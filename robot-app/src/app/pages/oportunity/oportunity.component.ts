import { Component, OnInit } from '@angular/core';
import { OportunityService } from 'src/app/services/oportunity.service';

@Component({
  selector: 'app-oportunity',
  templateUrl: './oportunity.component.html',
  styleUrls: ['./oportunity.component.scss']
})
export class OportunityComponent implements OnInit {
  show = false;
  oportunity: any[] = [];

  constructor (
    private oportunityService: OportunityService
  ) { }

  ngOnInit (): void {
    this.getOportunity();
  }

  getOportunity() {
    this.oportunityService.getOportunity().subscribe((oportunity: any) => {
      this.oportunity = oportunity.map((o: any) => {
        delete o._id;
        delete o.__v;
        o.ordersRequest = JSON.stringify(o.ordersRequest) || '';
        o.ordersResponse = JSON.stringify(o.ordersResponse) || '';
        o.error = JSON.stringify(o.error) || '';
        return o;
      });
      this.show = true;
    });
  }
}
