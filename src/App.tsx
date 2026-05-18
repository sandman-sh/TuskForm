
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { FormBuilder } from './pages/FormBuilder';
import { FormView } from './pages/FormView';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/build" element={<FormBuilder />} />
          <Route path="/build/:id" element={<FormBuilder />} />
          <Route path="/f/:id" element={<FormView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
