import { Component, OnInit } from '@angular/core'
import { RobotService } from 'src/app/services/robot.service'
import { WalletService } from 'src/app/services/wallet.service'

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
  loading = true
  accountInfo: any = {}
  prices: any = []

  constructor (
    private walletService: WalletService,
    private robotService: RobotService
  ) { }

  ngOnInit (): void {
    this.walletService.getAccountInfo().subscribe(accountInfo => {
      this.accountInfo = accountInfo
      const assets = this.accountInfo?.balances?.map((balance: any) => {
        return balance.asset
      })
      this.robotService.getPrices(assets).subscribe((prices: any) => {
        this.prices = prices
        this.loading = false
      })
    })
  }
}
