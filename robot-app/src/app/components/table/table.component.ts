import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() data: any;

  displayedColumns: string[] = [];
  dataSource = [];

  constructor () { }

  ngOnInit (): void {
    if (this.data) {
      this.displayedColumns = Object.keys(this.data[0])
      this.dataSource = this.data
    }
  }
}
