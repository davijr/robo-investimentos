import { Injectable } from '@angular/core'
import { Observable, take } from 'rxjs'
import { ApiService } from './api.service'

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  BASE_URL = 'order/'

  // eslint-disable-next-line no-useless-constructor
  constructor (private api: ApiService) { }

  getHistory (): Observable<any> {
    return this.api.getRequest(`${this.BASE_URL}history`, {}).pipe(take(1))
  }
}
