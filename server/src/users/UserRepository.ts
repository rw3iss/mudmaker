import {EntityRepository, Repository} from 'typeorm';
import {User}                         from '@tripora/shared/dist/models/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

}
