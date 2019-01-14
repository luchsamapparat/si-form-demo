
export interface AbstractControlState<T = any> {
    touched: boolean;
    dirty: boolean;
    pending: boolean;
    disabled: boolean;
    value: T;
    errors: any;
}

export interface FormControlState<T = any> extends AbstractControlState<T> {}

export interface FormGroupState<T = any> extends AbstractControlState<T> {
    controls: { [key: string]: AbstractControlState };
}
export interface FormArrayState<T = any> extends AbstractControlState<T> {
    controls: AbstractControlState[];
}

export function formControlState<T>(state: Partial<FormControlState<T>>): FormControlState<T> {
    return abstractControlState(state);
}

export function formGroupState<T>(state: Partial<FormGroupState<T>>): FormGroupState<T> {
    return {
        controls: {},
        ...abstractControlState(state),
    };
}

export function formArrayState<T>(state: Partial<FormArrayState<T>>): FormArrayState<T> {
    return {
        controls: [],
        ...abstractControlState(state),
    };
}

// TODO: fix typing
function abstractControlState<T>(state: T): AbstractControlState {
    return {
        dirty: false,
        disabled: false,
        errors: null,
        pending: false,
        touched: false,
        value: null,
        // TODO: fix error TS2698: Spread types may only be created from object types
        ...<any> state
    };
}
