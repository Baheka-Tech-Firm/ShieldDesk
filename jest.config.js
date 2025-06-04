/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/client/src/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/server/**/*.test.(ts|js)',
    '<rootDir>/shared/**/*.test.(ts|js)'
  ],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.{ts,js}',
    'shared/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/*.config.{ts,js}',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70
    }
  },
  
  // CI-specific settings
  ci: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
  verbose: true,
  bail: false,
  maxWorkers: '50%',
  projects: [
    {
      displayName: 'Frontend Tests',
      testMatch: ['<rootDir>/client/src/**/*.test.(ts|tsx)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup-frontend.ts']
    },
    {
      displayName: 'Backend Tests',
      testMatch: ['<rootDir>/server/**/*.test.(ts|js)'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup-backend.ts']
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/integration/**/*.test.(ts|js)'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts']
    }
  ]
};