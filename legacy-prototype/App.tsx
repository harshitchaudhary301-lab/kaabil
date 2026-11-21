import React, { useState, useEffect } from 'react';
import { IntroLandingPage } from './pages/IntroLandingPage';
import { LandingPage } from './pages/LandingPage';
import { AppWorkspace } from './pages/AppWorkspace';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/app')) return '/app';
    if (path.startsWith('/landing') || path.startsWith('/overview')) return '/landing';
    return '/'; // Root defaults to the 5-second introductory welcome landing page
  });

  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/app')) {
        setCurrentRoute('/app');
      } else if (path.startsWith('/landing') || path.startsWith('/overview')) {
        setCurrentRoute('/landing');
      } else {
        setCurrentRoute('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, query?: string) => {
    if (query) {
      setInitialSearchQuery(query);
    }
    window.history.pushState(null, '', path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route 1: Main Dashboard (/app)
  if (currentRoute === '/app') {
    return (
      <AppWorkspace
        initialSearchQuery={initialSearchQuery}
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // Route 2: Detailed Extended Landing Page (/landing)
  if (currentRoute === '/landing') {
    return (
      <LandingPage
        onNavigateToApp={(query?: string) => navigateTo('/app', query)}
      />
    );
  }

  // Route 3: Root (/) - 5-Second Introductory Landing Page
  return (
    <IntroLandingPage
      onTransitionToDashboard={() => navigateTo('/app')}
      onExploreFullLanding={() => navigateTo('/landing')}
    />
  );
};

export default App;
