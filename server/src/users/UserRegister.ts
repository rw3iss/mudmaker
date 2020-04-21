import {ApiProperty}     from '@nestjs/swagger';
import {IsEmail, Length} from 'class-validator';

export class UserRegister {

	@ApiProperty()
	@IsEmail()
	public email: string;

	@ApiProperty()
	@Length(6, 255)
	public password: string;

}
