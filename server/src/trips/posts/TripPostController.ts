import {PrincipalGuard}   from '../../auth/PrincipalGuard';
import {User}             from '@tripora/shared/dist/models/User';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	UploadedFiles,
	UseGuards,
	UseInterceptors
}                         from "@nestjs/common";
import {FilesInterceptor} from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiTags
}                         from '@nestjs/swagger';
import {TripService}      from '../TripService';
import {Trip}             from '@tripora/shared/dist/models/Trip';
import {TripPost}         from '@tripora/shared/dist/models/TripPost';
import {TripPostCreate}   from './TripPostCreate';
import {TripPostService}  from './TripPostService';
import {Principal}        from "../../auth/Principal";

@ApiBearerAuth()
@ApiTags('Trip Posts')
@Controller('/trips/:tripId/posts')
export class TripPostController {

	public constructor(private readonly tripService: TripService,
					   private readonly postService: TripPostService) {

	}

	@UseGuards(PrincipalGuard)
	@Get('/:postId')
	public async getByIdAndTrip(@Principal() user: User,
								@Param('tripId', ParseUUIDPipe) tripId: string,
								@Param('postId', ParseUUIDPipe) postId: string): Promise<Array<TripPost>> {

		console.log("get trip post", tripId);
		let trip = await this.tripService.getByIdAndUser(tripId, user);
		return this.postService.getByTrip(trip);

	}

	@UseGuards(PrincipalGuard)
	@Get()
	public search(@Principal() principal: User): Promise<Array<Trip>> {

		console.log("get trip posts");

		return this.tripService.search(principal);

	}

	@UseGuards(PrincipalGuard)
	@Post()
	@UseInterceptors(FilesInterceptor('files'))
	public async create(@Principal() user: User,
						@Param('tripId', ParseUUIDPipe) tripId: string,
						@Body() tripPostCreate: TripPostCreate,
						@UploadedFiles() files): Promise<TripPost> {

		console.log("trip post", tripId, tripPostCreate, files);

		let trip = await this.tripService.getByIdAndUser(tripId, user);

		return this.postService.create(user, trip, tripPostCreate);

	}

	@UseGuards(PrincipalGuard)
	@Delete('/:postId')
	public async delete(@Principal() user: User,
						@Param('tripId', ParseUUIDPipe) tripId: string,
						@Param('postId', ParseUUIDPipe) postId: string): Promise<boolean> {

		console.log("trip post delete", tripId, postId);

		let trip = await this.tripService.getByIdAndUser(tripId, user);
		let post = await this.postService.getByIdAndUser(postId, user);

		return this.postService.delete(user, trip, post);

	}

}
