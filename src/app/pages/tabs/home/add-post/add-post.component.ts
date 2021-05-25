import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from '@nativescript/angular';
import { TNSCheckBoxModule } from '@nstudio/nativescript-checkbox/angular';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';



@Component({
  selector: 'ns-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent implements OnInit {
  

  constructor(private modalDialogParams: ModalDialogParams) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.modalDialogParams.closeCallback();
  }

  pickImage() {
    // pick the image 
    // this.addPost()
  }

  addPost() {
    //add the post to the collection in firebase
  }

  // component:
  @ViewChild('CB1') FirstCheckBox: ElementRef;
  public toggleCheck() {
    this.FirstCheckBox.nativeElement.toggle();
  }

  public getCheckProp() {
    console.log(
      'checked prop value = ' + this.FirstCheckBox.nativeElement.checked
    );
  }
}
