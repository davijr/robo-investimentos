import { Injectable } from '@angular/core'
import { map, Observable, take } from 'rxjs'
import { ApiService } from './api.service'

@Injectable({
  providedIn: 'root'
})
export class RobotService {
  BASE_URL = 'robot/'
  // eslint-disable-next-line no-useless-constructor
  constructor (private api: ApiService) { }

  getPrices (): Observable<any> {
    return this.api.getRequest(`${this.BASE_URL}prices`, {}).pipe(take(1), map((res: any) => res.payload))
  }
}
