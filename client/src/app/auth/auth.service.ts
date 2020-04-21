import {Injectable, Output, EventEmitter}          from '@angular/core';
import {APIClient}           from '../lib/APIClient';
import {Observable, Subject} from 'rxjs';
import { LocalStorageService } from '../lib/services/localstorage.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient }     from '@angular/common/http';

@Injectable()
export class AuthService extends APIClient<any> {

    @Output() getUser: EventEmitter<any> = new EventEmitter();
	
	constructor(httpClient: HttpClient, 
			toastrService: ToastrService,
			private localStorageService: LocalStorageService) {
		super(httpClient, toastrService);
	}

	public isLoggedIn() {

		console.log('isAuthd in local storage?', this.localStorageService.get('token'));

		// todo: validate token
		
		return this.localStorageService.get('token') !== null;

	}

	public login(email: string, password: string): Observable<boolean> {

		const subject$: Subject<boolean> = new Subject();

		this.post('users/login', {email, password}).subscribe(result => {

			if (!result) {
				return subject$.next(false);
			}

			this.localStorageService.set('token', result['token']);

            this.getUser.emit(result);

			subject$.next(true);

		});

		return subject$;

	}

	public logout() {

		this.localStorageService.set('token', null);

		this.getUser.emit(null);

		return Promise.resolve(true);

	}

	public register(email: string, password: string): Observable<boolean> {

		const subject$: Subject<boolean> = new Subject();

		this.post('users/register', {email, password}).subscribe((result) => {

			console.log("register result", result);

			if (!result) {
				console.log('no result');
				return subject$.next(false);
			}

			subject$.next(true);

		}, e => {
			console.log("REGISTER ERROR", e);
		});

		return subject$;

	}

	public getCurrentUser(): Observable<any> {

		const user$: Subject<any> = new Subject();
		this.get('users/my').subscribe(u => {
			user$.next(u);
		});
		return user$;
		
	}

	// public getCurrentUser() {
	// 	return localStorage.getItem('currentUser');
	// }

	// public static parseToken(jwtToken: string): any {

	// 	const helper = new JwtHelperService();
	// 	const decodedToken = helper.decodeToken(jwtToken);
	// 	const expirationDate = helper.getTokenExpirationDate(jwtToken);
	// 	const isExpired = helper.isTokenExpired(jwtToken);

	// 	console.log(helper);

	// 	console.log(decodedToken);
	// 	console.log(expirationDate);
	// 	console.log(isExpired);

	// }

	public getToken(): string {

		return this.localStorageService.get('token');

	}

}