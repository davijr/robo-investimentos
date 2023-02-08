import { Injectable } from '@angular/core'
import { take } from 'rxjs'
import { RequestModel } from 'src/app/model/utils/RequestModel'
import { ResponseModel } from 'src/app/model/utils/ResponseModel'
import { ApiService } from '../../core/services/api.service'

@Injectable({
  providedIn: 'root'
})
export class OptionsService {
  private readonly BASE_URL = 'edition/model';

  constructor (private apiService: ApiService) {

  }

  list (request: RequestModel) {
    return this.apiService.getRequest<ResponseModel>(`${this.BASE_URL}/${request.model}`).pipe(take(1))
  }
}
