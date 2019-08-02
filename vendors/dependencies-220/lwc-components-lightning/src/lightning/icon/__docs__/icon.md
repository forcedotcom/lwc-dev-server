---
examples:
 - name: basic
   label: Basic Icons
   description: Action icons, doctype icons, standard icons, and utility icons. You can change the icon size by setting the size attribute.
 - name: variants
   label: Icons with Variants
   description: Effects of the inverse, success, warning and error variants.
 - name: custom
   label: Custom Icons
   description: Load custom icons from an external resource by specifying the src attribute.
---
A `lightning-icon` is a visual element that provides context and enhances
usability. Icons can be used inside the body of another component or on their
own.

Visit [icons](https://lightningdesignsystem.com/icons) to view the available icons.

When applying Lightning Design System classes or icons, check that they are
available in the Lightning Design System release tied to your org. The latest
Lightning Design System resources become available only when the new release
is available in your org.

Here is an example.
```html
<template>
    <lightning-icon
            icon-name="action:approval"
            size="large"
            alternative-text="Indicates approval">
    </lightning-icon>
</template>
```

Use the `variant`, `size`, or `class` attributes to customize the styling. The
`variant` attribute changes the appearance of a utility icon. For example, the
`error` variant adds a red fill to the error utility icon.

```html
<template>
    <lightning-icon icon-name="utility:error" variant="error">
    </lightning-icon>
</template>
```

If you want to make additional changes to the styling of an icon, use
the `class` attribute. For example, you can set `class="slds-m-vertical_large"` or other
[margin](https://lightningdesignsystem.com/utilities/margin/) classes to add
spacing around the icon.

You can't change the color of the icon using the `class` attribute.

Icons are not available in Lightning Out, but they are available in Lightning Components for Visualforce and other experiences.

#### Accessibility

Use the `alternative-text` attribute to describe the icon. The description
should indicate what happens when you click the button, for example 'Upload
File', not what the icon looks like, 'Paperclip'.

Sometimes an icon is decorative and does not need a description. But icons can
switch between being decorative or informational based on the screen size. If
you choose not to include an `alternative-text` description, check smaller
screens and windows to ensure that the icon is decorative on all formats.

#### Using Custom Icons

Use the `src` attribute to specify the path of the resource for the custom
icon. When this attribute is present, `lightning-icon` attempts to load an
icon from the provided resource.

Define a static resource in your org and upload your custom icon's SVG resource
to it. The SVG code must include a `<g>` element with an id that you can reference.

For example, suppose your static resource is named `mySVG_icon` and it contains
this `google.svg` content.

```html
<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">&lt;title>Google icon&lt;/title>
    <g id="google">
        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
    </g>
</svg>
```

Import the SVG resource into your component, and set a variable to the static resource URL plus the `<g>` ID.

```javascript
// myComponent.js
import { LightningElement } from 'lwc';
import mySVG_icon from '@salesforce/resourceUrl/mySVG_icon';

export default class myComponent extends LightningElement {
    googleIcon = mySVG_icon + '#google';
    }
```

Pass the static resource variable in the `src` attribute.

```html
<template>
    <lightning-icon src={googleIcon}></lightning-icon>
</template>
```

For more information about static resources and using SVG, see [Access Static Resources](docs/component-library/documentation/lwc/create_resources) and [Use SVG Resources](docs/component-library/documentation/lwc/lwc.use_svg_in_component) in the *Lightning Web Components Developer Guide*.

##### Overriding the Icon Fill Color of Custom Icons

Note that custom icons have a default fill attribute value `##fff`, which
you can override in your svg sprite directly. For example, change the color to
a shade of green by inserting `fill=#648079` in the `<svg>` element.

You can't use CSS to change the fill color in a custom icon.

#### Usage Considerations

For IE11, the custom icon feature is disabled for now due to performance issues.

