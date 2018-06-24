import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ViewEncapsulation
} from "@angular/core";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import * as gestures from "tns-core-modules/ui/gestures";

@Component({
  selector: "slide",
  moduleId: module.id,
  templateUrl: "./slide.component.html",
  encapsulation: ViewEncapsulation.None
})
export class SlideComponent {
  @ViewChild("slideLayout") slideLayout: ElementRef;
  @Input("class") cssClass: string = "";
  @Output("tap") tap = new EventEmitter<gestures.GestureEventData>();
  @Output("doubleTap")
  doubleTap = new EventEmitter<gestures.GestureEventData>();
  @Output("pinch") pinch = new EventEmitter<gestures.GestureEventData>();

  set slideWidth(width: number) {
    this.layout.width = width;
  }

  set slideHeight(height: number | string) {
    this.layout.height = <any>height;
  }

  get layout(): StackLayout {
    return this.slideLayout.nativeElement;
  }

  constructor() {
    this.cssClass = this.cssClass ? this.cssClass : "";
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.slideLayout.nativeElement.on(
      "tap",
      (args: gestures.GestureEventData): void => {
        this.tap.next(args);
      }
    );

    this.slideLayout.nativeElement.on(
      "doubleTap",
      (args: gestures.GestureEventData): void => {
        this.doubleTap.next(args);
      }
    );

    this.slideLayout.nativeElement.on(
      "pinch",
      (args: gestures.GestureEventData): void => {
        this.pinch.next(args);
      }
    );
  }
}
