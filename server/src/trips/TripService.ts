import {Injectable}         from '@nestjs/common';
import {InjectRepository}   from '@nestjs/typeorm';
import {Trip}               from '@tripora/shared/dist/models/Trip';
import {User}               from '@tripora/shared/dist/models/User';
import {TripRepository}     from './TripRepository';
import {TripPostRepository} from './posts/TripPostRepository';
import {TripCreate}         from './TripCreate';
import {TripPostCreate}     from './posts/TripPostCreate';
import {TripPost}           from '@tripora/shared/dist/models/TripPost';

@Injectable()
export class TripService {

	public constructor(@InjectRepository(TripRepository) private readonly tripRepository: TripRepository,
					   @InjectRepository(TripPostRepository) private readonly tripPostRepository: TripPostRepository
	) {

	}

	public search(user: User): Promise<Array<Trip>> {

		return this.tripRepository.find({

			where: {user}

		});

	}

	public getByIdAndUser(id: string, user: User): Promise<Trip> {

		return this.tripRepository.findOneOrFail({where: {id, user}, relations: ['posts']});

	}

	public create(user: User, tripCreate: TripCreate): Promise<Trip> {

		return this.tripRepository.save({

			user,
			...tripCreate

		});

	}

}
