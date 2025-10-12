'use client';

import { ReactNode } from 'react';
import { FlashcardsProvider } from '@/context/FlashcardsContext';
import ReminderManager from './ReminderManager';

const AppProviders = ({ children }: { children: ReactNode }) => (
  <FlashcardsProvider>
    {children}
    <ReminderManager />
  </FlashcardsProvider>
);

export default AppProviders;
