"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var SlideComponent = (function () {
    function SlideComponent() {
        this.cssClass = '';
        this.tap = new core_1.EventEmitter();
        this.doubleTap = new core_1.EventEmitter();
        this.pinch = new core_1.EventEmitter();
        this.cssClass = this.cssClass ? this.cssClass : '';
    }
    Object.defineProperty(SlideComponent.prototype, "slideWidth", {
        set: function (width) {
            this.layout.width = width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideComponent.prototype, "slideHeight", {
        set: function (height) {
            this.layout.height = height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideComponent.prototype, "layout", {
        get: function () {
            return this.slideLayout.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    SlideComponent.prototype.ngOnInit = function () {
    };
    SlideComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.slideLayout.nativeElement.on('tap', function (args) {
            _this.tap.next(args);
        });
        this.slideLayout.nativeElement.on('doubleTap', function (args) {
            _this.doubleTap.next(args);
        });
        this.slideLayout.nativeElement.on('pinch', function (args) {
            _this.pinch.next(args);
        });
    };
    return SlideComponent;
}());
__decorate([
    core_1.ViewChild('slideLayout'),
    __metadata("design:type", core_1.ElementRef)
], SlideComponent.prototype, "slideLayout", void 0);
__decorate([
    core_1.Input('class'),
    __metadata("design:type", String)
], SlideComponent.prototype, "cssClass", void 0);
__decorate([
    core_1.Output('tap'),
    __metadata("design:type", Object)
], SlideComponent.prototype, "tap", void 0);
__decorate([
    core_1.Output('doubleTap'),
    __metadata("design:type", Object)
], SlideComponent.prototype, "doubleTap", void 0);
__decorate([
    core_1.Output('pinch'),
    __metadata("design:type", Object)
], SlideComponent.prototype, "pinch", void 0);
SlideComponent = __decorate([
    core_1.Component({
        selector: 'slide',
        template: "\n\t<StackLayout #slideLayout [class]=\"cssClass\">\n\t\t<ng-content></ng-content>\n\t</StackLayout>\n\t",
    }),
    __metadata("design:paramtypes", [])
], SlideComponent);
exports.SlideComponent = SlideComponent;
