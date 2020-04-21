import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Response,
	UnauthorizedException,
	UseGuards,
	UseInterceptors
}                               from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import * as jwt                 from 'jsonwebtoken';
import {Principal}              from '../auth/Principal';
import {PrincipalGuard}         from '../auth/PrincipalGuard';
import {User}                   from '@tripora/shared/dist/models/User';
import {UserLogin}              from './UserLogin';
import {UserRegister}           from './UserRegister';
import {UserService}            from './UserService';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('/users')
export class UserController {

	public static JWT_TOKEN = 'change';
	public static JWT_EXPIRY = 86400;

	public constructor(private userService: UserService) {

	}

	/**
	 * Endpoint to perform login with an email address and password.
	 * When successful a JWT token will be returned.
	 *
	 * @param response
	 * @param {UserLogin} login
	 *
	 * @returns {Promise<(req: http.IncomingMessage, res: http.ServerResponse, next: createServer.NextFunction) => void>}
	 *
	 * @throws UnauthorizedException Thrown if the login credentials are invalid.
	 */
	@Post('/login')
	public async login(@Response() response, @Body() login: UserLogin) {

		const user = await this.userService.getByEmail(login.email);

		if (user) {

			const token = jwt.sign({id: user.id}, UserController.JWT_TOKEN, {expiresIn: UserController.JWT_EXPIRY});

			return response.status(HttpStatus.OK).json({expiresIn: UserController.JWT_EXPIRY, token});

		} else {

			throw new UnauthorizedException();

		}

	}

	/**
	 * Creates a new user.
	 *
	 * @param {UserRegister} userRegister
	 *
	 * @returns {Promise<string>}
	 */
	@Post('/register')
	public async register(@Body() userRegister: UserRegister): Promise<string> {

		const user = await this.userService.register(userRegister);

		console.log(user);

		if (user) {

			return 'OK';

		} else {

			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

		}

	}

	/**
	 * Retrieve the current logged in users profile.
	 *
	 * @param {Principal} principal
	 *
	 * @returns {Promise<User>}
	 */
	@Get('/my')
	@UseGuards(PrincipalGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	public async getMyProfile(@Principal() principal: User): Promise<User> {

		return this.userService.getById(principal.id);

	}

	/**
	 * Sends a reset password email.
	 *
	 * @param {string} email
	 *
	 * @returns {Promise<boolean>}
	 */
	// @Post('/reset/send')
	// public forgotSend(@Query('email')  email: string): Promise<boolean> {
	//
	//     return this.userService.resetSend(email);
	//
	// }

	/**
	 * Change password if token matches.
	 *
	 * @param {string} token
	 * @param {UserPassword} userPassword
	 *
	 * @returns {Promise<boolean>}
	 */
	// @Post('/reset/submit')
	// public resetSubmit(@Query('token') token: string, @Body() userPassword: UserPassword): Promise<boolean> {
	//
	//     return this.usersService.resetSubmit(token, userPassword.password);
	//
	// }

	@Post('/changePassword')
	@UseGuards(PrincipalGuard)
	public changePassword(@Principal() user: User, @Body() changePassword: string): Promise<User> {

		return this.userService.changePassword(user, changePassword);

	}

}
