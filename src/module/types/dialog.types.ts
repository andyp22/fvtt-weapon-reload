export interface DialogOptions {
    title: string;
    contentClasses?: string[];
    content: string;
    buttons: {
        action: string;
        label: string;
        callback: (
            event: PointerEvent | SubmitEvent,
            button: HTMLButtonElement
        ) => unknown;
    }[];
    onSubmit: (data: unknown) => Promise<void>;
}
