import ModuleManager from './ModuleManager';
import { type DialogOptions } from '../types';

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

    uiNotification(msg: string, type: string = 'info') {
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
        type: 0 | 1 | 2 | 3 | 4 | 5 = CONST.CHAT_MESSAGE_TYPES.OTHER
    ) {
        const ChatData = {
            speaker: ChatMessage.getSpeaker({ actor: speaker }),
            type,
            flavor,
            sound,
            content,
            whisper,
        };
        ChatMessage.create(ChatData);
    }

    getLocalizedTxt(
        key: string,
        opts?: { [key: string]: string },
        format: boolean = false
    ) {
        if (format) {
            return (game as any).i18n.format(key, opts);
        }
        return (game as any).i18n.localize(key, opts);
    }

    toString() {
        return 'class UiManager';
    }
}
