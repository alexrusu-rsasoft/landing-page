import { Injectable, inject } from '@angular/core';
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/** Requests to third-party APIs must opt out: custom auth headers trigger CORS preflight failures on origins that don't allowlist them. */
export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  private readonly storage = window.localStorage;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(SKIP_AUTH_INTERCEPTOR)) {
      return next.handle(request);
    }

    const token = this.storage.getItem('access_token');

    const authenticatedRequest = token
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest',
            'X-Trace-Id': crypto.randomUUID(),
            'X-Client-Platform': 'web',
          },
        })
      : request.clone({
          setHeaders: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Trace-Id': crypto.randomUUID(),
            'X-Client-Platform': 'web',
          },
        });

    return next.handle(authenticatedRequest).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const retryHeader = event.headers.get('X-Token-Renewed');
          if (retryHeader === 'true') {
            this.storage.setItem('token_refreshed', 'true');
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.storage.removeItem('access_token');
        }
        return throwError(() => error);
      }),
    );
  }
}
