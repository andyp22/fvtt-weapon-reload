import { NextRoundFeature } from './NextRoundFeature';
import { moduleMocks } from '../../../tests/mocks/module-mocks';
import { jest } from '@jest/globals';
import { UtilityActivity } from '../types';

let feature: NextRoundFeature;

const mockModuleManager = (version: 13 | 14) => ({
    version,
    uiManager: moduleMocks.MockUiManager,
});

beforeEach(() => {
    jest.clearAllMocks();

    feature = new NextRoundFeature(moduleMocks.MockFeatureManager as any);
});

describe('NextRoundFeature.init()', () => {
    test('registers dnd5e.preUseActivity hook', () => {
        feature.init();

        expect((global as any).Hooks.on).toHaveBeenCalledWith(
            'dnd5e.preUseActivity',
            expect.any(Function)
        );
    });
});

describe('NextRoundFeature.onUseActivity()', () => {
    test('returns true if activity is not Next Round', () => {
        const result = feature.onUseActivity({
            type: 'attack',
            name: 'Fire Shot',
            actor: { id: 'actor1' },
            item: { id: 'weapon1' },
        } as unknown as UtilityActivity);

        expect(result).toBe(true);
    });

    test('returns true for a utility activity with a different name', () => {
        const result = feature.onUseActivity({
            type: 'utility',
            name: 'Reload',
            actor: { id: 'actor1' },
            item: { id: 'weapon1' },
        } as unknown as UtilityActivity);

        expect(result).toBe(true);
    });

    test('returns false, sets IDs, and calls nextRound() for Next Round activity', () => {
        const consoleSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => {});

        const mockNextRound = jest
            .spyOn(feature, 'nextRound')
            .mockResolvedValue(undefined);

        const activity = {
            type: 'utility',
            name: 'Next Round',
            actor: { id: 'actor123' },
            item: { id: 'weapon456' },
        } as unknown as UtilityActivity;

        const result = feature.onUseActivity(activity);

        expect(consoleSpy).toHaveBeenCalledWith(
            'Weapon Reload | Triggered Next Round'
        );
        expect(feature.characterId).toBe('actor123');
        expect(feature.weaponId).toBe('weapon456');
        expect(mockNextRound).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);

        mockNextRound.mockRestore();
        consoleSpy.mockRestore();
    });
});

describe('NextRoundFeature.nextRound()', () => {
    const mockWeapon = {
        name: 'Mock Revolver',
        system: {
            uses: {
                max: 6,
            },
        },
    } as any;

    const mockActor = {
        id: 'actor1',
        name: 'Shooter',
    } as any;

    beforeEach(() => {
        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(mockWeapon);

        jest.spyOn(feature, 'character', 'get').mockReturnValue(mockActor);

        jest.spyOn(feature, 'loadout', 'get').mockReturnValue([
            'Round A',
            'Round B',
        ]);

        jest.spyOn(feature, 'translate').mockImplementation(
            (key) => `localized:${key}`
        );

        jest.spyOn(feature, 'moduleManager', 'get').mockReturnValue(
            mockModuleManager(13) as any
        );

        jest.spyOn(
            (global as any).foundry.applications.handlebars,
            'renderTemplate'
        ).mockResolvedValue('<div>Rendered Template</div>');
    });

    test('renders the ammo refund template', async () => {
        await feature.nextRound();

        expect(
            (global as any).foundry.applications.handlebars.renderTemplate
        ).toHaveBeenCalledWith(
            'modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs',
            {
                item: {
                    img: 'systems/dnd5e/icons/svg/damage/piercing.svg',
                    name: 'Round A',
                },
                description:
                    'localized:WEAPON_RELOAD.Features.NextRound.Description',
                title: 'localized:WEAPON_RELOAD.Features.NextRound.Title',
            }
        );
    });

    test('translates the description with bullet and weapon values', async () => {
        const translateSpy = jest
            .spyOn(feature, 'translate')
            .mockImplementation((key) => `localized:${key}`);

        await feature.nextRound();

        expect(translateSpy).toHaveBeenCalledWith(
            'WEAPON_RELOAD.Features.NextRound.Description',
            {
                bullet: 'Round A',
                weapon: 'Mock Revolver',
            },
            true
        );

        expect(translateSpy).toHaveBeenCalledWith(
            'WEAPON_RELOAD.Features.NextRound.Title'
        );
    });

    test('sends chat with type 4 for Foundry v13', async () => {
        jest.spyOn(feature, 'moduleManager', 'get').mockReturnValue(
            mockModuleManager(13) as any
        );

        await feature.nextRound();

        expect(moduleMocks.MockUiManager.sendChat).toHaveBeenCalledWith(
            mockActor,
            '<div>Rendered Template</div>',
            undefined,
            undefined,
            [mockActor.id],
            4
        );
    });

    test('sends chat with type 0 for Foundry v14', async () => {
        jest.spyOn(feature, 'moduleManager', 'get').mockReturnValue(
            mockModuleManager(14) as any
        );

        await feature.nextRound();

        expect(moduleMocks.MockUiManager.sendChat).toHaveBeenCalledWith(
            mockActor,
            '<div>Rendered Template</div>',
            undefined,
            undefined,
            [mockActor.id],
            0
        );
    });

    test('uses the first loadout item as the next round', async () => {
        jest.spyOn(feature, 'loadout', 'get').mockReturnValue([
            'Armor Piercing',
            'Incendiary',
        ]);

        await feature.nextRound();

        expect(
            (global as any).foundry.applications.handlebars.renderTemplate
        ).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                item: expect.objectContaining({
                    name: 'Armor Piercing',
                }),
            })
        );
    });
});

describe('NextRoundFeature.toString()', () => {
    test('returns correct identifier', () => {
        expect(feature.toString()).toBe('class NextRoundFeature');
    });
});
