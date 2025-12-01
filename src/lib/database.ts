import { supabase, isSupabaseConfigured } from './supabase';
import { User, Series, SeriesMember, Pick, Invitation } from '../types';

// Database types matching Supabase schema
interface DbUser {
  id: string;
  google_id: string | null;
  email: string;
  name: string;
  picture: string | null;
  created_at: string;
}

interface DbSeriesMember {
  id: string;
  series_id: string;
  user_id: string;
  lives_remaining: number;
  is_eliminated: boolean;
  joined_at: string;
  users?: DbUser;
}

interface DbPick {
  id: string;
  series_id: string;
  user_id: string;
  week: number;
  team_id: string;
  result: 'pending' | 'win' | 'loss';
  is_auto_pick: boolean;
  picked_at: string;
}

interface DbInvitation {
  id: string;
  series_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  users?: DbUser;
}

// ============================================
// USER OPERATIONS
// ============================================

export async function upsertUser(user: User): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) return user;

  const { data, error } = await supabase
    .from('users')
    .upsert({
      google_id: user.id.startsWith('demo_') ? null : user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    }, {
      onConflict: 'email',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture || '',
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture || '',
  };
}

// ============================================
// SERIES OPERATIONS
// ============================================

export async function createSeries(
  name: string,
  description: string,
  userId: string
): Promise<Series | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  // Create the series
  const { data: seriesData, error: seriesError } = await supabase
    .from('series')
    .insert({
      name,
      description: description || null,
      created_by: userId,
    })
    .select()
    .single();

  if (seriesError || !seriesData) {
    console.error('Error creating series:', seriesError);
    return null;
  }

  // Add creator as first member
  const { error: memberError } = await supabase
    .from('series_members')
    .insert({
      series_id: seriesData.id,
      user_id: userId,
    });

  if (memberError) {
    console.error('Error adding creator as member:', memberError);
  }

  return fetchSeriesById(seriesData.id);
}

export async function fetchUserSeries(userId: string): Promise<Series[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  // Get series IDs where user is a member
  const { data: memberData, error: memberError } = await supabase
    .from('series_members')
    .select('series_id')
    .eq('user_id', userId);

  if (memberError || !memberData) {
    console.error('Error fetching member series:', memberError);
    return [];
  }

  const seriesIds = memberData.map(m => m.series_id);
  if (seriesIds.length === 0) return [];

  // Fetch full series data
  const series = await Promise.all(seriesIds.map(id => fetchSeriesById(id)));
  return series.filter((s): s is Series => s !== null);
}

export async function fetchSeriesById(seriesId: string): Promise<Series | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  // Fetch series
  const { data: seriesData, error: seriesError } = await supabase
    .from('series')
    .select('*')
    .eq('id', seriesId)
    .single();

  if (seriesError || !seriesData) {
    console.error('Error fetching series:', seriesError);
    return null;
  }

  // Fetch members with user info
  const { data: membersData, error: membersError } = await supabase
    .from('series_members')
    .select(`
      *,
      users (*)
    `)
    .eq('series_id', seriesId);

  if (membersError) {
    console.error('Error fetching members:', membersError);
  }

  // Fetch picks for all members
  const { data: picksData, error: picksError } = await supabase
    .from('picks')
    .select('*')
    .eq('series_id', seriesId);

  if (picksError) {
    console.error('Error fetching picks:', picksError);
  }

  // Fetch invitations
  const { data: invitationsData, error: invitationsError } = await supabase
    .from('invitations')
    .select(`
      *,
      users:invited_by (name)
    `)
    .eq('series_id', seriesId);

  if (invitationsError) {
    console.error('Error fetching invitations:', invitationsError);
  }

  // Transform to app format
  const members: SeriesMember[] = (membersData || []).map((m: DbSeriesMember) => {
    const memberPicks = (picksData || [])
      .filter((p: DbPick) => p.user_id === m.user_id)
      .map((p: DbPick): Pick => ({
        week: p.week,
        teamId: p.team_id,
        result: p.result,
        isAutoPick: p.is_auto_pick,
        pickedAt: new Date(p.picked_at),
      }));

    return {
      userId: m.user_id,
      userName: m.users?.name || 'Unknown',
      userPicture: m.users?.picture || '',
      livesRemaining: m.lives_remaining,
      isEliminated: m.is_eliminated,
      joinedAt: new Date(m.joined_at),
      picks: memberPicks,
    };
  });

  const invitations: Invitation[] = (invitationsData || []).map((i: DbInvitation & { users?: { name: string } }) => ({
    id: i.id,
    email: i.email,
    invitedBy: i.users?.name || 'Unknown',
    invitedAt: new Date(i.created_at),
    status: i.status,
  }));

  return {
    id: seriesData.id,
    name: seriesData.name,
    description: seriesData.description || '',
    createdBy: seriesData.created_by,
    createdAt: new Date(seriesData.created_at),
    currentWeek: seriesData.current_week,
    season: seriesData.season,
    isActive: seriesData.is_active,
    members,
    invitations,
    prizeValue: seriesData.prize_value || 0,
    showPrizeValue: seriesData.show_prize_value || false,
  };
}

// ============================================
// MEMBER OPERATIONS
// ============================================

export async function joinSeries(seriesId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('series_members')
    .insert({
      series_id: seriesId,
      user_id: userId,
    });

  if (error) {
    console.error('Error joining series:', error);
    return false;
  }

  return true;
}

export async function leaveSeries(seriesId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('series_members')
    .delete()
    .eq('series_id', seriesId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error leaving series:', error);
    return false;
  }

  return true;
}

// ============================================
// PICK OPERATIONS
// ============================================

export async function makePick(
  seriesId: string,
  userId: string,
  week: number,
  teamId: string,
  isAutoPick: boolean = false
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('picks')
    .upsert({
      series_id: seriesId,
      user_id: userId,
      week,
      team_id: teamId,
      is_auto_pick: isAutoPick,
    }, {
      onConflict: 'series_id,user_id,week',
    });

  if (error) {
    console.error('Error making pick:', error);
    return false;
  }

  return true;
}

export async function updatePickResult(
  seriesId: string,
  week: number,
  teamId: string,
  result: 'win' | 'loss'
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('picks')
    .update({ result })
    .eq('series_id', seriesId)
    .eq('week', week)
    .eq('team_id', teamId);

  if (error) {
    console.error('Error updating pick result:', error);
    return false;
  }

  return true;
}

// ============================================
// SERIES SETTINGS
// ============================================

export async function updateSeriesSettings(
  seriesId: string,
  settings: { prizeValue?: number; showPrizeValue?: boolean }
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const updateData: Record<string, unknown> = {};
  if (settings.prizeValue !== undefined) updateData.prize_value = settings.prizeValue;
  if (settings.showPrizeValue !== undefined) updateData.show_prize_value = settings.showPrizeValue;

  const { error } = await supabase
    .from('series')
    .update(updateData)
    .eq('id', seriesId);

  if (error) {
    console.error('Error updating series settings:', error);
    return false;
  }

  return true;
}

// ============================================
// INVITATION OPERATIONS
// ============================================

export async function createInvitation(
  seriesId: string,
  email: string,
  invitedBy: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('invitations')
    .upsert({
      series_id: seriesId,
      email: email.toLowerCase(),
      invited_by: invitedBy,
      status: 'pending',
    }, {
      onConflict: 'series_id,email',
    });

  if (error) {
    console.error('Error creating invitation:', error);
    return false;
  }

  return true;
}

export async function fetchPendingInvitations(email: string): Promise<{ series: Series; invitation: Invitation }[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      series (*),
      users:invited_by (name)
    `)
    .eq('email', email.toLowerCase())
    .eq('status', 'pending');

  if (error || !data) {
    console.error('Error fetching invitations:', error);
    return [];
  }

  const results: { series: Series; invitation: Invitation }[] = [];

  for (const inv of data) {
    const series = await fetchSeriesById(inv.series_id);
    if (series) {
      results.push({
        series,
        invitation: {
          id: inv.id,
          email: inv.email,
          invitedBy: inv.users?.name || 'Unknown',
          invitedAt: new Date(inv.created_at),
          status: inv.status,
        },
      });
    }
  }

  return results;
}

export async function acceptInvitation(
  invitationId: string,
  seriesId: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  // Update invitation status
  const { error: invError } = await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  if (invError) {
    console.error('Error accepting invitation:', invError);
    return false;
  }

  // Join the series
  return joinSeries(seriesId, userId);
}

export async function declineInvitation(invitationId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'declined' })
    .eq('id', invitationId);

  if (error) {
    console.error('Error declining invitation:', error);
    return false;
  }

  return true;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToSeries(
  seriesId: string,
  onUpdate: () => void
) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel(`series:${seriesId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'series_members', filter: `series_id=eq.${seriesId}` },
      onUpdate
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'picks', filter: `series_id=eq.${seriesId}` },
      onUpdate
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'invitations', filter: `series_id=eq.${seriesId}` },
      onUpdate
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}

export function subscribeToUserInvitations(
  email: string,
  onUpdate: () => void
) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel(`invitations:${email}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'invitations', filter: `email=eq.${email.toLowerCase()}` },
      onUpdate
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}
