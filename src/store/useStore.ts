import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Series, SeriesMember, Pick, Invitation } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import * as db from '../lib/database';
import { OddsFormat } from '../lib/nflSchedule';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Series
  series: Series[];
  activeSeries: Series | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // User Preferences
  oddsFormat: OddsFormat;

  // Auth actions
  setUser: (user: User | null) => Promise<void>;
  logout: () => void;

  // Series actions
  createSeries: (name: string, description: string) => Promise<Series | null>;
  loadUserSeries: () => Promise<void>;
  joinSeries: (seriesId: string) => Promise<void>;
  leaveSeries: (seriesId: string) => Promise<void>;
  deleteSeries: (seriesId: string) => Promise<boolean>;
  setActiveSeries: (seriesId: string | null) => void;
  refreshActiveSeries: () => Promise<void>;
  updateSeriesSettings: (seriesId: string, settings: { prizeValue?: number; showPrizeValue?: boolean }) => Promise<void>;

  // Invitation actions
  inviteToSeries: (seriesId: string, email: string) => Promise<void>;
  acceptInvitation: (seriesId: string, invitationId: string) => Promise<void>;
  declineInvitation: (seriesId: string, invitationId: string) => Promise<void>;
  loadPendingInvitations: () => Promise<void>;

  // Pick actions
  makePick: (seriesId: string, teamId: string) => Promise<void>;
  adminMakePick: (seriesId: string, targetUserId: string, teamId: string) => Promise<boolean>;
  processWeekResults: (seriesId: string, week: number, results: Record<string, 'win' | 'loss'>) => void;
  autoPickFavorite: (seriesId: string, favoriteTeamId: string) => Promise<void>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOddsFormat: (format: OddsFormat) => void;
  getUserSeriesStatus: (seriesId: string) => {
    member: SeriesMember | null;
    usedTeams: string[];
    canPick: boolean;
  };
  getPendingInvitations: () => { series: Series; invitation: Invitation }[];

  // Internal
  _pendingInvitations: { series: Series; invitation: Invitation }[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      series: [],
      activeSeries: null,
      isLoading: false,
      error: null,
      oddsFormat: 'american',
      _pendingInvitations: [],

      // Auth actions
      setUser: async (user) => {
        if (user && isSupabaseConfigured()) {
          // Upsert user to database and get the database ID
          const dbUser = await db.upsertUser(user);
          if (dbUser) {
            set({ user: dbUser, isAuthenticated: true });
            // Load user's series after login
            await get().loadUserSeries();
            await get().loadPendingInvitations();
            return;
          }
        }
        set({ user, isAuthenticated: !!user });
      },

      logout: () => set({
        user: null,
        isAuthenticated: false,
        activeSeries: null,
        series: [],
        _pendingInvitations: [],
      }),

      // Series actions
      createSeries: async (name, description) => {
        const { user, series } = get();
        if (!user) throw new Error('Must be logged in to create a series');

        set({ isLoading: true });

        if (isSupabaseConfigured()) {
          const newSeries = await db.createSeries(name, description, user.id);
          if (newSeries) {
            set({ series: [...series, newSeries], isLoading: false });
            return newSeries;
          }
          set({ isLoading: false, error: 'Failed to create series' });
          return null;
        }

        // Local-only mode
        const newSeries: Series = {
          id: generateId(),
          name,
          description,
          createdBy: user.id,
          createdAt: new Date(),
          currentWeek: 1,
          season: new Date().getFullYear(),
          isActive: true,
          members: [{
            userId: user.id,
            userName: user.name,
            userPicture: user.picture,
            livesRemaining: 2,
            isEliminated: false,
            joinedAt: new Date(),
            picks: [],
          }],
          invitations: [],
        };

        set({ series: [...series, newSeries], isLoading: false });
        return newSeries;
      },

      loadUserSeries: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });

        if (isSupabaseConfigured()) {
          const userSeries = await db.fetchUserSeries(user.id);
          set({ series: userSeries, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      joinSeries: async (seriesId) => {
        const { user, series } = get();
        if (!user) return;

        if (isSupabaseConfigured()) {
          await db.joinSeries(seriesId, user.id);
          await get().loadUserSeries();
          return;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;
            if (s.members.some(m => m.userId === user.id)) return s;

            return {
              ...s,
              members: [...s.members, {
                userId: user.id,
                userName: user.name,
                userPicture: user.picture,
                livesRemaining: 2,
                isEliminated: false,
                joinedAt: new Date(),
                picks: [],
              }],
            };
          }),
        });
      },

      leaveSeries: async (seriesId) => {
        const { user, series, activeSeries } = get();
        if (!user) return;

        if (isSupabaseConfigured()) {
          await db.leaveSeries(seriesId, user.id);
          set({
            series: series.filter(s => s.id !== seriesId),
            activeSeries: activeSeries?.id === seriesId ? null : activeSeries,
          });
          return;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;
            return {
              ...s,
              members: s.members.filter(m => m.userId !== user.id),
            };
          }),
          activeSeries: activeSeries?.id === seriesId ? null : activeSeries,
        });
      },

      deleteSeries: async (seriesId) => {
        const { user, series, activeSeries } = get();
        if (!user) return false;

        // Check if user is the creator
        const targetSeries = series.find(s => s.id === seriesId);
        if (!targetSeries || targetSeries.createdBy !== user.id) {
          return false;
        }

        if (isSupabaseConfigured()) {
          const success = await db.deleteSeries(seriesId);
          if (success) {
            set({
              series: series.filter(s => s.id !== seriesId),
              activeSeries: activeSeries?.id === seriesId ? null : activeSeries,
            });
          }
          return success;
        }

        // Local-only mode
        set({
          series: series.filter(s => s.id !== seriesId),
          activeSeries: activeSeries?.id === seriesId ? null : activeSeries,
        });
        return true;
      },

      setActiveSeries: (seriesId) => {
        const { series } = get();
        const active = seriesId ? series.find(s => s.id === seriesId) || null : null;
        set({ activeSeries: active });
      },

      refreshActiveSeries: async () => {
        const { activeSeries } = get();
        if (!activeSeries) return;

        if (isSupabaseConfigured()) {
          const updated = await db.fetchSeriesById(activeSeries.id);
          if (updated) {
            const { series } = get();
            set({
              activeSeries: updated,
              series: series.map(s => s.id === updated.id ? updated : s),
            });
          }
        }
      },

      updateSeriesSettings: async (seriesId, settings) => {
        const { series, activeSeries } = get();

        if (isSupabaseConfigured()) {
          await db.updateSeriesSettings(seriesId, settings);
          await get().refreshActiveSeries();
          return;
        }

        // Local-only mode
        const updatedSeries = series.map(s => {
          if (s.id !== seriesId) return s;
          return {
            ...s,
            prizeValue: settings.prizeValue ?? s.prizeValue,
            showPrizeValue: settings.showPrizeValue ?? s.showPrizeValue,
          };
        });

        set({
          series: updatedSeries,
          activeSeries: activeSeries?.id === seriesId
            ? updatedSeries.find(s => s.id === seriesId) || activeSeries
            : activeSeries,
        });
      },

      // Invitation actions
      inviteToSeries: async (seriesId, email) => {
        const { user, series } = get();
        if (!user) return;

        if (isSupabaseConfigured()) {
          await db.createInvitation(seriesId, email, user.id);
          await get().refreshActiveSeries();
          return;
        }

        // Local-only mode
        const invitation: Invitation = {
          id: generateId(),
          email,
          invitedBy: user.name,
          invitedAt: new Date(),
          status: 'pending',
        };

        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;
            if (s.invitations.some(i => i.email === email && i.status === 'pending')) return s;

            return {
              ...s,
              invitations: [...s.invitations, invitation],
            };
          }),
        });
      },

      loadPendingInvitations: async () => {
        const { user } = get();
        if (!user) return;

        if (isSupabaseConfigured()) {
          const invitations = await db.fetchPendingInvitations(user.email);
          set({ _pendingInvitations: invitations });
        }
      },

      acceptInvitation: async (seriesId, invitationId) => {
        const { user, series } = get();
        if (!user) return;

        if (isSupabaseConfigured()) {
          await db.acceptInvitation(invitationId, seriesId, user.id);
          await get().loadUserSeries();
          await get().loadPendingInvitations();
          return;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;

            const invitation = s.invitations.find(i => i.id === invitationId);
            if (!invitation || invitation.email !== user.email) return s;

            return {
              ...s,
              invitations: s.invitations.map(i =>
                i.id === invitationId ? { ...i, status: 'accepted' as const } : i
              ),
              members: [...s.members, {
                userId: user.id,
                userName: user.name,
                userPicture: user.picture,
                livesRemaining: 2,
                isEliminated: false,
                joinedAt: new Date(),
                picks: [],
              }],
            };
          }),
        });
      },

      declineInvitation: async (seriesId, invitationId) => {
        const { series } = get();

        if (isSupabaseConfigured()) {
          await db.declineInvitation(invitationId);
          await get().loadPendingInvitations();
          return;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;

            return {
              ...s,
              invitations: s.invitations.map(i =>
                i.id === invitationId ? { ...i, status: 'declined' as const } : i
              ),
            };
          }),
        });
      },

      // Pick actions
      makePick: async (seriesId, teamId) => {
        const { user, series, activeSeries } = get();
        if (!user) return;

        const targetSeries = series.find(s => s.id === seriesId);
        if (!targetSeries) return;

        if (isSupabaseConfigured()) {
          await db.makePick(seriesId, user.id, targetSeries.currentWeek, teamId);
          await get().refreshActiveSeries();
          return;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;

            return {
              ...s,
              members: s.members.map(m => {
                if (m.userId !== user.id) return m;
                if (m.isEliminated) return m;
                if (m.picks.some(p => p.week === s.currentWeek)) return m;
                if (m.picks.some(p => p.teamId === teamId)) return m;

                const newPick: Pick = {
                  week: s.currentWeek,
                  teamId,
                  result: 'pending',
                  isAutoPick: false,
                  pickedAt: new Date(),
                };

                return {
                  ...m,
                  picks: [...m.picks, newPick],
                };
              }),
            };
          }),
        });

        // Refresh active series
        const updatedSeries = get().series.find(s => s.id === seriesId);
        if (updatedSeries && activeSeries?.id === seriesId) {
          set({ activeSeries: updatedSeries });
        }
      },

      // Admin function to make a pick on behalf of another user
      adminMakePick: async (seriesId, targetUserId, teamId) => {
        const { user, series, activeSeries } = get();
        if (!user) return false;

        const targetSeries = series.find(s => s.id === seriesId);
        if (!targetSeries) return false;

        // Verify the current user is the series creator (admin)
        if (targetSeries.createdBy !== user.id) {
          console.error('Only the series creator can make picks for other users');
          return false;
        }

        if (isSupabaseConfigured()) {
          const success = await db.adminMakePick(seriesId, targetUserId, targetSeries.currentWeek, teamId);
          if (success) {
            await get().refreshActiveSeries();
          }
          return success;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;

            return {
              ...s,
              members: s.members.map(m => {
                if (m.userId !== targetUserId) return m;
                if (m.isEliminated) return m;

                // Find and replace existing pick for this week, or add new one
                const existingPickIndex = m.picks.findIndex(p => p.week === s.currentWeek);
                const newPick: Pick = {
                  week: s.currentWeek,
                  teamId,
                  result: 'pending',
                  isAutoPick: false,
                  pickedAt: new Date(),
                };

                const updatedPicks = existingPickIndex >= 0
                  ? m.picks.map((p, i) => i === existingPickIndex ? newPick : p)
                  : [...m.picks, newPick];

                return {
                  ...m,
                  picks: updatedPicks,
                };
              }),
            };
          }),
        });

        // Refresh active series
        const updatedSeries = get().series.find(s => s.id === seriesId);
        if (updatedSeries && activeSeries?.id === seriesId) {
          set({ activeSeries: updatedSeries });
        }

        return true;
      },

      autoPickFavorite: async (seriesId, favoriteTeamId) => {
        const { user, series } = get();
        if (!user) return;

        const targetSeries = series.find(s => s.id === seriesId);
        if (!targetSeries) return;

        if (isSupabaseConfigured()) {
          await db.makePick(seriesId, user.id, targetSeries.currentWeek, favoriteTeamId, true);
          await get().refreshActiveSeries();
          return;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;

            return {
              ...s,
              members: s.members.map(m => {
                if (m.userId !== user.id) return m;
                if (m.isEliminated) return m;
                if (m.picks.some(p => p.week === s.currentWeek)) return m;

                const newPick: Pick = {
                  week: s.currentWeek,
                  teamId: favoriteTeamId,
                  result: 'pending',
                  isAutoPick: true,
                  pickedAt: new Date(),
                };

                return {
                  ...m,
                  picks: [...m.picks, newPick],
                };
              }),
            };
          }),
        });
      },

      processWeekResults: (seriesId, week, results) => {
        const { series } = get();

        // This is typically admin-only and would be done via backend
        // Keeping local implementation for now
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;

            return {
              ...s,
              members: s.members.map(m => {
                const weekPick = m.picks.find(p => p.week === week);
                if (!weekPick) return m;

                const result = results[weekPick.teamId];
                if (!result) return m;

                const updatedPicks = m.picks.map(p =>
                  p.week === week ? { ...p, result } : p
                );

                const newLives = result === 'loss' ? m.livesRemaining - 1 : m.livesRemaining;

                return {
                  ...m,
                  picks: updatedPicks,
                  livesRemaining: newLives,
                  isEliminated: newLives <= 0,
                };
              }),
            };
          }),
        });
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setOddsFormat: (format) => set({ oddsFormat: format }),

      getUserSeriesStatus: (seriesId) => {
        const { user, series } = get();
        if (!user) return { member: null, usedTeams: [], canPick: false };

        const targetSeries = series.find(s => s.id === seriesId);
        if (!targetSeries) return { member: null, usedTeams: [], canPick: false };

        const member = targetSeries.members.find(m => m.userId === user.id) || null;
        if (!member) return { member: null, usedTeams: [], canPick: false };

        const usedTeams = member.picks.map(p => p.teamId);
        const hasPickedThisWeek = member.picks.some(p => p.week === targetSeries.currentWeek);
        const canPick = !member.isEliminated && !hasPickedThisWeek;

        return { member, usedTeams, canPick };
      },

      getPendingInvitations: () => {
        const { user, series, _pendingInvitations } = get();
        if (!user) return [];

        // If using Supabase, return loaded invitations
        if (isSupabaseConfigured()) {
          return _pendingInvitations;
        }

        // Local-only mode
        const pending: { series: Series; invitation: Invitation }[] = [];

        series.forEach(s => {
          s.invitations.forEach(inv => {
            if (inv.email === user.email && inv.status === 'pending') {
              pending.push({ series: s, invitation: inv });
            }
          });
        });

        return pending;
      },
    }),
    {
      name: 'nfl-survivor-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        series: isSupabaseConfigured() ? [] : state.series, // Don't persist series if using Supabase
        oddsFormat: state.oddsFormat,
      }),
    }
  )
);
