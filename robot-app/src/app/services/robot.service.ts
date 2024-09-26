import { Injectable } from '@angular/core'
import { Observable, take } from 'rxjs'
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

  getRobotStatus (): Observable<any> {
    return this.api.getRequest(`${this.BASE_URL}status`, {}).pipe(take(1))
  }

  setRobotStatus (status: string): Observable<any> {
    return this.api.postRequest(`${this.BASE_URL}status/${status}`, {}).pipe(take(1))
  }

  addMoney(): Observable<any> {
    return this.api.postRequest(`${this.BASE_URL}add-money`, {}).pipe(take(1));
  }
}
