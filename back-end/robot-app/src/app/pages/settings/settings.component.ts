import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  parameters: any

  constructor () { }

  ngOnInit (): void {
    this.parameters = [
      {
        status: 'ACTIVE',
        parameter: 'PROFITABILITY',
        description: 'Prifitability aim.',
        value: '10%'
      }, {
        status: 'ACTIVE',
        parameter: 'CURRENCY',
        description: 'Currency used to execute orders.',
        value: 'BTCUSD'
      }, {
        status: 'ACTIVE',
        parameter: 'AMOUNT_TO_NEGOTIATE',
        description: 'Amount available to negotiations. One by one.',
        value: '100.00'
      }
    ]
  }
}
