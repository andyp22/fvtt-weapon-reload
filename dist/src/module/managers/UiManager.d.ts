import ModuleManager from './ModuleManager';
import { type DialogOptions } from '../types';
export default class UiManager {
    private _moduleManager;
    constructor(moduleManager: ModuleManager);
    get moduleManager(): ModuleManager;
    buildDialog(options: DialogOptions, id: string): import("@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/api/dialog.mjs").default;
    uiNotification(msg: string, type?: string): void;
    sendChat(speaker: Actor5e, content: string, flavor?: string, sound?: string, whisper?: string[], type?: 0 | 1 | 2 | 3 | 4 | 5): void;
    getLocalizedTxt(key: string, opts?: Record<string, string>, format?: boolean): string;
    toString(): string;
}
