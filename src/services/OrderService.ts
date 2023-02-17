import { OrderTypeEnum } from '@models/enum/OrderTypeEnum'
import { Order } from '@models/Order'
import { BinanceApi } from './BinanceApi'

const binance = new BinanceApi()

export class OrderService {
    private orderUrl = '/v3/order'

    async newOrder (order: Order) {
      if (order.type === OrderTypeEnum.LIMIT) {
        order.timeInForce = 'GTC'
      }
      return binance.post(this.orderUrl, order)
    }
}
