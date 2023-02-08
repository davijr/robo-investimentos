import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
    public loading = false;

    constructor () { }

    public isLoading () {
      return this.loading
    }

    public showLoading () {
      Promise.resolve().then(() => this.loading = true)
    }

    public hideLoading () {
      Promise.resolve().then(() => this.loading = false)
    }
}
