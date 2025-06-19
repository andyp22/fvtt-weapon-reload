export type DialogOptions = {
    title: string;
    contentClasses?: string[];
    content: string;
    buttons: {
        action: string;
        label: string;
        callback: (
            event: PointerEvent | SubmitEvent,
            button: HTMLButtonElement
        ) => any;
    }[];
    onSubmit: (data: any) => Promise<void>;
};
