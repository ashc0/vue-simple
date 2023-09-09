export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node', 'vue'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/packages/**/__tests__/**/*.[jt]s?(x)', '**/packages/**/?(*.)spec.[tj]s?(x)'],
  transform: {
    '^.+\\.(j)s$': 'babel-jest',
    '^.+\\.(t)s$': 'ts-jest'
  }
}
