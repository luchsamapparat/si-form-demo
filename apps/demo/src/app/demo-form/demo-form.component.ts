import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { applyFormState, FormGroupState, toFormState } from '@si/form';
import { cloneDeep, isEmpty, negate } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoFormComponent {

    profileForm: FormGroup;

    constructor(
        private fb: FormBuilder
    ) {
        this.profileForm = this.fb.group({
            firstName: [],
            lastName: [],
            age: [],
            address: this.fb.group({
                street: [],
                houseNo: [],
                zip: [],
                city: [],
                country: []
            }),
            webIdentities: this.fb.array([
                []
            ])
        });

        this.profileForm.valueChanges.pipe(
            map(() => toFormState(this.profileForm)),
            switchMap(formState => formBehavior(formState)),
            map(updatedFormState => applyFormState(
                this.profileForm,
                updatedFormState
            ))
        )
            .subscribe();


        this.profileForm.valueChanges.pipe(
            map((profile: Profile) => profile.webIdentities),
            filter(webIdentities => webIdentities.every(negate(isEmpty))),
        )
            .subscribe(() => this.addWebIdentityFormControl())
    }

    get webIdentities() {
        return <FormArray> this.profileForm.controls.webIdentities;
    }

    addWebIdentityFormControl() {
        this.webIdentities.push(new FormControl());
    }

    removeWebIdentityFormControlIfEmpty(event: Event, index: number) {
        const hasEmptyValue = isEmpty((<HTMLInputElement> event.target).value);
        const isLast = index === this.webIdentities.controls.length - 1;

        if (hasEmptyValue && !isLast) {
            this.webIdentities.removeAt(index);
        }
    }

    get formState() {
        return toFormState(this.profileForm);
    }

    // updateFormState() {
    //     const formState = toFormState(this.profileForm);

    //     const updatedFormState = formBehavior(formState);

    //     applyFormState(
    //         this.profileForm,
    //         updatedFormState
    //     );
    // }

}

function formBehavior(formState: FormGroupState): Observable<FormGroupState> {
    const updatedFormState = cloneDeep(formState);

    if (formState.controls.firstName.value === 'Marvin') {
        updatedFormState.controls.lastName.value = 'Luchs';
        updatedFormState.controls.lastName.disabled = true;
    }

    return of(updatedFormState);
}
