import { RobotStatusEnum } from "@enum/RobotStatusEnum"
import { RobotService } from "./RobotService"
import logger from "@config/logger";
import { OrderTypeEnum } from "@enum/OrderTypeEnum";
import { OrderSideEnum } from "@enum/OrderSideEnum";
import { OrderService } from "./OrderService";
import { NotificationService, NotificationSoundType } from "./NotificationService";
import { AppUtils } from "@utils/AppUtils";

export class TraderService {

  constructor(
        private robotService: RobotService,
        private orderService: OrderService
  ) { }

  async executeStrategy(type: 'BSS' | 'BBS', symbols: any[]) {
    const robotStatus = this.robotService.getRobotStatus();
    try {
      if (robotStatus !== RobotStatusEnum.STOPPED && robotStatus !== RobotStatusEnum.TRADING) {
        await this.robotService.setRobotStatus(RobotStatusEnum.TRADING);
        logger.info(`##### INICIANDO ESTRATÉGIA DE TRIANGULAÇÃO - ${type} ${symbols.map(i => i.symbol).join(' > ')} #####`)
        // ORDER 1
        logger.info(`EXECUTANDO TRANSAÇÃO 1: BUY ${symbols[0].symbol}`)
        const newOrder1 = {
          type: OrderTypeEnum.LIMIT,
          price: symbols[0].price,
          symbol: symbols[0].symbol,
          quantity: symbols[0].quantity.toFixed(5),
          side: OrderSideEnum.BUY
        }
        // await AppUtils.sleep(5)
        const order1: any = await this.orderService.newOrder(newOrder1)
        logger.info('ORDER 1', JSON.stringify(order1))
        // ORDER 2
        const transactionType = (type === 'BBS') ? OrderSideEnum.BUY : OrderSideEnum.SELL
        logger.info(`EXECUTANDO TRANSAÇÃO 2: ${transactionType} ${symbols[1].symbol}`)
        const newOrder2 = {
          type: OrderTypeEnum.LIMIT,
          price: symbols[1].price,
          symbol: symbols[1].symbol,
          quantity: symbols[1].quantity?.toFixed(5) || Number(order1.fills?.[0].qty).toFixed(5),
          side: transactionType
        }
        // await AppUtils.sleep(5)
        const order2: any = await this.orderService.newOrder(newOrder2)
        logger.info('ORDER 2', JSON.stringify(order2))
        // ORDER 3
        logger.info(`EXECUTANDO TRANSAÇÃO 3: SELL ${symbols[2].symbol}`)
        const newOrder3 = {
          type: OrderTypeEnum.LIMIT,
          price: symbols[2].price,
          symbol: symbols[2].symbol,
          quantity: Number(order1.fills?.[0].qty).toFixed(5),
          side: OrderSideEnum.SELL
        }
        // await AppUtils.sleep(5)
        const order3: any = await this.orderService.newOrder(newOrder3)
        logger.info('ORDER 3', JSON.stringify(order3))
        NotificationService.playSound(NotificationSoundType.COMPLETED)
        logger.info('##################### ESPERAR 1 MINUTO #####################')
        await AppUtils.sleep(60);
        await this.robotService.setRobotStatus(RobotStatusEnum.SEARCHING);
      }
    } catch (e: any) {
      NotificationService.playSound(NotificationSoundType.ERROR)
      logger.error(`Deu ruim na hora de tentar executar estratégia. ${AppUtils.extractErrorMessage(e)}`)
      await this.robotService.setRobotStatus(RobotStatusEnum.SEARCHING);
      // logger.info('##################### PARAR ROBÔ #####################')
      // await AppUtils.sleep(60)
    }
  }

  strategy(oportunity: any) {
    // for (let i = 1; i <= 3; i++) {
    //     // 
    // }
    // buy: price, amount = qty1
    // buy: price, qty1 = qty2
    // sell: price, qty2 = qty3

    const operations = [];
  }

  buy() { }

  sell() { }

}
