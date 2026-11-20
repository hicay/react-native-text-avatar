module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/__tests__/**'],
};
