import { Component, OnInit, Input } from '@angular/core';
import { Room } from 'src/app/lib/models/Room';

@Component({
  selector: 'app-room-edit',
  templateUrl: './room-edit.component.html',
  styleUrls: ['./room-edit.component.scss']
})
export class RoomEditComponent implements OnInit {

    @Input() room: Room;

    constructor() { }

    ngOnInit(): void {
    }

    
	public toggleExit(exit) {
        console.log('toggle exit', this.room, exit, this.room.exits[exit]);

        if (this.room.exits[exit]) {
            delete this.room.exits[exit];
        } else {
            this.room.exits[exit] = exit;
        }
	}

	public addNewObject(room) {
	}

	public removeObject(o) {
	}


	public addNewItem(room) {
	}

	public removeItem(o) {
	}


	public addNewNpc(room) {
	}

	public removeNpc(o) {
	}

    
}
