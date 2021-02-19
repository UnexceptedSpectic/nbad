import { AfterViewInit, Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements AfterViewInit {

  constructor(public data: DataService) {}

  ngAfterViewInit(): void {
    this.data.loadCharts();
  }

}
