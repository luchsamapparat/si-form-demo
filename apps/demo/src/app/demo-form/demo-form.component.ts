import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { applyFormState, FormArrayState, formControlState, FormGroupState, toFormState } from '@si/form';
import { detailedDiff } from 'deep-object-diff';
import { cloneDeep, isEmpty } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { filter, map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';

interface Profile {
    firstName: string;
    lastName: string;
    age: number;
    address: Address;
    webIdentities: string[];
}

interface Address {
    street: string;
    houseNo: number;
    zip: string;
    city: string;
    country: Country;
};

enum Country {
    Germany = 'de',
    UnitedStates = 'us'
}

@Component({
    selector: 'si-demo-form',
    templateUrl: './demo-form.component.html',
    styleUrls: ['./demo-form.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoFormComponent {

    profileForm: FormGroup;

    constructor(
        private fb: FormBuilder
    ) {
        this.profileForm = this.fb.group({
            firstName: [null, Validators.required],
            lastName: [],
            age: [],
            address: this.fb.group({
                street: [null, Validators.required],
                houseNo: [],
                zip: [],
                city: [],
                country: []
            }),
            webIdentities: this.fb.array([
                []
            ])
        });

        // TODO: find nicer solution to prevent parallel form state calculations
        let pendingCalculation = false;

        this.profileForm.valueChanges.pipe(
            startWith(this.profileForm.value),
            map(() => toFormState(this.profileForm)),
            pairwise(),

            filter(() => !pendingCalculation),
            tap(() => pendingCalculation = true),

            switchMap(([previous, next]) => applyFormBehavior(
                next,
                previous,
                detailedDiff(previous, next)
            ))
        )
            .subscribe(updatedFormState => {
                applyFormState(
                    this.profileForm,
                    updatedFormState
                );
                pendingCalculation = false;
            });

    }

    get formState() {
        return toFormState(this.profileForm);
    }
}

function applyFormBehavior(
    formState: FormGroupState,
    prevFormState: FormGroupState,
    diff: any
): Observable<FormGroupState> {
    const updatedFormState = cloneDeep(formState);

    if (formState.controls.firstName.value === 'Marvin') {
        updatedFormState.controls.lastName.value = 'Luchs';
        updatedFormState.controls.lastName.disabled = true;
    }

    (<FormArrayState> updatedFormState.controls.webIdentities).controls = [
        ...(<FormArrayState> formState.controls.webIdentities).controls
            .filter(control => !isEmpty(control.value)),
        formControlState({})
    ];

    console.log((<FormArrayState> formState.controls.webIdentities).controls.map(c => c.value));

    return of(updatedFormState);
}

window['toFormState'] = toFormState;
