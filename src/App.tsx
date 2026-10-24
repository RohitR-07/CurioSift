import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FileViewerPage from './pages/FileViewerPage';
import StudyWorkspacePage from './pages/StudyWorkspacePage';
import AIAssistant from './pages/AIAssistant';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import FlashcardGeneratorPage from './pages/FlashcardGeneratorPage';
import RevisionNotesPage from './pages/RevisionNotesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';
import { ProcessingProvider } from './context/ProcessingContext';
import { StudyMaterialProvider } from './context/StudyMaterialContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        {/* AuthProvider must be inside BrowserRouter so it can use navigate */}
        <AuthProvider>
          {/* FileProvider must wrap ProcessingProvider since Processing depends on useFiles() */}
          <FileProvider>
            <ProcessingProvider>
              <StudyMaterialProvider>
                <Routes>
                  {/* Public Landing Page */}
                  <Route path="/" element={<Landing />} />

                  {/* Authentication Pages */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Full-screen File Viewer — rendered outside AppLayout (no sidebar) */}
                  <Route path="/viewer/:fileId" element={
                    <ProtectedRoute><FileViewerPage /></ProtectedRoute>
                  } />

                  {/* Full-screen Study Workspace */}
                  <Route path="/study/:fileId" element={
                    <ProtectedRoute><StudyWorkspacePage /></ProtectedRoute>
                  } />

                  {/* Protected Application Routes (with AppLayout sidebar/topnav) */}
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* Placeholders for future routes */}
                    <Route path="/pdfs" element={<div className="p-8">My PDFs Placeholder</div>} />
                    <Route path="/summary" element={<div className="p-8">AI Summary Placeholder</div>} />
                    <Route path="/explain" element={<div className="p-8">AI Explain Placeholder</div>} />
                    <Route path="/questions" element={<div className="p-8">Question Generator Placeholder</div>} />
                    <Route path="/chat" element={<AIAssistant />} />
                    <Route path="/flashcards" element={<FlashcardGeneratorPage />} />
                    <Route path="/quiz" element={<QuizGeneratorPage />} />
                    <Route path="/notes" element={<RevisionNotesPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  {/* Catch-all redirect for unknown routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </StudyMaterialProvider>
            </ProcessingProvider>
          </FileProvider>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
