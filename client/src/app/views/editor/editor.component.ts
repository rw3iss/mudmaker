import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router}            from '@angular/router';
import {AuthService}       from '../../auth/auth.service';
import { Area } from 'src/app/lib/models/Area';
import { Room } from 'src/app/lib/models/Room';
import { User } from 'src/app/lib/models/User';
import RoomView from './RoomView';
import CanvasUtils from './CanvasUtils'

@Component({
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
     
    public user: User;

    public area: Area;
    
    public canvas: HTMLCanvasElement;

    public draggingCanvas: boolean;

	public gridZoom: number;

    public editingRoom: Room;
    
    public selectedRooms: Array<RoomView>;

    private baseRoomSize = 16;
    private baseGridSize = 26;
    private currZoomPerc = 100;
    private lastRoomID = 0;

    public uiConfig = {
        panels: {
            all: false,
            rooms: true,
            roomProperties: true
        }
    };

	constructor(private router: Router, private authService: AuthService, private changeDetector: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.loadData();
	}

	async loadData() {
        const self = this;
		console.log('loading dashboard...');

		const user = this.authService.getCurrentUser().subscribe(u => {
            if (!u)
                return self.router.navigate(['/login']);
            self.user = u;
		    console.log("Dashboard user data", u);
        });
        
        this.startNewArea();
	}
	
	public startNewArea() {
        this.area = new Area();
        this.initEditor();
    }
    
    public togglePanel(panel) {
        console.log('toggle panel');
        this.uiConfig.panels[panel] = !this.uiConfig.panels[panel];
    }

    public initEditor() {
        const self = this;
        this.canvas = (document.getElementById('area-canvas') as HTMLCanvasElement)
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        
        console.log("canvas", this.canvas);

		///this.cContext = this.canvas[0].getContext('2d');

		//Clickable center area/room gui
		this.canvas.addEventListener('click', (event: any) => {

            console.log("CLICK", event.which);

			if(self.area == null)
				return;

			var totalOffsetX = 0;
		    var totalOffsetY = 0;
		    var canvasX = 0;
		    var canvasY = 0;
		    var currentElement = event.target;

		    do {
		        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
		        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
		    }
		    while(currentElement = currentElement.offsetParent)

		    canvasX = event.pageX - totalOffsetX;
		    canvasY = event.pageY - totalOffsetY;

		    if(event.which == 2) {
		    	//stop drag?
		    	self.dragEnd();
		    	return;
            }
            
            console.log('canvas click', event, canvasX, canvasY);

		 	self.handleCanvasClick(canvasX, canvasY, event);
        });
        
        document.addEventListener('mousedown', function(e) {
            console.log("DOC CLICK", e);
        })
        
		this.canvas.addEventListener('wheel', (event: any) => {
            console.log('mousewheel', event);
            let direction = event.deltaY < 0 ? 'UP' : 'DOWN';
            let movement = Math.abs(event.deltaY);
            if (direction == 'UP') {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        });
        
        this.clearCanvas();
        this.renderAll();
    }

    public zoomIn() {
        console.log('ZOOM IN');
        if (this.currZoomPerc >= 200)
            return;
        this.currZoomPerc += 10;
        this.renderAll();
    }

    public zoomOut() {
        console.log('ZOOM OUT');
        if (this.currZoomPerc <= 50)
            return;
        this.currZoomPerc -= 10;
        this.renderAll();
    }

    public onResize($event) {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.renderAll();
    }

    public handleCanvasClick(x, y, event) {
        if(event.which == 2) {
            console.log('2nd click')
            return;
        }

        //find the closest grid point to the click:
        var gridPt = this.findGridPoint(x, y);
        console.log('grid pt', gridPt);

        var existingRoom = this.roomAtClick(gridPt.x, gridPt.y);
        console.log('existing room', existingRoom);

        if(event.ctrlKey == true) {
            console.log('CTRL KEY')
            if (existingRoom != null) {
                this.removeRoom(existingRoom);
            }
            return;
        };

        if (existingRoom != null) {
            this.selectRoom(existingRoom, event, true);
        } else {
            this.addRoom(gridPt.x, gridPt.y, event);
            if(this.area.rooms.length == 0) {
                //store our first room so we can create a grid relative to that:
            }
        }
    }

    public findGridPoint(x, y) {
        console.log('find grid pt', x, y);
        var gridSize = this.baseGridSize * (this.currZoomPerc/100); //pixels per room
        var tx = (x % gridSize) - gridSize/2;
        var ty = (y % gridSize) - gridSize/2;
        var rx, ry;

        if (tx < gridSize / 2) {
            //round down
            rx = Math.floor(x / gridSize) * gridSize;
        } else {
            //round up
            rx = Math.ceil(x / gridSize) * gridSize;
        }

        if (ty < gridSize / 2) {
            //round down
            ry = Math.floor(y / gridSize) * gridSize;
        } else {
            //round up
            ry = Math.ceil(y / gridSize) * gridSize;
        }

        return { x: rx, y: ry }
    }
    
    public roomAtClick(x, y) {
        
        for(var i in this.area.rooms) {
            var r =  this.area.rooms[i];
            
            if (r.x == x && r.y == y) {
                r.selected = true;
                return r;
            }

            // if( ( (x > r.x) && (x < r.x+this.baseGridSize) ) &&
            //     ( (y > r.y) && (y < r.y+this.baseGridSize) ) ) {
            //     r.selected = true;
            //     return r;
            // }
        }

        return null;
    }

    public clearCanvas = () => {
        let ctx = this.canvas.getContext('2d');
        console.log('got canvas context?', ctx);
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        ctx.restore();
    }

	public dragEnd = () => {
        this.draggingCanvas = false;

        //fix all rooms to grid:
        for(var i in this.area.rooms) {
            var r: Room = this.area.rooms[i];

            var gridCoords = this.findGridPoint(r.x, r.y);
            r.x = gridCoords.x;
            r.y = gridCoords.y;
        }
                
        this.renderAll();
    }

    public selectRoom = (room, event, fromCanvas) => {
        console.log("selectRoom", room, event);

        var addToSelection = false;

        if(typeof event != 'undefined') {
            event.preventDefault();
            addToSelection = event.shiftKey;
        }

        if(typeof fromCanvas == 'undefined')
            fromCanvas = false;

        if(!addToSelection) {
            this.clearSelection();
        }

        this.selectedRooms.push(room);
        room.selected = true;
        this.editingRoom = room;

        this.renderAll();

        if(fromCanvas) {
            this.changeDetector.detectChanges();
        }

        //TODO: load room properties
    }

    public clearSelection = () => {
        this.selectedRooms = [];

        for(var i in this.area.rooms) {
            var r =  this.area.rooms[i];
            r.selected = false;
        }
    }

    public addRoom = (x, y, event) => {	
        //this.clearSelection();

        console.log('addRoom', x, y)

        //find the closest grid point to the click:
        var room = new Room();
        let point = this.findGridPoint(x, y);
        console.log("add room point", point);

        room.x = point.x;
        room.y = point.y;
        room.id = (this.lastRoomID++).toString();

        this.area.rooms.push(room);

        //select the new room
        this.selectRoom(room, event, true);

        this.changeDetector.detectChanges();
    }

    public removeRoom(room) { //x, y) {
        for(var i in this.area.rooms) {
            var r =  this.area.rooms[i];
            
            if (r == room) {
                this.area.rooms.splice(Number.parseInt(i), 1);
            }
            // if( (x > r.x-this.baseRoomSize/2 && x < r.x+this.baseRoomSize) && (y > r.y-this.baseRoomSize/2 && y < r.y+this.baseRoomSize) ) {
            //     this.area.rooms.splice(Number.parseInt(i), 1);
            // }
        }

        this.renderAll();
        this.changeDetector.detectChanges();
    }
    
    //iterates through rooms and such and draws everything
	public renderAll() {
        this.clearCanvas();
        var ctx = this.canvas.getContext('2d');

        let zoom = (this.currZoomPerc/100);
        let gridSize = this.baseGridSize * zoom;

        let drawGrid = true;
        if (drawGrid) {
            let cols = Math.ceil(this.canvas.width/gridSize);
            let rows = Math.ceil(this.canvas.height/gridSize);
            for (var i=0; i<cols; i++) {
                CanvasUtils.drawLine(ctx, "#151515", i*gridSize, 0, i*gridSize, this.canvas.height);
            }
            for (var i=0; i<rows; i++) {
                CanvasUtils.drawLine(ctx, "#151515", 0, i*gridSize, this.canvas.width, i*gridSize);
            }
        }

        for(let i in this.area.rooms) {
            let r =  this.area.rooms[i];

            let width = this.baseRoomSize * zoom;
            let cX = (r.x*zoom) + gridSize/2;///2;
            let cY = (r.y*zoom) + gridSize/2;//this.baseGridSize*zoom/2;

            //draw exits first so room block covers them
            this.drawRoomExits(r);

            if(r.selected == true) {

                // draw at grid point + grid size - half room size
                CanvasUtils.drawSquare(ctx, "#B0DAFF", cX - (width/2), cY - (width/2),
                    (cX+(width/2)),
                    (cY+(width/2))
                );
                CanvasUtils.drawSquare(ctx, "#B0DAFF", cX - (width/2)+1, cY - (width/2)+1,
                    (cX+(width/2)-2),
                    (cY+(width/2)-2)
                );

            } else {
                
                CanvasUtils.drawSquare(ctx, "#112", cX - (width/2), cY - (width/2),
                    (cX+(width/2)),
                    (cY+(width/2))
                );

            }
        }
    }

    public drawRoomExits(room) {
        const self = this;
        var ctx = this.canvas.getContext('2d');
        
        for(var i in room.exits) {
            var e = room.exits[i];
            switch(e) {
                case 'n':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x, room.y-self.baseGridSize * self.currZoomPerc);
                    break;

                case 's':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x, room.y-self.baseGridSize * self.currZoomPerc);
                    break;

                case 'e':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x+self.baseGridSize, room.y);
                    break;
    
                case 'w':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x-self.baseGridSize, room.y);
                    break;

                case 'sw':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x-self.baseGridSize, room.y+self.baseGridSize);
                    break;

                case 'se':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x+self.baseGridSize, room.y+self.baseGridSize);
                    break;

                case 'nw':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x-self.baseGridSize, room.y-self.baseGridSize);
                    break;

                case 'ne':
                    CanvasUtils.drawLine(ctx, "#000", room.x, room.y, room.x+self.baseGridSize, room.y-self.baseGridSize);
                    break;
    
            }
        }
    }







    
	public toggleExitSelection(exit) {
	}


	public saveArea() {
	}

	public loadArea() {
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


	public areaNameChanged(t) {
	}

}
