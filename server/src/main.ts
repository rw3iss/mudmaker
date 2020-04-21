import {Server}    from './Server';
import 'reflect-metadata';
import {AppModule} from './AppModule';

const serverUrls = [];


if (Server.getEnvironment() === 'local') {

	serverUrls.push('http://localhost:3001');

}

serverUrls.push('https://api.tripora.com');

Server.bootstrap(AppModule, 'tripora', Number(process.env.PORT) || 3001, {
	path: 'swagger',
	title: '3KDB API',
	description: '3KDB API',
	version: '0.0.1',
	tags: [],
	contactName: 'rw3iss@gmail.com',
	contactEmail: 'rw3iss@gmail.com',
	contactUrl: '',
	docsDescription: 'docs',
	docsUrl: 'https://mudmaker.3kdb.org',
	serverUrls
}, ['http://localhost:5000', 'http://localhost:4201'], []);
//# sourceMappingURL=main.js.map