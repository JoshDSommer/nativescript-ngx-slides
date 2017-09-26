import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { StackLayout } from 'ui/layouts/stack-layout';
import * as gestures from 'ui/gestures';


@Component({
	selector: 'slide',
	template: `
	<StackLayout #slideLayout [class]="cssClass">
		<ng-content></ng-content>
	</StackLayout>
	`,
})

export class SlideComponent {
	@ViewChild('slideLayout') slideLayout: ElementRef;
	@Input('class') cssClass: string = '';
	@Output('tap') tap = new EventEmitter<gestures.GestureEventData>();

	set slideWidth(width: number) {
		this.layout.width = width;
	}

	set slideHeight(height: number | string) {
		this.layout.height = <any>height;
	}


	get layout(): StackLayout {
		return this.slideLayout.nativeElement
	}

	constructor() {
		this.cssClass = this.cssClass ? this.cssClass : '';
	}

	ngOnInit() {
	}

	ngAfterViewInit(){
		this.slideLayout.nativeElement.on('tap', (args: gestures.GestureEventData): void => {
			this.tap.next(args);
		});
	}

}
