import { Injectable } from '@angular/core'
import { Observable, take } from 'rxjs'
import { ApiService } from './api.service'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  BASE_URL = 'settings/'

  constructor (private api: ApiService) { }

  getSettings (): Observable<any> {
    return this.api.getRequest(`${this.BASE_URL}`, {}).pipe(take(1));
  }

  setSettings (status: string): Observable<any> {
    // const settings = {

    // };
    return this.api.postRequest(`${this.BASE_URL}`, {}).pipe(take(1));
  }
}
