export interface ActivityCardChatType {
    description: {
        concealed?: boolean;
        chat: string;
        followOn?: string;
    };
    item: {
        img: string;
        name: string;
    };
    subtitle?: string;
    buttons?: {
        dataset: {
            visibility: 'all' | 'gm';
        };
        icon?: string;
        label: string;
        classes?: string;
        id?: string;
    }[];
    supplements?: string[];
    properties?: string[];
}

export interface ChatMessage5e extends ChatMessage {
    flags: Record<string, any>;
}
