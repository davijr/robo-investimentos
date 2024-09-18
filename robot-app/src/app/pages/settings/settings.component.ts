import { Component, OnInit } from '@angular/core'
import { take, tap } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings: any

  constructor (
    private settingsService: SettingsService
  ) { }

  ngOnInit (): void {
    this.getSettings();
    // this.parameters = [
    //   {
    //     status: 'ACTIVE',
    //     parameter: 'PROFITABILITY',
    //     description: 'Prifitability aim.',
    //     value: '10%'
    //   }, {
    //     status: 'ACTIVE',
    //     parameter: 'CURRENCY',
    //     description: 'Currency used to execute orders.',
    //     value: 'BTCUSD'
    //   }, {
    //     status: 'ACTIVE',
    //     parameter: 'AMOUNT_TO_NEGOTIATE',
    //     description: 'Amount available to negotiations. One by one.',
    //     value: '100.00'
    //   }
    // ]
  }

  getSettings() {
    this.settingsService.getSettings().pipe(
      tap(settings => {
        console.log('settings', settings);
        Object.keys(settings).forEach(key => {
          this.settings[key] = settings[key];
        });
      })
    )
  }
}
