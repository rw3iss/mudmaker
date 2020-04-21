import { Length }        from 'class-validator';
import { ApiProperty }   from '@nestjs/swagger';
import { TripPostMedia } from '@tripora/shared/dist/models/TripPostMedia';
import { Point }         from 'geojson';
import { Transform }     from 'class-transformer';

export class TripPostCreate {

	@ApiProperty()
	@Length(0, 4048)
	public message: string;

	@ApiProperty()
	public media: Array<TripPostMedia>;

	@ApiProperty()
	public public: boolean;

	@ApiProperty()
	@Transform(v => {
		console.log("trip post create transform location", v);
		return v;
	})
	public location?: Point;

}
