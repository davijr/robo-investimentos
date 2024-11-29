
export class Candle {
    open: number;
    close: number;
    max: number;
    min: number;
    volume: number;
    time: number;

    constructor(open: number, close: number, high: number, low: number, volume: number, time: number) {
        this.open = open;
        this.close = close;
        this.max = high;
        this.min = low;
        this.volume = volume;
        this.time = time;
    }
}