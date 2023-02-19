import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'formatTimestamp'
})
export class FormatTimestampPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): unknown {
    return new Date(value).toLocaleString()
  }
}
