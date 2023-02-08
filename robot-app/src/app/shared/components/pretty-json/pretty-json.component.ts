import { Component, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import JSONFormatter from 'json-formatter-js';

@Component({
  selector: 'app-pretty-json',
  template: ''
})
export class PrettyJsonComponent implements OnChanges {
  @Input() data: any;

  constructor( private element: ElementRef) {}

  ngOnChanges() {
    const formatter = new JSONFormatter(this.data);
    formatter.toggleOpen();
    this.element.nativeElement.appendChild(formatter.render());
  }

}
