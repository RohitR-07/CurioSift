import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Protected Application Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Placeholders for future routes */}
            <Route path="/pdfs" element={<div className="p-8">My PDFs Placeholder</div>} />
            <Route path="/summary" element={<div className="p-8">AI Summary Placeholder</div>} />
            <Route path="/explain" element={<div className="p-8">AI Explain Placeholder</div>} />
            <Route path="/questions" element={<div className="p-8">Question Generator Placeholder</div>} />
            <Route path="/chat" element={<div className="p-8">AI Chat Placeholder</div>} />
            <Route path="/flashcards" element={<div className="p-8">Flashcards Placeholder</div>} />
            <Route path="/quiz" element={<div className="p-8">Quiz Generator Placeholder</div>} />
            <Route path="/notes" element={<div className="p-8">Revision Notes Placeholder</div>} />
            <Route path="/analytics" element={<div className="p-8">Analytics Placeholder</div>} />
            <Route path="/settings" element={<div className="p-8">Settings Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
