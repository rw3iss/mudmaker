import {EntityBase} from './EntityBase';
import { RoomExit } from './RoomExit';
import { NPC } from './NPC';

export class Room extends EntityBase {

    public shortDescription: string;
    
    public longDescription: string;

    public exits: Array<RoomExit>;

    public items: Array<Object>;

    public npcs: Array<NPC>;

    public x: number;
    public y: number;

	constructor() {
		super();
		this.exits = new Array<RoomExit>();
		this.items = new Array<Object>();
        this.npcs = new Array<NPC>();
        this.x = 0;
        this.y = 0;
    }
    
    public selected: boolean;

}
