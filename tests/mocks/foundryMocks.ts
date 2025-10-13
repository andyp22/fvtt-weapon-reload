import { jest } from '@jest/globals';

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
                    uses: {}
                },
                getFlag: jest.fn().mockReturnValue(['Empty', 'Empty', 'Empty', 'Empty']),
                setFlag: jest.fn()
            }),
        }
    }),
  }
};

(global as any).foundry = {
  applications: {
    handlebars: {
      renderTemplate: jest.fn(async (_path: string, context: any) => {
        return `<div class="mock-template">${context?.item?.name ?? ''}</div>`;
      }),
    },
  },
};

(global as any).Roll = jest.fn().mockImplementation(() => ({
  roll: jest.fn().mockReturnValue({ total: 4 }),
  toMessage: jest.fn(),
}));

export const foundryMocks = {
  Hooks: (global as any).Hooks,
  game: (global as any).game,
  foundry: (global as any).foundry,
  Roll: (global as any).Roll,
};
