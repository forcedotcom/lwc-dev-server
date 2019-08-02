A `lightning-record-edit-form` component is a wrapper component that accepts a
record ID and is used to display one or more fields and labels associated with
that record. To create editable fields, use the `lightning-input-field` component inside `lightning-record-edit-form`.

The `lightning-output-field` component and other display components such as
`lightning-formatted-name` can be used to display read-only information in `lightning-record-edit-form`.
If you want to display read-only data only, use `lightning-record-form` or `lightning-record-view-form`.

`lightning-record-edit-form` requires a record ID to display the fields on the
record. It doesn't require additional Apex controllers to display, create, or edit record data because it implements Lightning Data Service. Using `lightning-record-edit-form` to insert or update records with Apex controllers can lead to unexpected behaviors.
This component also takes care of field-level security and sharing for you, so users see only the data they have access to.

`lightning-record-edit-form` and `lightning-input-field` support the following
features.

  * Editing a record using specified fields, or fields from a compact or full layout using a given record ID.
  * Creating a record using specified fields, or fields from a compact or full layout.

#### Supported Objects

This component doesn't support all Salesforce standard objects. For example,
the Event and Task objects are not supported. This limitation also applies to a record
that references a field that belongs to an unsupported object.

For a list of supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

#### Error Handling

Include a `lightning-button` component with `type="submit"` to automatically save any changes in the input fields when the button is clicked.

`lightning-record-edit-form` handles field-level validation errors and Lightning Data Service errors automatically.
For example, entering an invalid email format for the Email field
results in an error message when you try to submit the change. Similarly, a
required field like the Last Name field displays an error message when you try
to submit the change and the field is blank.

A Lightning Data Service error is returned when a resource becomes inaccessible on the server or an invalid record ID is passed in, for example. To display the error message automatically, include `lightning-messages` immediately before or after the `lightning-input-field` components. For more information, see __Overriding Default Behaviors__.

#### Editing a Record

To enable record editing, pass in the ID of the record and the corresponding
object API name to be edited. Specify the fields you want to include in the
record edit layout using `lightning-input-field`. For more information, see the
[`lightning-input-field`](bundle/lightning-input-field/documentation) documentation.


```html
<template>
    <lightning-record-edit-form record-id="003XXXXXXXXXXXXXXX"
                                object-api-name="Contact">
        <lightning-messages>
        </lightning-messages>
        <lightning-output-field field-name="AccountId">
        </lightning-output-field>
        <lightning-input-field field-name="FirstName">
        </lightning-input-field>
        <lightning-input-field field-name="LastName">
        </lightning-input-field>
        <lightning-input-field field-name="Email">
        </lightning-input-field>
        <lightning-button
            class="slds-m-top_small"
            variant="brand"
            type="submit"
            name="update"
            label="Update">
        </lightning-button>
    </lightning-record-edit-form>
</template>
```

#### Creating a Record

To enable record creation, pass in the object API name for the record to be
created. Specify the fields you want to include in the record create layout
using `lightning-input-field` components. For more information, see the
[`lightning-input-field`](bundle/lightning-input-field/documentation) documentation.

```html
<template>
    <lightning-record-edit-form object-api-name="Contact">
        <lightning-messages>
        </lightning-messages>
        <lightning-input-field field-name="Name">
        </lightning-input-field>
            <lightning-button
                class="slds-m-top_small"
                type="submit"
                label="Create new">
            </lightning-button>
    </lightning-record-edit-form>
</template>
```

#### Returning the Record Id

A record Id is generated when a record is created successfully. To return the Id, use the `onsuccess` handler.
This example shows an Id field that's populated when you create an account by providing an account name and pressing the __Create Account__ button.

```html
<template>
    <lightning-record-edit-form object-api-name="Account" onsuccess={handleSuccess}>
        <lightning-messages></lightning-messages>
        <div class="slds-m-around_medium">
            <lightning-input-field field-name='Id' value={accountId}></lightning-input-field>
            <lightning-input-field field-name='Name'></lightning-input-field>
            <div class="slds-m-top_medium">
                <lightning-button variant="brand" type="submit" name="save" label="Create Account">
                </lightning-button>
           </div>
       </div>
    </lightning-record-edit-form>
</template>
```

The `accountId` property is annotated with `@track` so that if its value changes, the component rerenders.

```javascript
import { LightningElement, track } from 'lwc';

export default class createRecordForm extends LightningElement {
   @track accountId;
   handleSuccess(event) {
       this.accountId = event.detail.id;
   }
}
```

#### Displaying Forms Based on a Record Type

If your org uses record types, picklist fields display values according to
your record types. You must provide a record type ID using the `record-type-id`
attribute if you have multiple record types on an object and you don't have a
default record type. Otherwise, the default record type ID is used.

To retrieve a list of record type IDs in your org, use the `getObjectInfo` wire adapter. For more information, see the [getObjectInfo documentation](docs/component-library/documentation/lwc/lwc.reference_wire_adapters_object_info).

Passing in a record type as a field on this component is not supported.

#### Working with the Edit Layout

To create a multi-column layout for your record edit layout, use the Grid
utility classes in Lightning Design System. This example creates a two-column
layout.

```html
<template>
    <lightning-record-edit-form
            record-id="003XXXXXXXXXXXXXXX"
            object-api-name="Contact">
        <div class="slds-grid">
            <div class="slds-col slds-size_1-of-2">
                <!-- Your lightning-input-field components here -->
            </div>
            <div class="slds-col slds-size_1-of-2">
                    <!-- More lightning-input-field components here -->
            </div>
        </div>
    </lightning-record-edit-form>
</template>
```
#### Prepopulating Field Values

 To provide a custom field value when the form displays, use the `value` attribute on `lightning-input-field`. If you're providing a record ID, the value returned by the record on load does not override this custom value.

 This example displays a form with a custom value for the account name field.
The form creates a new account record when the button is clicked.

 ```html
<template>
    <lightning-record-edit-form object-api-name="Account">
        <lightning-input-field field-name="Name"
                               value="My Field Value">
        </lightning-input-field>
        <lightning-button class="slds-m-top_small"
                          type="submit"
                          label="Create new">
        </lightning-button>
    </lightning-record-edit-form>
</template>
```

 This example displays a form with a custom value for the account name field.
The form updates the account record when the button is clicked.

 ```html
<template>
    <lightning-record-edit-form record-id={recordId}
                                object-api-name={objectApiName}>
        <lightning-input-field field-name="Name"
                            value="My Field Value"></lightning-input-field>
        <lightning-button class="slds-m-top_small"
                        type="submit"
                        label="Update record"></lightning-button>
    </lightning-record-edit-form>
</template>
```

 Define the `recordId` and the `objectApiName` in your JavaScript code. The component inherits the record ID from the record page it's placed on.

 ```javascript
import { LightningElement, api } from 'lwc';
 export default class FieldValueExample extends LightningElement {
    @api recordId;
    @api objectApiName;
}
 ```

 To programmatically set the value when the form loads, provide your value in JavaScript. This example sets the value using the `myValue` property. You can set this value programmatically at a later time, as shown by the `onclick` event handler, which calls the `overrideValue` method.

 ```html
<template>
    <lightning-record-edit-form object-api-name="Account">
        <lightning-input-field field-name="Name"
                               value={myValue}></lightning-input-field>
        <lightning-button class="slds-m-top_small"
                          type="submit"
                          label="Create new"></lightning-button>
    </lightning-record-edit-form>

     <lightning-button label="Override Value"
                      onclick={overrideValue}></lightning-button>

 </template>
```

 The `myValue` property is annotated with `@track` so that if its value changes, the component rerenders.

 ```javascript
import { LightningElement, api, track } from 'lwc';
 export default class FieldValueCreateExample extends LightningElement {
    @track myValue = "My Account Name";
     overrideValue(event) {
        this.myValue = "My New Name";
    }
}
 ```

#### Form Display Density

In the Salesforce user interface, the Display Density setting lets users choose how densely the content is displayed. The Comfy density shows labels on top of the fields and more space between page elements. Compact density shows labels next to the fields and less space between page elements.

The record form components, `lightning-record-form`, `lightning-record-edit-form`, and `lightning-record-view-form`,
handle form density in similar ways. The `density` attribute is set to `auto` by default for all record form components.

Display density is supported for `lightning-input-field` and `lightning-output-field` within the form; display density is not supported for custom components within the form.

With `auto` density:
* Record form components detect the Display Density setting and the width of the form's container to determine label position. The record form components don't change the space between elements, however.
* If your Salesforce density setting is Comfy, the fields always display with their labels above them.
* If your Salesforce density setting is Compact, the fields initially display with their labels next to them. If you resize the form container below a certain width or use the form in a narrow container, the fields display with their labels above them. This behavior is similar to how other elements behave in the Salesforce app when Compact density is enabled. The record form components use the same width settings to determine when to switch the display density.
* If a record form component doesn't detect the Salesforce density setting, the fields display with their labels next to them. If you resize the form container to a narrow width, the fields display with their labels above them.

Detecting the user's density setting is only supported in the Salesforce app. When a record form component runs outside the Salesforce app, and density is set to `auto`, the fields display with their labels next to them, and switch to labels above the fields when in a narrow container.

If you specify a variant for `lightning-input-field`, the variant overrides the display density for that field.

##### Setting the Form Display Density

To display a record form with a particular density, set the `density` attribute to one of these values.
* `comfy` makes the form always display labels on top of fields and doesn't detect the user setting.
* `compact` makes the form display labels next to their fields and doesn't detect the user setting. However, the form switches to the comfy density if the form is narrowed to the width that triggers the automatic change. To reduce the whitespace between the label and field when the form uses compact density, use the `slds-form-element_1-col` class on `lightning-input-field` or `lightning-output-field`.
* `auto` makes the form use the default behavior described in __Form Display Density__.

#### Overriding Default Behaviors

To customize the behavior of your form when it loads or when data is
submitted, use the `onload` and `onsubmit` attributes to specify event
handlers. If you capture the submit event and submit the form
programmatically, use `event.preventDefault()` to cancel the default behavior
of the event. This prevents a duplicate form submission.

Errors are automatically handled. To customize the behavior of the form when
it encounters an error on submission or when data is submitted successfully,
use the `onerror` and `onsuccess` attributes to specify event handlers.

Here are some example event handlers for `onsubmit` and `onsuccess`.

 ```javascript
handleSubmit(event){
    event.preventDefault();       // stop the form from submitting
    const fields = event.detail.fields;
    fields.Street = '32 Prince Street';
    this.template.querySelector('lightning-record-edit-form').submit(fields);
}
handleSucess(event){
    const updatedRecord = event.detail.id;
    console.log('onsuccess: ', updatedRecord);
}
```

To see all the response data:

```javascript
handleSuccess(event){
    const payload = event.detail;
    console.log(JSON.stringify(payload));
}
```

#### Resetting the Form

To reset the form fields to their initial values, use the `reset()` method on `lightning-input-field`.

This example creates a form with two fields, followed by Cancel and Save Record buttons.
When you click the Cancel button, the Cancel button resets the fields to its initial values. Add this example to an account record page to inherit its record ID.

 ```html
<template>
    <lightning-record-edit-form
        record-id={recordId}
        object-api-name={objectApiName}>
        <lightning-input-field field-name="Name"></lightning-input-field>
        <lightning-input-field field-name="Industry"></lightning-input-field>
        <div class="slds-m-top_medium">
            <lightning-button class="slds-m-top_small" label="Cancel" onclick={handleReset}></lightning-button>
            <lightning-button class="slds-m-top_small" type="submit" label="Save Record"></lightning-button>
        </div>
    </lightning-record-edit-form>
```

 Call the `reset()` method on each field.

 ```javascript
handleReset(event) {
    const inputFields = this.template.querySelectorAll(
        'lightning-input-field'
    );
    if (inputFields) {
        inputFields.forEach(field => {
            field.reset();
        });
    }
}
```

The same event handlers can be used with [`lightning-record-form`](bundle/lightning-record-form/documentation).

#### Usage Considerations

The lookup type is supported in Lightning Experience only. When used in the
mobile app, the lookup type is rendered as an input text field. Read-only fields are displayed as
input fields that are disabled.

When using `lightning-input-field`, rich text fields can't be used for image
uploads.

For more information about supported field types, see the
[`lightning-input-field`](bundle/lightning-input-field/documentation) documentation.

Consider using the [`lightning-record-form`](bundle/lightning-record-form/documentation)
component to create record forms more easily.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](docs/component-library/documentation/lwc/lwc.migrate_map_aura_lwc_components) in the Lightning Web Components Developer Guide.

#### Custom Events

**`error`**

The event fired when the record edit form retuns a server-side error.

Use the `event.detail` property to return the error.

Parameter|Type|Description
-----|-----|----------
message|String|General description of error.
detail|Object|Description of error details, if any.
output|Object|[Record exception errors](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_exception.htm#ui_api_responses_record_exception)  with `errors` and `fieldErrors` properties. For example, to return the error details when a required field is missing, use `event.detail.output.fieldErrors`.

We recommend using `lightning-messages` as described in the examples to display your error messages in the form, which can be used without a custom `error` event handler.

 Include `lightning-messages` immediately before or after the `lightning-input-field` components to automatically display the string that's returned by `message`, and the  `detail` or `fieldErrors` message if it's available.

 The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call preventDefault() on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

**`load`**

The event fired when the record edit form loads record data.

The `load` event returns the following parameters.

 Parameter|Type|Description
-----|-----|----------
data|Object|The record data and object metadata. For more information, see the [User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_ui.htm).
picklistValues|Object|Values of picklists in record, if any.

 The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call preventDefault() on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

**`submit`**

The event fired when the record edit form submits changed record data.

The `submit` event returns the following parameters.

 Parameter|Type|Description
-----|-----|----------
fields|Object|The fields that are provided for submission during a record create. For example, if you include a `lightning-input-field` component with the `Name` field, `fields` returns `FirstName`, `LastName`, and `Salutation`.

The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|true|This event bubbles up through the DOM.
cancelable|true|This event can be canceled. You can call `preventDefault()` on this event.
composed|true|This event propagates outside of the component in which it was dispatched.

**`success`**

The event fired when the record edit form submits changed record data.

Use the `event.detail` property to return the saved record. For more information, see the [User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record.htm).

The event properties are as follows.

 Property|Value|Description
-----|-----|----------
bubbles|true|This event bubbles up through the DOM.
cancelable|false|This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event.
composed|true|This event propagates outside of the component in which it was dispatched.

#### See Also

[Create a Form To Work with Records](docs/component-library/documentation/lwc/lwc.data_get_user_input)
