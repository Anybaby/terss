import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import { ViewState, Candidate } from './types';
import { MOCK_CANDIDATES } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Initialize state with mock data so we can add to it
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCurrentView(ViewState.REPORT);
  };

  const handleBackToDashboard = () => {
    setSelectedCandidate(null);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard' || tab === 'candidates') {
      setCurrentView(ViewState.DASHBOARD);
      setSelectedCandidate(null);
    }
  };

  const handleAddCandidate = (newCandidate: Candidate) => {
    setCandidates([newCandidate, ...candidates]);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {currentView === ViewState.DASHBOARD && (
        <Dashboard 
          candidates={candidates} 
          onSelectCandidate={handleCandidateSelect}
          onAddCandidate={handleAddCandidate}
        />
      )}
      
      {currentView === ViewState.REPORT && selectedCandidate && (
        <Report 
          candidate={selectedCandidate} 
          onBack={handleBackToDashboard} 
        />
      )}
    </Layout>
  );
};

export default App;