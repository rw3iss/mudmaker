import { OnInit, Input, Output, EventEmitter, Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import CanvasUtils from '../../views/editor/CanvasUtils';

@Component({
    selector: 'app-panel',
	templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit, AfterViewInit {
    
    @Input() id: string;

    @Input() title: string;

    @Input() isOpen: boolean = true;

    @Output() titleClick: EventEmitter<any> = new EventEmitter<any>();
    
    @Input() draggable: boolean;

    public isDragging = false;
    public mouseDownStart = null;

    public top: string = "0";
    public left: string = "0";

    @ViewChild('thePanel') thePanel: ElementRef;
    @ViewChild('titleBar') titleBar: ElementRef;

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        this.bindDraggable();
    }

    private bindDraggable = () => {
        const self = this;
        console.log("DRAG", this.titleBar);
        
        this.titleBar.nativeElement.addEventListener('mousedown', (event: any) => {
            console.log('mousedown', event.which);
            this.mouseDownStart = event;
            let { x, y } = CanvasUtils.mousePos(event);
        });
        
        document.body.addEventListener('mousemove', (event: any) => {
            if (!this.isDragging && this.mouseDownStart) {
                let { x, y } = CanvasUtils.mousePos(event);
                this.dragStart(x, y, event);
            } else if (this.isDragging) {
                self.movePanel(event);
            }
        })

		document.body.addEventListener('mouseup', (event: any) => {
            if(this.isDragging && event.which == 1) {
                self.dragEnd(event);
            } 
        });
    }

    public movePanel(event) {
        let diffX = this.mouseDownStart.clientX - event.clientX;
        let diffY = this.mouseDownStart.clientY - event.clientY;
        let parent =  this.thePanel.nativeElement.parentNode;
        parent.style.top = -diffY + "px";
        parent.style.left = -diffX + "px";
    }

    public dragStart(x, y, event) {
        console.log('dragStart');
        this.isDragging = true;
    }
    
	public dragEnd = (event) => {
        
        console.log('dragEnd');
        // add total drag to new start position/offset
        // let diffX = this.mouseDownStart.clientX - event.clientX;
        // let diffY = this.mouseDownStart.clientY - event.clientY;

        //move item to new location

        this.mouseDownStart = null;
        this.isDragging = false;

        //fix all rooms to grid:
        // for(var i in this.area.rooms) {
        //     var r: Room = this.area.rooms[i];

        //     var gridCoords = this.findGridPoint(r.x, r.y);
        //     r.x = gridCoords.x;
        //     r.y = gridCoords.y;
        // }
    }

}