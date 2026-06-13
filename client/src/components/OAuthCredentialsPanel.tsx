import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  fields: {
    clientId: string;
    clientSecret: string;
  };
  guide: {
    title: string;
    steps: string[];
    redirectUrl: string;
  };
}

const PLATFORMS: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'from-pink-400 to-purple-500',
    fields: { clientId: 'App ID', clientSecret: 'App Secret' },
    guide: {
      title: 'Instagram OAuth Setup',
      steps: [
        'Go to https://developers.facebook.com/',
        'Create a new app or select existing one',
        'Add Instagram Graph API product',
        'Go to Settings → Basic to find App ID and App Secret',
        'Copy and paste them below',
      ],
      redirectUrl: 'https://aicontent-femeuybh.manus.space/api/oauth/callback/instagram',
    },
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '𝕏',
    color: 'from-black to-gray-700',
    fields: { clientId: 'API Key', clientSecret: 'API Secret Key' },
    guide: {
      title: 'Twitter OAuth Setup',
      steps: [
        'Go to https://developer.twitter.com/',
        'Create a new app',
        'Go to "Keys and tokens" tab',
        'Copy API Key and API Secret Key',
        'Paste them below',
      ],
      redirectUrl: 'https://aicontent-femeuybh.manus.space/api/oauth/callback/twitter',
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-600 to-blue-800',
    fields: { clientId: 'Client ID', clientSecret: 'Client Secret' },
    guide: {
      title: 'LinkedIn OAuth Setup',
      steps: [
        'Go to https://www.linkedin.com/developers/',
        'Create a new app',
        'Go to "Auth" tab',
        'Copy Client ID and Client Secret',
        'Paste them below',
      ],
      redirectUrl: 'https://aicontent-femeuybh.manus.space/api/oauth/callback/linkedin',
    },
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👤',
    color: 'from-blue-500 to-blue-700',
    fields: { clientId: 'App ID', clientSecret: 'App Secret' },
    guide: {
      title: 'Facebook OAuth Setup',
      steps: [
        'Go to https://developers.facebook.com/',
        'Create a new app',
        'Add Facebook Login product',
        'Go to Settings → Basic',
        'Copy App ID and App Secret',
      ],
      redirectUrl: 'https://aicontent-femeuybh.manus.space/api/oauth/callback/facebook',
    },
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: 'from-red-500 to-red-700',
    fields: { clientId: 'Client ID', clientSecret: 'Client Secret' },
    guide: {
      title: 'YouTube OAuth Setup',
      steps: [
        'Go to https://console.cloud.google.com/',
        'Create a new project',
        'Enable YouTube Data API v3',
        'Create OAuth 2.0 Client ID',
        'Download JSON and copy credentials',
      ],
      redirectUrl: 'https://aicontent-femeuybh.manus.space/api/oauth/callback/youtube',
    },
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-black to-gray-800',
    fields: { clientId: 'Client ID', clientSecret: 'Client Secret' },
    guide: {
      title: 'TikTok OAuth Setup',
      steps: [
        'Go to https://developers.tiktok.com/',
        'Create a new app',
        'Go to "App Settings"',
        'Copy Client ID and Client Secret',
        'Paste them below',
      ],
      redirectUrl: 'https://aicontent-femeuybh.manus.space/api/oauth/callback/tiktok',
    },
  },
];

export const OAuthCredentialsPanel: React.FC = () => {
  const [credentials, setCredentials] = useState<Record<string, { clientId: string; clientSecret: string }>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [savedPlatforms, setSavedPlatforms] = useState<Set<string>>(new Set());
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  const handleInputChange = (platformId: string, field: 'clientId' | 'clientSecret', value: string) => {
    setCredentials(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [field]: value,
      },
    }));
  };

  const handleSaveCredentials = (platformId: string) => {
    const cred = credentials[platformId];
    if (cred?.clientId && cred?.clientSecret) {
      setSavedPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.add(platformId);
        return newSet;
      });
      // Here you would typically send to backend
      console.log(`Saved credentials for ${platformId}`);
    }
  };

  const handleTestCredentials = async (platformId: string) => {
    setTestingPlatform(platformId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestingPlatform(null);
  };

  const toggleShowSecret = (platformId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [platformId]: !prev[platformId],
    }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">OAuth Credentials</h2>
        <p className="text-gray-400">Add your social media platform credentials to start automation</p>
      </div>

      {/* Quick Start Alert */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <HelpCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-200">
          <strong>New here?</strong> Click on any platform below to see step-by-step instructions on how to get your credentials.
        </AlertDescription>
      </Alert>

      {/* Tabs for each platform */}
      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 bg-gray-900/50 p-2">
          {PLATFORMS.map(platform => (
            <TabsTrigger
              key={platform.id}
              value={platform.id}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-lg">{platform.icon}</span>
              <span className="hidden sm:inline">{platform.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content for each platform */}
        {PLATFORMS.map(platform => (
          <TabsContent key={platform.id} value={platform.id} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Guide */}
              <Card className="border-gray-700 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{platform.icon}</span>
                    {platform.guide.title}
                  </CardTitle>
                  <CardDescription>Follow these steps to get your credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-3">
                    {platform.guide.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-300 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Redirect URL */}
                  <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Redirect URL (use this in platform settings):</p>
                    <code className="text-xs text-green-400 break-all font-mono">{platform.guide.redirectUrl}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 w-full text-xs"
                      onClick={() => navigator.clipboard.writeText(platform.guide.redirectUrl)}
                    >
                      Copy Redirect URL
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right: Credential Input */}
              <Card className="border-gray-700 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Add Credentials</CardTitle>
                  <CardDescription>Paste your credentials here</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      {platform.fields.clientId}
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </label>
                    <Input
                      type="text"
                      placeholder={`Enter ${platform.fields.clientId}`}
                      value={credentials[platform.id]?.clientId || ''}
                      onChange={(e) => handleInputChange(platform.id, 'clientId', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>

                  {/* Client Secret */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      {platform.fields.clientSecret}
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </label>
                    <div className="relative">
                      <Input
                        type={showSecrets[platform.id] ? 'text' : 'password'}
                        placeholder={`Enter ${platform.fields.clientSecret}`}
                        value={credentials[platform.id]?.clientSecret || ''}
                        onChange={(e) => handleInputChange(platform.id, 'clientSecret', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pr-10"
                      />
                      <button
                        onClick={() => toggleShowSecret(platform.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showSecrets[platform.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  {savedPlatforms.has(platform.id) && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/50 rounded text-green-400 text-sm">
                      <CheckCircle2 size={16} />
                      Credentials saved
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleTestCredentials(platform.id)}
                      variant="outline"
                      className="flex-1"
                      disabled={!credentials[platform.id]?.clientId || !credentials[platform.id]?.clientSecret || testingPlatform === platform.id}
                    >
                      {testingPlatform === platform.id ? 'Testing...' : 'Test Credentials'}
                    </Button>
                    <Button
                      onClick={() => handleSaveCredentials(platform.id)}
                      className={`flex-1 bg-gradient-to-r ${platform.color}`}
                      disabled={!credentials[platform.id]?.clientId || !credentials[platform.id]?.clientSecret}
                    >
                      {savedPlatforms.has(platform.id) ? 'Update' : 'Save'} Credentials
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary */}
      <Card className="border-gray-700 bg-gray-900/50">
        <CardHeader>
          <CardTitle>Credentials Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PLATFORMS.map(platform => {
              const isSaved = Array.from(savedPlatforms).includes(platform.id);
              return (
              <div key={platform.id} className="text-center">
                <div className="text-3xl mb-2">{platform.icon}</div>
                <p className="text-sm font-medium text-gray-300 mb-2">{platform.name}</p>
                {isSaved ? (
                  <div className="flex items-center justify-center gap-1 text-green-400 text-xs">
                    <CheckCircle2 size={14} />
                    Connected
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-xs">
                    <AlertCircle size={14} />
                    Pending
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Alert className="border-purple-500/50 bg-purple-500/10">
        <CheckCircle2 className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-200">
          <strong>All set!</strong> Once you've added credentials for all platforms, you can start scheduling posts and automating your social media.
        </AlertDescription>
      </Alert>
    </div>
  );
};
