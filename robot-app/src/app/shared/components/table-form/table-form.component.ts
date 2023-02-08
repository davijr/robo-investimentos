import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Model, Relationship } from 'src/app/model/Model';
import { BaseFormComponent } from '../base-form/base-form.component';
import { AlertService } from '../../services/alert.service';
import { OptionsService } from '../../services/options.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-table-form',
  templateUrl: './table-form.component.html',
  styleUrls: ['./table-form.component.scss'],
  preserveWhitespaces: true
})
export class TableFormComponent extends BaseFormComponent implements OnInit {
  
  @Input() editionMode: ('list' | 'create' | 'edit' | 'copy') = 'edit';
  @Input() modelEdit!: Model;
  @Output() cancel = new EventEmitter<any>();
  @Output() save = new EventEmitter<any>();
  
  constructor(
    optionsService: OptionsService,
    alertService: AlertService,
    progressService: ProgressService
  ) {
    super(optionsService, alertService, progressService);
  }
  
  override ngOnInit(): void {
    this.model = this.modelEdit;
    this.initForm();
    if (this.editionMode === 'edit') {
      this.form.get(this.modelEdit.idField)?.disable();
    }
  }
  
  submit(model: Model): void {
    this.save.emit(model);
  }

  onClear() {
    this.reset();
  }

  onCancel() {
    this.reset();
    this.cancel.emit({});
  }

  validationMessage(fieldName: string = ''): string | null {
    if (!this.form.get(fieldName)?.valid) {
      return "This field is invalid."
    }
    return null;
  }

  getOptions(relationshipName: string) {
    const filtered: Relationship[] = this.relationships?.filter((i) => i.name === relationshipName) ?? [];
    return filtered[0]?.data ?? [];
  }

  getShowFields(relationshipName: string, data: any): string {
    const filtered: Relationship[] = this.relationships?.filter((i) => i.name === relationshipName) ?? [];
    const showFields = filtered[0]?.showFields ?? [];
    let show = '';
    showFields.forEach((field, index) => {
      if (index > 0) {
        show += ` - ${data[field]}`;
      } else {
        show += `${data[field]}`;
      }
    });
    return show;
  }

}
