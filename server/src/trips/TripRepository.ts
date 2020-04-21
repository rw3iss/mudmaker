import { EntityRepository, Repository } from "typeorm";
import { Trip }                         from '@tripora/shared/dist/models/Trip';

@EntityRepository(Trip)
export class TripRepository extends Repository<Trip> {

}
