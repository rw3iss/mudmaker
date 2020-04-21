export class PageRequest {

	public terms: string;
	public count: number = 0;
	public pageSize: number = 5;
	public offset: number = 0;
	public limit: number = 5;

	public constructor(terms?: string, offset?: number, limit?: number) {

		this.terms = terms;
		this.offset = (offset) ? offset : 0;
		this.limit = (limit) ? limit : 20;
		this.pageSize = limit;

	}

}
