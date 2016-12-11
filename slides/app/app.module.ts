import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/platform";

import { SlidesModule } from './slides.module';

import { AppComponent } from "./app.component";

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [NativeScriptModule, SlidesModule],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
