
export class Indicators {
    candles: any[] = [];
    ema: number;
    hilo: number;

    // Método para calcular a EMA
    calculateEMA(period: number, prices: number[]): number[] {
        const k = 2 / (period + 1);
        let emaArray: number[] = [];
        let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
        emaArray.push(ema);

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * k + ema;
            emaArray.push(ema);
        }

        return emaArray;
    }

    // Método para calcular o volume total
    calculateVolume(): number {
        return this.candles.reduce((total, candle) => total + candle.volume, 0);
    }
}