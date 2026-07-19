import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PassportPhoto from './components/PassportPhoto';
import IdCardPrint from './components/IdCardPrint';
import SettingsPage from './components/SettingsPage';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<PassportPhoto />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/id-print" element={<IdCardPrint />} />
        <Route path="/app" element={<Navigate to="/studio" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PwaInstallPrompt />
    </BrowserRouter>
  );
}
