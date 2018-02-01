import { Component, OnInit, AfterViewInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, forwardRef, ViewChild, ContentChildren, ElementRef, QueryList, Input, Output, EventEmitter } from '@angular/core';

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
	<AbsoluteLayout width="100%">
		<ng-content></ng-content>
		<StackLayout *ngIf="pageIndicators" #footer style="width:100%; height:20%;">
			<Label *ngFor="let indicator of indicators"
				[class.slide-indicator-active]="indicator.active == true"
				[class.slide-indicator-inactive]="indicator.active == false	"
			></Label>
		</StackLayout>
	</AbsoluteLayout>
	`,
	encapsulation: ViewEncapsulation.None
})

export class SlidesComponent implements OnInit {

	@ContentChildren(forwardRef(() => SlideComponent)) slides: QueryList<SlideComponent>;
	@ViewChild('footer') footer: ElementRef;
	@Input('pageWidth') pageWidth: number;
	@Input('pageHeight') pageHeight: number;
	@Input('footerMarginTop') footerMarginTop: number;
	@Input('loop') loop: boolean;
	@Input('pageIndicators') pageIndicators: boolean;
	@Input('class') cssClass: string = '';
	@Input() zoomEnabled = false;
	@Output() changed: EventEmitter<any> = new EventEmitter();
	@Output() finished: EventEmitter<any> = new EventEmitter();
	@Output('tap') tap: EventEmitter<gestures.GestureEventData> = new EventEmitter<gestures.GestureEventData>();

	private transitioning: boolean;
	private direction: direction = direction.none;
	private FOOTER_HEIGHT: number = 50;

	indicators: IIndicators[];
	currentSlide: ISlideMap;
	_slideMap: ISlideMap[];

	currentScale = 1;
	currentDeltaX = 0;
	currentDeltaY = 0;

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
		this.footerMarginTop = this.footerMarginTop ? this.footerMarginTop : this.calculateFoorterMarginTop(this.pageHeight);
		// handle orientation change
		app.on(app.orientationChangedEvent, this.onOrientationChanged, this);
	}

	ngAfterViewInit() {
		// loop through slides and setup height and widith
		this.slides.forEach((slide: SlideComponent) => {
			AbsoluteLayout.setLeft(slide.layout, this.pageWidth);
			slide.slideWidth = this.pageWidth;
			slide.slideHeight = this.pageHeight;

		});

		this.currentSlide = this.buildSlideMap(this.slides.toArray());

		if (this.currentSlide) {
			this.positionSlides(this.currentSlide);
			this.applyGestures();
		}

		if (this.pageIndicators) {
			this.buildFooter(this.slides.length);
			this.setActivePageIndicator(0);
		}
	}

	ngOnDestroy() {
		app.off(app.orientationChangedEvent, this.onOrientationChanged, this);
	}

	onOrientationChanged(args: app.OrientationChangedEventData) {

		// event and page orientation didn't seem to always be on the same page so
		// setting it in the time out addresses this.
		setTimeout(() => {

			// the values are either 'landscape' or 'portrait'
			// platform.screen.mainScreen.heightDIPs/widthDIPs holds original screen size
			if (args.newValue === 'landscape') {
				this.pageWidth = (app.android) ?
					platform.screen.mainScreen.heightDIPs : platform.screen.mainScreen.widthDIPs;
				this.pageHeight = (app.android) ?
					platform.screen.mainScreen.widthDIPs : platform.screen.mainScreen.heightDIPs;
			} else {
				this.pageWidth = platform.screen.mainScreen.widthDIPs;
				this.pageHeight = platform.screen.mainScreen.heightDIPs;
			}

			this.footerMarginTop = this.calculateFoorterMarginTop(this.pageHeight);

			// loop through slides and setup height and widith
			this.slides.forEach((slide: SlideComponent) => {
				AbsoluteLayout.setLeft(slide.layout, this.pageWidth);
				slide.slideWidth = this.pageWidth;
				slide.slideHeight = this.pageHeight;
				slide.layout.eachLayoutChild((view: any) => {
					if (view instanceof StackLayout) {
						AbsoluteLayout.setLeft(view, this.pageWidth);
						view.width = this.pageWidth;
						view.height = this.pageHeight;
					}
				});
			});

			if (this.currentSlide) {
				this.positionSlides(this.currentSlide);
			}

			if (this.pageIndicators) {
				this.buildFooter(this.slides.length);
			}


		}, 17); // one frame @ 60 frames/s, no flicker
	}

	setActivePageIndicator(activeIndex: number) {
		this.indicators.map((indicator: IIndicators, index: number) => {
			if (index === activeIndex) {
				indicator.active = true;
			} else {
				indicator.active = false;
			}
		});

		this.indicators = [...this.indicators];
		this.ref.detectChanges();
	}

	//
	// private  functions
	//

	// position footer
	private calculateFoorterMarginTop(pageHeight: number): number {
		return pageHeight - (pageHeight / 6);
	}

	// footer stuff
	private buildFooter(pageCount: number = 5): void {

		const footerSection = (<StackLayout>this.footer.nativeElement);
		footerSection.horizontalAlignment = 'center';
		footerSection.orientation = 'horizontal';
		footerSection.marginTop = this.footerMarginTop;
		footerSection.height = this.FOOTER_HEIGHT;
		footerSection.width = this.pageWidth;

		if (app.ios) {
			footerSection.clipToBounds = false;
		}

		let index = 0;
		this.indicators = [];
		while (index < pageCount) {
			this.indicators.push({ active: false });
			index++;
		}
	}

	private setupPanel(slide: ISlideMap) {
		this.direction = direction.none;
		this.transitioning = false;
		this.currentSlide.slide.layout.off('pan');
		this.currentSlide = slide;

		// sets up each slide so that they are positioned to transition either way.
		this.positionSlides(this.currentSlide);

		//if (this.disablePan === false) {
		this.applyGestures();
		//}

		if (this.pageIndicators) {
			this.setActivePageIndicator(this.currentSlide.index);
		}

		this.changed.next(this.currentSlide.index);

		if (this.currentSlide.index === this.slides.length - 1) {
			this.finished.next(null);
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

	private showRightSlide(slideMap: ISlideMap, offset: number = this.pageWidth, endingVelocity: number = 32, duration: number = 300): AnimationModule.AnimationPromise {
		let animationDuration: number;
		animationDuration = duration; // default value

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

	private showLeftSlide(slideMap: ISlideMap, offset: number = this.pageWidth, endingVelocity: number = 32, duration: number = 300): AnimationModule.AnimationPromise {

		let animationDuration: number;
		animationDuration = duration; // default value
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

	public applyGestures(): void {

		this.currentSlide.slide.layout.on('tap',
			(args: gestures.GestureEventData): void => this.tap.next(args));

		this.currentSlide.slide.layout.on('doubleTap', (args: gestures.GestureEventData): void => {

			if (this.zoomEnabled) {
				this.onDoubleTap(args)
			}

		});

		this.currentSlide.slide.layout.on('pinch', (args: gestures.PinchGestureEventData): void => {

			if (this.zoomEnabled) {
				this.onPinch(args)
			}

		});

		this.currentSlide.slide.layout.on('pan', (args: gestures.PanGestureEventData): void => {

			if (this.zoomEnabled && this.currentScale !== 1) {
				this.onPan(args);
			} else {
				this.onSwipe(args);
			}

		});
	}

	public onSwipe(args: gestures.PanGestureEventData) {

		let previousDelta = -1; //hack to get around ios firing pan event after release
		let endingVelocity = 0;
		let startTime, deltaTime;
		this.transitioning = false;

		if (args.state === gestures.GestureStateTypes.began) {
			startTime = Date.now();
			previousDelta = 0;
			endingVelocity = 250;

			//this.triggerStartEvent();
		} else if (args.state === gestures.GestureStateTypes.ended) {
			deltaTime = Date.now() - startTime;
			// if velocityScrolling is enabled then calculate the velocitty

			// swiping left to right.
			if (args.deltaX > (this.pageWidth / 3)) {
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
			else if (args.deltaX < (-this.pageWidth / 3)) {
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

	}

	public onDoubleTap(args: gestures.GestureEventData) {

		args.view.animate({
			translate: { x: -this.pageWidth, y: 0 },
			scale: { x: 1, y: 1 },
			curve: 'easeOut',
			duration: 300
		})

		this.currentScale = 1;

	}

	public onPinch(args: gestures.PinchGestureEventData) {

		let item = args.view;

		if (args.state === gestures.GestureStateTypes.began) {
			const newOriginX = args.getFocusX() - item.translateX;
			const newOriginY = args.getFocusY() - item.translateY;

			const oldOriginX = item.originX * item.getMeasuredWidth();
			const oldOriginY = item.originY * item.getMeasuredHeight();

			item.translateX += (oldOriginX - newOriginX) * (1 - item.scaleX);
			item.translateY += (oldOriginY - newOriginY) * (1 - item.scaleY);

			item.originX = newOriginX / item.getMeasuredWidth();
			item.originY = newOriginY / item.getMeasuredHeight();

			this.currentScale = item.scaleX;

		} else if (args.scale && args.scale !== 1) {
			let newScale = this.currentScale * args.scale;
			newScale = Math.min(8, newScale);
			newScale = Math.max(1, newScale);

			item.scaleX = newScale;
			item.scaleY = newScale;

			this.currentScale = newScale;

		}

	}

	public onPan(args: gestures.PanGestureEventData) {

		let item = args.view;

		if (args.state === 1) {
			this.currentDeltaX = 0;
			this.currentDeltaY = 0;
		}
		else if (args.state === 2) {
			item.translateX += args.deltaX - this.currentDeltaX;
			item.translateY += args.deltaY - this.currentDeltaY;

			this.currentDeltaX = args.deltaX;
			this.currentDeltaY = args.deltaY;
		}

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

	public GoToSlide(num: number, traverseDuration: number = 50, landingDuration: number = 200): void {
		if (this.currentSlide.index == num) return;

		var duration: number = landingDuration;
		if (Math.abs(num - this.currentSlide.index) != 1) duration = traverseDuration;

		if (this.currentSlide.index < num)
			this.nextSlide(duration).then(() => this.GoToSlide(num));
		else
			this.previousSlide(duration).then(() => this.GoToSlide(num));
	}

	public nextSlide(duration?: number): Promise<any> {
		if (!this.hasNext) {
			//this.triggerCancelEvent(cancellationReason.noMoreSlides);
			return;
		}

		this.direction = direction.left;
		this.transitioning = true;
		//	this.triggerStartEvent();
		return this.showRightSlide(this.currentSlide, null, null, duration).then(() => {
			this.setupPanel(this.currentSlide.right);
			//this.triggerChangeEventRightToLeft();
		});
	}


	public previousSlide(duration?: number): Promise<any> {
		if (!this.hasPrevious) {
			//this.triggerCancelEvent(cancellationReason.noPrevSlides);
			return;
		}

		this.direction = direction.right;
		this.transitioning = true;
		//this.triggerStartEvent();
		return this.showLeftSlide(this.currentSlide, null, null, duration).then(() => {
			this.setupPanel(this.currentSlide.left);

			//this.triggerChangeEventLeftToRight();
		});
	}
}
