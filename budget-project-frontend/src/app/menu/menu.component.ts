import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(public data: DataService) { }

  ngOnInit(): void {
  }

  login(): void {
    this.data.login();
  }

  logout(): void {
    this.data.logout();
  }

}
