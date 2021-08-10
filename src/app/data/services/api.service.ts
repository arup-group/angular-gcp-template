import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable, throwError} from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: environment.apiKey,
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }

  getData(): Observable<any[]> {
    const options = {
      ...httpOptions,
      params: new HttpParams().set('key', environment.apiKey),
    };
    return this.http.get<any[]>(
      environment.apiUrl + '/<URL>',
      options
    );
  }

  postData(data: any): Observable<string> {
    const options = {
      ...httpOptions,
      params: new HttpParams().set('key', environment.apiKey),
    };
    return this.http.post<string>(environment.apiUrl + '<URL>/', data, options)
  }

}
