"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var slide_component_1 = require("../slide/slide.component");
var gestures = require("ui/gestures");
var platform = require("platform");
var AnimationModule = require("ui/animation");
var enums_1 = require("ui/enums");
var app = require("application");
var absolute_layout_1 = require("ui/layouts/absolute-layout");
var stack_layout_1 = require("ui/layouts/stack-layout");
var direction;
(function (direction) {
    direction[direction["none"] = 0] = "none";
    direction[direction["left"] = 1] = "left";
    direction[direction["right"] = 2] = "right";
})(direction || (direction = {}));
var cancellationReason;
(function (cancellationReason) {
    cancellationReason[cancellationReason["user"] = 0] = "user";
    cancellationReason[cancellationReason["noPrevSlides"] = 1] = "noPrevSlides";
    cancellationReason[cancellationReason["noMoreSlides"] = 2] = "noMoreSlides";
})(cancellationReason || (cancellationReason = {}));
var SlidesComponent = (function () {
    function SlidesComponent(ref) {
        this.ref = ref;
        this.cssClass = '';
        this.zoomEnabled = false;
        this.changed = new core_1.EventEmitter();
        this.finished = new core_1.EventEmitter();
        this.tap = new core_1.EventEmitter();
        this.pinch = new core_1.EventEmitter();
        this.direction = direction.none;
        this.FOOTER_HEIGHT = 50;
        this.currentScale = 1;
        this.currentDeltaX = 0;
        this.currentDeltaY = 0;
        this.indicators = [];
    }
    Object.defineProperty(SlidesComponent.prototype, "hasNext", {
        get: function () {
            return !!this.currentSlide && !!this.currentSlide.right;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlidesComponent.prototype, "hasPrevious", {
        get: function () {
            return !!this.currentSlide && !!this.currentSlide.left;
        },
        enumerable: true,
        configurable: true
    });
    SlidesComponent.prototype.ngOnInit = function () {
        this.loop = this.loop ? this.loop : false;
        this.pageIndicators = this.pageIndicators ? this.pageIndicators : false;
        this.pageWidth = this.pageWidth ? this.pageWidth : platform.screen.mainScreen.widthDIPs;
        this.pageHeight = this.pageHeight ? this.pageHeight : platform.screen.mainScreen.heightDIPs;
        this.footerMarginTop = this.footerMarginTop ? this.footerMarginTop : this.calculateFoorterMarginTop(this.pageHeight);
        // handle orientation change
        app.on(app.orientationChangedEvent, this.onOrientationChanged, this);
    };
    SlidesComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        // loop through slides and setup height and widith
        this.slides.forEach(function (slide) {
            absolute_layout_1.AbsoluteLayout.setLeft(slide.layout, _this.pageWidth);
            slide.slideWidth = _this.pageWidth;
            slide.slideHeight = _this.pageHeight;
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
    };
    SlidesComponent.prototype.ngOnDestroy = function () {
        app.off(app.orientationChangedEvent, this.onOrientationChanged, this);
    };
    SlidesComponent.prototype.onOrientationChanged = function (args) {
        var _this = this;
        // event and page orientation didn't seem to always be on the same page so
        // setting it in the time out addresses this.
        setTimeout(function () {
            // the values are either 'landscape' or 'portrait'
            // platform.screen.mainScreen.heightDIPs/widthDIPs holds original screen size
            if (args.newValue === 'landscape') {
                _this.pageWidth = (app.android) ?
                    platform.screen.mainScreen.heightDIPs : platform.screen.mainScreen.widthDIPs;
                _this.pageHeight = (app.android) ?
                    platform.screen.mainScreen.widthDIPs : platform.screen.mainScreen.heightDIPs;
            }
            else {
                _this.pageWidth = platform.screen.mainScreen.widthDIPs;
                _this.pageHeight = platform.screen.mainScreen.heightDIPs;
            }
            _this.footerMarginTop = _this.calculateFoorterMarginTop(_this.pageHeight);
            // loop through slides and setup height and widith
            _this.slides.forEach(function (slide) {
                absolute_layout_1.AbsoluteLayout.setLeft(slide.layout, _this.pageWidth);
                slide.slideWidth = _this.pageWidth;
                slide.slideHeight = _this.pageHeight;
                slide.layout.eachLayoutChild(function (view) {
                    if (view instanceof stack_layout_1.StackLayout) {
                        absolute_layout_1.AbsoluteLayout.setLeft(view, _this.pageWidth);
                        view.width = _this.pageWidth;
                        view.height = _this.pageHeight;
                    }
                });
            });
            if (_this.currentSlide) {
                _this.positionSlides(_this.currentSlide);
            }
            if (_this.pageIndicators) {
                _this.buildFooter(_this.slides.length);
            }
        }, 17); // one frame @ 60 frames/s, no flicker
    };
    SlidesComponent.prototype.setActivePageIndicator = function (activeIndex) {
        this.indicators.map(function (indicator, index) {
            if (index === activeIndex) {
                indicator.active = true;
            }
            else {
                indicator.active = false;
            }
        });
        this.indicators = this.indicators.slice();
        this.ref.detectChanges();
    };
    //
    // private  functions
    //
    // position footer
    SlidesComponent.prototype.calculateFoorterMarginTop = function (pageHeight) {
        return pageHeight - (pageHeight / 6);
    };
    // footer stuff
    SlidesComponent.prototype.buildFooter = function (pageCount) {
        if (pageCount === void 0) { pageCount = 5; }
        var footerSection = this.footer.nativeElement;
        footerSection.horizontalAlignment = 'center';
        footerSection.orientation = 'horizontal';
        footerSection.marginTop = this.footerMarginTop;
        footerSection.height = this.FOOTER_HEIGHT;
        footerSection.width = this.pageWidth;
        if (app.ios) {
            footerSection.clipToBounds = false;
        }
        var index = 0;
        this.indicators = [];
        while (index < pageCount) {
            this.indicators.push({ active: false });
            index++;
        }
    };
    SlidesComponent.prototype.setupPanel = function (slide) {
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
    };
    SlidesComponent.prototype.positionSlides = function (slide) {
        // sets up each slide so that they are positioned to transition either way.
        if (slide.left != null && slide.left.slide != null) {
            slide.left.slide.layout.translateX = -this.pageWidth * 2;
        }
        slide.slide.layout.translateX = -this.pageWidth;
        if (slide.right != null && slide.right.slide != null) {
            slide.right.slide.layout.translateX = 0;
        }
    };
    SlidesComponent.prototype.showRightSlide = function (slideMap, offset, endingVelocity, duration) {
        if (offset === void 0) { offset = this.pageWidth; }
        if (endingVelocity === void 0) { endingVelocity = 32; }
        if (duration === void 0) { duration = 300; }
        var animationDuration;
        animationDuration = duration; // default value
        var transition = new Array();
        transition.push({
            target: slideMap.right.slide.layout,
            translate: { x: -this.pageWidth, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        transition.push({
            target: slideMap.slide.layout,
            translate: { x: -this.pageWidth * 2, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        var animationSet = new AnimationModule.Animation(transition, false);
        return animationSet.play();
    };
    SlidesComponent.prototype.showLeftSlide = function (slideMap, offset, endingVelocity, duration) {
        if (offset === void 0) { offset = this.pageWidth; }
        if (endingVelocity === void 0) { endingVelocity = 32; }
        if (duration === void 0) { duration = 300; }
        var animationDuration;
        animationDuration = duration; // default value
        var transition = new Array();
        transition.push({
            target: slideMap.left.slide.layout,
            translate: { x: -this.pageWidth, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        transition.push({
            target: slideMap.slide.layout,
            translate: { x: 0, y: 0 },
            duration: animationDuration,
            curve: enums_1.AnimationCurve.easeOut
        });
        var animationSet = new AnimationModule.Animation(transition, false);
        return animationSet.play();
    };
    SlidesComponent.prototype.applyGestures = function () {
        var _this = this;
        this.currentSlide.slide.layout.on('tap', function (args) { return _this.tap.next(args); });
        this.currentSlide.slide.layout.on('doubleTap', function (args) {
            if (_this.zoomEnabled) {
                _this.onDoubleTap(args);
            }
        });
        this.currentSlide.slide.layout.on('pinch', function (args) {
            if (_this.zoomEnabled) {
                _this.onPinch(args);
            }
        });
        this.currentSlide.slide.layout.on('pan', function (args) {
            if (_this.zoomEnabled && _this.currentScale !== 1) {
                _this.onPan(args);
            }
            else {
                _this.onSwipe(args);
            }
        });
    };
    SlidesComponent.prototype.onSwipe = function (args) {
        var _this = this;
        var previousDelta = -1; //hack to get around ios firing pan event after release
        var endingVelocity = 0;
        var startTime, deltaTime;
        this.transitioning = false;
        if (args.state === gestures.GestureStateTypes.began) {
            startTime = Date.now();
            previousDelta = 0;
            endingVelocity = 250;
            //this.triggerStartEvent();
        }
        else if (args.state === gestures.GestureStateTypes.ended) {
            deltaTime = Date.now() - startTime;
            // if velocityScrolling is enabled then calculate the velocitty
            // swiping left to right.
            if (args.deltaX > (this.pageWidth / 3)) {
                if (this.hasPrevious) {
                    this.transitioning = true;
                    this.showLeftSlide(this.currentSlide, args.deltaX, endingVelocity).then(function () {
                        _this.setupPanel(_this.currentSlide.left);
                        //this.triggerChangeEventLeftToRight();
                    });
                }
                else {
                    //We're at the start
                    //Notify no more slides
                    //this.triggerCancelEvent(cancellationReason.noPrevSlides);
                }
                return;
            }
            else if (args.deltaX < (-this.pageWidth / 3)) {
                if (this.hasNext) {
                    this.transitioning = true;
                    this.showRightSlide(this.currentSlide, args.deltaX, endingVelocity).then(function () {
                        _this.setupPanel(_this.currentSlide.right);
                        // Notify changed
                        //this.triggerChangeEventRightToLeft();
                        if (!_this.hasNext) {
                            // Notify finsihed
                            // this.notify({
                            // 	eventName: SlideContainer.FINISHED_EVENT,
                            // 	object: this
                            // });
                        }
                    });
                }
                else {
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
                    curve: enums_1.AnimationCurve.easeOut
                });
                if (this.hasNext) {
                    this.currentSlide.right.slide.layout.animate({
                        translate: { x: 0, y: 0 },
                        duration: 200,
                        curve: enums_1.AnimationCurve.easeOut
                    });
                    if (app.ios)
                        this.currentSlide.right.slide.layout.translateX = 0;
                }
                if (this.hasPrevious) {
                    this.currentSlide.left.slide.layout.animate({
                        translate: { x: -this.pageWidth * 2, y: 0 },
                        duration: 200,
                        curve: enums_1.AnimationCurve.easeOut
                    });
                    if (app.ios)
                        this.currentSlide.left.slide.layout.translateX = -this.pageWidth;
                }
                if (app.ios)
                    this.currentSlide.slide.layout.translateX = -this.pageWidth;
                this.transitioning = false;
            }
        }
        else {
            if (!this.transitioning
                && previousDelta !== args.deltaX
                && args.deltaX != null
                && args.deltaX < 0) {
                if (this.hasNext) {
                    this.direction = direction.left;
                    this.currentSlide.slide.layout.translateX = args.deltaX - this.pageWidth;
                    this.currentSlide.right.slide.layout.translateX = args.deltaX;
                }
            }
            else if (!this.transitioning
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
    };
    SlidesComponent.prototype.onDoubleTap = function (args) {
        args.view.animate({
            // translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeOut',
            duration: 300
        });
        this.currentScale = 1;
    };
    SlidesComponent.prototype.onPinch = function (args) {
        var item = args.view;
        if (args.state === gestures.GestureStateTypes.began) {
            var newOriginX = args.getFocusX() - item.translateX;
            var newOriginY = args.getFocusY() - item.translateY;
            var oldOriginX = item.originX * item.getMeasuredWidth();
            var oldOriginY = item.originY * item.getMeasuredHeight();
            item.translateX += (oldOriginX - newOriginX) * (1 - item.scaleX);
            item.translateY += (oldOriginY - newOriginY) * (1 - item.scaleY);
            item.originX = newOriginX / item.getMeasuredWidth();
            item.originY = newOriginY / item.getMeasuredHeight();
            this.currentScale = item.scaleX;
        }
        else if (args.scale && args.scale !== 1) {
            var newScale = this.currentScale * args.scale;
            newScale = Math.min(8, newScale);
            newScale = Math.max(1, newScale);
            item.scaleX = newScale;
            item.scaleY = newScale;
            this.currentScale = newScale;
        }
    };
    SlidesComponent.prototype.onPan = function (args) {
        var item = args.view;
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
    };
    SlidesComponent.prototype.buildSlideMap = function (slides) {
        var _this = this;
        this._slideMap = [];
        slides.forEach(function (slide, index) {
            _this._slideMap.push({
                slide: slide,
                index: index,
            });
        });
        this._slideMap.forEach(function (mapping, index) {
            if (_this._slideMap[index - 1] != null)
                mapping.left = _this._slideMap[index - 1];
            if (_this._slideMap[index + 1] != null)
                mapping.right = _this._slideMap[index + 1];
        });
        if (this.loop) {
            this._slideMap[0].left = this._slideMap[this._slideMap.length - 1];
            this._slideMap[this._slideMap.length - 1].right = this._slideMap[0];
        }
        return this._slideMap[0];
    };
    SlidesComponent.prototype.GoToSlide = function (num, traverseDuration, landingDuration) {
        var _this = this;
        if (traverseDuration === void 0) { traverseDuration = 50; }
        if (landingDuration === void 0) { landingDuration = 200; }
        if (this.currentSlide.index == num)
            return;
        var duration = landingDuration;
        if (Math.abs(num - this.currentSlide.index) != 1)
            duration = traverseDuration;
        if (this.currentSlide.index < num)
            this.nextSlide(duration).then(function () { return _this.GoToSlide(num); });
        else
            this.previousSlide(duration).then(function () { return _this.GoToSlide(num); });
    };
    SlidesComponent.prototype.nextSlide = function (duration) {
        var _this = this;
        if (!this.hasNext) {
            //this.triggerCancelEvent(cancellationReason.noMoreSlides);
            return;
        }
        this.direction = direction.left;
        this.transitioning = true;
        //	this.triggerStartEvent();
        return this.showRightSlide(this.currentSlide, null, null, duration).then(function () {
            _this.setupPanel(_this.currentSlide.right);
            //this.triggerChangeEventRightToLeft();
        });
    };
    SlidesComponent.prototype.previousSlide = function (duration) {
        var _this = this;
        if (!this.hasPrevious) {
            //this.triggerCancelEvent(cancellationReason.noPrevSlides);
            return;
        }
        this.direction = direction.right;
        this.transitioning = true;
        //this.triggerStartEvent();
        return this.showLeftSlide(this.currentSlide, null, null, duration).then(function () {
            _this.setupPanel(_this.currentSlide.left);
            //this.triggerChangeEventLeftToRight();
        });
    };
    return SlidesComponent;
}());
__decorate([
    core_1.ContentChildren(core_1.forwardRef(function () { return slide_component_1.SlideComponent; })),
    __metadata("design:type", core_1.QueryList)
], SlidesComponent.prototype, "slides", void 0);
__decorate([
    core_1.ViewChild('footer'),
    __metadata("design:type", core_1.ElementRef)
], SlidesComponent.prototype, "footer", void 0);
__decorate([
    core_1.Input('pageWidth'),
    __metadata("design:type", Number)
], SlidesComponent.prototype, "pageWidth", void 0);
__decorate([
    core_1.Input('pageHeight'),
    __metadata("design:type", Number)
], SlidesComponent.prototype, "pageHeight", void 0);
__decorate([
    core_1.Input('footerMarginTop'),
    __metadata("design:type", Number)
], SlidesComponent.prototype, "footerMarginTop", void 0);
__decorate([
    core_1.Input('loop'),
    __metadata("design:type", Boolean)
], SlidesComponent.prototype, "loop", void 0);
__decorate([
    core_1.Input('pageIndicators'),
    __metadata("design:type", Boolean)
], SlidesComponent.prototype, "pageIndicators", void 0);
__decorate([
    core_1.Input('class'),
    __metadata("design:type", String)
], SlidesComponent.prototype, "cssClass", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], SlidesComponent.prototype, "zoomEnabled", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlidesComponent.prototype, "changed", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlidesComponent.prototype, "finished", void 0);
__decorate([
    core_1.Output('tap'),
    __metadata("design:type", core_1.EventEmitter)
], SlidesComponent.prototype, "tap", void 0);
__decorate([
    core_1.Output('pinch'),
    __metadata("design:type", core_1.EventEmitter)
], SlidesComponent.prototype, "pinch", void 0);
SlidesComponent = __decorate([
    core_1.Component({
        selector: 'slides',
        template: "\n\t<AbsoluteLayout width=\"100%\">\n\t\t<ng-content></ng-content>\n\t\t<StackLayout *ngIf=\"pageIndicators\" #footer style=\"width:100%; height:20%;\">\n\t\t\t<Label *ngFor=\"let indicator of indicators\"\n\t\t\t\t[class.slide-indicator-active]=\"indicator.active == true\"\n\t\t\t\t[class.slide-indicator-inactive]=\"indicator.active == false\t\"\n\t\t\t></Label>\n\t\t</StackLayout>\n\t</AbsoluteLayout>\n\t",
        encapsulation: core_1.ViewEncapsulation.None
    }),
    __metadata("design:paramtypes", [core_1.ChangeDetectorRef])
], SlidesComponent);
exports.SlidesComponent = SlidesComponent;
