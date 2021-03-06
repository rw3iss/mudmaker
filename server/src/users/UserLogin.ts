import {ApiProperty}     from '@nestjs/swagger';
import {IsEmail, Length} from 'class-validator';

/**
 * Class used for deserializing HTTP POST Body into an object class
 * for user login.
 */
export class UserLogin {

	@ApiProperty()
	@IsEmail()
	public email: string;

	@ApiProperty()
	@Length(6, 255)
	public password: string;

}
