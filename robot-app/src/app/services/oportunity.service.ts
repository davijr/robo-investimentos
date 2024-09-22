import { Injectable } from '@angular/core'
import { Observable, take } from 'rxjs'
import { ApiService } from './api.service'

@Injectable({
  providedIn: 'root'
})
export class OportunityService {
  BASE_URL = 'oportunity/'

  constructor (private api: ApiService) { }

  getOportunity (): Observable<any> {
    return this.api.getRequest(`${this.BASE_URL}`, {}).pipe(take(1));
  }

  setOportunity (status: string): Observable<any> {
    return this.api.postRequest(`${this.BASE_URL}`, {}).pipe(take(1));
  }
}
