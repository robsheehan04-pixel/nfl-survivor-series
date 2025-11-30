import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { activeSeries, inviteToSeries } = useStore();
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = email.trim().toLowerCase();
    setError('');

    if (!trimmedEmail) return;

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (emails.includes(trimmedEmail)) {
      setError('This email has already been added');
      return;
    }

    if (activeSeries?.invitations.some(i => i.email === trimmedEmail && i.status === 'pending')) {
      setError('This person already has a pending invitation');
      return;
    }

    if (activeSeries?.members.some(m => m.userId === trimmedEmail)) {
      setError('This person is already a member');
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim()) {
      handleAddEmail();
      return;
    }

    if (emails.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    if (!activeSeries) return;

    emails.forEach(e => inviteToSeries(activeSeries.id, e));
    setSuccess(true);

    setTimeout(() => {
      setEmails([]);
      setEmail('');
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setEmail('');
    setEmails([]);
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  if (!activeSeries) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-md w-full mx-4"
          >
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Invitations Sent!</h3>
                <p className="text-gray-400">Your friends will receive an email invitation</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-nfl text-xl text-white">Invite to {activeSeries.name}</h2>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="friend@email.com"
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddEmail}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Email list */}
                  {emails.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Invitations to send:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {emails.map((e) => (
                          <motion.div
                            key={e}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full"
                          >
                            <span className="text-sm text-blue-300">{e}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEmail(e)}
                              className="text-blue-300 hover:text-blue-100"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={emails.length === 0 && !email.trim()}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Invite{emails.length > 1 ? 's' : ''}
                    </button>
                  </div>
                </form>

                {/* Pending invitations */}
                {activeSeries.invitations.filter(i => i.status === 'pending').length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-sm font-medium text-gray-300 mb-2">Pending Invitations:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {activeSeries.invitations
                        .filter(i => i.status === 'pending')
                        .map(inv => (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between text-sm bg-white/5 px-3 py-2 rounded-lg"
                          >
                            <span className="text-gray-400">{inv.email}</span>
                            <span className="text-yellow-400 text-xs">Pending</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
