import { jest } from '@jest/globals';

beforeAll(() => {
    (global as any).CONST = {
        CHAT_MESSAGE_TYPES: {
            WHISPER: 'whisper',
        },
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
    };

    (global as any).foundry = {
        applications: {
            handlebars: {
                renderTemplate: jest.fn(async () => {
                    return `<div>Rendered Template</div>`;
                }),
            },
        },
    };

    (global as any).Roll = jest.fn().mockReturnValue({
        roll: jest.fn().mockImplementation(function () {
            return Promise.resolve();
        }),
        toMessage: jest.fn(),
    });
});
