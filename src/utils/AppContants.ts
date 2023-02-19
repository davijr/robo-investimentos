
export class AppConstants {
    static readonly API_URL = process.env.API_URL
    static readonly API_URL_STREAM = process.env.API_URL_STREAM
    static readonly API_KEY = process.env.API_KEY
    static readonly API_SECRET = process.env.API_SECRET
    static readonly URL_STREAM = `${this.API_URL_STREAM}/!ticker@arr`
    static readonly URL_EXCHANGE_INFO = `${this.API_URL}/v3/exchangeInfo`
    // aim
    static readonly QUOTE = 'TRX'
    static readonly PROFITABILITY = 1.001 // 1.003 está considerando as taxas em todas as operações
    static readonly AMOUNT = 100 // qtd a ser negociada
}
