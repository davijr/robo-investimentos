
export class AppConstants {
  static readonly API_URL = process.env.API_URL;
  static readonly API_URL_STREAM = process.env.API_URL_STREAM;
  static readonly API_KEY = process.env.API_KEY;
  static readonly API_SECRET = process.env.API_SECRET;
  static readonly URL_STREAM = `${this.API_URL_STREAM}/!ticker@arr`;
  static readonly URL_EXCHANGE_INFO = "/v3/exchangeInfo";

  // DEFAULT VALUES:
  static readonly MYTRADES_UPDATE_INTERVAL = 60; // segundos
  static readonly ACCOUNT_UPDATE_INTERVAL = 60; // segundos
  static readonly EXCHANGE_UPDATE_INTERVAL = 60; // segundos
  static readonly STOP_TIME_AFTER_FINISH = 60; // segundos
  static readonly BALANCES_UPDATE_INTERVAL = 60; // segundos
  static readonly QUOTE = "USDT";
  static readonly MIN_DAILY_VOLUME = 1000000; // volume diário mínimo: 1 milhão
  static readonly PROFITABILITY = 1.001; // 1.00075 é a taxa Binance = 0,075% quando tem BNB. Ou 0,1% se não tiver BNB na conta
  static readonly AMOUNT = 100; // em USDT qtd a ser negociada
  static readonly ATTEMPT_INTERVALS = [ // intervalo em segundos que o robô vai aguardar a ordem ser FILLED
    0.1, 0.1, 0.1, 0.2, 0.2, 0.5, 0.5, 1, 5, 15, 30, 60, 60, 60, 60, 60, 300,
    300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300,
  ];
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
    "XRPUSDT",
  ];
}
