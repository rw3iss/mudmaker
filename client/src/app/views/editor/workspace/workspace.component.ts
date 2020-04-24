import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { cloneDeep } from 'lodash';

interface IConfig {
    columns: Array<{
        visible: boolean,
        size: number,
        rows: Array<{
            visible: boolean,
            size: number,
            type: string
        }>
    }>
    disabled: boolean
}

const defaultConfig: IConfig = {
    columns: [
        {
            visible: true,
            size: 25,
            rows: [
                { visible: true, size: 25, type: 'A' },
                { visible: true, size: 75, type: 'B' }
            ]
        },
        {
            visible: true,
            size: 50,
            rows: [
                { visible: true, size: 60, type: 'doc' },
                { visible: true, size: 40, type: 'C' }    
            ]
        },
        {
            visible: true,
            size: 25,
            rows: [
                { visible: true, size: 20, type: 'D' },
                { visible: true, size: 30, type: 'E' },    
                { visible: true, size: 50, type: 'F' }    
            ]
        }
    ],
    disabled: false
};

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceComponent implements OnInit, AfterViewInit {

    localStorageName = 'angular-split-ws'
    config: IConfig = null
    
    @Output() onReady: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        console.log('WORKSPACE')
        if(localStorage.getItem(this.localStorageName)) {
            this.config = JSON.parse(localStorage.getItem(this.localStorageName));
        }
        else {
            this.resetConfig();
        }
    }

    ngAfterViewInit() {
        this.onReady.emit();
    }

    resetConfig() {
        this.config = cloneDeep(defaultConfig);

        localStorage.removeItem(this.localStorageName);
    }

    onDragEnd(columnindex: number, e: {gutterNum: number, sizes: Array<number>}) {
        // Column dragged
        if(columnindex === -1) {
            // Set size for all visible columns
            this.config.columns.filter(c => c.visible === true).forEach((column, index) => column.size = e.sizes[index]);
        }
        // Row dragged
        else {
            // Set size for all visible rows from specified column
            this.config.columns[columnindex].rows.filter(r => r.visible === true).forEach((row, index) => row.size = e.sizes[index]);
        }

        this.saveLocalStorage();
    }

    toggleDisabled() {
        this.config.disabled = !this.config.disabled;

        this.saveLocalStorage();
    }

    refreshColumnVisibility() {
        // Refresh columns visibility based on inside rows visibilities (If no row > hide column)
        this.config.columns.forEach((column, index) => {
            column.visible = column.rows.some(row => row.visible === true);
        });

        this.saveLocalStorage();
    }

    saveLocalStorage() {
        localStorage.setItem(this.localStorageName, JSON.stringify(this.config));
    }

}
