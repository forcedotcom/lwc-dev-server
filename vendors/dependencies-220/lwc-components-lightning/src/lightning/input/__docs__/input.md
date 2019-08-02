---
examples:
 - name: date
   label: Date Input
   description: Date input fields provide a date picker for entering a date.
 - name: datetime
   label: Date/Time Input
   description: Date/Time input fields provide a date and time picker for entering a date and time.
 - name: timebasic
   label: Time Input (Basic)
   description: Time input fields provide a dropdown list of time values in 15-minute increments.
 - name: timeadvanced
   label: Time Input (Advanced)
   description: Time input fields support earliest and latest time input.
 - name: color
   label: Color Input
   description: Color input fields provide a color swatch for entering a HEX or RGB value.
 - name: file
   label: File Input
   description: File input fields support upload of single or multiple files and can restrict the accepted file types.
 - name: password
   label: Password Input
   description: Password input fields obscure text.
 - name: tel
   label: Telephone Input
   description: Telephone input fields support number pattern matching.
 - name: url
   label: URL Input
   description: URL input fields support URL pattern matching.
 - name: number
   label: Number Input
   description: Number input fields support decimal, percentage, and currency values.
 - name: checkboxbasic
   label: Checkbox
   description: Checkbox options can be required or disabled.
 - name: checkboxbutton
   label: Checkbox Button
   description: Checkbox buttons can be required or disabled.
 - name: toggle
   label: Toggle
   description: Toggle buttons can be required or disabled.
 - name: search
   label: Search Input
   description: A search input field enables search queries.
---
A `lightning-input` component creates an HTML `input` element. This component
supports HTML5 input types, including `checkbox`, `date`, `datetime`, `time`,
`email`, `file`, `password`, `search`, `tel`, `url`, `number`, `radio`,
`toggle`. The default is `text`.

You can define an action for input events like `blur`,
`focus`, and `change`. For example, to handle a change event on the
component when the value of the component is changed, use the `onchange`
attribute.

This component inherits styling from
[input](https://www.lightningdesignsystem.com/components/input/) in the
Lightning Design System.

#### Checkbox

Checkboxes let you select one or more options. `lightning-input
type="checkbox"` is useful for creating single checkboxes. If you are working
with a group of checkboxes, use [`lightning-checkbox-group`](bundle/lightning-checkbox-group/documentation) instead.

```html
<template>
    <lightning-input type="checkbox"
                     label="Red"
                     checked>
    </lightning-input>
    <lightning-input type="checkbox">
    </lightning-input>
</template>
```

#### Checkbox-button

Checkbox buttons let you select one or more options with an alternative visual
design.

```html
<template>
    <lightning-input type="checkbox"
                     label="Add pepperoni"
                     checked
                     value="pepperoni">
    </lightning-input>
    <lightning-input type="checkbox-button"
                     label="Add salami"
                     value="salami">
    </lightning-input>
</template>
```

#### Color

A color picker enables you to specify a color using a color picker or by
entering the color into a text field.

```html
<template>
    <lightning-input type="color"
                     label="Color"
                     value="#EEEEEE">
    </lightning-input>
</template>
```

#### Date

An input field for entering a date. The date format is automatically validated
against the user's Salesforce locale format during the `blur` event.

Dates are displayed by default in a medium-length style, such as Jan 7, 2019 in the en-US locale.
To specify a short style such as 1/7/2019, set `date-style="short"`. To specify a long style such as
January 7, 2019  set `date-style="long"`. If a user enters a date using a different style, the component
accepts the input and reformats it to the specified `date-style` during the `blur` event. The date entered must
be valid for the user's Salesforce locale, and match one of the short, medium, or long styles.

Use the date picker to pick a date or provide an ISO8601 formatted string in
the `value` attribute. On desktop, `lightning-input` provides its own date picker,
but on mobile devices it uses the native date picker.

```html
<template>
    <lightning-input type="date"
                     label="Birthday">
    </lightning-input>
</template>
```

#### Datetime

An input field for entering a date and time. The date and time formats are
automatically validated against the user's Salesforce locale format during the
`blur` event. The date and time reflect the user's time zone setting. Use
the `timezone` attribute to specify a different time zone in IANA time zone
database format. For example, specify `timezone="America/New_York"` for US
Eastern Time or `timezone="GMT"` for Greenwich Mean Time.

Dates are displayed by default in a medium-length style, such as Jan 7, 2019 in the en-US locale.
To specify a short style such as 01/07/2019, set `date-style="short"`. To specify a long style such as
January 7, 2019  set `date-style="long"`. If a user enters a date using a different style, the component
accepts the input and reformats it to the specified `date-style` during the `blur` event. The date entered must
be valid for the user's Salesforce locale, and match one of the short, medium, or long styles.

Times are displayed by default in a short style, such as 6:53 PM in the en-US locale.
To specify a style to include seconds, set `time-style="medium"` or `time-style="long"`. The
medium and long styles currently have the same formatting.

Use the date picker and time picker to pick a date and time or provide an
ISO8601 formatted string in the `value` attribute. On desktop, `lightning-input`
provides its own date/time picker, but on mobile devices it uses the native date/time picker.

__Note__: Set the same time zone on your mobile device and in Salesforce to avoid confusion and potential validation
issues. For example, suppose the current time is 4:00 PM ET. Your mobile device is set to the America/New_York time zone and
you're interacting with Salesforce while it's set to the America/Los_Angeles time zone. When you tap an empty date/time field
on the mobile device, the native date/time picker automatically selects the current device time, 4:00 PM.
Since the current time is 1:00 PM in Salesforce, this input time is in the future. If there's a validation rule stating that
the value must be earlier than the current time, for example, the value is invalid. This occurs only
because of the time zone discrepancy, and only on mobile devices when the date/time field is initially empty.

```html
<template>
    <lightning-input type="datetime"
                     label="Created date">
    </lightning-input>
</template>
```

#### Email

An input field for entering an email address. The email pattern is
automatically validated during the `blur` event.

```html
<template>
    <lightning-input type="email"
                     label="Email"
                     value="abc@example.com">
    </lightning-input>
</template>
```

#### File

An input field for uploading files using an `Upload Files` button or a drag-
and-drop zone.

To retrieve the list of selected files, use
`event.target.files` in the `onchange` event handler. Your selected files are returned in a `FileList` object, each specified as a `File` object with the `size` and `type` attributes.

```html
<template>
    <lightning-input type="file"
                     label="Attachment"
                     accept="image/png, .zip"
                     onchange={handleFilesChange}
                     multiple>
    </lightning-input>
</template>
```

Files uploaded using `type="file"` are subject to a 1 MB size limit, or about
4 MB if you chunk the files. You must wire up your component to an Apex
controller that handles file uploads. Alternatively, use the
[`lightning-file-upload`](bundle/lightning-file-upload/documentation) component for an integrated way to upload files to
records.

#### Number

An input field for entering a number. When working with numerical input, you
can use attributes like `max`, `min`, and `step`.

```html
<template>
    <lightning-input type="number"
                     label="Number"
                     value="12345">
    </lightning-input>
</template>
```

To format numerical input as a percentage or currency, set `formatter` to
`percent` or `currency` respectively.

```html
<template>
    <lightning-input type="number"
                     label="Price"
                     value="12345"
                     formatter="currency">
    </lightning-input>
</template>
```

Fields for percentage and currency input default to a step increment of 0.01.

```html
<template>
    <lightning-input type="number"
                     label="Enter a decimal value" step="0.001"
                     step="0.001">
    </lightning-input>
    <lightning-input type="number"
                     label="Enter a percentage value"
                     formatter="percent"
                     step="0.01">
    </lightning-input>
    <lightning-input type="number"
                     label="Enter a dollar amount"
                     formatter="currency"
                     step="0.01">
    </lightning-input>
</template>

```

To enter a percentage value as is, use `formatter="percent-fixed"`. For
example, entering "10" results in "10%" on blur.

#### Password

An input field for entering a password. Characters you enter are masked.

```html
<template>
    <lightning-input type="password"
                     label="Password">
    </lightning-input>
</template>
```

#### Radio

Radio buttons let you select only one of a given number of options.
`lightning-input type="radio"` is useful for creating single radio buttons. If
you are working with a set of radio buttons, use [`lightning-radio-group`](bundle/lightning-radio-group/documentation)
instead.

```html
<template>
    <lightning-input type="radio"
                     label="Red"
                     value="red"
                     checked>
    </lightning-input>
    <lightning-input type="radio"
                     label="Blue"
                     value="blue">
    </lightning-input>
</template>
```

#### Range

A slider control for entering a number. When working with numerical input, you
can use attributes like `max`, `min`, and `step`.

```html
<template>
    <lightning-input type="range"
                     label="Number"
                     min="0"
                     max="10">
    </lightning-input>
</template>
```

#### Search

An input field for entering a search string. This field displays the Lightning
Design System search utility icon.

```html
<template>
    <lightning-input type="search"
                     label="Search">
    </lightning-input>
</template>
```

To indicate activity in the search field with a spinner, such as data loading, include the `is-loading` attribute.

```html
<template>
    <lightning-input type="search"
                     label="Search"
                     is-loading>
    </lightning-input>
</template>
```

#### Tel

An input field for entering a telephone number. Use the `pattern` attribute to
define a pattern for field validation.

```html
<template>
    <lightning-input type="tel"
                     label="Telephone"
                     value="343-343-3434"
                     pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
    </lightning-input>
</template>
```

#### Text

An input field for entering text. This is the default input type.

```html
<template>
    <lightning-input label="Name">
    </lightning-input>
</template>
```

#### Time

An input field for entering time. The time format is automatically validated
against the user's Salesforce locale format during the `blur` event.

Times are displayed by default in a short style, such as 6:53 PM in the en-US locale.
To specify a style to include seconds, set `time-style="medium"`.

Use the time picker to pick a time or provide an ISO8601 formatted time string
in the `value` attribute. On desktop, `lightning-input` provides its own time picker,
but on mobile devices it uses the native time picker.

```html
<template>
    <lightning-input type="time"
                     label="Time">
    </lightning-input>
</template>
```

#### Toggle

A checkbox toggle for selecting one of two given values. Use the
`message-toggle-active` and `message-toggle-inactive` attributes to specify labels
displayed under the toggle for each state. By default the labels are Active
and Inactive. To display no labels, set these attributes to empty strings.

```html
<template>
    <lightning-input type="toggle"
                     label="Toggle value"
                     checked>
    </lightning-input>
</template>
```

#### URL

An input field for entering a URL. The address must include the protocol, such
as http:// or ftp://. The URL pattern is automatically validated during the
`blur` event. To enter the address without the protocol, such as
www.example.com, use the default `type="text"` instead.

```html
<template>
    <lightning-input type="url"
                     label="Website">
    </lightning-input>
</template>
```

#### Input Validation

Client-side input validation is available for this component. For example, an
error message is displayed when a URL or email address is expected for an
input type of `url` or `email`. Note that disabled and read-only inputs are
always valid.

You can define additional field requirements. For example, to set a maximum
value on a number field, use the `max` attribute.

```html
<template>
    <lightning-input type="number"
                     value="500"
                     label="Quantity"
                     max="1000">
    </lightning-input>
</template>
```

To check the validity states of an input, use the `validity` attribute, which
is based on the Constraint Validation API. To determine if a field is valid,
you can access the validity states in JavaScript. Let's say
you have the following input field.

```html
<template>
    <lightning-input class="input"
                     label="Enter some text"
                     onblur={handleBlur}>
    </lightning-input>
</template>
```

The `valid` attribute returns true because all constraint validations are met,
and in this case there are none.

```javascript
import { LightningElement } from 'lwc';

export default class DemoInput extends LightningElement {

    handleBlur(event) {
        var input = this.template.querySelector(".input");
        console.log(input.validity.valid); //returns true
    }
```

For example, you have the following form with several fields and a button. To
display error messages on invalid fields, use the `reportValidity()` method.

```html
<template>
    <lightning-input label="First name"
                     placeholder="First name"
                     required>
    </lightning-input>
    <lightning-input label="Last name"
                     placeholder="Last name"
                     required>
    </lightning-input>
    <lightning-button type="submit"
                      label="Submit"
                      onclick={handleClick}>
    </lightning-button>
</template>
```

Validate the fields in JavaScript.

```javascript
export default class InputHandler extends LightningElement {
    @track value = "initial value";

    handleClick(evt) {
        console.log('Current value of the input: ' + evt.target.value);

        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
            }, true);
        if (allValid) {
            alert('All form entries look valid. Ready to submit!');
        } else {
            alert('Please update the invalid form entries and try again.');
        }

    }
}
```

This `validity` attribute returns an object with the following read-only `boolean`
attributes.

  * `badInput`: Indicates that the value is invalid.
  * `customError`: Indicates that a custom error has been set. See Custom Validity Error Messages.
  * `patternMismatch`: Indicates that the value doesn't match the specified pattern.
  * `rangeOverflow`: Indicates that the value is greater than the specified `max` attribute.
  * `rangeUnderflow`: Indicates that the value is less than the specified `min` attribute.
  * `stepMismatch`: Indicates that the value doesn't match the specified `step` attribute.
  * `tooLong`: Indicates that the value exceeds the specified `maxlength` attribute.
  * `tooShort`: Indicates that the value is less than the specified `minlength` attribute.
  * `typeMismatch`: Indicates that the value doesn't match the required syntax for an email or url input type.
  * `valueMissing`: Indicates that an empty value is provided when `required` attribute is set to `true`
  * `valid`: True if none of the preceding properties are true.

#### Error Messages

When an input validation fails, the following messages are displayed by
default.

  * `badInput`: Enter a valid value.
  * `patternMismatch`: Your entry does not match the allowed pattern.
  * `rangeOverflow`: The number is too high.
  * `rangeUnderflow`: The number is too low.
  * `stepMismatch`: Your entry isn't a valid increment.
  * `tooLong`: Your entry is too long.
  * `tooShort`: Your entry is too short.
  * `typeMismatch`: You have entered an invalid format.
  * `valueMissing`: Complete this field.

You can override the default messages by providing your own values for these
attributes: `message-when-bad-input`, `message-when-pattern-mismatch`,
`message-when-type-mismatch`, `message-when-value-missing`,
`message-when-range-overflow`, `message-when-range-underflow`,
`message-when-step-mismatch`, `message-when-too-long`.

For example, you want to display a custom error message when the input is less
than five characters.

```html
<template>
    <lightning-input label="First Name"
                     minlength="5"
                     message-when-bad-input="Your entry must be at least 5 characters.">
    </lightning-input>
 </template>
 ```

#### Custom Validity Error Messages

The component supports `setCustomValidity()` from HTML5's Constraint
Validation API. To set an error message, provide a quoted string to display.
To reset the error message, set the message to an empty string (""). See
details at [https://www.w3.org/TR/html52/sec-forms.html#dom-htmlinputelement-setcustomvalidity](https://www.w3.org/TR/html52/sec-forms.html#dom-htmlinputelement-setcustomvalidity).

This example shows how to display a custom error message with
`setCustomValidity()` and `reportValidity()`. The component is a simple text
input with a button.


```html
<template>
    <lightning-input class="inputCmp"
                     label="Enter your name:">
    </lightning-input>
    <lightning-button label="Register"
                      onclick={register}>
    </lightning-button>
 </template>
 ```

The `register()` function compares the input entered by the user to a
particular text string. If true, `setCustomValidity()` sets the custom error
message. The error message is displayed immediately using `reportValidity()`.
Note that when the comparison isn't true, you should set the error message to
an empty string to zero out any messages that might have been set on previous
calls.

```javascript
import { LightningElement } from 'lwc';
export default class MyComponent extends LightningElement {

    register(event) {
        var inputCmp = this.template.querySelector(".inputCmp");
        var value = inputCmp.value;
        // is input valid text?
        if (value === "John Doe") {
            inputCmp.setCustomValidity("John Doe is already registered");
        } else {
            inputCmp.setCustomValidity(""); // if there was a custom error before, reset it
        }
        inputCmp.reportValidity(); // Tells lightning-input to show the error right away without needing interaction
    }
}
```

#### Using Autocomplete in Input Fields

Some input types can be autofilled, based on your browser's support of the feature.
The `autocomplete` attribute passes its value to the browser.
These `lighting-input` types support the `autocomplete` attribute:
* `email`
* `search`
* `tel`
* `text`
* `url`

The values `on` and `off` are supported, but the behavior depends on the browser. Some browsers might ignore the passed value.

See [Autofill in the HTML5 Specification](https://www.w3.org/TR/html/sec-forms.html#sec-autofill) for more information.

#### Adding Field-Level Help

To provide a hint for entering information in the field, use the `field-level-help` attribute to create an info icon and tooltip next to the input label. To provide an example input in the field, use the `placeholder` attribute to specify placeholder text.

```html
<template>
    <lightning-input label="Event Name"
         placeholder="Grand Opening"
         field-level-help="The event name must be less than 50 characters" max-length="50"/>
</template>
```

`field-level-help` isn't supported for `file`, `radio`, `toggle`, and `checkbox-button` types.

#### Usage Considerations

The label for an input field is displayed above the field by default. To display the label next to
the field, use the `label-inline` variant.

`maxlength` limits the number of characters you can enter. The
`message-when-too-long` error message isn't triggered because you can't type more
than the number of characters allowed. However, you can use the
`message-when-pattern-mismatch` and `pattern` to achieve the same behavior.

```html
    <lightning-input type="text"
                     message-when-pattern-mismatch="Too many characters!"
                     pattern=".{0,5}"
                     label="Enter up to 5 characters">
    </lightning-input>
```

You can use custom labels that display translated values on input fields. For more information,
see [Access Labels](docs/component-library/documentation/lwc/lwc.create_labels)

The following input types are not supported.

  * `button`
  * `hidden`
  * `image`
  * `reset`
  * `submit`

Use `lightning-button` instead for input types `button`, `reset`, and
`submit`.

When working with checkboxes, radio buttons, and toggle
switches, use `this.template.querySelectorAll` to retrieve the array of components. You can
use `.filter` to determine which elements are checked or unchecked. The following
example displays the values of the selected checkboxes.

```html
<template>
    <lightning-input type="checkbox"
                     label="Red"
                     onchange={handleCheckboxChange}>
    </lightning-input>
    <lightning-input type="checkbox"
                     label="Blue"
                     onchange={handleCheckboxChange}>
    </lightning-input>
    <lightning-input type="checkbox"
                     label="Green"
                     onchange={handleCheckboxChange}>
    </lightning-input>

    <p>Checked items: {selection}</p>
</template>
```

When you select a checkbox, the `handleCheckboxChange` function updates the `selection` property
to display a list of selected checkboxes.

```javascript
import { LightningElement, track } from 'lwc';

export default class CheckboxExample extends LightningElement {
    @track selection;

    handleCheckboxChange() {
        // Query the DOM
        const checked = Array.from(
            this.template.querySelectorAll('lightning-input')
        )
            // Filter down to checked items
            .filter(element => element.checked)
            // Map checked items to their labels
            .map(element => element.label);
        this.selection = checked.join(', ');
    }
}
```

Arabic, Hindi, and Persian numbers are not supported by `lightning-input` for these `type` values:

  * `number`
  * `date`
  * `time`
  * `datetime`

The `lightning-input` component has these limitations when running in the Playground and the Mini-Playground in the Examples tab of this Component Reference.

 * The `timezone` attribute currently doesn't work, so the time is formatted using the runtime system's timezone.
 * The input types `date`, `time`, and `datetime` are limited to the en-US locale. Other locales are currently not supported in Playground.


#### Accessibility

You must provide a text label for accessibility to make the information
available to assistive technology. The `label` attribute creates an HTML
`label` element for your input component. To hide a label from view and make
it available to assistive technology, use the `label-hidden` variant.
