import { Component, OnInit, NgZone, ViewContainerRef } from '@angular/core';
import { FeedInterface } from "../home/feed-interface"
import { ModalDialogOptions, ModalDialogService, ModalDialogParams } from "@nativescript/angular/modal-dialog";
const firebase = require('nativescript-plugin-firebase/app')
import { AddPostComponent } from "./add-post/add-post.component";



@Component({
  selector: 'ns-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // need to add the collection and pull the posts
  public postsCollection = firebase.firestore().collection("posts");
  //public post = this.postsCollection

  public feedList: Array<FeedInterface> = []

  public constructor(private _modalService: ModalDialogService, private _vcRef: ViewContainerRef) {
  }

  ngOnInit(): void {
  }

  loadFeed() {
    // loud the post from the collection 
    for (let i = 0; i < 10; i++) {
      this.feedList.push({
        id: i,
        image: `https://images.ctfassets.net/ticbtmcn8ib7/6A1X91pyvwiYdgwkExmMmS/fbe8ec9955beef00822d7ba64d44c458/soccer-ball-1200.jpg?w=900&q=50`,
        context: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`
      })
    }
  }

  createPost() {
    // need to add the post to the collection
    const options: ModalDialogOptions = {
      viewContainerRef: this._vcRef,
      context: {},
      fullscreen: false
    };

    this._modalService.showModal(AddPostComponent, options)
    .then((result: string) => {
        console.log(result);
    });

  }
}
