import { Component, OnInit } from '@angular/core';
import { AuthService }       from '../../auth/auth.service';
import { Router, ActivatedRoute }            from '@angular/router';

@Component({
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {
	public email: string;
	public password: string;
	public error: string;

	constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
	}

	ngOnInit() {
		if (this.route.snapshot.routeConfig.path == "logout") {
			this.authService.logout();
			this.router.navigate([ '/login' ]);
		}
	}

	public tryLogin() {
		this.authService.login(this.email, this.password).subscribe(r => {
			console.log("login result", r);
			if (r) {
				return this.router.navigate([ '/dash' ]);
			} else {
				this.error = "Invalid login.";
			}
		});
	}

	public isValid() {
		console.log("valid?", this.email, this.password);
		return this.email !== '' && this.password !== '';
	}
}


