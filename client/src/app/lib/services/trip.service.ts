import {Injectable}    from '@angular/core';
import {Subject}       from "rxjs/internal/Subject";
import {ReplaySubject} from "rxjs/internal/ReplaySubject";
import {Observable}    from "rxjs/internal/Observable";
import {APIClient}     from "../APIClient";

@Injectable()
export class TripService extends APIClient<any> {
/* 
	public activeTrip: Subject<Trip> = new Subject();

	public trips: ReplaySubject<Array<Trip>> = new ReplaySubject();

	public create(trip): Observable<Trip> {

		return this.post('trips', trip);

	}

	public getTrips(userId?): Observable<Array<Trip>> {

		return this.get('trips');

	}

	public getTrip(id): Observable<Trip> {

		return this.get(`sites/${id}`);

	}

	public saveTrip(trip): Observable<Trip> {

		return this.put(`trips/${trip.id}`, trip);

	}

	public getActiveTrip(): Observable<Trip> {
		return this.activeTrip;
	}

	public createPost(tripId, post: TripPost): Observable<TripPost> {
		console.log('create post', post);
		return this.post(`trips/${tripId}/posts`, post);
	}

	public updatePost(tripId, post: TripPost): Observable<TripPost> {
		return this.put(`trips/${tripId}/posts/${post.id}`, post);
	}

	public deletePost(tripId: string, post: TripPost): Observable<Array<TripPost>> {

		return this.delete(`trips/${tripId}/posts/${post.id}`);

	}

	public getPosts(tripId): Observable<Array<TripPost>> {

		return this.get(`trips/${tripId}/posts`);

	}

	initAppEvents() {
		window.addEventListener('online', () => console.log('came online'));
		window.addEventListener('offline', () => console.log('came offline'));
		(navigator as any).connection.addEventListener('typechange', function () {
			console.log('connected type change', (navigator as any).connection.type);
		});
	} */

}
