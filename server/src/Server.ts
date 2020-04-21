import {NestInterceptor, ValidationPipe} from '@nestjs/common';
import {NestFactory}                     from '@nestjs/core';
import {NestExpressApplication}          from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule}  from '@nestjs/swagger';
import * as bodyParser                   from 'body-parser';
import * as dotenv                       from 'dotenv';
import * as fs                           from 'fs';
import {GlobalExceptionsFilter}          from './lib/GlobalExceptionsFilter';
import {SwaggerSettings}                 from './lib/SwaggerSettings';

dotenv.config();

export class Server {

	public static async bootstrap(module: any, name: string, port: number, swagger: SwaggerSettings, origins: Array<string>, interceptors: Array<NestInterceptor>): Promise<NestExpressApplication> {

		const app = await NestFactory.create<NestExpressApplication>(module, {

			cors: {

				origin: origins

			}

		});

		const documentBuilder = new DocumentBuilder().setTitle(swagger.title)
													 .setContact(swagger.contactName, swagger.contactUrl, swagger.contactEmail)
													 .setDescription(swagger.description)
													 .setExternalDoc(swagger.docsDescription, swagger.docsUrl)
													 .setVersion(swagger.version)
													 .addBearerAuth();

		swagger.serverUrls.forEach(url => documentBuilder.addServer(url));

		Object.keys(swagger.tags).forEach(key => {

			documentBuilder.addTag(key, swagger.tags[key]);

		});

		SwaggerModule.setup(swagger.path, app, SwaggerModule.createDocument(app, documentBuilder.build()));

		if (interceptors) {

			app.useGlobalInterceptors(...interceptors);

		}
		app.useGlobalPipes(new ValidationPipe({
			transform: true,
			forbidUnknownValues: true
		}));
		app.useGlobalFilters(new GlobalExceptionsFilter());
		app.use(bodyParser.json({limit: '50mb'}));
		app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
		app.disable('x-powered-by');

		await app.listen(port);

		console.log(`${new Date().toISOString()} ${name} server started on port ${port}`);

		return app;

	}

	public static getEnvironment(): 'local' | 'docker' | 'k8' {

		if (fs.existsSync('/proc/1/cgroup')) {

			const contents = fs.readFileSync('/proc/1/cgroup');

			if (contents.indexOf('docker') > -1) {

				return 'docker';

			} else if (contents.indexOf('kube') > -1) {

				return 'k8';

			}

		}

		return 'local';

	}

}
