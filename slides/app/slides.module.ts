import { NgModule } from '@angular/core';

import { SlidesComponent } from './slides/slides.component';
import { SlideComponent } from './slide/slide.component';

@NgModule({
    imports: [],
    exports: [SlideComponent, SlidesComponent],
    declarations: [SlidesComponent, SlideComponent],
    providers: [],
})
export class SlidesModule { }
