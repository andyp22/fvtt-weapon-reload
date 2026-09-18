export type foundryGame = typeof game & {
    i18n: {
        format(key: string, opts?: Record<string, string>): string;
        localize(key: string, opts?: Record<string, string>): string;
    };
    release: {
        generation: number;
    };
};

export type FOUNDRY_CONFIGS = CONFIG & {
    DND5E: {
        featureTypes: Record<string, FeatureProps>;
        itemProperties: Record<string, ItemProps>;
        validProperties: {
            weapon: {
                add: (name: string) => void;
            };
        };
        weaponIds: {
            reloadableWeapon?: string;
        };
    };
};

interface FeatureProps {
    label: string;
}

interface ItemProps {
    label: string;
    isPhysical?: boolean;
}

// Create an intersection type
export type foundryApplications = typeof foundry.applications & {
    handlebars: {
        renderTemplate(name: string, data: unknown): string;
        loadTemplates(paths: Record<string, string>): Promise<void>;
    };
};
