import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/model/User';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ProgressService } from 'src/app/shared/services/progress.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user: User = new User();

  constructor(
    private authService: AuthService,
    private router: Router,
    private progressService: ProgressService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void { }

  onLogin() {
    if (this.user.username && this.user.password) {
      this.progressService.showLoading();
      this.authService.login(this.user).subscribe(
        res => {
          this.alertService.toastSuccess(`Logged with success!`);
          this.router.navigate(['/edition/SysExternalSystem']);
        },
        err => {
          this.alertService.toastError(`Error on trying to login. ${err.error.message}`);
          this.progressService.hideLoading();
        },
        () => {
          this.progressService.hideLoading();
        }
      );
    }
  }

}
