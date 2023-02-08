
import { environment } from 'src/environments/environment';import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Field, Model, Relationship } from 'src/app/model/Model';
import { RequestModel } from 'src/app/model/utils/RequestModel';
import { ResponseModel } from 'src/app/model/utils/ResponseModel';
import { AlertService } from '../../services/alert.service';
import { OptionsService } from '../../services/options.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-base-form',
  template: '<div></div>'
})
export abstract class BaseFormComponent implements OnInit {
  
  readonly debugForms = environment.debugForms;

  model!: Model;
  form!: FormGroup;
  relationships: Relationship[] = [];

  formBuilder = new FormBuilder();

  constructor(
    public optionsService: OptionsService,
    public alertService: AlertService,
    public progressService: ProgressService
  ) {
    this.optionsService = optionsService;
    this.alertService = alertService;
    this.progressService = progressService;
  }

  ngOnInit(): void {}

  initForm() {
    this.buildFormGroup();
    this.getRelationships();
    this.setValues();
  }

  abstract submit(model: any): void;

  onSubmit(): void {
    if (this.form.valid) {
      const object: any = this.form.getRawValue();
      object[this.model.idField] = (this.model as any)[this.model.idField];
      this.submit(object);
    } else {
      this.alertService.toastError("There is validations errors. Please, verify the fields.");
      this.verifyFormValidations(this.form);
    }
  }

  buildFormGroup() {
    const formGroup: any = {};
    if (this.model) {
      this.model.fields.forEach((field: Field) => {
        const validators: any[] = [];
        if (field.required) {
          validators.push(Validators.required);
        }
        if (field.length) {
          validators.push(Validators.maxLength(field.length));
        }
        formGroup[field.name] = [null, validators];
      });
    }
    this.form = this.formBuilder.group(formGroup);
  }

  getRelationships() {
    this.model.fields.forEach((field: Field) => {
      if (field.type.includes('relationship')) {
        const relationship = Object.assign({}, field.relationship);
        const request = <RequestModel> {
          model: relationship.name
        };
        this.progressService.showLoading();
        this.optionsService.list(request).pipe(
          catchError(error => {
            console.error('error', error)
            // this.alertService.modalSuccess({} as BsModalRef, error.message);
            this.alertService.toastError(error.message);
            this.progressService.hideLoading();
            return of()
          })
        ).subscribe((response: any) => {
          relationship.data = response.data;
          this.relationships.push(relationship);
          this.progressService.hideLoading();
        });
      }
    });
  }

  setValues() {
    this.form.patchValue(this.model);
  }

  // #### VALIDATIONS ####

  verifyFormValidations(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field) ?? new FormControl();
      control.markAsDirty();
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.verifyFormValidations(control);
      }
    });
  }

  reset() : void {
    this.form.reset();
  }

  verifyValidTouched(fieldName: string) {
    return (
      !this.form.get(fieldName)?.valid &&
      (this.form.get(fieldName)?.touched || this.form.get(fieldName)?.dirty)
    );
  }

  verifyRequiredError(fieldName: string) {
    return (
      this.form.get(fieldName)?.hasError('required') &&
      (this.form.get(fieldName)?.touched || this.form.get(fieldName)?.dirty)
    );
  }

  verifyInvalidEmail() {
    const email = this.form.get('email');
    if (email?.errors) {
      return email.errors['email'] && email.touched;
    }
  }

  isRequired(fieldName: string) {
    return this.form.get(fieldName)?.hasValidator(Validators.required);
  }

  applyCssError(fieldName: string) {
    return {
      'is-invalid': this.verifyValidTouched(fieldName)
    };
  }

  resetFields(controlNames: string[]) {
    controlNames.forEach(controlName => {
      this.form.get(controlName)?.setValue(null);
      this.form.get(controlName)?.markAsPristine();
      this.form.get(controlName)?.markAsUntouched();
    });
  }

  showTooltip(fieldName: string) {
    if (this.verifyValidTouched(fieldName)) {
      return 'This field is mandatory.';
    }
    return undefined;
  }

}
