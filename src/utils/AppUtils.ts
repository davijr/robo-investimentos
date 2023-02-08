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

  public static menuItemsToFilter () {
    return [
      // sys
      'Sys Adhoc Holiday',
      'Sys Calendar',
      'Sys Country',
      'Sys Country Ccy Lnk',
      'Sys Currency',
      'Sys Curve',
      'Sys Curve Underlying Link',
      'Sys External System',
      'Sys Underlying',
      'Sys Underlying Type',
      // company
      'Company Book',
      'Company Book Type',
      'Company Company',
      'Company Cost Centre',
      'Company Cost Centre Lnk',
      'Company Link',
      'Company Lob',
      'Company Lob Lnk',
      'Company Lob Type',
      // doms
      'Doms Accrual Basis',
      'Doms Amortizing Type',
      'Doms Balance Type',
      'Doms Banking Facility Type',
      'Doms Banking Trading',
      'Doms Bankruptcy Remote',
      'Doms Branch Subsidiary',
      'Doms Broken Period Type',
      'Doms Calc Day Convention',
      'Doms Calc Day Rule',
      'Doms Calc Frequency',
      'Doms Cap Type',
      'Doms Cash Flow Approach',
      'Doms Cash Flow Quality',
      'Doms Cash Flow Type',
      'Doms Ccp Exposure Type',
      'Doms Ccy Conv Type',
      'Doms Cinst Calc Rule',
      'Doms Cinst Rule Annuity After Mat',
      'Doms Client Proprietary',
      'Doms Coll Contract Type',
      'Doms Collateral Mode',
      'Doms Committed',
      'Doms Compound Type',
      'Doms Consolidation Type',
      'Doms Deferment Context',
      'Doms Deferment Method',
      'Doms Delivery Type',
      'Doms Derivative Multiplier Type',
      'Doms Discount Method',
      'Doms Distribution Channel',
      'Doms Facility Liq Type',
      'Doms Facility Purpose',
      'Doms Facility Type',
      'Doms Fair Value Option',
      'Doms Fixing Rule',
      'Doms Forbearance Measures',
      'Doms Given Received',
      'Doms Gl Class',
      'Doms Gl Nature',
      'Doms Hedge Accounting Type',
      'Doms Income Type',
      'Doms Industry Sector Type',
      'Doms Invpty Status',
      'Doms Long Short',
      'Doms Margin Excess Type',
      'Doms Margin Type',
      'Doms Netting Class',
      'Doms Overlapping Priority',
      'Doms Participation Flag',
      'Doms Participation Link',
      'Doms Pay Receive',
      'Doms Penalty Calc Method',
      'Doms Performing Status',
      'Doms Rate Type',
      'Doms Repartition Method',
      'Doms Rmgt Facility',
      'Doms Rolling Convention',
      'Doms Security Status',
      'Doms Seniority',
      'Doms Servicing Type',
      'Doms Settlement Mode',
      'Doms Statement Type',
      'Doms Sub Type',
      'Doms System Type',
      'Doms Target Type',
      'Doms Tax Invpty Type',
      'Doms Tax Status',
      'Doms Transferred',
      'Doms True False',
      'Doms Underlying Classification',
      'Doms Underlying Family',
      // alcm
      'ALCM_CAPITAL_PRODUCT_PARAM',
      'ALCM_PRODUCT_GROUP',
      // Buyin
      'BUYIN_CONTRACT_LINK',
      // Invpty
      'INVPTY_DET',
      'INVPTY_EXT_COD',
      'INVPTY_EXT_COD_CODIF',
      'INVPTY_LINK',
      'INVPTY_LINK_CODIF',
      'INVPTY_LINK_TYPE',
      'INVPTY_RTNG_AGCY',
      'INVPTY_RTNG_AGCY_RTS_LNK',
      'INVPTY_RTNG_AGCY_RTS_STR',
      'INVPTY_RTNG_CRD',
      'INVPTY_TYPE',
      'INVPTY_TYPE_CODIF',
      'INVPTY_TYPE_LNK',
      'INVPTY_TYPE_LRGCOPR',
      // Mktd
      'MKTD_SECURITY',
      // Product
      'PRODUCT',
      'PRODUCT_EXT_COD',
      'PRODUCT_HSBC_GRP',
      'PRODUCT_HSBC_GRP_LINK',
      // Recon
      'RECON_BZDF_MAP',
      // 'RECON_BZDF_POINT',
      // 'RECON_DIMENSION',
      // 'RECON_GL_POINT',
      'RECON_MATH_OPERATOR',
      'RECON_METRIC',
      // Genldg
      'GENLDG_ACCOUNT_PLAN',
      'GENLDG_AGGOUNT_GROUP',
      'GENLDG_GAAP_CODE',
      'GENLDG_GAAP_PLAN',
      'GENLDG_GRCA_AVERAGE_MAP',
      'GENLDG_GRCA_PLAN',
      'GENLDG_GRCA_PRIMARY_MAP',
      'GENLDG_INVPTY_LINK'
    ]
  }
}
