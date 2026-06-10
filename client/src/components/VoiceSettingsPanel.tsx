import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume2, Mic, Play, RotateCcw } from "lucide-react";
import { useVoiceSettings, useVoiceTest } from "@/hooks/useVoiceWelcome";
import { VoiceSettings, testVoice } from "@/lib/voiceWelcome";

export function VoiceSettingsPanel() {
  const { settings, updateSettings, resetSettings, isLoading } = useVoiceSettings();
  const { isTesting, testVoice: performTest } = useVoiceTest();
  const [activeTab, setActiveTab] = useState<"general" | "advanced">("general");

  if (isLoading) {
    return <div className="text-center py-4">Loading voice settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Voice Welcome Settings</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "general"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "advanced"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Advanced
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <Card className="p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Voice Welcome</h3>
              <p className="text-sm text-gray-600">
                {settings.enabled
                  ? "AI will greet you by name on every visit"
                  : "Voice welcome is disabled"}
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                updateSettings({ enabled: checked })
              }
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Volume
              </label>
              <span className="text-sm text-gray-600">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={(value) =>
                updateSettings({ volume: value[0] })
              }
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold">Speech Speed</label>
              <span className="text-sm text-gray-600">
                {settings.speed.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[settings.speed]}
              onValueChange={(value) =>
                updateSettings({ speed: value[0] })
              }
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Adjust how fast the AI speaks (0.5x - 2.0x)
            </p>
          </div>

          {/* Voice Type */}
          <div className="space-y-2">
            <label className="font-semibold">Voice Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["male", "female", "neutral"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => updateSettings({ voiceType: type })}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors capitalize ${
                    settings.voiceType === type
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Test Voice */}
          <div className="pt-4 border-t">
            <Button
              onClick={() => performTest(settings)}
              disabled={isTesting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isTesting ? "Playing..." : "Test Voice"}
            </Button>
          </div>
        </Card>
      )}

      {/* Advanced Settings */}
      {activeTab === "advanced" && (
        <Card className="p-6 space-y-6">
          {/* Pitch Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold">Pitch</label>
              <span className="text-sm text-gray-600">
                {settings.pitch.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[settings.pitch]}
              onValueChange={(value) =>
                updateSettings({ pitch: value[0] })
              }
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Adjust voice pitch (0.5x - 2.0x)
            </p>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="font-semibold">Language</label>
            <select
              value={settings.language}
              onChange={(e) =>
                updateSettings({ language: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="ja-JP">Japanese</option>
              <option value="zh-CN">Chinese (Simplified)</option>
            </select>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Advanced settings may not be supported on all
              browsers. Test your settings to ensure they work as expected.
            </p>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={resetSettings}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </Card>
      )}

      {/* Settings Summary */}
      <Card className="p-4 bg-purple-50 border border-purple-200">
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-purple-900">Current Settings:</p>
          <ul className="space-y-1 text-purple-800">
            <li>• Status: {settings.enabled ? "✅ Enabled" : "❌ Disabled"}</li>
            <li>• Volume: {Math.round(settings.volume * 100)}%</li>
            <li>• Speed: {settings.speed.toFixed(1)}x</li>
            <li>• Pitch: {settings.pitch.toFixed(1)}x</li>
            <li>• Voice: {settings.voiceType}</li>
            <li>• Language: {settings.language}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
