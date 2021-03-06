import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common';
import {Request, Response}                                 from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {

	public catch(exception: any, host: ArgumentsHost): void {

		console.error(`GlobalExceptionsFilter.catch(): ${JSON.stringify(exception)}`);

		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const clazz = exception.constructor.name;

		console.error(`GlobalExceptionsFilter.catch(): class name = ${clazz}`);

		if (clazz === 'UnauthorizedException') {

			response.status(401).json({

				statusCode: exception.status,
				timestamp: new Date().toISOString(),
				path: request.url,
				message: exception.message.message

			});

		} else if (clazz === 'BadRequestException') {

			response.status(400).json(exception['response']);

		} else if (clazz === 'ResourceNotFoundException') {

			response.status(exception.status).json(exception);

		} else if (clazz === 'ResourceForbiddenException') {

			response.status(exception.status).json(exception);

		} else if (clazz === 'ResourceAlreadyExistsException') {

			response.status(exception.status).json(exception['message']);

		} else if (clazz === 'QueryFailedError') {

			if (exception.message.indexOf('duplicate key') >= -1) {

				response.status(HttpStatus.CONFLICT).json({message: 'a similar record already exists'});

			}

		} else {

			response.status(500).json('something went wrong! our support team has been notified. please try again later :(');

		}

	}

}
