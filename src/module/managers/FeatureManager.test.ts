import FeatureManager from './FeatureManager';
import ModuleManager from './ModuleManager';
import {
    NextRoundFeature,
    ReloadFeature,
    ReloadableWeaponAttackFeature,
    ReloadableWeaponCreationFeature,
} from '../features';
import { jest } from '@jest/globals';

jest.mock('../features', () => ({
    NextRoundFeature: jest.fn().mockImplementation(() => ({ id: 'nextRound' })),
    ReloadFeature: jest.fn().mockImplementation(() => ({ id: 'reload' })),
    ReloadableWeaponAttackFeature: jest
        .fn()
        .mockImplementation(() => ({ id: 'reloadableWeaponAttack' })),
    ReloadableWeaponCreationFeature: jest
        .fn()
        .mockImplementation(() => ({ id: 'reloadableWeaponCreation' })),
}));

let moduleManager: ModuleManager;
let featureManager: FeatureManager;

beforeEach(() => {
    jest.clearAllMocks();
    moduleManager = {} as ModuleManager;
    featureManager = new FeatureManager(moduleManager);
});

describe('FeatureManager.constructor', () => {
    test('initializes empty features and stores moduleManager', () => {
        expect(featureManager['moduleManager']).toStrictEqual({}); // private; check via getter
        expect(featureManager.moduleManager).toBe(moduleManager);
        expect(featureManager['_features']).toBeUndefined;
        expect(featureManager['getFeature']).toBeDefined();
    });
});

describe('FeatureManager.init()', () => {
    test('instantiates all expected features with correct class calls', () => {
        featureManager.init();

        expect(NextRoundFeature).toHaveBeenCalledWith(featureManager);
        expect(ReloadFeature).toHaveBeenCalledWith(featureManager);
        expect(ReloadableWeaponAttackFeature).toHaveBeenCalledWith(
            featureManager
        );
        expect(ReloadableWeaponCreationFeature).toHaveBeenCalledWith(
            featureManager
        );

        expect(featureManager['_features']).not.toBeUndefined;
        expect(Object.keys(featureManager['_features'])).toEqual([
            'nextRound',
            'reload',
            'reloadableWeaponAttack',
            'reloadableWeaponCreation',
        ]);
    });
});

describe('FeatureManager.getFeature()', () => {
    test('returns matching feature when present', () => {
        featureManager.init();
        const feature = featureManager.getFeature('reload');
        expect(feature).toEqual({ id: 'reload' });
    });

    test('returns null for unknown feature', () => {
        featureManager.init();
        const feature = featureManager.getFeature('notReal');
        expect(feature).toBeNull();
    });
});

describe('FeatureManager.toString()', () => {
    test('returns formatted string with feature count', () => {
        featureManager.init();
        const result = featureManager.toString();
        expect(result).toBe('class FeatureManager: undefined');
    });
});
