import { Component } from '@angular/core';
import { InfoService } from '../services/info.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  constructor(public infoService: InfoService) {
    this.infoService = infoService;
  }
  ngOnInit(){
    this.infoService.Info();
  }
}
