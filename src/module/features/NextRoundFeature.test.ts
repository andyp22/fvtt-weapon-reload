import { NextRoundFeature } from './NextRoundFeature';
import { moduleMocks } from '../../../tests/mocks/module-mocks';
import { jest } from '@jest/globals';
import { UtilityActivity } from '../types';

let feature: NextRoundFeature;

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
        expect(mockNextRound).toHaveBeenCalled();
        expect(result).toBe(false);

        mockNextRound.mockRestore();
    });
});

describe('NextRoundFeature.nextRound()', () => {
    test('renders template and sends chat message', async () => {
        // Arrange: mock BaseFeature dependencies
        const mockWeapon = {
            name: 'Mock Revolver',
            system: { uses: { max: 6 } },
        } as any;
        const mockActor = { id: 'actor1', name: 'Shooter' } as any;

        jest.spyOn(feature, 'weapon', 'get').mockReturnValue(mockWeapon);
        jest.spyOn(feature, 'character', 'get').mockReturnValue(mockActor);
        jest.spyOn(feature, 'loadout', 'get').mockReturnValue([
            'Round A',
            'Round B',
        ]);
        jest.spyOn(feature, 'translate').mockImplementation(
            (key) => `localized:${key}`
        );

        const renderSpy = jest
            .spyOn(
                (global as any).foundry.applications.handlebars,
                'renderTemplate'
            )
            .mockResolvedValue('<div>Rendered Template</div>');

        const sendChatSpy = moduleMocks.MockUiManager.sendChat;

        // Act
        await feature.nextRound();

        // Assert
        expect(renderSpy).toHaveBeenCalledWith(
            'modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs',
            expect.objectContaining({
                item: expect.objectContaining({ name: 'Round A' }),
                description: expect.stringContaining('localized:'),
                title: expect.stringContaining('localized:'),
            })
        );

        expect(sendChatSpy).toHaveBeenCalledWith(
            mockActor,
            '<div>Rendered Template</div>',
            undefined,
            undefined,
            [mockActor.id]
        );
    });
});

describe('NextRoundFeature.toString()', () => {
    test('returns correct identifier', () => {
        expect(feature.toString()).toMatchInlineSnapshot(
            `"class NextRoundFeature"`
        );
    });
});
