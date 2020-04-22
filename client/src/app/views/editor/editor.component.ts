import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router}            from '@angular/router';
import {AuthService}       from '../../auth/auth.service';
import { Area } from 'src/app/lib/models/Area';
import { Room } from 'src/app/lib/models/Room';
import { User } from 'src/app/lib/models/User';
import RoomView from './RoomView';
import CanvasUtils from './CanvasUtils'

function ww() {
    return document.body.clientWidth;
}
function wh() {
    return document.body.clientHeight;
}

@Component({
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
     
    public user: User;

    public area: Area;
    
    public canvas: HTMLCanvasElement;

	public gridZoom: number;

    public editingRoom: Room;
    
    public selectedRooms: Array<RoomView>;
    public hoverGridPt = null;

    public baseRoomSize = 16;
    public baseGridSize = 26;
    public zoomIncr = 10;
    public currZoomPerc = 100;

    public draggingCanvas: boolean;
    public dragStartEvent: MouseEvent = null;
    public gridOffsetY = 0;
    public gridOffsetX = 0;
    public gridTempOffsetY = 0; // while dragging
    public gridTempOffsetX = 0;

    public lastRoomID = 0;

    public uiConfig = {
        panels: {
            all: true,
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

    public dragStart(event) {
        this.draggingCanvas = true;
        console.log('dragstart', event);
        this.dragStartEvent = event;
    }

    public initEditor() {
        const self = this;
        this.canvas = (document.getElementById('area-canvas') as HTMLCanvasElement)
        this.canvas.width = ww(); //document.body.clientWidth;
        this.canvas.height = wh(); //document.body.clientHeight;

		this.canvas.addEventListener('mousedown', (event: any) => {
            console.log('mousedown', event.which);

            if (event.which == 3) {//} && event.shiftKey) {
                console.log("RIGHT DRAG");
                this.dragStart(event);
            }
        });


		this.canvas.addEventListener('ondragstart', (event: any) => {
            console.log('dragstart', event.which);
        });

        // this.canvas.addEventListener('mousedown', function(e) { 
        //     console.log('mouse down', e)
        // });

		//Clickable center area/room gui
		this.canvas.addEventListener('mouseup', (event: any) => {

			if(self.area == null)
				return;

		    if(event.which == 3 && this.draggingCanvas) {
                //stop drag?
                console.log('right', event);
		    	self.dragEnd(event);
		    	return;
            } 

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
            
            self.handleCanvasClick(canvasX, canvasY, event);
        });
        
        this.canvas.addEventListener('mousemove', (event: any) => {
            
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

            this.handleCanvasMouseMove(canvasX, canvasY, event);
        })

		this.canvas.addEventListener('wheel', (event: any) => {
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
        if (this.currZoomPerc >= 200)
            return;
        this.currZoomPerc += this.zoomIncr;
        
        this.renderAll();
    }

    public zoomOut() {
        if (this.currZoomPerc <= 50)
            return;
        this.currZoomPerc -= this.zoomIncr;
        this.renderAll();
    }

    public onResize($event) {
        this.canvas.width = ww();
        this.canvas.height = wh();
        this.renderAll();
    }

    public handleCanvasClick(x, y, event) {
        //find the closest grid point to the click:
        var gridPt = this.findGridPoint(x, y);
        console.log('grid pt', x, y, gridPt);

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
        }
    }

    public handleCanvasMouseMove = (x, y, event) => {
        if (this.draggingCanvas) {
            this.moveCanvas(event);
        } else {
            console.log('move', x, y );//event.clientX, event.clientY);
            let gridPt = this.findGridPoint(x, y);//event.clientX-this.gridOffsetX, event.clientY-this.gridOffsetY);
            this.hoverGridPt = gridPt;
            this.renderAll();
        }
    }

    public moveCanvas(event) {
        console.log("moveCanvas", event);
        let diffX = this.dragStartEvent.clientX - event.clientX;
        let diffY = this.dragStartEvent.clientY - event.clientY;
        this.gridTempOffsetX = diffX;
        this.gridTempOffsetY = diffY;
        this.renderAll();
    }

    public findGridPoint(x, y) {
        var gridSize = this.baseGridSize * (this.currZoomPerc/100); //pixels per room

        let offsetX = this.gridOffsetX + this.gridTempOffsetX;
        let offsetY = this.gridOffsetY + this.gridTempOffsetY;

        console.log('offset', offsetX, offsetY);

        return { 
            x: Math.floor((x+offsetX) / gridSize), 
            y: Math.floor((y+offsetY) / gridSize) 
        };
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
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        ctx.restore();
    }

	public dragEnd = (event) => {
        
        // add total drag to new start position/offset
        let diffX = this.dragStartEvent.clientX - event.clientX;
        let diffY = this.dragStartEvent.clientY - event.clientY;
        this.gridOffsetX += this.gridTempOffsetX;
        this.gridOffsetY += this.gridTempOffsetY;
        this.gridTempOffsetX = 0;
        this.gridTempOffsetY = 0;

        this.dragStartEvent = null;
        this.draggingCanvas = false;

        //fix all rooms to grid:
        // for(var i in this.area.rooms) {
        //     var r: Room = this.area.rooms[i];

        //     var gridCoords = this.findGridPoint(r.x, r.y);
        //     r.x = gridCoords.x;
        //     r.y = gridCoords.y;
        // }
                
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
        room.x = x;
        room.y = y;
        room.id = (this.lastRoomID++).toString();

        this.area.rooms.push(room);

        //select the new room
        this.selectRoom(room, event, true);

        this.onResize(null);

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
        let gridColor = "30,30,30";
        let gridOpacity = .5;

        let offsetX = this.gridOffsetX + this.gridTempOffsetX;
        let offsetY = this.gridOffsetY + this.gridTempOffsetY;

        let drawGrid = true;
        if (drawGrid) {
            let cols = Math.ceil(this.canvas.width/gridSize);
            let rows = Math.ceil(this.canvas.height/gridSize);

            let offsetCols = Math.ceil(offsetX/gridSize);
            let offsetRows = Math.ceil(offsetY/gridSize);
           // console.log('OFFSET', offsetCols, offsetRows);  

           let lineWidth = this.currZoomPerc/100;

            for (var i=offsetCols; i<cols+offsetCols; i++) {
                CanvasUtils.drawLine(ctx, lineWidth, `rgba(${gridColor}, ${gridOpacity})`, i*gridSize - offsetX, 0, i*gridSize - offsetX, this.canvas.height);
            }
            for (var i=offsetRows; i<rows+offsetRows; i++) {
                CanvasUtils.drawLine(ctx, lineWidth, `rgba(${gridColor}, ${gridOpacity})`, 0, i*gridSize - offsetY, this.canvas.width, i*gridSize - offsetY);
            }

            // for (var i=0; i<cols; i++) {
            //     CanvasUtils.drawLine(ctx, "#151515", i*gridSize + offsetX, 0, i*gridSize + offsetX, this.canvas.height);
            // }
            // for (var i=-10; i<rows; i++) {
            //     CanvasUtils.drawLine(ctx, "#151515", 0, i*gridSize -offsetY, this.canvas.width, i*gridSize - offsetY);
            // }
            // for (var i=0; i<rows; i++) {
            //     CanvasUtils.drawLine(ctx, "#151515", 0, i*gridSize + offsetY, this.canvas.width, i*gridSize + offsetY);
            // }
        }

        // draw hover border
        if (!this.draggingCanvas) {
            if (this.hoverGridPt) {
                let x = (this.hoverGridPt.x * gridSize) - offsetX;
                let y = (this.hoverGridPt.y * gridSize) - offsetY;
                CanvasUtils.drawSquare(ctx, "#7a7a7a", x, y, x+gridSize, y+gridSize);
                CanvasUtils.drawStrokeRect(ctx, "#252515", x, y, x+gridSize, y+gridSize);
            }
        }

        for(let i in this.area.rooms) {
            let r =  this.area.rooms[i];

            let width = this.baseRoomSize * zoom;
            let cX = (r.x * (gridSize)) + gridSize/2 - offsetX;///2;
            let cY = (r.y * (gridSize)) + gridSize/2 - offsetY;//this.baseGridSize*zoom/2;

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
        let lineWidth = 1;
        
        for(var i in room.exits) {
            var e = room.exits[i];
            switch(e) {
                case 'n':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x, room.y-self.baseGridSize * self.currZoomPerc);
                    break;

                case 's':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x, room.y-self.baseGridSize * self.currZoomPerc);
                    break;

                case 'e':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x+self.baseGridSize, room.y);
                    break;
    
                case 'w':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x-self.baseGridSize, room.y);
                    break;

                case 'sw':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x-self.baseGridSize, room.y+self.baseGridSize);
                    break;

                case 'se':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x+self.baseGridSize, room.y+self.baseGridSize);
                    break;

                case 'nw':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x-self.baseGridSize, room.y-self.baseGridSize);
                    break;

                case 'ne':
                    CanvasUtils.drawLine(ctx, lineWidth, "#000", room.x, room.y, room.x+self.baseGridSize, room.y-self.baseGridSize);
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
