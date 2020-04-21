import {HttpException, HttpStatus} from '@nestjs/common';

/**
 * Used to throw an exception when a record already exists
 * such as a database record when creating entities.
 */
export class ResourceAlreadyExistsException extends HttpException {

	public constructor(message: string) {

		super(message, HttpStatus.CONFLICT);

	}

}
