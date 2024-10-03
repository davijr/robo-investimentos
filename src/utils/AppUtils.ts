import moment from 'moment'

export class AppUtils {
  public static getTest() {
    return "nothing";
  }

  public static isLocalEnvironment(): boolean {
    const env = "".concat(process.env.NODE_ENV as string).trim();
    return env === "local";
  }

  public static isDBShowSQL(): boolean {
    const showSqlQuery = "".concat(process.env.DB_SHOW_SQL as string).trim();
    if (showSqlQuery === "true") {
      return true;
    }
    return false;
  }

  public static isDBSync(): boolean {
    const dbSync = "".concat(process.env.DB_SYNC as string).trim();
    if (dbSync === "true") {
      return true;
    }
    return false;
  }

  public static isUseTunnel(): boolean {
    const useTunnel = "".concat(process.env.USE_TUNNEL as string).trim();
    if (useTunnel === "true") {
      return true;
    }
    return false;
  }

  public static isUseSSL(): boolean {
    const useSSL = "".concat(process.env.USE_SSL as string).trim();
    if (useSSL === "true" || !useSSL) {
      return true;
    }
    return false;
  }

  public static getJwtSecret(): string {
    return "".concat(process.env.JWT_SECRET as string).trim();
  }

  public static getJwtTokenExpiration(): number {
    return parseInt("".concat(process.env.JWT_EXPIRATION as string).trim());
  }

  public static sleep(seconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
  }

  public static getDaysToNow(date: Date): number {
    return moment().diff(date, "day");
  }

  public static diffMin(date: any): number {
    return moment().diff(date, "minutes");
  }

  public static diffSec(date: any): number {
    return moment().diff(date, "seconds");
  }

  public static diff(
    date1: any,
    date2: any,
    type: "years" | "days" | "hours" | "minutes" | "seconds"
  ): number {
    return moment(date2).diff(date1, type);
  }

  public static getTimestamp(): string {
    return moment().format("YYYYMMDDHHmmss");
  }

  public static getHourTimestamp(): string {
    return moment().format("YYYYMMDDHH") + "0000";
  }

  public static extractErrorMessage(e: any): string {
    if (typeof e === "string") return e;
    let message = e.response?.data?.msg;
    message = message || e.message;
    return message || AppUtils.stringify(e);
  }

  public static sort(items: any, orderBy: string, order = "ASC") {
    items.sort(function (a: any, b: any) {
      const isString =
        typeof a[orderBy] === "string" || a[orderBy] instanceof String;
      const valueA = isString ? a[orderBy].toUpperCase() : a[orderBy];
      const valueB = isString ? b[orderBy].toUpperCase() : b[orderBy];
      if (valueA < valueB) {
        return order === "ASC" ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === "ASC" ? 1 : -1;
      }
      return 0;
    });
  }

  public static stringify(obj: any) {
    let cache: any = [];
    let str: any = JSON.stringify(obj, function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null; // reset the cache
    return str;
  }

  public static validateJson(obj: any) {
    const cleanedObject = AppUtils.stringify(obj);
    return JSON.parse(cleanedObject);
  }

  public static toFixed(x: any) {
    if (!x) {
      throw new Error('Invalid number. x=' + x);
    }
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split("e-")[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = "0." + new Array(e).join("0") + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split("+")[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join("0");
      }
    }
    return x;
  }

  /**
   * Split array into chunks
   * @param array 
   * @param chunkSize 
   * @returns 
   */
  public static chunk(array: any[], chunkSize: number) {
    const numberOfChunks = Math.ceil(array.length / chunkSize)
    return [...Array(numberOfChunks)]
      .map((value, index) => {
        return array.slice(index * chunkSize, (index + 1) * chunkSize)
      })
  }
}
