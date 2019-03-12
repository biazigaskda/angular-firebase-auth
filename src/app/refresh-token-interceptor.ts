import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { AuthService } from './services/auth/auth.service';
import { JwtInterceptor } from '@auth0/angular-jwt';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  constructor(private authorizationService: AuthService, private jwtInterceptor: JwtInterceptor) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable <any> {
    if (this.jwtInterceptor.isWhitelistedDomain(req) && !this.jwtInterceptor.isBlacklistedRoute(req)) {
      return next.handle(req).pipe(
        catchError((err) => {
          const errorResponse = err as HttpErrorResponse;
          if (errorResponse.status === 401 && errorResponse.error.message === 'Expired JWT Token') {
            return this.authorizationService.refresh().pipe(mergeMap(() => {
              return this.jwtInterceptor.intercept(req, next);
            }));
          }
          return throwError(err);
        }));
    } else {
      return next.handle(req);
    }
  }

}

