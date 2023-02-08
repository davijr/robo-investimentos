import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-prompt-modal',
  templateUrl: './prompt-modal.component.html',
  styleUrls: ['./prompt-modal.component.scss'],
  preserveWhitespaces: true
})
export class PromptModalComponent implements OnInit {

  @Input() message? = '';
  @Output() confirm = new EventEmitter<any>();

  constructor(
    public bsModalRef: BsModalRef,
    public snackBar: MatSnackBar,
    public alertService: AlertService) { }

  ngOnInit(): void {
    const promptOptions = this.alertService.getCurrentOptions();
    this.message = promptOptions?.message || 'Do you want to confirm?';
  }

  onConfirm(): void {
    this.confirm.emit({});
    this.bsModalRef.hide();
  }
 
  onCancel(): void {
    this.bsModalRef.hide();
  }

}
