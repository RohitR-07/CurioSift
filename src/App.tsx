import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FileViewerPage from './pages/FileViewerPage';
import StudyWorkspacePage from './pages/StudyWorkspacePage';
import AIAssistant from './pages/AIAssistant';

import { ToastProvider } from './context/ToastContext';
import { FileProvider } from './context/FileContext';
import { ProcessingProvider } from './context/ProcessingContext';
import { StudyMaterialProvider } from './context/StudyMaterialContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
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
              <Route path="/viewer/:fileId" element={<FileViewerPage />} />

              {/* Full-screen Study Workspace */}
              <Route path="/study/:fileId" element={<StudyWorkspacePage />} />

              {/* Protected Application Routes (with AppLayout sidebar/topnav) */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Placeholders for future routes */}
                <Route path="/pdfs" element={<div className="p-8">My PDFs Placeholder</div>} />
                <Route path="/summary" element={<div className="p-8">AI Summary Placeholder</div>} />
                <Route path="/explain" element={<div className="p-8">AI Explain Placeholder</div>} />
                <Route path="/questions" element={<div className="p-8">Question Generator Placeholder</div>} />
                <Route path="/chat" element={<AIAssistant />} />
                <Route path="/flashcards" element={<div className="p-8">Flashcards Placeholder</div>} />
                <Route path="/quiz" element={<div className="p-8">Quiz Generator Placeholder</div>} />
                <Route path="/notes" element={<div className="p-8">Revision Notes Placeholder</div>} />
                <Route path="/analytics" element={<div className="p-8">Analytics Placeholder</div>} />
                <Route path="/settings" element={<div className="p-8">Settings Placeholder</div>} />
              </Route>

              {/* Catch-all redirect for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </StudyMaterialProvider>
          </ProcessingProvider>
        </FileProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
