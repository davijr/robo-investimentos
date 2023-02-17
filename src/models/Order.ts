import { OrderSideEnum } from './enum/OrderSideEnum'
import { OrderTypeEnum } from './enum/OrderTypeEnum'

export class Order {
    symbol: string
    quantity: number
    price: number
    side: OrderSideEnum = OrderSideEnum.BUY
    type: OrderTypeEnum = OrderTypeEnum.MARKET
    timeInForce: string
}
