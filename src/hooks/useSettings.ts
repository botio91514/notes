import { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { db } from '../utils/database';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    fontSize: 16,
    fontFamily: 'Inter',
    aiEnabled: true,
    encryptionEnabled: true
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await db.settings.toArray();
      if (settingsData.length > 0) {
        setSettings(settingsData[0]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    try {
      await db.settings.clear();
      await db.settings.add(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  return {
    settings,
    loading,
    updateSettings,
    toggleTheme
  };
};