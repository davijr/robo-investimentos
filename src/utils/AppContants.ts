
export class AppConstants {
    static readonly API_URL = process.env.API_URL
    static readonly API_URL_STREAM = process.env.API_URL_STREAM
    static readonly API_KEY = process.env.API_KEY
    static readonly API_SECRET = process.env.API_SECRET
    static readonly URL_STREAM = `${this.API_URL_STREAM}/!ticker@arr`
    static readonly URL_EXCHANGE_INFO = '/v3/exchangeInfo';
    // intervals
    static readonly MYTRADES_UPDATE_INTERVAL = 5; // 5 minutos
    // aim
    static readonly QUOTE = 'USDT';
    static readonly MIN_DAILY_VOLUME = 1000000; // volume diário mínimo: 1 milhão
    static readonly PROFITABILITY = 1.002; // 1.00075 é a taxa Binance = 0,075% quando tem BNB. Ou 0,1% se não tiver BNB na conta
    static readonly AMOUNT = 100; // em USDT qtd a ser negociada
}
