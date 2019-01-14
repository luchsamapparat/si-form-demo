import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { mapValues } from 'lodash-es';
import { AbstractControlState, FormArrayState, formArrayState, FormControlState, FormGroupState, formGroupState } from './form.model';

// TODO: accept FormArray and FormControl
export function toFormState(form: FormGroup): FormGroupState {
    return toFormGroupState(form);
}

function toState(control: AbstractControl) {
    if (control instanceof FormGroup) {
        return toFormGroupState(control);
    }
    if (control instanceof FormArray) {
        return toFormArrayState(control);
    }
    if (control instanceof FormControl) {
        return toFormControlState(control);
    }
    throw new Error('Invalid control type');
}

function toFormGroupState(formGroup: FormGroup): FormGroupState {
    return formGroupState({
        ...toAbstractFormState(formGroup),
        // TODO: fix typing
        controls: <any> mapValues(formGroup.controls, toState)
    });
}

function toFormArrayState(formArray: FormArray): FormArrayState {
    return formArrayState({
        ...toAbstractFormState(formArray),
        controls: formArray.controls.map(toState)
    });
}

function toFormControlState(formControl: FormControl): FormControlState {
    return toAbstractFormState(formControl);
}

function toAbstractFormState(control: AbstractControl): AbstractControlState {
    return {
        dirty: control.dirty,
        disabled: control.disabled,
        errors: control.errors,
        pending: control.pending,
        touched: control.touched,
        value: control.value
    };
}
