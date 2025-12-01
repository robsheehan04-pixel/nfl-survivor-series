import { supabase, isSupabaseConfigured } from './supabase';
import { User, Series, SeriesMember, Pick, Invitation, SeriesSettings, defaultSeriesSettings, AppRole, SeriesRole, Sport, Competition, SeriesType, PlayoffStage } from '../types';

// Owner email - this user has full access to all series
const OWNER_EMAIL = 'robsheehan04@gmail.com';

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
  role: SeriesRole;
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

  // Determine role based on email
  const role: AppRole = data.email === OWNER_EMAIL ? 'owner' : 'user';

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture || '',
    role,
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

  const role: AppRole = data.email === OWNER_EMAIL ? 'owner' : 'user';

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture || '',
    role,
  };
}

// ============================================
// SERIES OPERATIONS
// ============================================

export async function createSeries(
  name: string,
  description: string,
  userId: string,
  settings: SeriesSettings = defaultSeriesSettings,
  sport: Sport = 'nfl',
  competition: Competition = 'regular_season',
  seriesType: SeriesType = 'survivor'
): Promise<Series | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  // Create the series with settings stored as JSON
  const { data: seriesData, error: seriesError } = await supabase
    .from('series')
    .insert({
      name,
      description: description || null,
      created_by: userId,
      current_week: settings.startingWeek,
      settings: settings,
      sport,
      competition,
      series_type: seriesType,
    })
    .select()
    .single();

  if (seriesError || !seriesData) {
    console.error('Error creating series:', seriesError);
    return null;
  }

  // Add creator as first member with admin role and correct lives based on settings
  const { error: memberError } = await supabase
    .from('series_members')
    .insert({
      series_id: seriesData.id,
      user_id: userId,
      lives_remaining: settings.livesPerPlayer,
      role: 'admin',
    });

  if (memberError) {
    console.error('Error adding creator as member:', memberError);
  }

  return fetchSeriesById(seriesData.id);
}

export async function fetchUserSeries(userId: string, userEmail?: string): Promise<Series[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  console.log('[fetchUserSeries] userId:', userId, 'userEmail:', userEmail, 'OWNER_EMAIL:', OWNER_EMAIL);
  console.log('[fetchUserSeries] isOwner:', userEmail === OWNER_EMAIL);

  // If user is the owner, fetch ALL series
  if (userEmail === OWNER_EMAIL) {
    const { data: allSeriesData, error: allSeriesError } = await supabase
      .from('series')
      .select('id');

    console.log('[fetchUserSeries] Owner mode - allSeriesData:', allSeriesData, 'error:', allSeriesError);

    if (allSeriesError || !allSeriesData) {
      console.error('Error fetching all series:', allSeriesError);
      return [];
    }

    const series = await Promise.all(allSeriesData.map(s => fetchSeriesById(s.id)));
    console.log('[fetchUserSeries] Owner mode - fetched series count:', series.filter(s => s !== null).length);
    return series.filter((s): s is Series => s !== null);
  }

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

// Update a member's role in a series
export async function updateMemberRole(seriesId: string, userId: string, role: SeriesRole): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('series_members')
    .update({ role })
    .eq('series_id', seriesId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating member role:', error);
    return false;
  }

  return true;
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
      role: (m.role as SeriesRole) || 'member',
    };
  });

  const invitations: Invitation[] = (invitationsData || []).map((i: DbInvitation & { users?: { name: string } }) => ({
    id: i.id,
    email: i.email,
    invitedBy: i.users?.name || 'Unknown',
    invitedAt: new Date(i.created_at),
    status: i.status,
  }));

  // Parse settings from database or use defaults
  const settings: SeriesSettings = seriesData.settings
    ? (typeof seriesData.settings === 'string'
        ? JSON.parse(seriesData.settings)
        : seriesData.settings)
    : defaultSeriesSettings;

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
    settings,
    // Multi-sport fields with defaults for existing data
    sport: (seriesData.sport as Sport) || 'nfl',
    competition: (seriesData.competition as Competition) || 'regular_season',
    seriesType: (seriesData.series_type as SeriesType) || 'survivor',
  };
}

// ============================================
// MEMBER OPERATIONS
// ============================================

export async function joinSeries(seriesId: string, userId: string, role: SeriesRole = 'member'): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('series_members')
    .insert({
      series_id: seriesId,
      user_id: userId,
      role,
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

// Admin function to make a pick on behalf of another user
export async function adminMakePick(
  seriesId: string,
  targetUserId: string,
  week: number,
  teamId: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('picks')
    .upsert({
      series_id: seriesId,
      user_id: targetUserId,
      week,
      team_id: teamId,
      is_auto_pick: false,
    }, {
      onConflict: 'series_id,user_id,week',
    });

  if (error) {
    console.error('Error making admin pick:', error);
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
  updates: {
    prizeValue?: number;
    showPrizeValue?: boolean;
    settings?: Partial<SeriesSettings>;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const updateData: Record<string, unknown> = {};
  if (updates.prizeValue !== undefined) updateData.prize_value = updates.prizeValue;
  if (updates.showPrizeValue !== undefined) updateData.show_prize_value = updates.showPrizeValue;

  // If settings are being updated, we need to merge with existing settings
  if (updates.settings) {
    // First fetch existing settings
    const { data: existingData } = await supabase
      .from('series')
      .select('settings')
      .eq('id', seriesId)
      .single();

    const existingSettings = existingData?.settings || defaultSeriesSettings;
    const mergedSettings = { ...existingSettings, ...updates.settings };
    updateData.settings = mergedSettings;

    // If starting week changed, update current_week too
    if (updates.settings.startingWeek !== undefined) {
      updateData.current_week = updates.settings.startingWeek;
    }
  }

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
// DELETE SERIES
// ============================================

export async function deleteSeries(seriesId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  // Delete in order to handle foreign key constraints:
  // 1. Delete picks for this series
  const { error: picksError } = await supabase
    .from('picks')
    .delete()
    .eq('series_id', seriesId);

  if (picksError) {
    console.error('Error deleting picks:', picksError);
    // Continue anyway, picks might not exist
  }

  // 2. Delete invitations for this series
  const { error: invitationsError } = await supabase
    .from('invitations')
    .delete()
    .eq('series_id', seriesId);

  if (invitationsError) {
    console.error('Error deleting invitations:', invitationsError);
    // Continue anyway
  }

  // 3. Delete series members
  const { error: membersError } = await supabase
    .from('series_members')
    .delete()
    .eq('series_id', seriesId);

  if (membersError) {
    console.error('Error deleting series members:', membersError);
    // Continue anyway
  }

  // 4. Finally delete the series itself
  const { error } = await supabase
    .from('series')
    .delete()
    .eq('id', seriesId);

  if (error) {
    console.error('Error deleting series:', error);
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

// ============================================
// PLAYOFF POOL OPERATIONS
// ============================================

export async function makePlayoffPicks(
  seriesId: string,
  userId: string,
  picks: { gameId: string; pickedWinnerId: string; predictedMargin: number }[]
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  // Upsert each pick
  const picksToInsert = picks.map(pick => ({
    series_id: seriesId,
    user_id: userId,
    game_id: pick.gameId,
    picked_winner_id: pick.pickedWinnerId,
    predicted_margin: pick.predictedMargin,
    picked_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('playoff_picks')
    .upsert(picksToInsert, {
      onConflict: 'series_id,user_id,game_id',
    });

  if (error) {
    console.error('Error saving playoff picks:', error);
    return false;
  }

  return true;
}

export async function updatePlayoffStage(
  seriesId: string,
  stage: PlayoffStage
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('series')
    .update({ playoff_stage: stage })
    .eq('id', seriesId);

  if (error) {
    console.error('Error updating playoff stage:', error);
    return false;
  }

  return true;
}
