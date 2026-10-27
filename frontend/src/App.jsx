import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import RaceDetail from './pages/RaceDetail';
import DriverStandings from './pages/DriverStandings';
import ConstructorStandings from './pages/ConstructorStandings';
import Drivers from './pages/Drivers';
import DriverProfile from './pages/DriverProfile';
import Circuits from './pages/Circuits';
import CircuitDetail from './pages/CircuitDetail';
import Insights from './pages/Insights';
import { api } from './services/api';

/**
 * Global Scroll Restoration Component
 * Automatically resets window & document scroll position to top (0, 0)
 * whenever the user navigates to any new route.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

export default function App() {
  const [systemStatus, setSystemStatus] = useState({
    season: '2026',
    isDemo: false,
    lastUpdated: null,
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.getStatus();
        setSystemStatus({
          season: res.season || '2026',
          isDemo: res.is_demo || false,
          lastUpdated: res.last_updated || null,
        });
      } catch (err) {
        console.warn('Backend not responding yet, operating with local defaults:', err);
      }
    }
    checkStatus();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0D12] text-[#F8F9FA] antialiased selection:bg-[#E10600] selection:text-white">
        {/* Left Dark Charcoal Sidebar / Mobile Header */}
        <Sidebar
          season={systemStatus.season}
          isDemo={systemStatus.isDemo}
          lastUpdated={systemStatus.lastUpdated}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              {/* Home Dashboard */}
              <Route path="/" element={<Home />} />

              {/* Race Calendar & Details */}
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/races/:season/:round" element={<RaceDetail />} />

              {/* Standings */}
              <Route path="/standings" element={<Navigate to="/standings/drivers" replace />} />
              <Route path="/standings/drivers" element={<DriverStandings />} />
              <Route path="/standings/constructors" element={<ConstructorStandings />} />

              {/* Drivers & Profiles */}
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/drivers/:driverId" element={<DriverProfile />} />

              {/* Circuits */}
              <Route path="/circuits" element={<Circuits />} />
              <Route path="/circuits/:circuitId" element={<CircuitDetail />} />

              {/* Insights / Analytics */}
              <Route path="/insights" element={<Insights />} />
              <Route path="/analytics" element={<Navigate to="/insights" replace />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
