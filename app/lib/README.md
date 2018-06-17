# NativeScript + Angular Slides for iOS and Android

[![npm](https://img.shields.io/npm/v/nativescript-ngx-slides.svg)](https://www.npmjs.com/package/nativescript-ngx-slides)
[![npm](https://img.shields.io/npm/dt/nativescript-ngx-slides.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-ngx-slides)


### Intro slides example:
[![Nativescript Slides. Click to Play](https://img.youtube.com/vi/kGby8qtSDjM/0.jpg)](https://www.youtube.com/embed/kGby8qtSDjM)

### Image carousel example:
[![Nativescript Slides. Click to Play](https://img.youtube.com/vi/RsEqGAKm62k/0.jpg)](https://www.youtube.com/embed/RsEqGAKm62k)

_videos are from the NativeScript Slides plugin. all features may not be implemented yet._

_videos by [Brad Martin](https://github.com/bradmartin)_

## Example Usage:

```ts
import { SlidesModule } from 'nativescript-ngx-slides';

import { AppComponent } from "./app.component";

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [NativeScriptModule, SlidesModule],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }

```

### XML
```xml

<slides>
    <slide class="slide-1">
        <Label text="This is Panel 1"></Label>
    </slide>
    <slide class="slide-2">
        <Label text="This is Panel 2"></Label>
    </slide>
    <slide class="slide-3">
        <Label text="This is Panel 3"></Label>
    </slide>
    <slide class="slide-4">
        <Label text="This is Panel 4"></Label>
    </slide>
    <slide class="slide-5">
        <Label text="This is Panel 5"></Label>
    </slide>
</slides>

```
### CSS

place this in the app.css file in the root of your project. 

```css
.slide-1{
  background-color: darkslateblue;
}

.slide-2{
  background-color: darkcyan;
}
.slide-3{
  background-color: darkgreen;
}

.slide-4{
  background-color: darkgoldenrod;
}
.slide-5{
  background-color: darkslategray;
}
Label{
  text-align: center;
  width: 100%;
  font-size: 35;
  margin-top: 35;
	color: #fff;

}

```
Great for Intros/Tutorials to Image Carousels.

This very much a work in progress. Please feel free to contribute.

### Attributes for SlideContainer

-  **loop : boolean** - If true will cause the slide to be an endless loop. The suggested use case would be for a Image Carousel or something of that nature.

- **pageIndicators : boolean** - If true adds indicator dots to the bottom of your slides.

#### Indicators

If the property `pageIndicators` is `true` you won't see the page indicators anymore as of 2.0.0 right away. there are two css classes exposed that you can setup however you like for active and inactive indicators. below is an example for semi translucent dots.

```css
.slide-indicator-inactive{
    background-color: #fff;
    opacity : 0.4;
    width : 10;
    height : 10;
    margin-left : 2.5;
    margin-right : 2.5;
    margin-top : 0;
    border-radius : 5;
}

.slide-indicator-active{
    background-color: #fff;
    opacity : 0.9;
    width : 10;
    height : 10;
    margin-left : 2.5;
    margin-right : 2.5;
    margin-top : 0;
    border-radius : 5;
}
```

#### Plugin Development Work Flow:

* Clone repository to your machine.
* Run `npm run setup` to prepare the demo project
* Build with `npm run build`
* Run and deploy to your device or emulator with `npm run demo.android` or `npm run demo.ios`

#### Known issues

  * Does not work well inside of ScrollView or TabViews.

## Contributors

[<img alt="TheOriginalJosh" src="https://avatars.githubusercontent.com/u/1486275?v=3&s=117" width="117">](https://github.com/TheOriginalJosh) | [<img alt="dobjek" src="https://avatars.githubusercontent.com/u/353596?v=3&s=117" width="117">](https://github.com/dobjek)| [<img alt="EddyVerbruggen" src="https://avatars.githubusercontent.com/u/1426370?v=3&s=117" width="117">](https://github.com/EddyVerbruggen)| [<img alt="Marco Mantovani" src="https://avatars.githubusercontent.com/u/1965169?v=3&s=117" width="117">](https://github.com/codeback)
:---: |:---: |:---: |:---: |
[Josh Sommer](https://github.com/TheOriginalJosh) |[dobjek](https://github.com/dobjek) |[Eddy Verbruggen](https://github.com/EddyVerbruggen)|[Codeback Software](https://github.com/codeback)

## Contributing guidelines
[Contributing guidelines](https://github.com/TheOriginalJosh/nativescript-swiss-army-knife/blob/master/CONTRIBUTING.md)

## License

[MIT](/LICENSE)

for {N} version 2.0.0+


