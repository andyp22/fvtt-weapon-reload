import { jest } from '@jest/globals';

beforeAll(() => {
    (global as any).CONST = {
        CHAT_MESSAGE_TYPES: {
            OTHER: 0,
            WHISPER: 1,
        },
    };

    (global as any).CONFIG = {
        DND5E: {
            featureTypes: {},
            itemProperties: {},
            validProperties: { weapon: new Set() },
            weaponIds: {},
        },
        debug: {},
    };

    (global as any).Hooks = {
        on: jest.fn(),
        once: jest.fn(),
        off: jest.fn(),
        callAll: jest.fn(),
    };

    (global as any).game = {
        settings: {
            get: jest.fn().mockReturnValue(false),
            set: jest.fn(),
            register: jest.fn(),
        },
        actors: {
            get: jest.fn().mockReturnValue({
                items: {
                    get: jest.fn().mockReturnValue({
                        system: {
                            uses: { max: 6, spent: 0, value: 6 },
                        },
                        getFlag: jest
                            .fn()
                            .mockReturnValue([
                                'Empty',
                                'Empty',
                                'Empty',
                                'Empty',
                            ]),
                        setFlag: jest.fn(),
                    }),
                },
            }),
        },
        i18n: {
            localize: jest.fn((key) => `localized:${key}`),
            format: jest.fn(
                (key, opts) => `formatted:${key}:${JSON.stringify(opts)}`
            ),
        },
    };

    (global as any).foundry = {
        applications: {
            api: {
                DialogV2: jest.fn(),
            },
            handlebars: {
                renderTemplate: jest.fn(async () => {
                    return `<div>Rendered Template</div>`;
                }),
            },
        },
    };

    (globalThis as any).ui = {
        notifications: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        },
    };

    (globalThis as any).ChatMessage = {
        getSpeaker: jest.fn().mockImplementation(() => ({ alias: 'Speaker' })),
        create: jest.fn(),
    };

    (global as any).Roll = jest.fn().mockReturnValue({
        roll: jest.fn().mockImplementation(function () {
            return Promise.resolve();
        }),
        toMessage: jest.fn(),
    });
});
