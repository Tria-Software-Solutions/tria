'use client';

import { ReactNode } from 'react';

interface IntlProviderProps {
  children: ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  return <>{children}</>;
}
