import { Length }      from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TripCreate {

	@ApiProperty()
	@Length(0, 255)
	public name: string;

}