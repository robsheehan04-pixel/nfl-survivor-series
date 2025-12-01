import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Series, SeriesMember, Pick, Invitation, SeriesSettings, defaultSeriesSettings, Sport, Competition, SeriesType, PlayoffBracketPick, PlayoffPoolMember, PlayoffStage } from '../types';
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
  refreshUser: () => Promise<void>;
  logout: () => void;

  // Series actions
  createSeries: (name: string, description: string, settings?: SeriesSettings, sport?: Sport, competition?: Competition, seriesType?: SeriesType) => Promise<Series | null>;
  loadUserSeries: () => Promise<void>;
  joinSeries: (seriesId: string) => Promise<void>;
  leaveSeries: (seriesId: string) => Promise<void>;
  deleteSeries: (seriesId: string) => Promise<boolean>;
  setActiveSeries: (seriesId: string | null) => void;
  refreshActiveSeries: () => Promise<void>;
  updateSeriesSettings: (seriesId: string, updates: { prizeValue?: number; showPrizeValue?: boolean; settings?: Partial<SeriesSettings> }) => Promise<void>;

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

  // Playoff Pool actions
  makePlayoffPick: (seriesId: string, picks: { gameId: string; pickedWinnerId: string; predictedMargin: number }[]) => Promise<void>;
  getPlayoffPoolStatus: (seriesId: string) => {
    picks: PlayoffBracketPick[];
    hasSubmittedStage1: boolean;
    hasSubmittedStage2: boolean;
    totalPoints: number;
  } | null;
  updatePlayoffStage: (seriesId: string, stage: PlayoffStage) => Promise<void>;

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

      // Refresh user from database to get correct role and reload series
      refreshUser: async () => {
        const { user } = get();
        console.log('[refreshUser] Starting with user:', user?.email);
        if (!user || !isSupabaseConfigured()) return;

        const dbUser = await db.getUserByEmail(user.email);
        console.log('[refreshUser] Got dbUser:', dbUser?.email, 'role:', dbUser?.role);
        if (dbUser) {
          set({ user: dbUser });
          // Now load series with the updated user email (important for owner role)
          console.log('[refreshUser] Calling fetchUserSeries with:', dbUser.id, dbUser.email);
          const userSeries = await db.fetchUserSeries(dbUser.id, dbUser.email);
          console.log('[refreshUser] Got series count:', userSeries.length);
          set({ series: userSeries, isLoading: false });
        }
      },

      logout: () => set({
        user: null,
        isAuthenticated: false,
        activeSeries: null,
        series: [],
        _pendingInvitations: [],
      }),

      // Series actions
      createSeries: async (name, description, settings = defaultSeriesSettings, sport: Sport = 'nfl', competition: Competition = 'regular_season', seriesType: SeriesType = 'survivor') => {
        const { user, series } = get();
        if (!user) throw new Error('Must be logged in to create a series');

        set({ isLoading: true });

        if (isSupabaseConfigured()) {
          const newSeries = await db.createSeries(name, description, user.id, settings, sport, competition, seriesType);
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
          currentWeek: settings.startingWeek,
          season: new Date().getFullYear(),
          isActive: true,
          members: [{
            userId: user.id,
            userName: user.name,
            userPicture: user.picture,
            livesRemaining: settings.livesPerPlayer,
            isEliminated: false,
            joinedAt: new Date(),
            picks: [],
            role: 'admin' as const,
          }],
          invitations: [],
          settings,
          sport,
          competition,
          seriesType,
        };

        set({ series: [...series, newSeries], isLoading: false });
        return newSeries;
      },

      loadUserSeries: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });

        if (isSupabaseConfigured()) {
          // Pass email so owner can see all series
          const userSeries = await db.fetchUserSeries(user.id, user.email);
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
                role: 'member' as const,
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
                role: 'member' as const,
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

      // Playoff Pool actions
      makePlayoffPick: async (seriesId, picks) => {
        const { user, series, activeSeries } = get();
        if (!user) return;

        const targetSeries = series.find(s => s.id === seriesId);
        if (!targetSeries || targetSeries.seriesType !== 'playoff_pool') return;

        if (isSupabaseConfigured()) {
          // Save to database
          await db.makePlayoffPicks(seriesId, user.id, picks);
          await get().refreshActiveSeries();
          return;
        }

        // Local-only mode
        const newPicks: PlayoffBracketPick[] = picks.map(p => ({
          gameId: p.gameId,
          round: 'wild_card', // Would be determined by game
          pickedWinnerId: p.pickedWinnerId,
          predictedMargin: p.predictedMargin,
          pickedAt: new Date(),
        }));

        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;

            // Find or create playoff pool member
            const existingMembers = s.playoffPoolMembers || [];
            const memberIndex = existingMembers.findIndex(m => m.userId === user.id);

            let updatedMembers: PlayoffPoolMember[];
            if (memberIndex >= 0) {
              // Update existing member's picks
              updatedMembers = existingMembers.map((m, i) => {
                if (i !== memberIndex) return m;
                return {
                  ...m,
                  picks: [...m.picks.filter(p => !newPicks.some(np => np.gameId === p.gameId)), ...newPicks],
                };
              });
            } else {
              // Add new member
              updatedMembers = [...existingMembers, {
                userId: user.id,
                userName: user.name,
                userPicture: user.picture,
                picks: newPicks,
                results: [],
                totalPoints: 0,
                joinedAt: new Date(),
              }];
            }

            return {
              ...s,
              playoffPoolMembers: updatedMembers,
            };
          }),
        });

        // Refresh active series
        const updatedSeries = get().series.find(s => s.id === seriesId);
        if (updatedSeries && activeSeries?.id === seriesId) {
          set({ activeSeries: updatedSeries });
        }
      },

      getPlayoffPoolStatus: (seriesId) => {
        const { user, series } = get();
        if (!user) return null;

        const targetSeries = series.find(s => s.id === seriesId);
        if (!targetSeries || targetSeries.seriesType !== 'playoff_pool') return null;

        const member = targetSeries.playoffPoolMembers?.find(m => m.userId === user.id);
        if (!member) {
          return {
            picks: [],
            hasSubmittedStage1: false,
            hasSubmittedStage2: false,
            totalPoints: 0,
          };
        }

        // Check which stages have been submitted
        const wildCardGameIds = ['wc-afc-1', 'wc-afc-2', 'wc-afc-3', 'wc-nfc-1', 'wc-nfc-2', 'wc-nfc-3'];
        const hasSubmittedStage1 = wildCardGameIds.every(gameId =>
          member.picks.some(p => p.gameId === gameId)
        );

        const stage2GameIds = ['div-afc-1', 'div-afc-2', 'div-nfc-1', 'div-nfc-2', 'conf-afc', 'conf-nfc', 'super-bowl'];
        const hasSubmittedStage2 = stage2GameIds.every(gameId =>
          member.picks.some(p => p.gameId === gameId)
        );

        return {
          picks: member.picks,
          hasSubmittedStage1,
          hasSubmittedStage2,
          totalPoints: member.totalPoints,
        };
      },

      updatePlayoffStage: async (seriesId, stage) => {
        const { series, activeSeries } = get();

        if (isSupabaseConfigured()) {
          await db.updatePlayoffStage(seriesId, stage);
          await get().refreshActiveSeries();
          return;
        }

        // Local-only mode
        set({
          series: series.map(s => {
            if (s.id !== seriesId) return s;
            return { ...s, playoffStage: stage };
          }),
        });

        // Refresh active series
        const updatedSeries = get().series.find(s => s.id === seriesId);
        if (updatedSeries && activeSeries?.id === seriesId) {
          set({ activeSeries: updatedSeries });
        }
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
