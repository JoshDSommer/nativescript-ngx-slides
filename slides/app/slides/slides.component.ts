import { Component, OnInit, AfterViewInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, forwardRef, ViewChild, ContentChildren, ElementRef, QueryList, Input } from '@angular/core';

import { SlideComponent } from '../slide/slide.component';
import * as gestures from 'ui/gestures';
import * as platform from 'platform';
import * as AnimationModule from 'ui/animation';
import { AnimationCurve, Orientation } from 'ui/enums';
import * as app from 'application';
import { AbsoluteLayout } from 'ui/layouts/absolute-layout';
import { StackLayout } from 'ui/layouts/stack-layout';
import { Label } from 'ui/label';

export interface IIndicators {
	active: boolean;
}

export interface ISlideMap {
	slide: SlideComponent;
	index: number;
	left?: ISlideMap;
	right?: ISlideMap;
}

enum direction {
	none,
	left,
	right
}

enum cancellationReason {
	user,
	noPrevSlides,
	noMoreSlides
}

@Component({
	selector: 'slides',
	template: `
	<AbsoluteLayout>
		<ng-content></ng-content>
		<StackLayout *ngIf="pageIndicators" #footer orientation="horizontal" class="footer">
			<Label *ngFor="let indicator of indicators"
				[class.slide-indicator-active]="indicator.active == true"
				[class.slide-indicator-inactive]="indicator.active == false	"
			></Label>

		</StackLayout>
	</AbsoluteLayout>
	`,
	styles: [`
		.footer{
			width:100%;
			height:20%
			horizontal-align:center;
		}
	`],
	encapsulation: ViewEncapsulation.None
})

export class SlidesComponent implements OnInit {
	@ContentChildren(forwardRef(() => SlideComponent)) slides: QueryList<SlideComponent>;
	@ViewChild('footer') footer: ElementRef;
	@Input('pageWidth') pageWidth: number;
	@Input('pageHeight') pageHeight: number;
	@Input('loop') loop: boolean;
	@Input('pageIndicators') pageIndicators: boolean;

	private transitioning: boolean;
	private direction: direction = direction.none;

	indicators: IIndicators[];
	currentSlide: ISlideMap;
	_slideMap: ISlideMap[];

	get hasNext(): boolean {
		return !!this.currentSlide && !!this.currentSlide.right;
	}
	get hasPrevious(): boolean {
		return !!this.currentSlide && !!this.currentSlide.left;
	}

	constructor(private ref: ChangeDetectorRef) {
		this.indicators = [];
	}

	ngOnInit() {
		this.loop = this.loop ? this.loop : false;
		this.pageIndicators = this.pageIndicators ? this.pageIndicators : false;
		this.pageWidth = this.pageWidth ? this.pageWidth : platform.screen.mainScreen.widthDIPs;
		this.pageHeight = this.pageHeight ? this.pageHeight : platform.screen.mainScreen.heightDIPs;
	}

	ngAfterViewInit() {
		// loop through slides and setup height and widith
		this.slides.forEach((slide: SlideComponent) => {
			AbsoluteLayout.setLeft(slide.layout, this.pageWidth);
			slide.slideWidth = this.pageWidth;
			slide.slideHeight = this.pageHeight;
		});

		this.currentSlide = this.buildSlideMap(this.slides.toArray());

		if (this.pageIndicators) {
			this.buildFooter(this.slides.length);
			this.setActivePageIndicator(0);
		}
		if (this.currentSlide) {
			this.positionSlides(this.currentSlide);
			this.applySwipe(this.pageWidth);
		}
	}

	ngOnDestroy() {

	}

	//footer stuff
	private buildFooter(pageCount: number = 5): void {
		const sections = (this.pageHeight / 6);
		const footerSection = (<StackLayout>this.footer.nativeElement);

		footerSection.marginTop = (sections * 5);
		footerSection.height = sections;
		footerSection.horizontalAlignment = 'center';

		if (app.ios) {
			footerSection.clipToBounds = false;
		}

		footerSection.orientation = 'horizontal';

		let index = 0;
		while (index < pageCount) {
			this.indicators.push({ active: false });
			index++;
		}
	}

	setActivePageIndicator(activeIndex: number) {
		this.indicators.map((indicator: IIndicators, index: number) => {
			if (index == activeIndex) {
				indicator.active = true;
			} else {
				indicator.active = false;
			}
		});

		this.indicators = [...this.indicators];
		this.ref.detectChanges();
	}

	// private  functions
	private setupPanel(slide: ISlideMap) {
		this.direction = direction.none;
		this.transitioning = false;
		this.currentSlide.slide.layout.off('pan');
		this.currentSlide = slide;

		// sets up each slide so that they are positioned to transition either way.
		this.positionSlides(this.currentSlide);

		//if (this.disablePan === false) {
		this.applySwipe(this.pageWidth);
		//}

		if (this.pageIndicators) {
			this.setActivePageIndicator(this.currentSlide.index);
		}
	}

	private positionSlides(slide: ISlideMap) {
		// sets up each slide so that they are positioned to transition either way.
		if (slide.left != null && slide.left.slide != null) {
			slide.left.slide.layout.translateX = -this.pageWidth * 2;
		}
		slide.slide.layout.translateX = -this.pageWidth;
		if (slide.right != null && slide.right.slide != null) {
			slide.right.slide.layout.translateX = 0;
		}
	}

	private showRightSlide(slideMap: ISlideMap, offset: number = this.pageWidth, endingVelocity: number = 32): AnimationModule.AnimationPromise {
		let animationDuration: number;
		animationDuration = 300; // default value

		let transition = new Array();

		transition.push({
			target: slideMap.right.slide.layout,
			translate: { x: -this.pageWidth, y: 0 },
			duration: animationDuration,
			curve: AnimationCurve.easeOut
		});
		transition.push({
			target: slideMap.slide.layout,
			translate: { x: -this.pageWidth * 2, y: 0 },
			duration: animationDuration,
			curve: AnimationCurve.easeOut
		});
		let animationSet = new AnimationModule.Animation(transition, false);

		return animationSet.play();
	}

	private showLeftSlide(slideMap: ISlideMap, offset: number = this.pageWidth, endingVelocity: number = 32): AnimationModule.AnimationPromise {

		let animationDuration: number;
		animationDuration = 300; // default value
		let transition = new Array();

		transition.push({
			target: slideMap.left.slide.layout,
			translate: { x: -this.pageWidth, y: 0 },
			duration: animationDuration,
			curve: AnimationCurve.easeOut
		});
		transition.push({
			target: slideMap.slide.layout,
			translate: { x: 0, y: 0 },
			duration: animationDuration,
			curve: AnimationCurve.easeOut
		});
		let animationSet = new AnimationModule.Animation(transition, false);

		return animationSet.play();

	}

	public applySwipe(pageWidth: number): void {
		let previousDelta = -1; //hack to get around ios firing pan event after release
		let endingVelocity = 0;
		let startTime, deltaTime;

		this.currentSlide.slide.layout.on('pan', (args: gestures.PanGestureEventData): void => {
			if (args.state === gestures.GestureStateTypes.began) {
				startTime = Date.now();
				previousDelta = 0;
				endingVelocity = 250;

				//this.triggerStartEvent();
			} else if (args.state === gestures.GestureStateTypes.ended) {
				deltaTime = Date.now() - startTime;
				// if velocityScrolling is enabled then calculate the velocitty

				// swiping left to right.
				if (args.deltaX > (pageWidth / 3)) {
					if (this.hasPrevious) {
						this.transitioning = true;
						this.showLeftSlide(this.currentSlide, args.deltaX, endingVelocity).then(() => {
							this.setupPanel(this.currentSlide.left);

							//this.triggerChangeEventLeftToRight();
						});
					} else {
						//We're at the start
						//Notify no more slides
						//this.triggerCancelEvent(cancellationReason.noPrevSlides);
					}
					return;
				}
				// swiping right to left
				else if (args.deltaX < (-pageWidth / 3)) {
					if (this.hasNext) {
						this.transitioning = true;
						this.showRightSlide(this.currentSlide, args.deltaX, endingVelocity).then(() => {
							this.setupPanel(this.currentSlide.right);

							// Notify changed
							//this.triggerChangeEventRightToLeft();

							if (!this.hasNext) {
								// Notify finsihed
								// this.notify({
								// 	eventName: SlideContainer.FINISHED_EVENT,
								// 	object: this
								// });
							}
						});
					} else {
						// We're at the end
						// Notify no more slides
						//this.triggerCancelEvent(cancellationReason.noMoreSlides);
					}
					return;
				}

				if (this.transitioning === false) {
					//Notify cancelled
					//this.triggerCancelEvent(cancellationReason.user);
					this.transitioning = true;
					this.currentSlide.slide.layout.animate({
						translate: { x: -this.pageWidth, y: 0 },
						duration: 200,
						curve: AnimationCurve.easeOut
					});
					if (this.hasNext) {
						this.currentSlide.right.slide.layout.animate({
							translate: { x: 0, y: 0 },
							duration: 200,
							curve: AnimationCurve.easeOut
						});
						if (app.ios) //for some reason i have to set these in ios or there is some sort of bounce back.
							this.currentSlide.right.slide.layout.translateX = 0;
					}
					if (this.hasPrevious) {
						this.currentSlide.left.slide.layout.animate({
							translate: { x: -this.pageWidth * 2, y: 0 },
							duration: 200,
							curve: AnimationCurve.easeOut
						});
						if (app.ios)
							this.currentSlide.left.slide.layout.translateX = -this.pageWidth;

					}
					if (app.ios)
						this.currentSlide.slide.layout.translateX = -this.pageWidth;

					this.transitioning = false;
				}
			} else {
				if (!this.transitioning
					&& previousDelta !== args.deltaX
					&& args.deltaX != null
					&& args.deltaX < 0) {

					if (this.hasNext) {
						this.direction = direction.left;
						this.currentSlide.slide.layout.translateX = args.deltaX - this.pageWidth;
						this.currentSlide.right.slide.layout.translateX = args.deltaX;

					}
				} else if (!this.transitioning
					&& previousDelta !== args.deltaX
					&& args.deltaX != null
					&& args.deltaX > 0) {

					if (this.hasPrevious) {
						this.direction = direction.right;
						this.currentSlide.slide.layout.translateX = args.deltaX - this.pageWidth;
						this.currentSlide.left.slide.layout.translateX = -(this.pageWidth * 2) + args.deltaX;
					}
				}

				if (args.deltaX !== 0) {
					previousDelta = args.deltaX;
				}

			}
		});
	}

	private buildSlideMap(slides: SlideComponent[]) {
		this._slideMap = [];
		slides.forEach((slide: SlideComponent, index: number) => {
			this._slideMap.push({
				slide: slide,
				index: index,
			});
		});
		this._slideMap.forEach((mapping: ISlideMap, index: number) => {
			if (this._slideMap[index - 1] != null)
				mapping.left = this._slideMap[index - 1];
			if (this._slideMap[index + 1] != null)
				mapping.right = this._slideMap[index + 1];
		});

		if (this.loop) {
			this._slideMap[0].left = this._slideMap[this._slideMap.length - 1];
			this._slideMap[this._slideMap.length - 1].right = this._slideMap[0];
		}
		return this._slideMap[0];
	}

	public nextSlide(): void {
		if (!this.hasNext) {
			//this.triggerCancelEvent(cancellationReason.noMoreSlides);
			return;
		}

		this.direction = direction.left;
		this.transitioning = true;
		//	this.triggerStartEvent();
		this.showRightSlide(this.currentSlide).then(() => {
			this.setupPanel(this.currentSlide.right);
			//this.triggerChangeEventRightToLeft();
		});
	}
	public previousSlide(): void {
		if (!this.hasPrevious) {
			//this.triggerCancelEvent(cancellationReason.noPrevSlides);
			return;
		}

		this.direction = direction.right;
		this.transitioning = true;
		//this.triggerStartEvent();
		this.showLeftSlide(this.currentSlide).then(() => {
			this.setupPanel(this.currentSlide.left);

			//this.triggerChangeEventLeftToRight();
		});
	}
}