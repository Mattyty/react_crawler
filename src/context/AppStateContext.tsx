import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppState {
  currentCity: string;
  userPersona: string;
  isOnboarded: boolean;
  setCurrentCity: (city: string) => void;
  setUserPersona: (persona: string) => void;
  setOnboarded: () => void;
}

const AppStateContext = createContext<AppState>({
  currentCity: '',
  userPersona: '',
  isOnboarded: false,
  setCurrentCity: () => {},
  setUserPersona: () => {},
  setOnboarded: () => {},
});

const STORAGE_KEYS = {
  city: 'crawler_city',
  persona: 'crawler_persona',
  onboarded: 'crawler_onboarded',
};

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCity] = useState('');
  const [userPersona, setPersona] = useState('');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [city, persona, onboarded] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.city),
        AsyncStorage.getItem(STORAGE_KEYS.persona),
        AsyncStorage.getItem(STORAGE_KEYS.onboarded),
      ]);
      if (city) setCity(city);
      if (persona) setPersona(persona);
      if (onboarded === 'true') setIsOnboarded(true);
      setLoaded(true);
    })();
  }, []);

  const setCurrentCity = (city: string) => {
    setCity(city);
    AsyncStorage.setItem(STORAGE_KEYS.city, city);
  };

  const setUserPersona = (persona: string) => {
    setPersona(persona);
    AsyncStorage.setItem(STORAGE_KEYS.persona, persona);
  };

  const setOnboarded = () => {
    setIsOnboarded(true);
    AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true');
  };

  if (!loaded) return null;

  return (
    <AppStateContext.Provider
      value={{ currentCity, userPersona, isOnboarded, setCurrentCity, setUserPersona, setOnboarded }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
