import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Page } from "@nativescript/core/ui/page";
import { SelectedIndexChangedEventData } from "tns-core-modules/ui/tab-view";


@Component({
  selector: 'ns-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {

  constructor(public page: Page, public router: Router) {
    page.actionBarHidden = true;
  }

  ngOnInit(): void {
  }

  onSelectedIndexchangedTab(args: SelectedIndexChangedEventData) {
    let newIndex = args.newIndex;
  }

  goToMap() {
    this.router.navigate(['/map'])
  }
  goToProfile() {
    this.router.navigate(['/profile'])
  }
  goToHome() {
    this.router.navigate(['/home'])
  }
  goToSettings() {
    this.router.navigate(['/settings'])
  }
  goToChat() {
    this.router.navigate(['/chat/oHv6fD6ZeqRMHRKEC1wPWaVn53m1'])
  }
}
