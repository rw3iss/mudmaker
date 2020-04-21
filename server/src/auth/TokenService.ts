import {Random}           from '../util/Random';
import {Injectable}       from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User}             from '@tripora/shared/dist/models/User';
import {Token}            from '@tripora/shared/dist/models/Token';
import {TokenRepository}  from './TokenRepository';

@Injectable()
export class TokenService {

	public constructor(@InjectRepository(TokenRepository) private readonly tokenRepository: TokenRepository) {

	}

	public getByToken(token: string): Promise<Token> {

		return new Promise(async (resolve, reject) => {

			const entity = await this.tokenRepository.findOne({where: {token}});

			if (entity) {

				resolve(entity);

			} else {

				reject(new Error('could not locate token'));

			}

		});

	}

	/**
	 * Create a new api token.
	 *
	 * @param {User} principal
	 * @param tokenCreate
	 *
	 * @return {Promise<Token>}
	 */
	public async create(principal: User, tokenCreate: any): Promise<Token> {

		const token = new Token();

		token.user = principal;
		token.token = Random.getRandomCryptoString(100);
		token.name = tokenCreate.name;
		token.description = tokenCreate.description;

		await this.tokenRepository.save(token);

		return this.getByToken(token.token);

	}

	/**
	 * Delete an api token by it's id and owning organization.
	 *
	 * @param {string} id
	 * @param {Organization} organization
	 *
	 * @return {Promise<boolean>}
	 */
	public async deleteByIdAndUser(id: string, user: User): Promise<boolean> {

		return (await this.tokenRepository.delete({id, user})).affected > 0;

	}

	/**
	 * Search across all api tokens.
	 *
	 * @param {Organization} organization
	 *
	 * @return {Promise<Array<Token>>}
	 */
	public search(user: User): Promise<Array<Token>> {

		return this.tokenRepository.find({where: {user}});

	}

}
