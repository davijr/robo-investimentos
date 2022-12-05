
export class AppUtils {
  public static getTest () {
    return 'nothing'
  }

  public static isDevEnvironment (): boolean {
    const env = ''.concat(process.env.NODE_ENV as string).trim()
    return env === 'dev'
  }

  public static isDBShowSQL (): boolean {
    const showSqlQuery = ''.concat(process.env.DB_SHOW_SQL as string).trim()
    if (showSqlQuery) {
      return true
    }
    return false
  }

  public static isDBSync (): boolean {
    const dbSync = ''.concat(process.env.DB_SYNC as string).trim()
    if (dbSync) {
      return true
    }
    return false
  }

  public static sleep (seconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000)
    })
  }
}
