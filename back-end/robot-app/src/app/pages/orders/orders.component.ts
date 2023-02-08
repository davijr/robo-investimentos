import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: any

  constructor () { }

  ngOnInit (): void {
    this.orders = []
    let price = Number(33519999)
    for (let i = 1; i < 10; i++) {
      price = Math.round(price * 1.001)
      this.orders.push({
        currency: (i % 2) ? 'USD' : 'BTC',
        type: (i % 2) ? 'BUY' : 'SELL',
        amount: (i % 2) ? '100.00' : '110.00',
        price: (i % 2) ? price : Math.round(price * 1.1),
        date: new Date(new Date().getTime() - i * 60000)
      })
    }
  }
}
