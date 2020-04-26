import {Component, OnInit, ChangeDetectorRef, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import {Router}            from '@angular/router';
import {AuthService}       from '../../auth/auth.service';
import { Area } from 'src/app/lib/models/Area';
import { Room } from 'src/app/lib/models/Room';
import { User } from 'src/app/lib/models/User';
import RoomView from './RoomView';
import CanvasUtils from './CanvasUtils';
import { jqxWindowComponent } from 'jqwidgets-ng/jqxwindow';
import { Xliff } from '@angular/compiler';


// const BACKGROUND_COLOR = "#6a6a7a";
// const GRID_COLOR = "30,30,30";
// const ROOM_COLOR = "#112";
// const ROOM_SELECTED_COLOR = "#B0DAFF";

// let ColorScheme = {
//     BACKGROUND_COLOR: "#f4eef9",
//     GRID_COLOR: "#a3bff0",
//     ROOM_COLOR: "#a3bff0",
//     ROOM_SELECTED_COLOR: "#3f8e47",
//     HIGHLIGHT_COLOR: "#ffffff",
//     HIGHLIGHT_BORDER_COLOR: "#a3bff0"
// }

let ColorScheme = {
    BACKGROUND_COLOR: "#6a6a7a",
    GRID_COLOR: "#333",
    ROOM_COLOR: "#112",
    ROOM_SELECTED_COLOR: "#B0DAFF",
    HIGHLIGHT_COLOR: "#7a7a8a",
    HIGHLIGHT_BORDER_COLOR: "#333"
}

const enum MouseMode {
    Insert, Drag, Delete, None
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
    public zoomPos = null;
    public currZoomPerc = 100;

    public isDraggingItem: boolean;
    public itemDragStartEvent: MouseEvent = null;
    public draggingItem: any;

    public isDraggingCanvas: boolean;
    public canvasDragStartEvent: MouseEvent = null;

    public mouseDownEvent: MouseEvent = null;
    public mouseDownPos = null;
    public mouseMode: MouseMode = MouseMode.None;

    public gridOffsetY = 0;
    public gridOffsetX = 0;
    public gridTempOffsetY = 0; // while dragging
    public gridTempOffsetX = 0;

    public lastRoomID = 0;

    @ViewChild('jqxWidget', { static: false }) jqxWidget: ElementRef;
    @ViewChild('windowReference', { static: false }) window: jqxWindowComponent;
    
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
    
    ngAfterViewInit = () => {
        let offsetLeft = this.jqxWidget.nativeElement.offsetLeft;
        let offsetTop = this.jqxWidget.nativeElement.offsetTop;
        this.window.position({ x: offsetLeft + 50, y: offsetTop + 50 });
        this.window.focus();
        this.window.open();
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
        console.log('toggle panel', panel);
        this.uiConfig.panels[panel] = !this.uiConfig.panels[panel];
        this.changeDetector.detectChanges();
    }

    public initEditor() {
        const self = this;

        this.canvas = (document.getElementById('area-canvas') as HTMLCanvasElement)
        this.canvas.width = CanvasUtils.ww();
        this.canvas.height = CanvasUtils.wh();
       
        this.canvas.addEventListener('mousedown', (event: any) => {
            console.log('mousedown', event.which);
            this.mouseDownEvent = event;
            let { x, y } = CanvasUtils.mousePos(event);
            this.mouseDownPos = this.findGridPoint(x, y);

            // LEFT-CLICK modify rooms
            if (event.which == 1) {
                
                if (event.ctrlKey) {
                    this.mouseMode = MouseMode.Delete;
                } else {
                    let existingRoom = this.roomAtGridPt(this.mouseDownPos.x, this.mouseDownPos.y);
                    if (existingRoom) {
                        this.mouseMode = MouseMode.Drag;
                        this.selectRoom(existingRoom, event, true);
                        this.itemDragStart(existingRoom, this.mouseDownPos, event);
                    } else {
                        this.mouseMode = MouseMode.Insert;
                    } 
                }

            }
            // RIGHT-CLICK drag canvas
            else if (event.which == 3) {

                this.canvasDragStart(event);
                
            }
        });

		this.canvas.addEventListener('mouseup', (event: any) => {

            this.mouseMode = MouseMode.None;

            let { x, y } = CanvasUtils.mousePos(event);
            let mouseUpPos = this.findGridPoint(x, y);

            if(event.which == 1 && this.isDraggingItem) {
                self.itemDragEnd(event);
            } 

		    if(event.which == 3 && this.isDraggingCanvas) {
		    	self.canvasDragEnd(event);
            } 
            
            // mousewheel up, or regular click up
            if (event.which == 2 ||
                (event.which == 1 && (this.mouseDownPos.x == mouseUpPos.x && this.mouseDownPos.y == mouseUpPos.y)) ) {
                self.handleCanvasClick(mouseUpPos.x, mouseUpPos.y, event);
            }

            this.mouseDownEvent = null;
        });
        
        this.canvas.addEventListener('mousemove', (event: any) => {

            let { x, y } = CanvasUtils.mousePos(event);
            let gridPt = this.findGridPoint(x, y);
            let existingRoom = this.roomAtGridPt(gridPt.x, gridPt.y);

            // Left click drag
            if (this.mouseMode == MouseMode.Insert) {
                if (!existingRoom)
                    this.addRoom(gridPt.x, gridPt.y, event);
            } else if (this.mouseMode == MouseMode.Drag) {
                this.moveItem(event, this.draggingItem);
            } else if (this.mouseMode == MouseMode.Delete) {
                if (existingRoom)
                    this.removeRoom(existingRoom);
            }

            if (this.isDraggingCanvas) {
                this.moveCanvas(event);
                //this.handleCanvasMouseMove(x, y, event);
            } else {
                // just show normal selection
                this.hoverGridPt = gridPt;
                this.renderAll();
            }
            
        })

		this.canvas.addEventListener('wheel', (event: any) => {
            
            let direction = event.deltaY < 0 ? 'UP' : 'DOWN';
            let newZoom;
            
            if (direction == 'UP') {
                if (this.currZoomPerc >= 200)
                    return;
                newZoom = this.currZoomPerc + this.zoomIncr;
            } else {
                if (this.currZoomPerc <= 50)
                    return;
                newZoom = this.currZoomPerc - this.zoomIncr;
            }

            // on wheel: take 10% of distance from 0,0 to event grid pos, and set offset to opposite of this.

            this.zoomPos = CanvasUtils.mousePos(event);
            let gridPt = this.findGridPoint(this.zoomPos.x, this.zoomPos.y);
            let gridSize = this.baseGridSize * (newZoom/100);
 
            let distX = this.zoomPos.x + this.gridOffsetX;
            let distY = this.zoomPos.y + this.gridOffsetY;
            // let distX = gridPt.x * gridSize;
            // let distY = gridPt.y * gridSize;

            console.log('grid zoom', gridPt, distX, distY);

            let offsetX = distX * .1;
            let offsetY = distY * .1;

            console.log('wheel', event);

            if (direction == 'UP') {
                this.gridOffsetX += offsetX;
                this.gridOffsetY += offsetY;
                this.zoomIn();
            } else {
                this.gridOffsetX -= offsetX;
                this.gridOffsetY -= offsetY;
                this.zoomOut();
            }
        });
        
        this.clearCanvas();
        this.renderAll();
    }

    public handleCanvasClick(x, y, event) {
        //find the closest grid point to the click:
        var existingRoom = this.roomAtGridPt(x, y);

        if(event.ctrlKey == true || event.which == 2) {
            if (existingRoom != null) {
                this.removeRoom(existingRoom);
            }
            return;
        };

        if (existingRoom != null) {
            this.selectRoom(existingRoom, event, true);
        } else {
            this.addRoom(x, y, event);
        }
    }

    public canvasDragStart(event) {
        this.isDraggingCanvas = true;
        console.log('dragstart', event);
        this.canvasDragStartEvent = event;
    }

    public itemDragStart(item, gridPt, event) {
        this.isDraggingItem = true;
        this.itemDragStartEvent = event;
        this.draggingItem = item;
        console.log('DRAG START', item);
    }

    public moveItem(event, item) {
        let { x, y } = CanvasUtils.mousePos(event);
        let pt = this.findGridPoint(x, y);
        console.log('moveItem', x, y, pt, item);
        item.x = pt.x;
        item.y = pt.y;

        this.renderAll();
    }

    public moveCanvas(event) {
        let diffX = this.canvasDragStartEvent.clientX - event.clientX;
        let diffY = this.canvasDragStartEvent.clientY - event.clientY;
        this.gridTempOffsetX = diffX;
        this.gridTempOffsetY = diffY;
        this.renderAll();
    }

    public findGridPoint(x, y) {
        var gridSize = this.baseGridSize * (this.currZoomPerc/100); //pixels per room

        let offsetX = this.gridOffsetX + this.gridTempOffsetX;
        let offsetY = this.gridOffsetY + this.gridTempOffsetY;

        return { 
            x: Math.floor((x+offsetX) / gridSize), 
            y: Math.floor((y+offsetY) / gridSize) 
        };
    }
    
    public roomAtGridPt(x, y) {
        
        for(var i in this.area.rooms) {
            var r =  this.area.rooms[i];
            
            if (r.x == x && r.y == y) {
                //r.selected = true;
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

    public zoomIn() {
        if (this.currZoomPerc >= 200)
            return;
        this.currZoomPerc += this.zoomIncr;
        
        this.renderAll();
        
        this.gridTempOffsetX = 0;
        this.gridTempOffsetY = 0;
    }

    public zoomOut() {
        if (this.currZoomPerc <= 50)
            return;
        this.currZoomPerc -= this.zoomIncr;
        this.renderAll();

        this.gridTempOffsetX = 0;
        this.gridTempOffsetY = 0;
    }

    public onResize($event) {
        this.canvas.width = CanvasUtils.ww();
        this.canvas.height = CanvasUtils.wh();
        this.renderAll();
    }

    public clearCanvas = () => {
        let ctx = this.canvas.getContext('2d');
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        ctx.restore();
    }

	public canvasDragEnd = (event) => {
        
        // add total drag to new start position/offset
        let diffX = this.canvasDragStartEvent.clientX - event.clientX;
        let diffY = this.canvasDragStartEvent.clientY - event.clientY;
        this.gridOffsetX += this.gridTempOffsetX;
        this.gridOffsetY += this.gridTempOffsetY;
        this.gridTempOffsetX = 0;
        this.gridTempOffsetY = 0;

        this.canvasDragStartEvent = null;
        this.isDraggingCanvas = false;

        //fix all rooms to grid:
        // for(var i in this.area.rooms) {
        //     var r: Room = this.area.rooms[i];

        //     var gridCoords = this.findGridPoint(r.x, r.y);
        //     r.x = gridCoords.x;
        //     r.y = gridCoords.y;
        // }
                
        this.renderAll();
    }

	public itemDragEnd = (event) => {
        
        // add total drag to new start position/offset
        let diffX = this.itemDragStartEvent.clientX - event.clientX;
        let diffY = this.itemDragStartEvent.clientY - event.clientY;

        //move item to new location

        this.itemDragStartEvent = null;
        this.isDraggingItem = false;

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

    public addRoom = (gridX, gridY, event) => {	
        //this.clearSelection();
        console.log('addRoom', gridX, gridY)

        //find the closest grid point to the click:
        var room = new Room();
        room.x = gridX;
        room.y = gridY;
        room.id = (this.lastRoomID++).toString();

        room.exits 
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
        let gridOpacity = .5;

        let offsetX = this.gridOffsetX + this.gridTempOffsetX;
        let offsetY = this.gridOffsetY + this.gridTempOffsetY;

        // Background Grid
        let drawGrid = true;
        if (drawGrid) {
            CanvasUtils.drawSquare(ctx, ColorScheme.BACKGROUND_COLOR, 0,0, CanvasUtils.ww(), CanvasUtils.wh());

            let cols = Math.ceil(this.canvas.width/gridSize);
            let rows = Math.ceil(this.canvas.height/gridSize);

            let offsetCols = Math.ceil(offsetX/gridSize);
            let offsetRows = Math.ceil(offsetY/gridSize);
           // console.log('OFFSET', offsetCols, offsetRows);  

           let lineWidth = this.currZoomPerc/100;

            for (var i=offsetCols; i<cols+offsetCols; i++) {
                CanvasUtils.drawLine(ctx, lineWidth, ColorScheme.GRID_COLOR, i*gridSize - offsetX, 0, i*gridSize - offsetX, this.canvas.height);
            }

            for (var i=offsetRows; i<rows+offsetRows; i++) {
                CanvasUtils.drawLine(ctx, lineWidth,ColorScheme. GRID_COLOR, 0, i*gridSize - offsetY, this.canvas.width, i*gridSize - offsetY);
            }
        }

        // Hover Selector / Cursor
        if (!this.isDraggingCanvas && !this.isDraggingItem) {
            if (this.hoverGridPt) {
                let x = (this.hoverGridPt.x * gridSize) - offsetX;
                let y = (this.hoverGridPt.y * gridSize) - offsetY;
                CanvasUtils.drawSquare(ctx, ColorScheme.HIGHLIGHT_COLOR, x, y, x+gridSize, y+gridSize);
                CanvasUtils.drawStrokeRect(ctx, ColorScheme.HIGHLIGHT_BORDER_COLOR, x, y, x+gridSize, y+gridSize);
            }
        }
    
        // if (roomX )
        let window = {
            x1: 0,
            y1: 0,
            x2: CanvasUtils.ww(),
            y2: CanvasUtils.wh()
        }

        // Rooms
        for(let i in this.area.rooms) {
            let r =  this.area.rooms[i];

            let width = this.baseRoomSize * zoom;
            let cX = (r.x * (gridSize)) + gridSize/2 - offsetX;///2;
            let cY = (r.y * (gridSize)) + gridSize/2 - offsetY;//this.baseGridSize*zoom/2;

            // only draw if the room sits within screen coords
            if (cX < window.x1 || cX > window.x2 || cY < window.y1 || cY > window.y2)
                continue;

            //draw exits first so room block covers them
            this.drawRoomExits(r);

            if(r.selected == true) {

                // draw at grid point + grid size - half room size
                CanvasUtils.drawSquare(ctx, ColorScheme.ROOM_SELECTED_COLOR, cX - (width/2), cY - (width/2),
                    (cX+(width/2)),
                    (cY+(width/2))
                );

            } else {
                
                CanvasUtils.drawSquare(ctx, ColorScheme.ROOM_COLOR, cX - (width/2), cY - (width/2),
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






	public saveArea() {
	}

	public loadArea() {
	}



	public areaNameChanged(t) {
	}

}
