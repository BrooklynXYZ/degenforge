export const SESSION_CONFIG = {
  sessionDuration: 7 * 24 * 60 * 60 * 1000,

  storageKeys: {
    hasSeenOnboarding: '@ghala/hasSeenOnboarding',
    biometricEnabled: '@ghala/biometricEnabled',
    rememberMe: '@ghala/rememberMe',
    userProfile: '@ghala/userProfile',
    lastLoginTimestamp: '@ghala/lastLoginTimestamp',
  },

  secureKeys: {
    walletAddress: 'ghala-secure-walletAddress',
    sessionToken: 'ghala-secure-sessionToken',
  },
};
