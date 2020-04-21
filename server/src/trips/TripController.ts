import {Principal}                                                    from '../auth/Principal';
import {PrincipalGuard}                                               from '../auth/PrincipalGuard';
import {User}                                                         from '@tripora/shared/dist/models/User';
import {Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags}                                       from '@nestjs/swagger';
import {TripService}                                                  from './TripService';
import {Trip}                                                         from '@tripora/shared/dist/models/Trip';
import {TripCreate}                                                   from './TripCreate';

@ApiBearerAuth()
@ApiTags('Trips')
@Controller('/trips')
export class TripController {

	public constructor(private readonly tripsService: TripService) {
	}

	@Get('/test')
	public test() {

		return "Test.";

	}

	@UseGuards(PrincipalGuard)
	@Get('/:id')
	public getByIdAndUser(@Principal() principal: User, @Param('id', ParseUUIDPipe) id: string): Promise<Trip> {

		console.log("get trip", id);

		return this.tripsService.getByIdAndUser(id, principal);

	}

	@UseGuards(PrincipalGuard)
	@Get()
	public search(@Principal() principal: User): Promise<Array<Trip>> {

		console.log("get trips");

		return this.tripsService.search(principal);

	}

	@UseGuards(PrincipalGuard)
	@Post()
	public create(@Principal() principal: User, @Body() tripCreate: TripCreate): Promise<Trip> {

		return this.tripsService.create(principal, tripCreate);

	}


}
