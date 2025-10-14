import { jest } from '@jest/globals';
import { ReloadableWeaponAttackFeature } from '../../src/module/features/ReloadableWeaponAttackFeature';

const MODULE_ID = 'fvtt-weapon-reload';

export const mockReloadFeature = {
    onReloadCallback: jest.fn(),
};

export const mockUiManager = {
    sendChat: jest.fn(),
    uiNotification: jest.fn(),
};

export const mockModuleManager = {
    id: MODULE_ID,
    uiManager: mockUiManager,
};

export const mockFeatureManager = {
    getFeature: jest.fn().mockReturnValue(mockReloadFeature),
    id: MODULE_ID,
    uiManager: mockUiManager,
    moduleManager: mockModuleManager,
};

export function makeMockReloadableWeaponAttackFeature(): ReloadableWeaponAttackFeature {
    const feature = new ReloadableWeaponAttackFeature(
        mockFeatureManager as any
    );

    (feature as any)._weaponId = 'testWeaponId';
    (feature as any)._actorId = 'testActorId';

    (feature as any).translate = jest.fn((key: string) => key);
    (feature as any).reload = jest.fn((mockActor, mockWeapon) => {
        (mockFeatureManager.getFeature('reload') as any).onReloadCallback(
            mockActor,
            mockWeapon
        );
    });
    (feature as any).ammunition = jest.fn(() => [
        { name: 'Round 1', id: 'ammo1', use: jest.fn() },
        { name: 'Round 2', id: 'ammo2', use: jest.fn() },
    ]);
    (feature as any).getReloadFlag = jest.fn(() => [
        'Round 1',
        'Round 2',
        'Empty',
    ]);

    return feature;
}

export const moduleMocks = {
    FeatureManager: mockFeatureManager,
    ModuleManager: mockModuleManager,
    UiManager: mockUiManager,
};
