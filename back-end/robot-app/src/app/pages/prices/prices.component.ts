import { Component, OnInit } from '@angular/core'
import { RobotService } from 'src/app/services/robot.service'

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.scss']
})
export class PricesComponent implements OnInit {
  prices: any

  constructor (private robotService: RobotService) { }

  ngOnInit (): void {
    // this.prices = this.robotService.getPrices()
    // this.onRefresh()

    // TODO
    this.prices = []
    for (let i = 1; i < 60; i = i + 5) {
      this.prices.push({
        high24hs: `344${i}88.00`,
        low24hs: `333${i}00.00`,
        volume: `11${i}.30994645`,
        buy: `335${i}99.97`,
        sell: `336${i}89.97`,
        offers: `341${i}11.0045`,
        date: new Date(new Date().getTime() - i * 60000)
      })
    }
  }

  onRefresh () {
    this.robotService.getPrices().subscribe(data => {
      console.log(data)
      this.prices = data
    })
  }
}
