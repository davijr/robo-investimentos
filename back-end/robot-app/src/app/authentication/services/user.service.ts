import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, take, tap, throwError } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../model/User';
import { ResponseModel } from '../../model/utils/ResponseModel';
import { formatDate } from '@angular/common';
import { RequestModel } from 'src/app/model/utils/RequestModel';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly BASE_URL = 'user';

  constructor(private apiService: ApiService) { }

  find() {
    return this.apiService.getRequest<ResponseModel>(`${this.BASE_URL}`).pipe(take(1));
  }

  findOne(userId: string) {
    return this.apiService.getRequest<ResponseModel>(`${this.BASE_URL}/${userId}`).pipe(take(1));
  }

  create(request: RequestModel) {
    return this.apiService.postRequest<ResponseModel>(`${this.BASE_URL}`, request.data).pipe(take(1));
  }

  update(request: RequestModel) {
    return this.apiService.putRequest<ResponseModel>(`${this.BASE_URL}`, request.data).pipe(take(1));
  }

  delete(request: RequestModel) {
    return this.apiService.deleteRequest<ResponseModel>(`${this.BASE_URL}/${request.data}`).pipe(take(1));
  }

}
