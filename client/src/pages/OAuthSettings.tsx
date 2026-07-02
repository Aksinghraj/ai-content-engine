import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';

export const OAuthSettings: React.FC = () => {
  const [credentials, setCredentials] = useState({
    instagram: { clientId: '', clientSecret: '', isConnected: false },
    tiktok: { clientId: '', clientSecret: '', isConnected: false },
    youtube: { clientId: '', clientSecret: '', isConnected: false },
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleInputChange = (platform: keyof typeof credentials, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value }
    }));
  };

  const handleConnect = (platform: keyof typeof credentials) => {
    if (credentials[platform].clientId && credentials[platform].clientSecret) {
      setCredentials(prev => ({
        ...prev,
        [platform]: { ...prev[platform], isConnected: true }
      }));
    }
  };

  const platforms = [
    { key: 'instagram', name: 'Instagram', icon: '📷', color: 'from-pink-600 to-rose-600' },
    { key: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-black to-slate-800' },
    { key: 'youtube', name: 'YouTube', icon: '▶️', color: 'from-red-600 to-red-700' },
  ] as const;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">OAuth Settings</h1>
          <p className="text-slate-400">Connect your social media accounts to automate posting</p>
        </div>

        <div className="space-y-6">
          {platforms.map(platform => {
            const cred = credentials[platform.key];
            const isConnected = cred.isConnected;

            return (
              <div key={platform.key} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl`}>{platform.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{platform.name}</h3>
                      <p className="text-slate-400 text-sm">Connect your {platform.name} account</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Not Connected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Client ID */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Client ID</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={`Enter ${platform.name} Client ID`}
                        value={cred.clientId}
                        onChange={(e) => handleInputChange(platform.key, 'clientId', e.target.value)}
                        disabled={isConnected}
                        className="flex-1"
                      />
                      {cred.clientId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(cred.clientId, `${platform.key}-id`)}
                        >
                          {copied === `${platform.key}-id` ? '✓' : <Copy className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Client Secret */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Client Secret</label>
                    <div className="flex gap-2">
                      <Input
                        type={showSecrets[platform.key] ? 'text' : 'password'}
                        placeholder={`Enter ${platform.name} Client Secret`}
                        value={cred.clientSecret}
                        onChange={(e) => handleInputChange(platform.key, 'clientSecret', e.target.value)}
                        disabled={isConnected}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSecrets(prev => ({ ...prev, [platform.key]: !prev[platform.key] }))}
                      >
                        {showSecrets[platform.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      {cred.clientSecret && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(cred.clientSecret, `${platform.key}-secret`)}
                        >
                          {copied === `${platform.key}-secret` ? '✓' : <Copy className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!isConnected && (
                    <Button
                      onClick={() => handleConnect(platform.key)}
                      disabled={!cred.clientId || !cred.clientSecret}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Connect {platform.name}
                    </Button>
                  )}
                  {isConnected && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCredentials(prev => ({
                          ...prev,
                          [platform.key]: { clientId: '', clientSecret: '', isConnected: false }
                        }));
                      }}
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to get your credentials
          </h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li>• Go to your platform's developer console</li>
            <li>• Create a new application</li>
            <li>• Copy the Client ID and Client Secret</li>
            <li>• Paste them here and click Connect</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};
