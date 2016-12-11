# NativeScript NG2 Slides for iOS and Android -- ALPHA

[![npm](https://img.shields.io/npm/v/nativescript-ng2-slides.svg)](https://www.npmjs.com/package/nativescript-ng2-slides)
[![npm](https://img.shields.io/npm/dt/nativescript-ng2-slides.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-ng2-slides)


### Intro slides example:
[![Nativescript Slides. Click to Play](https://img.youtube.com/vi/kGby8qtSDjM/0.jpg)](https://www.youtube.com/embed/kGby8qtSDjM)

### Image carousel example:
[![Nativescript Slides. Click to Play](https://img.youtube.com/vi/RsEqGAKm62k/0.jpg)](https://www.youtube.com/embed/RsEqGAKm62k)
_videos are from the NativeScript Slides plugin. all features may not be implemented yet._

_videos by [Brad Martin](https://github.com/bradmartin)_

## Example Usage:

```ts
import { SlidesModule } from 'nativescript-ng2-slides';

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
			<Label text="This is Panel 1"  />
		</slide>
		<slide class="slide-2">
			<Label text="This is Panel 2"  />
		</slide>
		<slide class="slide-3">
			<Label text="This is Panel 3"  />
		</slide>
		<slide class="slide-4">
			<Label text="This is Panel 4"  />
		</slide>
		<slide class="slide-5">
			<Label text="This is Panel 5"  />
		</slide>
	</slides>

```
### CSS
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
}

```
Great for Intros/Tutorials to Image Carousels.

If the property `pageIndicators` is `true` you won't see the page indicators anymore as of 2.0.0 right away. there are two css classes exposed that you can setup however you like for active and inactive indicators. below is an example for semi translucent dots.

#### Plugin Development Work Flow:

* Clone repository to your machine.
* Run `npm run setup` to prepare the demo project
* Build with `npm run build`
* Run and deploy to your device or emulator with `npm run demo.android` or `npm run demo.ios`

#### Known issues

  * There appears to be a bug with the loop resulting in bad transitions going right to left.
  * Currently in Android there is an known issue when a slide component inside of a scroll view.

#### How To: Load slides dynamically
You want to hook into the loaded event of the view and then create your view elements.


## Contributing guidelines
[Contributing guidelines](https://github.com/TheOriginalJosh/nativescript-swiss-army-knife/blob/master/CONTRIBUTING.md)

## License

[MIT](/LICENSE)

for {N} version 2.0.0+
