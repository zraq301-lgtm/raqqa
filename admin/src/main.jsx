import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FCM } from '@capacitor-community/fcm';
import { initializeGithubLiveUpdate } from './services/githubLiveUpdate';

const Main = () => {
  const handleTokenLocally = (tokenValue) => {
    if (tokenValue) localStorage.setItem('fcm_token', tokenValue);
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    initializeGithubLiveUpdate();
    const setupNotifications = async () => {
      try {
        await PushNotifications.addListener('registration', async (token) => {
          handleTokenLocally(token.value);
          try { await FCM.subscribeTo({ topic: 'all_users' }); } catch (error) { console.error('Topic Subscription Error:', error); }
        });
        await PushNotifications.addListener('pushNotificationReceived', (notification) => console.log('Push notification:', notification.title));
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => console.log('Push action:', notification.actionId));
        await LocalNotifications.addListener('localNotificationReceived', (notification) => console.log('Local notification:', notification.title));
        await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => console.log('Local action:', notification.actionId));
        const pushPerm = await PushNotifications.checkPermissions();
        const localPerm = await LocalNotifications.checkPermissions();
        if (pushPerm.receive === 'prompt') await PushNotifications.requestPermissions();
        if (localPerm.display === 'prompt') await LocalNotifications.requestPermissions();
        if ((await PushNotifications.checkPermissions()).receive === 'granted') await PushNotifications.register();
      } catch (error) { console.error('Notifications Init Error:', error); }
    };
    setupNotifications();
    return undefined;
  }, []);

  return <BrowserRouter><App /></BrowserRouter>;
};

const rootElement = document.getElementById('root');
if (rootElement) ReactDOM.createRoot(rootElement).render(<Main />);
