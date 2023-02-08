import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { AlertOptions } from 'src/app/model/utils/AlertOptions';
import { AlertModalComponent } from 'src/app/shared/components/alert-modal/alert-modal.component';
import { PromptModalComponent } from '../components/prompt-modal/prompt-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private bsModalRef!: BsModalRef;
  private alertOptions?: AlertOptions;

  private readonly alertModalConfig: ModalOptions = {
    // backdrop: false,
    // ignoreBackdropClick: true
  };

  private readonly promptModalConfig: ModalOptions = {
    // backdrop: false,
    ignoreBackdropClick: true,
    class: 'modal-sm'
  };

  private readonly alertSnackbarConfig: MatSnackBarConfig = {
    duration: 5 * 1000,
    horizontalPosition: 'center',
    verticalPosition: 'top'
  };

  constructor(
    private modalService: BsModalService,
    private snackBar: MatSnackBar) { }

  prompt(message?: string): Observable<any> {
    this.bsModalRef = this.modalService.show(PromptModalComponent, this.promptModalConfig);
    return this.bsModalRef.content.confirm;
  }

  modalError(message: string) {
    this.openAsModal('danger', 'ERROR!', message);
  }

  modalInfo(message: string) {
    this.openAsModal('info', 'INFO!', message);
  }
  
  modalSuccess(message: string) {
    this.openAsModal('success', 'SUCCESS!', message);
  }

  toastError(message: string) {
    this.openAsSnackBar('danger', 'ERROR!', message);
  }

  toastInfo(message: string) {
    this.openAsSnackBar('info', 'INFO!', message);
  }

  toastSuccess(message: string) {
    this.openAsSnackBar('success', 'SUCCESS!', message);
  }

  getCurrentOptions() {
    return this.alertOptions;
  }

  private resetOptions() {
    this.alertOptions = undefined;
  }

  private openAsSnackBar(type: ('danger' | 'info' | 'success'), title: string, message: string) {
    this.alertOptions = { type, title, message };
    this.snackBar.openFromComponent(AlertModalComponent, this.alertSnackbarConfig);
    const snackBarRef: any = this.snackBar._openedSnackBarRef;
    snackBarRef.afterDismissed().subscribe(() => {
      this.resetOptions();
    });
  }

  private openAsModal(type?: ('danger' | 'info' | 'success'), title?: string, message?: string) {
    this.bsModalRef = this.modalService.show(AlertModalComponent, this.alertModalConfig);
    this.bsModalRef.content.type = type;
    this.bsModalRef.content.title = title;
    this.bsModalRef.content.message = message;
  }

}
