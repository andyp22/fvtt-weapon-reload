import ModuleManager from './ModuleManager';
import FeatureManager from './FeatureManager';
import UiManager from './UiManager';
import TemplateManager from './TemplateManager';
import { jest } from '@jest/globals';

jest.mock('./FeatureManager');
jest.mock('./UiManager');
jest.mock('./TemplateManager');

let moduleManager: ModuleManager;

// Mocks for Foundry globals
beforeEach(() => {
    jest.clearAllMocks();

    (global as any).game = {
        release: {
            generation: 13,
        },
        settings: {
            register: jest.fn(),
        },
    };

    (global as any).CONFIG = {
        debug: {
            hooks: false,
        },
        DND5E: {
            featureTypes: {
                item: {},
            },
            itemProperties: {
                concealable: {},
                unstable: {},
            },
            validProperties: {
                weapon: new Set<string>(),
            },
            weaponIds: {},
        },
    };

    (UiManager as jest.Mock).mockImplementation(() => ({
        getLocalizedTxt: jest.fn((key: string) => `localized:${key}`),
    }));

    (FeatureManager as jest.Mock).mockImplementation(() => ({
        init: jest.fn(),
    }));

    (TemplateManager as unknown as jest.Mock).mockImplementation(() => ({
        init: jest.fn(),
    }));

    moduleManager = new ModuleManager('fvtt-weapon-reload');
});

describe('ModuleManager', () => {
    describe('constructor()', () => {
        test('sets the module id', () => {
            expect(moduleManager.id).toBe('fvtt-weapon-reload');
        });

        test('initializes the managers', () => {
            expect(FeatureManager).toHaveBeenCalledWith(moduleManager);
            expect(UiManager).toHaveBeenCalledWith(moduleManager);
            expect(TemplateManager).toHaveBeenCalledTimes(1);
        });

        test('stores the Foundry generation', () => {
            expect(moduleManager.version).toBe(13);
        });
    });

    describe('getters', () => {
        test('return the expected manager instances', () => {
            expect(moduleManager.featureManager).toBeDefined();
            expect(moduleManager.uiManager).toBeDefined();
            expect(moduleManager.templateManager).toBeDefined();
        });

        test('featureManager returns the FeatureManager instance', () => {
            expect(moduleManager.featureManager).toBe(
                (moduleManager as any)._featureManager
            );
        });

        test('uiManager returns the UiManager instance', () => {
            expect(moduleManager.uiManager).toBe(
                (moduleManager as any)._uiManager
            );
        });

        test('templateManager returns the TemplateManager instance', () => {
            expect(moduleManager.templateManager).toBe(
                (moduleManager as any)._templateManager
            );
        });
    });

    describe('init()', () => {
        test('calls systemOverrides and moduleConfigurations', () => {
            const systemOverridesSpy = jest.spyOn(
                moduleManager,
                'systemOverrides'
            );
            const moduleConfigurationsSpy = jest.spyOn(
                moduleManager,
                'moduleConfigurations'
            );

            moduleManager.init();

            expect(systemOverridesSpy).toHaveBeenCalledTimes(1);
            expect(moduleConfigurationsSpy).toHaveBeenCalledTimes(1);
        });

        test('initializes the feature and template managers', () => {
            moduleManager.init();

            expect(
                moduleManager.featureManager.init as jest.Mock
            ).toHaveBeenCalledTimes(1);

            expect(
                moduleManager.templateManager.init as jest.Mock
            ).toHaveBeenCalledTimes(1);
        });

        test('calls initialization methods in the expected order', () => {
            const calls: string[] = [];

            jest.spyOn(moduleManager, 'systemOverrides').mockImplementation(
                () => {
                    calls.push('systemOverrides');
                }
            );

            jest.spyOn(
                moduleManager,
                'moduleConfigurations'
            ).mockImplementation(() => {
                calls.push('moduleConfigurations');
            });

            (moduleManager.featureManager.init as jest.Mock).mockImplementation(
                () => {
                    calls.push('featureManager.init');
                }
            );

            (
                moduleManager.templateManager.init as jest.Mock
            ).mockImplementation(() => {
                calls.push('templateManager.init');
            });

            moduleManager.init();

            expect(calls).toEqual([
                'systemOverrides',
                'moduleConfigurations',
                'featureManager.init',
                'templateManager.init',
            ]);
        });
    });

    describe('systemOverrides()', () => {
        test('sets the item feature label', () => {
            moduleManager.systemOverrides();

            expect((global as any).CONFIG.DND5E.featureTypes.item).toEqual({
                label: 'localized:WEAPON_RELOAD.ItemFeature',
            });
        });

        test('sets the concealable item property', () => {
            moduleManager.systemOverrides();

            expect(
                (global as any).CONFIG.DND5E.itemProperties.concealable
            ).toEqual({
                label: 'localized:WEAPON_RELOAD.Concealable',
            });
        });

        test('adds concealable to valid weapon properties', () => {
            moduleManager.systemOverrides();

            expect(
                (global as any).CONFIG.DND5E.validProperties.weapon.has(
                    'concealable'
                )
            ).toBe(true);
        });

        test('sets the unstable item property', () => {
            moduleManager.systemOverrides();

            expect(
                (global as any).CONFIG.DND5E.itemProperties.unstable
            ).toEqual({
                label: 'localized:WEAPON_RELOAD.Unstable',
                isPhysical: true,
            });
        });

        test('sets the reloadable weapon id', () => {
            moduleManager.systemOverrides();

            expect(
                (global as any).CONFIG.DND5E.weaponIds.reloadableWeapon
            ).toBe(
                'Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.lE60QaS1sctb3OAd'
            );
        });

        test('localizes all configured labels', () => {
            moduleManager.systemOverrides();

            const getLocalizedTxt = moduleManager.uiManager
                .getLocalizedTxt as jest.Mock;

            expect(getLocalizedTxt).toHaveBeenCalledTimes(3);
            expect(getLocalizedTxt).toHaveBeenCalledWith(
                'WEAPON_RELOAD.ItemFeature'
            );
            expect(getLocalizedTxt).toHaveBeenCalledWith(
                'WEAPON_RELOAD.Concealable'
            );
            expect(getLocalizedTxt).toHaveBeenCalledWith(
                'WEAPON_RELOAD.Unstable'
            );
        });
    });

    describe('moduleConfigurations()', () => {
        test('registers all expected settings', () => {
            moduleManager.moduleConfigurations();

            expect(
                (global as any).game.settings.register
            ).toHaveBeenCalledTimes(5);
        });

        test('registers unstableAmmo', () => {
            moduleManager.moduleConfigurations();

            expect((global as any).game.settings.register).toHaveBeenCalledWith(
                'fvtt-weapon-reload',
                'unstableAmmo',
                expect.objectContaining({
                    scope: 'world',
                    name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Name',
                    hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Hint',
                    type: Boolean,
                    config: true,
                    default: true,
                })
            );
        });

        test('registers unstableAmmoFailureThreshhold', () => {
            moduleManager.moduleConfigurations();

            expect((global as any).game.settings.register).toHaveBeenCalledWith(
                'fvtt-weapon-reload',
                'unstableAmmoFailureThreshhold',
                expect.objectContaining({
                    scope: 'world',
                    name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Name',
                    hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Hint',
                    type: Number,
                    config: true,
                    default: 2,
                })
            );
        });

        test('registers useMisfires', () => {
            moduleManager.moduleConfigurations();

            expect((global as any).game.settings.register).toHaveBeenCalledWith(
                'fvtt-weapon-reload',
                'useMisfires',
                expect.objectContaining({
                    scope: 'world',
                    type: Boolean,
                    config: true,
                    default: true,
                })
            );
        });

        test('registers filterAmmunitionByEquipped as a user setting', () => {
            moduleManager.moduleConfigurations();

            expect((global as any).game.settings.register).toHaveBeenCalledWith(
                'fvtt-weapon-reload',
                'filterAmmunitionByEquipped',
                expect.objectContaining({
                    scope: 'user',
                    type: Boolean,
                    config: true,
                    default: false,
                })
            );
        });

        test('registers repeaterRoundUUID', () => {
            moduleManager.moduleConfigurations();

            expect((global as any).game.settings.register).toHaveBeenCalledWith(
                'fvtt-weapon-reload',
                'repeaterRoundUUID',
                expect.objectContaining({
                    scope: 'world',
                    type: String,
                    config: true,
                    default:
                        'Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.GQzRN4amlRZX7k0V',
                })
            );
        });
    });

    describe('debug()', () => {
        test('sets CONFIG.debug.hooks to true', () => {
            const logSpy = jest
                .spyOn(console, 'log')
                .mockImplementation(() => {});

            moduleManager.debug(true);

            expect((global as any).CONFIG.debug.hooks).toBe(true);

            logSpy.mockRestore();
        });

        test('sets CONFIG.debug.hooks to false', () => {
            const logSpy = jest
                .spyOn(console, 'log')
                .mockImplementation(() => {});

            (global as any).CONFIG.debug.hooks = true;

            moduleManager.debug(false);

            expect((global as any).CONFIG.debug.hooks).toBe(false);

            logSpy.mockRestore();
        });

        test('logs the Foundry version', () => {
            const logSpy = jest
                .spyOn(console, 'log')
                .mockImplementation(() => {});

            moduleManager.debug();

            expect(logSpy).toHaveBeenCalledWith(
                'Foundry Version: ',
                moduleManager.version
            );

            logSpy.mockRestore();
        });

        test('logs CONFIG and CONFIG.DND5E', () => {
            const logSpy = jest
                .spyOn(console, 'log')
                .mockImplementation(() => {});

            moduleManager.debug();

            expect(logSpy).toHaveBeenCalledWith(
                'CONFIG: ',
                (global as any).CONFIG
            );

            expect(logSpy).toHaveBeenCalledWith(
                'CONFIG.DND5E: ',
                (global as any).CONFIG.DND5E
            );

            logSpy.mockRestore();
        });
    });

    describe('toString()', () => {
        test('returns the expected identifier', () => {
            expect(moduleManager.toString()).toBe('class ModuleManager');
        });
    });
});
