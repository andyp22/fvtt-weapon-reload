import ModuleManager from './ModuleManager';
import { DialogOptions, type foundryGame } from '../types';

export default class UiManager {
    private _moduleManager: ModuleManager;

    constructor(moduleManager: ModuleManager) {
        this._moduleManager = moduleManager;
    }

    get moduleManager() {
        return this._moduleManager;
    }

    buildDialog(options: DialogOptions, id: string) {
        return new foundry.applications.api.DialogV2({
            window: {
                title: options.title,
                contentClasses: options.contentClasses || [],
            },
            content: options.content,
            buttons: options.buttons,
            submit: options.onSubmit,
            id: id,
        });
    }

    uiNotification(msg: string, type = 'info') {
        if (ui.notifications) {
            switch (type) {
                case 'error':
                    ui.notifications.error(msg);
                    break;
                case 'warn':
                    ui.notifications.warn(msg);
                    break;
                case 'info':
                default:
                    ui.notifications.info(msg);
            }
        }
    }

    sendChat(
        speaker: Actor5e,
        content: string,
        flavor?: string,
        sound?: string,
        whisper: string[] = [],
        type: 0 | 1 | 2 | 3 | 4 | 5 = 0
    ) {
        const ChatData = {
            speaker: ChatMessage.getSpeaker({ actor: speaker }),
            content,
            ...(flavor !== undefined && { flavor }),
            ...(sound !== undefined && { sound }),
            whisper,
            ...(this.moduleManager.version === 13 && { type }),
        };
        ChatMessage.create(ChatData);
    }

    getLocalizedTxt(
        key: string,
        opts?: Record<string, string>,
        format = false
    ) {
        if (format) {
            return (game as foundryGame).i18n.format(key, opts);
        }
        return (game as foundryGame).i18n.localize(key, opts);
    }

    toString() {
        return 'class UiManager';
    }
}
