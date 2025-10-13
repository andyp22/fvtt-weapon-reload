// This file mocks minimal pieces of FoundryVTT's global API.
// You can expand this as your module uses more of Foundry.

export function setupFoundryMocks() {
  const Hooks = {
    on: jest.fn(),
    once: jest.fn(),
    callAll: jest.fn(),
  };

  const game = {
    settings: {
      get: jest.fn(),
      set: jest.fn(),
      register: jest.fn(),
    },
    i18n: {
      localize: (str: string) => str,
    },
    modules: new Map(),
    user: { id: "1234", isGM: true },
  };

  const CONFIG = {
    debug: { hooks: false },
  };

  // Expose globals so your code sees them
  (global as any).Hooks = Hooks;
  (global as any).game = game;
  (global as any).CONFIG = CONFIG;

  return { Hooks, game, CONFIG };
}
