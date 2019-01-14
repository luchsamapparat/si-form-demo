import { async, TestBed } from '@angular/core/testing';
import { FormModule } from './form.module';

describe('FormModule', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormModule]
        })
            .compileComponents();
    }));

    it('should create', () => {
        expect(FormModule).toBeDefined();
    });
});
