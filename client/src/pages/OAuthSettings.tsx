import React, { useEffect } from 'react';
import { OAuthCredentialsPanel } from '@/components/OAuthCredentialsPanel';
import { useLocation } from 'wouter';

export const OAuthSettings: React.FC = () => {
  const [, navigate] = useLocation();
  // For now, assume user is authenticated if they reached this page
  const user = { id: '1', name: 'User' };
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-purple-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <OAuthCredentialsPanel />
      </div>
    </div>
  );
};
