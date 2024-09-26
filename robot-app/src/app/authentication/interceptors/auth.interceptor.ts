import { Injectable } from '@angular/core'
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
  HttpEvent
} from '@angular/common/http'
import { catchError, Observable, throwError } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { AlertService } from 'src/app/shared/services/alert.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor (
    public authService: AuthService,
    private alertService: AlertService
  ) {}

  intercept (request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getJwtToken()
    if (token) {
      request = this.addToken(request, token)
    }
    return next.handle(request).pipe(
      catchError(error => this.handle401Error(error))
    )
  }

  private handle401Error (error: any) {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.authService.removeJwtToken()
      this.alertService.toastError('An error has ocurred. Please login.')
    }
    return throwError(error)
  }

  private addToken (request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}
