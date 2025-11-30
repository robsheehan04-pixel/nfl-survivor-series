import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvitationsModal({ isOpen, onClose }: InvitationsModalProps) {
  const { getPendingInvitations, acceptInvitation, declineInvitation, setActiveSeries } = useStore();
  const pendingInvitations = getPendingInvitations();

  const handleAccept = (seriesId: string, invitationId: string) => {
    acceptInvitation(seriesId, invitationId);
    setActiveSeries(seriesId);
    if (pendingInvitations.length === 1) {
      onClose();
    }
  };

  const handleDecline = (seriesId: string, invitationId: string) => {
    declineInvitation(seriesId, invitationId);
    if (pendingInvitations.length === 1) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-nfl text-xl text-white">Pending Invitations</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {pendingInvitations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map(({ series, invitation }) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{series.name}</h3>
                        <p className="text-sm text-gray-400">
                          Invited by {invitation.invitedBy}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">
                          Week {series.currentWeek}
                        </span>
                        <p className="text-xs text-gray-500">
                          {series.members.length} member{series.members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {series.description && (
                      <p className="text-sm text-gray-400 mb-4">
                        {series.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecline(series.id, invitation.id)}
                        className="flex-1 btn-secondary py-2"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(series.id, invitation.id)}
                        className="flex-1 btn-success py-2"
                      >
                        Accept & Join
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
