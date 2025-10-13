import { jest } from '@jest/globals';
import { ReloadableWeaponAttackFeature } from '../../src/module/features/ReloadableWeaponAttackFeature';

// ------------------------------
// Foundry global mocks
// ------------------------------
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

// ------------------------------
// Mock dependencies
// ------------------------------
const mockFeatureManager = {
  getFeature: jest.fn().mockReturnValue({
    onReloadCallback: jest.fn(),
  }),
  id: 'fvtt-weapon-reload',
  uiManager: {
    sendChat: jest.fn(),
    uiNotification: jest.fn(),
  },
  moduleManager: {
    id: 'fvtt-weapon-reload',
  },
};

const mockWeapon = {
  name: 'Mock Gun',
  img: 'mock.png',
  system: {
    uses: { max: 6, spent: 0, value: 6 },
  },
  setFlag: jest.fn(),
  getFlag: jest.fn(),
  update: jest.fn(),
};

const mockCharacter = {
  name: 'Mock Shooter',
  items: {
    get: jest.fn(),
  },
};

// ------------------------------
// Factory: safe instantiation helper
// ------------------------------
export function makeMockReloadableWeaponAttackFeature(): ReloadableWeaponAttackFeature {
  const feature = new ReloadableWeaponAttackFeature(mockFeatureManager as any);

  // Safely stub properties
  (feature as any)._weaponId = 'testWeaponId';
  (feature as any)._actorId = 'testActorId';
  (feature as any).getReloadFlag = jest.fn().mockReturnValue(['Round 1', 'Round 2', 'Empty']);

  // Lightweight method stubs
  (feature as any).translate = jest.fn((key: string) => key);
  (feature as any).renderCard = jest.fn();
  (feature as any).reload = jest.fn();
  (feature as any).ammunition = jest.fn(() => [
    { name: 'Round 1', id: 'ammo1', use: jest.fn() },
    { name: 'Round 2', id: 'ammo2', use: jest.fn() },
  ]);

  return feature;
}

// ------------------------------
// Exported mocks for convenience
// ------------------------------
export const mocks = {
  Hooks: (global as any).Hooks,
  game: (global as any).game,
  foundry: (global as any).foundry,
  Roll: (global as any).Roll,
  FeatureManager: mockFeatureManager,
  Weapon: mockWeapon,
  Character: mockCharacter,
};