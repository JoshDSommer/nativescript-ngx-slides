import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlidesComponent } from './slides/slides.component';
import { SlideComponent } from './slide/slide.component';

export { SlidesComponent } from './slides/slides.component';
export { SlideComponent } from './slide/slide.component';

@NgModule({
    imports: [CommonModule],
    exports: [SlideComponent, SlidesComponent],
    declarations: [SlidesComponent, SlideComponent],
    providers: [],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SlidesModule { }
