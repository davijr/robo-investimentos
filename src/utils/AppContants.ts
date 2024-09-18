
export class AppConstants {
    static readonly API_URL = process.env.API_URL
    static readonly API_URL_STREAM = process.env.API_URL_STREAM
    static readonly API_KEY = process.env.API_KEY
    static readonly API_SECRET = process.env.API_SECRET
    static readonly URL_STREAM = `${this.API_URL_STREAM}/!ticker@arr`
    static readonly URL_EXCHANGE_INFO = '/v3/exchangeInfo';

    // DEFAULT VALUES:
    static readonly MYTRADES_UPDATE_INTERVAL = 1; // 5 minutos
    static readonly ACCOUNT_UPDATE_INTERVAL = 1; // 5 minutos
    static readonly QUOTE = 'USDT';
    static readonly MIN_DAILY_VOLUME = 1000000; // volume diário mínimo: 1 milhão
    static readonly PROFITABILITY = 1.002; // 1.00075 é a taxa Binance = 0,075% quando tem BNB. Ou 0,1% se não tiver BNB na conta
    static readonly AMOUNT = 1000; // em USDT qtd a ser negociada
    static readonly EXCLUDE_SYMBOLS = [];
    static readonly INCLUDE_SYMBOLS = [
        // "ARKMBNB",
        // "ARKMFDUSD",
        "ARKMUSDT",
        // "AUCTIONFDUSD",
        "AUCTIONUSDT",
        "BNBUSDT",
        // "BTCEUR",
        "BTCUSDT",
        // "CAKEBNB",
        "CAKEUSDT",
        // "CKBUSDC",
        "CKBUSDT",
        // "ETHBTC",
        "ETHUSDT",
        "EURUSDT",
        "FDUSDUSDT",
        // "FETUSDC",
        "FETUSDT",
        // "FTMBNB",
        // "FTMFDUSD",
        "FTMUSDT",
        // "METISBTC",
        "METISUSDT",
        // "NEARFDUSD",
        "NEARUSDT",
        // "PENDLEFDUSD",
        "PENDLEUSDT",
        // "PEOPLEFDUSD",
        // "PEOPLEUSDC",
        "PEOPLEUSDT",
        // "PIVXBTC",
        "PIVXUSDT",
        // "RAYFDUSD",
        "RAYUSDT",
        // "RUNEFDUSD",
        "RUNEUSDT",
        // "SEIUSDC",
        "SEIUSDT",
        // "SOLBTC",
        // "SOLETH",
        // "SOLEUR",
        // "SOLTUSD",
        // "SOLUSDC",
        "SOLUSDT",
        // "SSVBTC",
        "SSVUSDT",
        // "SUIBNB",
        // "SUIBTC",
        // "SUIFDUSD",
        // "SUIUSDC",
        "SUIUSDT",
        // "TIAFDUSD",
        // "TIAUSDC",
        "TIAUSDT",
        // "TNSRUSDC",
        "TNSRUSDT",
        "TUSDUSDT",
        "USDCUSDT",
        // "WLDFDUSD",
        // "WLDUSDC",
        "WLDUSDT",
        // "XRPEUR",
        // "XRPFDUSD",
        "XRPUSDT"
    ];
}
