import { Injectable } from '@angular/core'
import { Observable, take } from 'rxjs'
import { ApiService } from './api.service'

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  BASE_URL = 'wallet/'

  // eslint-disable-next-line no-useless-constructor
  constructor (private api: ApiService) { }

  getAccountInfo (): Observable<any> {
    return this.api.getRequest(`${this.BASE_URL}account`, {}).pipe(take(1))
  }
}
