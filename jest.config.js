const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup/foundry-globals.ts'],
    testEnvironment: 'jsdom',
    transform: {
        ...tsJestTransformCfg,
    },
};
