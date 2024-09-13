import moment from 'moment'

export class AppUtils {
  public static getTest () {
    return 'nothing'
  }

  public static isLocalEnvironment (): boolean {
    const env = ''.concat(process.env.NODE_ENV as string).trim()
    return env === 'local'
  }

  public static isDBShowSQL (): boolean {
    const showSqlQuery = ''.concat(process.env.DB_SHOW_SQL as string).trim()
    if (showSqlQuery === 'true') {
      return true
    }
    return false
  }

  public static isDBSync (): boolean {
    const dbSync = ''.concat(process.env.DB_SYNC as string).trim()
    if (dbSync === 'true') {
      return true
    }
    return false
  }

  public static isUseTunnel (): boolean {
    const useTunnel = ''.concat(process.env.USE_TUNNEL as string).trim()
    if (useTunnel === 'true') {
      return true
    }
    return false
  }

  public static isUseSSL (): boolean {
    const useSSL = ''.concat(process.env.USE_SSL as string).trim()
    if (useSSL === 'true' || !useSSL) {
      return true
    }
    return false
  }

  public static getJwtSecret (): string {
    return ''.concat(process.env.JWT_SECRET as string).trim()
  }

  public static getJwtTokenExpiration (): number {
    return parseInt(''.concat(process.env.JWT_EXPIRATION as string).trim())
  }

  public static sleep (seconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000)
    })
  }

  public static getDaysToNow (date: Date): number {
    return moment().diff(date, 'day')
  }

  public static diffMinutes (date: Date): number {
    return moment().diff(date, 'minutes')
  }

  public static diffSec (date: any): number {
    return moment().diff(date, 'seconds');
  }

  public static diff(date1: any, date2: any, type: 'years' | 'days' | 'hours' | 'minutes' | 'seconds'): number {
    return moment(date2).diff(date1, type);
  }

  public static extractErrorMessage(e: any): string {
    let message = e.response?.data?.msg
    message = message || e.message
    return message || e
  }

  public static sort (items: any, orderBy: string, order = 'ASC') {
    items.sort(function (a: any, b: any) {
      const isString = typeof a[orderBy] === 'string' || a[orderBy] instanceof String
      const valueA = isString ? a[orderBy].toUpperCase() : a[orderBy]
      const valueB = isString ? b[orderBy].toUpperCase() : b[orderBy]
      if (valueA < valueB) {
        return order === 'ASC' ? -1 : 1
      }
      if (valueA > valueB) {
        return order === 'ASC' ? 1 : -1
      }
      return 0
    })
  }
}
