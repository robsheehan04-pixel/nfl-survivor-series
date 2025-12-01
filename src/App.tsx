import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SeriesDetail } from './components/SeriesDetail';
import { CreateSeriesModal } from './components/CreateSeriesModal';
import { InvitationsModal } from './components/InvitationsModal';

function App() {
  const { isAuthenticated, user, loadUserSeries, loadPendingInvitations } = useStore();

  // Load user data when app mounts with authenticated user (e.g., page refresh)
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserSeries();
      loadPendingInvitations();
    }
  }, [isAuthenticated, user, loadUserSeries, loadPendingInvitations]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCreateSeries={() => {
            setIsSidebarOpen(false);
            setIsCreateModalOpen(true);
          }}
          onViewInvitations={() => {
            setIsSidebarOpen(false);
            setIsInvitationsModalOpen(true);
          }}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key="series-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto"
            >
              <SeriesDetail />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <CreateSeriesModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <InvitationsModal
        isOpen={isInvitationsModalOpen}
        onClose={() => setIsInvitationsModalOpen(false)}
      />

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export default App;
