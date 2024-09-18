import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { RobotService } from './services/robot.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  robotStatus: any
  // robotStatus$: Observable<string> = new Observable<string>()

  constructor (
    private router: Router,
    private robotService: RobotService
  ) { }

  ngOnInit(): void {
    this.onRefresh()
  }

  onRefresh() {
    this.robotService.getRobotStatus().pipe(take(1))
        .subscribe(result => {
          this.robotStatus = result;
        });
  }

  isActive (page: string) {
    return ''.concat(this.router.url).includes(page)
  }

  setRobotStatus (status: string) {
    this.robotService.setRobotStatus(status).pipe(take(1))
        .subscribe(result => { this.robotStatus = result });
    // this.onRefresh();
  }
}
