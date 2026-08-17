import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

/** No-op stand-in for `Storage` so the interceptor can be constructed during SSR, where there is no per-visitor token to attach. */
class NullStorage implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  getItem(): null {
    return null;
  }
  setItem(): void {}
  removeItem(): void {}
}

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = isPlatformBrowser(
    inject(PLATFORM_ID),
  )
    ? window.localStorage
    : new NullStorage();

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
