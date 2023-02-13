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

  getPrices (assets = []): Observable<any> {
    return this.api.postRequest(`${this.BASE_URL}prices`, assets).pipe(take(1))
  }
}
