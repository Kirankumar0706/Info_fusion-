import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DemoPage } from './pages/DemoPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { SourcesPage } from './pages/SourcesPage';
import { SourceDetailPage } from './pages/SourceDetailPage';
import { FactsPage } from './pages/FactsPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { ConflictsPage } from './pages/ConflictsPage';
import { EvidenceGapsPage } from './pages/EvidenceGapsPage';
import { EvidenceExplorerPage } from './pages/EvidenceExplorerPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { ActionsPage } from './pages/ActionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ActivityPage } from './pages/ActivityPage';
import { AskAssistantPage } from './pages/AskAssistantPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/demo" element={<DemoPage />} />

      {/* Enterprise Application Shell */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/sources/:id" element={<SourceDetailPage />} />
        <Route path="/facts" element={<FactsPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/conflicts" element={<ConflictsPage />} />
        <Route path="/evidence-gaps" element={<EvidenceGapsPage />} />
        <Route path="/evidence-explorer" element={<EvidenceExplorerPage />} />
        <Route path="/decisions" element={<DecisionsPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/ask" element={<AskAssistantPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
