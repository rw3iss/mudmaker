import {Injectable}         from '@nestjs/common';
import {InjectRepository}   from '@nestjs/typeorm';
import {User}               from '@tripora/shared/dist/models/User';
import {Trip}               from '@tripora/shared/dist/models/Trip';
import {TripPost}           from '@tripora/shared/dist/models/TripPost';
import {TripPostCreate}     from './TripPostCreate';
import {TripPostRepository} from './TripPostRepository';

@Injectable()
export class TripPostService {

	public constructor(@InjectRepository(TripPostRepository) private readonly tripPostRepository: TripPostRepository
	) {
	}

	public search(user: User): Promise<Array<TripPost>> {

		return this.tripPostRepository.find({

			where: {user}

		});

	}

	public getByTrip(trip: Trip): Promise<Array<TripPost>> {

		return this.tripPostRepository.find({where: {trip}});

	}

	public getByIdAndUser(id: string, user: User): Promise<TripPost> {

		return this.tripPostRepository.findOneOrFail({where: {id, user}});

	}

	public create(user: User, trip: Trip, tripPostCreate: TripPostCreate): Promise<TripPost> {

		return this.tripPostRepository.save({

			trip,
			user,
			...tripPostCreate

		});

	}

	public async delete(user: User, trip: Trip, post: TripPost): Promise<boolean> {

		return (await this.tripPostRepository.delete({
			id: post.id,
			user: user,
			trip: trip
		})).affected > 0;

	}

}
