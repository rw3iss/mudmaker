import {Component, OnInit} from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
	isLoggedIn: boolean;
	routeSubscription: any;

	constructor(private authService: AuthService, private router: Router) {
		this.isLoggedIn = authService.isLoggedIn();
	}

	ngOnInit(): void {

		this.authService.getUser.subscribe(user => {
			console.log("getUser event", user);
			this.isLoggedIn = user != null;
		});

		this.routeSubscription = this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				console.log('route changed', event);
				// Trick the Router into believing it's last link wasn't previously loaded
				//this.router.navigated = false;
			}
		});
	}

	ngOnDestroy() {
		if (this.routeSubscription) {
		  this.routeSubscription.unsubscribe();
		}
	}

}
