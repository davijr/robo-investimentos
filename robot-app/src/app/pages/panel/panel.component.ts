/* eslint-disable no-useless-constructor */
import { Component, OnInit } from '@angular/core'
import { catchError, Observable, of, tap } from 'rxjs'
import { OrderService } from 'src/app/services/order.service'
import { RobotService } from 'src/app/services/robot.service'
import { WalletService } from 'src/app/services/wallet.service'
import { AlertService } from 'src/app/shared/services/alert.service'

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
  accountInfo$: Observable<any> = new Observable<any>()
  orderHistory$: Observable<any> = new Observable<any>()

  constructor (
    private walletService: WalletService,
    private orderService: OrderService,
    private robotService: RobotService,
    private alert: AlertService
  ) { }

  ngOnInit (): void {
    this.onRefreshBalances()
    this.onRefreshHistory()
  }

  onRefreshBalances () {
    this.accountInfo$ = this.walletService.getAccountInfo().pipe(
      tap(accountInfo => {
        // const assets = this.accountInfo?.balances?.map((balance: any) => {
        //   return balance.asset
        // })
        // TODO get prices for each asset
        // this.robotService.getPrices(assets).subscribe((prices: any) => {
        //   this.prices = prices
        //   this.loading = false
        // }, (e: any) => this.handleError(e))
      }),
      catchError(async e => {
        this.handleError(e)
        return of([])
      })
    )
  }

  onRefreshHistory () {
    this.orderHistory$ = this.orderService.getHistory().pipe(
      catchError(async e => {
        this.handleError(e)
        return of([])
      })
    )
  }

  private handleError (e: any) {
    this.alert.toastError(e?.message || e)
  }
}
