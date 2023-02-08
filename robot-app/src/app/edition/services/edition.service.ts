import { Injectable } from '@angular/core';
import { map, take } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { RequestModel } from 'src/app/model/utils/RequestModel';
import { ResponseModel } from 'src/app/model/utils/ResponseModel';


@Injectable({
  providedIn: 'root'
})
export class EditionService {

  private readonly BASE_URL = 'edition';

  constructor(private apiService: ApiService) {}

  getAttributes(request: RequestModel) {
    return this.apiService.getRequest<ResponseModel>(`${this.BASE_URL}/model-attributes/${request.model}`).pipe(take(1));
  }

  getMenuOptions() {
    return this.apiService.getRequest<ResponseModel>(`${this.BASE_URL}/menu-options`).pipe(take(1));
  }

  find(request: RequestModel) {
    return this.apiService.getRequest<ResponseModel>(`${this.BASE_URL}/model/${request.model}`, {params: request.searchOptions}).pipe(take(1));
  }

  search(request: RequestModel) {
    let url = `${this.BASE_URL}/model/${request.model}/search`;
    if (request.searchOptions) {
      url += '?';
      Object.keys(request.searchOptions).forEach(key => {
        url += `${key}=${(request.searchOptions as any)[key]}&`;
      });
    }
    return this.apiService.postRequest<ResponseModel>(url, request.data).pipe(take(1));
  }

  create(request: RequestModel) {
    return this.apiService.postRequest<ResponseModel>(`${this.BASE_URL}/model/${request.model}`, request.data).pipe(take(1));
  }

  update(request: RequestModel) {
    return this.apiService.putRequest<ResponseModel>(`${this.BASE_URL}/model/${request.model}`, request.data).pipe(take(1));
  }

  delete(request: RequestModel) {
    return this.apiService.deleteRequest<ResponseModel>(`${this.BASE_URL}/model/${request.model}/${request.data}`).pipe(take(1));
  }

}
