import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SetupPage from './pages/SetupPage';
import ExtractPage from './pages/ExtractPage';
import ConfigurePage from './pages/ConfigurePage';
import GeneratePage from './pages/GeneratePage';
import ReviewPage from './pages/ReviewPage';

function App() {
  const { currentPage, isAPIInitialized } = useStore();

  const renderPage = () => {
    if (!isAPIInitialized) {
      return <SetupPage />;
    }

    switch (currentPage) {
      case 'extract':
        return <ExtractPage />;
      case 'configure':
        return <ConfigurePage />;
      case 'generate':
        return <GeneratePage />;
      case 'review':
        return <ReviewPage />;
      default:
        return <ExtractPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-gray-100">
      {isAPIInitialized && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
