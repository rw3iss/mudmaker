import { HttpClient }     from '@angular/common/http';
import { Injectable }     from '@angular/core';
import { ToastrService }  from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError }     from 'rxjs/operators';
import { environment }    from '../../environments/environment';
import { Pageable }       from './Pageable';
import { PageRequest }    from './PageRequest';

@Injectable()
export class APIClient<T> {

	public static readonly BASE_URL: string = environment.API_BASE;

	public constructor(private httpClient: HttpClient, private toastrService: ToastrService) {
	}

	public _getPageable(url: string, dataTablePage?: any): Observable<Pageable<T>> {

		if (dataTablePage) {

			return this.httpClient.get<Pageable<T>>(`${APIClient.BASE_URL}/${url}?${dataTablePage.toParams()}`);

		} else {

			return this.httpClient.get<Pageable<T>>(`${APIClient.BASE_URL}/${url}`);

		}

	}

	public get<T>(url: string): Observable<T> {

		return this.httpClient.get<T>(`${APIClient.BASE_URL}/${url}`);

	}

	public search<T>(url: string, pageRequest: PageRequest): Observable<T> {

		return this.httpClient.get<T>(`${APIClient.BASE_URL}/${url}?terms=${pageRequest.terms}&limit=${pageRequest.limit}&offset=${pageRequest.offset}`);

	}

	public post<T>(url: string, body?: any): Observable<T> {

		console.log("POST TO", `${APIClient.BASE_URL}/${url}`, body);

		return this.httpClient.post<T>(`${APIClient.BASE_URL}/${url}`, body).pipe(catchError(e => {

			console.log("Post response", e);

			if (e.error && e.error.message) {

				console.log("post ERROR", e);
				this.toastrService.error(`${e.error.message}!`, 'An error has occurred');

			}

			return of(null);

		}));

	}

	public put<T>(url: string, body: any): Observable<T> {

		return this.httpClient.put<T>(`${APIClient.BASE_URL}/${url}`, body).pipe(catchError(e => {

			if (e.error && e.error.message) {

				console.log("post ERROR", e);
				this.toastrService.error(`${e.error.message}!`, 'An error has occurred');

			}

			return of(null);

		}));

	}

	public delete<T>(url: string): Observable<T> {

		return this.httpClient.delete<T>(`${APIClient.BASE_URL}/${url}`).pipe(catchError(e => {

			if (e.error && e.error.message) {

				console.log("post ERROR", e);
				this.toastrService.error(`${e.error.message}!`, 'An error has occurred');

			}

			return of(null);

		}));

	}

}

