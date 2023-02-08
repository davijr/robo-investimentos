import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  API_URL = 'http://localhost:4200/api'

  // eslint-disable-next-line no-useless-constructor
  constructor (private http: HttpClient) { }

  async getAsync<T> (url: string) {
    return await this.http.get<T>(`${this.API_URL}${url}`)
  }

  getRequest<T> (url: string, options: any = {}) {
    return this.http.get<T>(`${this.API_URL}${url}`, options)
  }

  postRequest<T> (url: string, data: any) {
    return this.http.post<T>(`${this.API_URL}${url}`, data)
  }

  putRequest<T> (url: string, data: any) {
    return this.http.put<T>(`${this.API_URL}${url}`, data)
  }

  deleteRequest<T> (url: string) {
    return this.http.delete<T>(`${this.API_URL}${url}`)
  }
}
