import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-debug-form',
  templateUrl: './debug-form.component.html',
  styleUrls: ['./debug-form.component.scss']
})
export class DebugFormComponent implements OnInit {

  @Input() form!: FormGroup;

  constructor() {}

  ngOnInit(): void { }

  fieldsWithError() {
    const fields: any = {};
    Object.keys(this.form.controls).forEach(fieldKey => {
      if (this.form.controls[fieldKey]?.errors) {
        fields[fieldKey] = this.form.controls[fieldKey].errors;
      }
    });
    return fields;
  }

}
