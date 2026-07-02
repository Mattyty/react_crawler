import React, { useState } from 'react';

import { useAppState } from '@/context/AppStateContext';

import { CitySelector } from './CitySelector';
import { PersonaSelector } from './PersonaSelector';

export function OnboardingFlow() {
  const { isOnboarded, setOnboarded } = useAppState();
  const [step, setStep] = useState<'city' | 'persona'>('city');

  if (isOnboarded) return null;

  return (
    <>
      <CitySelector visible={step === 'city'} onDone={() => setStep('persona')} />
      <PersonaSelector
        visible={step === 'persona'}
        onDone={() => {
          setOnboarded();
        }}
      />
    </>
  );
}
