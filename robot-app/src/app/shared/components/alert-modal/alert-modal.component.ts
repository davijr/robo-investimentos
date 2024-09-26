import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent implements OnInit {

  @Input() type?: string;
  @Input() title? = '';
  @Input() message? = '';

  constructor(
    public bsModalRef: BsModalRef,
    public snackBar: MatSnackBar,
    public alertService: AlertService) {
    }

  ngOnInit(): void {
    if (this.type == undefined) {
      const alertOptions = this.alertService.getCurrentOptions();
      this.type = alertOptions?.type;
      this.title = alertOptions?.title;
      this.message = alertOptions?.message;
    }
  }

  onClose() {
    this.bsModalRef.hide();
    this.snackBar.dismiss();
  }

}
