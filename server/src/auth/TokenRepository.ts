import {EntityRepository, Repository} from 'typeorm';
import {Token}                        from '@tripora/shared/dist/models/Token';

@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {

}
