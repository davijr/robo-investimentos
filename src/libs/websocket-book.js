require('dotenv').config({path: '.env-test'});

const Binance = require('node-binance-api');

const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET
});

// binance.balance(function(error, balances) {
// 	console.log("balances()", balances);
// 	if ( typeof balances.ETH !== "undefined" ) {
// 		console.log("ETH balance: ", balances.ETH.available);
// 	}
// });

binance.websockets.bookTickers(console.log);