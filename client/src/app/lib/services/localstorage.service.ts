import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

	public get(key: string): any {
		// Look in local storage for object
		const str = window.localStorage.getItem(key);
		if (str != null) {
			try {
				return JSON.parse(str);
			} catch (e) {
			}
		}

		return str;
	}

	public set(key: string, value: any) {
		// todo: use safe-stringify json/deep stringify, removing circular references?
		window.localStorage.setItem(key, JSON.stringify(value));
	}

}
