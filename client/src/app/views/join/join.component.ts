import {Component}                          from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService}                        from '../../auth/auth.service';

@Component({
	templateUrl: './join.component.html',
	styleUrls: ['./join.component.scss']
})
export class JoinComponent {

	public formGroup = new FormGroup({

		email: new FormControl('', [

			Validators.required,
			Validators.email,
			Validators.minLength(1),
			Validators.maxLength(255)

		]),

		password: new FormControl('', [

			Validators.required,
			Validators.minLength(1),
			Validators.maxLength(255)

		]),

		confirmPassword: new FormControl('', [

			Validators.required,
			Validators.minLength(1),
			Validators.maxLength(255)

		]),

		agree: new FormControl('', []),

	});

	public error = '';

	public constructor(private authService: AuthService) {
	}

	public isValid() {
		return true; // this.formGroup.value.email !== '' && this.formGroup.value.password !== '' && this.formGroup.value.agree !== ''
	}

	public onSubmit() {
		console.log('submit', this.formGroup.value);

		this.authService.register(this.formGroup.get('email').value, this.formGroup.get('password').value).subscribe(result => {

			console.log('create result view', result);

			if (result) {
			} else {
				this.error = "Error.";
			}

		});

	}

}
