import React from 'react';
import { OAuthCredentialsPanel } from '@/components/OAuthCredentialsPanel';
import DashboardLayout from '@/components/DashboardLayout';

export const OAuthSettings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <OAuthCredentialsPanel />
      </div>
    </DashboardLayout>
  );
};
