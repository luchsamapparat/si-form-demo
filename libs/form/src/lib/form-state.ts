import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { difference, intersection, isArray, isObject, isUndefined, keys, rangeRight } from 'lodash-es';
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

    const removedControls = difference(
        keys(formGroup.controls),
        keys(formGroupState.controls)
    );

    removedControls.forEach(name => formGroup.removeControl(name));

    const addedControls = difference(
        keys(formGroupState.controls),
        keys(formGroup.controls)
    );

    addedControls.forEach(name => {
        const controlState = formGroupState.controls[name];
        formGroup.addControl(name, createControl(controlState));
    });

    const remainingControls = intersection(
        keys(formGroup.controls),
        keys(formGroupState.controls)
    );

    remainingControls.forEach(name => applyState(
        formGroup.controls[name],
        formGroupState.controls[name]
    ));
}


function applyFormArrayState(formArray: FormArray, formArrayState: FormArrayState) {
    applyAbstractFormState(formArray, formArrayState);

    // TODO: detect which controls have actually been removed and insert new controls at the correct index
    if (formArray.controls.length !== formArrayState.controls.length) {
        rangeRight(formArray.controls.length)
            .forEach(index => formArray.removeAt(0));

        formArrayState.controls.forEach((controlState, index) => {
            const control = createControl(controlState);
            formArray.push(control);
        });
    } else {
        formArray.controls
            .map((control, index) => applyState(
                control,
                formArrayState.controls[index]
            )
        );
    }
}

function applyFormControlState(formControl: FormControl, formControlState: FormControlState) {
    applyAbstractFormState(formControl, formControlState);

    if (formControlState.dirty !== formControl.dirty) {
        formControlState.dirty ? formControl.markAsDirty() : formControl.markAsPristine();
    }

    if (formControlState.disabled !== formControl.disabled) {
        formControlState.disabled ? formControl.disable() : formControl.enable();
    }

    if (formControlState.value !== formControl.value) {
        formControl.setValue(formControlState.value, { emitEvent: false });
    }
}

function applyAbstractFormState(control: AbstractControl, controlState: AbstractControlState) {
    if (controlState.errors !== control.errors) {
        control.setErrors(controlState.errors, { emitEvent: false });
    }
}

type ControlType = typeof FormControl | typeof FormArray | typeof FormGroup;

function createControl(controlState: AbstractControlState) {
    const controlType = getControlType(controlState);

    let control: AbstractControl;

    if (controlType === FormControl) {
        control = new FormControl();
    }

    if (controlType === FormArray) {
        control = new FormArray([]);
    }

    if (controlType === FormGroup) {
        control = new FormGroup({});
    }

    applyState(control, controlState);

    return control;
}

function getControlType(controlState: AbstractControlState): ControlType {
    const controls = ((<FormArrayState | FormGroupState> controlState).controls);

    if (isUndefined(controls)) {
        return FormControl;
    }

    if (isArray(controls)) {
        return FormArray;
    }

    if (isObject(controls)) {
        return FormGroup;
    }

    throw new Error('Cannot determine control type');
}

//          propagates down  propagates up
// errors	no	             no

// value	yes	             yes
// disable	yes	             yes,when all
// dirty	no	             yes
// pending	no	             yes
// touched	no	             yes
