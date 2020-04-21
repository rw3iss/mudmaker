import {EntityBase} from './EntityBase';
import {User}       from './User';
import { Room } from './Room';

export class Area extends EntityBase {

	public user: User;

	public name: string;

	public rooms: Array<Room>;

	constructor() {
		super();
		this.rooms = new Array<Room>();
	}

}
