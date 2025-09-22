import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navigation />
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;