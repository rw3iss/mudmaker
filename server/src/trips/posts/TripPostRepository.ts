import { EntityRepository, Repository } from "typeorm";
import { TripPost }                     from "@tripora/shared/dist/models/TripPost";

@EntityRepository(TripPost)
export class TripPostRepository extends Repository<TripPost> {

}
