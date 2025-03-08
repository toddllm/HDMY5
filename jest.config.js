/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true,
          target: 'es2020',
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'node'
        }
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx']
}; 