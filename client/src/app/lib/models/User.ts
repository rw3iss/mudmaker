import {EntityBase} from './EntityBase';

export class User extends EntityBase {

	public organization: any;

	public password?: string;

	public status?: any;

	public firstname?: string;

	public lastname?: string;

	public email?: string;

	public forgotToken: string;

	public confirmToken: string;

	public roles: Array<any>;

}
