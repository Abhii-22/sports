import React from 'react';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';

const CombinedProvider = ({ children }) => {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  );
};

export default CombinedProvider;
