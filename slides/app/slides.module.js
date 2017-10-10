"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var slides_component_1 = require("./slides/slides.component");
var slide_component_1 = require("./slide/slide.component");
var SlidesModule = (function () {
    function SlidesModule() {
    }
    return SlidesModule;
}());
SlidesModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule],
        exports: [slide_component_1.SlideComponent, slides_component_1.SlidesComponent],
        declarations: [slides_component_1.SlidesComponent, slide_component_1.SlideComponent],
        providers: [],
        schemas: [
            core_1.NO_ERRORS_SCHEMA
        ]
    })
], SlidesModule);
exports.SlidesModule = SlidesModule;
