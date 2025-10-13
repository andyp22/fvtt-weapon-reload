import { jest } from '@jest/globals';
import { ReloadableWeaponAttackFeature } from '../../src/module/features/ReloadableWeaponAttackFeature';

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

export function makeMockReloadableWeaponAttackFeature(): ReloadableWeaponAttackFeature {
  const feature = new ReloadableWeaponAttackFeature(mockFeatureManager as any);

  // Stub properties
  (feature as any)._weaponId = 'testWeaponId';
  (feature as any)._actorId = 'testActorId';

  // Lightweight method stubs
  (feature as any).translate = jest.fn((key: string) => key);
  (feature as any).renderCard = jest.fn();
  (feature as any).reload = jest.fn();
  (feature as any).ammunition = jest.fn(() => [
    { name: 'Round 1', id: 'ammo1', use: jest.fn() },
    { name: 'Round 2', id: 'ammo2', use: jest.fn() },
  ]);
  (feature as any).getReloadFlag = jest.fn().mockReturnValue(['Round 1', 'Round 2', 'Empty']);

  return feature;
}

export const moduleMocks = {
  FeatureManager: mockFeatureManager,
};