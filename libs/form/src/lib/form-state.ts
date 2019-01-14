import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { forEach } from 'lodash-es';
import { AbstractControlState, FormArrayState, FormControlState, FormGroupState } from './form.model';

// TODO: find better name for file

// TODO: accept FormArray(State) and FormControl(State)
export function applyFormState(formGroup: FormGroup, formGroupState: FormGroupState) {
    applyFormGroupState(formGroup, formGroupState);
}

function applyState(control: AbstractControl, controlState: AbstractControlState) {
    if (control instanceof FormGroup) {
        return applyFormGroupState(control, <FormGroupState> controlState);
    }
    if (control instanceof FormArray) {
        return applyFormArrayState(control, <FormArrayState> controlState);
    }
    if (control instanceof FormControl) {
        return applyFormControlState(control, <FormControlState> controlState);
    }
    throw new Error('Invalid control type');
}

function applyFormGroupState(formGroup: FormGroup, formGroupState: FormGroupState) {
    applyAbstractFormState(formGroup, formGroupState);

    forEach(
        formGroup.controls,
        (control, name) => applyState(
            control,
            formGroupState.controls[name]
        )
    );
}

function applyFormArrayState(formArray: FormArray, formArrayState: FormArrayState) {
    applyAbstractFormState(formArray, formArrayState);

    formArray.controls
        .map((control, index) => applyState(
            control,
            formArrayState.controls[index]
        )
    );
}

function applyFormControlState(formControl: FormControl, formControlState: FormControlState) {
    applyAbstractFormState(formControl, formControlState);
}

function applyAbstractFormState(control: AbstractControl, controlState: AbstractControlState) {
    if (controlState.dirty !== control.dirty) {
        controlState.dirty ? control.markAsDirty() : control.markAsPristine();
    }

    // TODO: find out if this makes sense
    if (controlState.pending && !control.pending) {
        control.markAsPending();
    }

    if (controlState.disabled !== control.disabled) {
        controlState.disabled ? control.disable() : control.enable();
    }

    if (controlState.value !== control.value) {
        control.setValue(controlState.value, { emitEvent: false });
    }

    if (controlState.errors !== control.errors) {
        control.setErrors(controlState.errors, { emitEvent: false });
    }
}
