import {Module}             from '@nestjs/common';
import {TypeOrmModule}      from '@nestjs/typeorm';
import * as dotenv          from 'dotenv';
import {TripService}        from './trips/TripService';
import {TripController}     from './trips/TripController';
import {TripRepository}     from './trips/TripRepository';
import {User}               from "@tripora/shared/dist/models/User";
import {Permission}         from "@tripora/shared/dist/models/Permission";
import {Role}               from "@tripora/shared/dist/models/Role";
import {Token}              from "@tripora/shared/dist/models/Token";
import {TripPostMedia}      from '@tripora/shared/dist/models/TripPostMedia';
import {Trip}               from '@tripora/shared/dist/models/Trip';
import {TripPost}           from '@tripora/shared/dist/models/TripPost';
import {TripPostRepository} from './trips/posts/TripPostRepository';
import {TripPostController} from './trips/posts/TripPostController';
import {TripPostService}    from './trips/posts/TripPostService';
import {UserService}        from "./users/UserService";
import {TokenService}       from "./auth/TokenService";
import {UserRepository}     from "./users/UserRepository";
import {TokenRepository}    from "./auth/TokenRepository";
import {UserController}     from "./users/UserController";

dotenv.config();

@Module({

	imports: [

		TypeOrmModule.forRoot({

			type: 'mysql',
			host: process.env.DB_HOSTNAME || 'localhost',
			port: Number.parseInt(process.env.DB_PORT) || 3306,
			username: process.env.DB_USERNAME || 'mysql',
			password: process.env.DB_PASSWORD || 'mysql',
			database: process.env.DB_NAME || 'tripora',
			synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
			keepConnectionAlive: true,
			autoLoadEntities: true,
			entities: [

				Permission,
				Role,
				Token,
				User,

				Trip,
				TripPost,
				TripPostMedia

			]

		}),

		TypeOrmModule.forFeature([

			TripRepository,
			TripPostRepository,
			UserRepository,
			TokenRepository

		])

	],

	providers: [

		TripService,
		TripPostService,
		UserService,
		TokenService

	],

	controllers: [

		TripController,
		TripPostController,
		UserController

	]

})
export class AppModule {

}
