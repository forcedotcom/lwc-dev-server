A `lightning-record-form` component enables you to quickly create forms to add,
view, or update a record. Using this component to create record forms is
easier than building forms manually with `lightning-record-edit-form` and
`lightning-record-view-form`.

The `object-api-name` attribute is always required, and the `record-id` is
required unless you're creating a record.

This component takes care of field-level security and sharing for you, so
users see only the data that they have access to.

#### Supported Objects

This component doesn't support all Salesforce standard objects. For example,
the Event and Task objects are not supported. This limitation also applies to a record
that references a field that belongs to an unsupported object.

For a list of supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

#### Modes

The component accepts a `mode` value that determines the user interaction
allowed for the form. The value for `mode` can be one of the following:

  * `edit` - Creates an editable form to add a record or update an existing one. When updating an existing record, specify the `record-id`. Edit mode is the default when `record-id` is not provided, which displays a form to create new records.
  * `view` - Creates a form to display a record that the user can also edit. The record fields each have an edit button. View mode is the default when `record-id` is provided.
  * `readonly` - Creates a form to display a record without enabling edits. The form doesn't display any buttons.

#### Specifying Record Fields

For all modes, the component expects the `fields` attribute or the `layout-type` attribute.

Use the `fields` attribute to pass record fields as an array of strings.
The fields display in the order you list them.

Use the `layout-type` attribute to specify a `Full` or `Compact` layout.
Layouts are typically created or modified by administrators. Loading record data using `layout-type` allows the form to adapt to those layout definitions. All fields that have been assigned to the layout are loaded into the form. This is the same behavior as the Lightning Data Service's [getRecordUi wire adapter](docs/component-library/documentation/lwc/lwc.reference_wire_adapters_record_ui).

To specify the field order, use `fields` without the `layout-type` attribute. We don't recommend using the `fields` attribute with the `layout-type` attribute as the display order of the fields can vary. Alternatively,
use the `lightning-record-edit-form` or `lightning-record-view-form` component to display a custom layout.

#### Viewing a Record with Option to Edit Fields

Use `mode="view"` and pass the ID of the record and the corresponding object
API name to be displayed. Specify the fields using the `fields` attribute, or
`layout-type` attribute to display all the fields defined on the `Full` or `Compact` layout.

The view mode loads the form using output fields with inline editing enabled.
You can edit fields that are marked updateable in the User Interface API. If the user clicks an edit icon next to a field,
all fields that are updateable becomes editable, and the form displays Submit and
Cancel buttons.

This example creates a form for an account record in view mode with fields from the full layout. Update the record ID with your own.

```html
<lightning-record-form
    record-id="001XXXXXXXXXXXXXXX"
    object-api-name="Account"
    layout-type="Full"
    mode="view">
</lightning-record-form>
```

#### Viewing a Record with Read-Only Fields

Use `mode="readonly"` and pass the ID of the record and the corresponding
object API name to be displayed. Specify the fields using the `fields`
attribute, or `layout-type` attribute to display all the fields defined on the
`Full` or `Compact` layout.

The readonly mode loads the form with output fields only, and without Submit
or Cancel buttons.

This example creates a form for an account record in readonly mode with a single column and fields from the compact layout. Update the record ID with your own.

```html
<lightning-record-form
    record-id="001XXXXXXXXXXXXXXX"
    object-api-name="Account"
    layout-type="Compact"
    columns="1"
    mode="readonly">
</lightning-record-form>
```

#### Editing a Record

To edit a record, pass the ID of the record and the corresponding object
API name to be edited. Specify the fields using the `fields` attribute, or
`layout-type` attribute to load all the fields defined on the `Full` or `Compact` layout.

When `record-id` is passed, edit mode loads the form with input fields
displaying the specified record's field values. The form also displays Submit
and Cancel buttons.

This example creates an editable two-column form for an account record using the compact layout. Place the form on an account record page to inherit its `record-id` and `object-api-name` properties. The `onsubmit` attribute specifies an action to override the handler for the submit.

```html
<lightning-record-form
        record-id={recordId}
        object-api-name={objectApiName}
        fields={fields}
        columns="2"
        mode="edit"
        onsubmit={handleSubmit}>
</lightning-record-form>
 ```

When a record ID is provided, view mode is the default. To use the edit mode, pass in `mode="edit"`. Define an array of field names in your JavaScript using the `fields` property.

```javascript
import { LightningElement, api } from 'lwc';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class RecordFormEditExample extends LightningElement {
    // The record page provides recordId and objectApiName
    @api recordId;
    @api objectApiName;

    fields = [NAME_FIELD, REVENUE_FIELD, INDUSTRY_FIELD];

    handleSubmit(event){
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        fields.LastName = 'My Custom Last Name'; // modify a field
        this.template.querySelector('lightning-record-form').submit(fields);
     }
}
```

#### Creating a Record

Pass in the object API name for the record to be created. Specify the fields you want using the
`fields` attribute, or use the `Full` layout to load fields.

The compact layout cannot be used for creating records. If you specify `layout-type="Compact"`,
the full layout is shown. If you specify the `fields` attribute, be sure
to include any fields that are designated as required for the object's records.

Because no record ID is passed, edit mode loads the form with input fields that
aren't populated with field data. The form displays Submit and Cancel buttons.

This example displays a form with the required name field and several others for creating account records. Place the form on an account record page to inherit its `object-api-name` property. The `onsuccess` attribute specifies an action to override the handler when an account is successfully created.

```html
<lightning-record-form
        object-api-name={objectApiName}
        fields={fields}
        onsuccess={handleSuccess}>
</lightning-record-form>
 ```

 When an account is successfully edited or created, a toast message is displayed using the
`ShowToastEvent` event, which is dispatched by the `handleSuccess` event handler. The `onsuccess` event returns the [record](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record.htm) object, including the ID of the newly created account.

```javascript
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import INDUSTRY_FIELD from '@salesforce/schema/Contact.Industry';

export default class RecordFormCreateExample extends LightningElement {
    // objectApiName is "Account" when this component is placed on an account record page
    @api objectApiName;

    fields = [NAME_FIELD, REVENUE_FIELD, INDUSTRY_FIELD];

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Account created",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
    }
}

```

#### Displaying Forms Based on a Record Type

If your org uses record types, picklist fields display values according to
your record types. You must provide a record type ID using the `record-type-id`
attribute if you have multiple record types on an object and you don't have a
default record type. Otherwise, the default record type ID is used.

To retrieve a list of record type IDs in your org, use the `getObjectInfo` wire adapter.
For more information, see the [getObjectInfo documentation](docs/component-library/documentation/lwc/lwc.reference_wire_adapters_object_info).

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

##### Setting the Form Display Density

To display a record form with a particular density, set the `density` atttibute to one of these values.
* `comfy` makes the form always display labels on top of fields and doesn't detect the user setting.
* `compact` makes the form display labels next to their fields and doesn't detect the user setting. However, the form switches to the comfy density if the form is narrowed to the width that triggers the automatic change.
* `auto` makes the form use the default behavior described in __Form Display Density__.


Passing in a record type as a field on this component is not supported.


#### Overriding Default Behaviors

To customize the behavior of your form when it loads or when data is submitted, specify your own event handlers using the `onload` and `onsubmit` attributes.

Errors are automatically handled. To customize the behavior of the form when
it encounters an error on submission or when data is submitted successfully,
use the `onerror` and `onsuccess` attributes to specify event handlers.

For examples of event handlers, see the documentation
for [`lightning-record-edit-form`](bundle/lightning-record-edit-form/documentation).


#### Custom Events

**`load`**

The event fired when the record form loads record data.

The `load` event returns the following parameters.

Parameter|Type|Description
-----|-----|----------
detail|Object|Record data

The event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call preventDefault() on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

**`error`**

The event fired when the record form encounters an error.

The `error` event returns the following parameters.

Parameter|Type|Description
-----|-----|----------
detail|Object|Error details.

 The event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call preventDefault() on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

**`success`**

The event fired when the record form submits successfully.

The `success` event returns the following parameters.

Parameter|Type|Description
-----|-----|----------
detail|string|The details of the submitted [record](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record.htm).

 The event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call preventDefault() on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

**`cancel`**

The event fired when the user cancels the form.

The `cancel` event returns no parameters.

The event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call preventDefault() on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.


#### See Also

[lightning-record-edit-form](bundle/lightning-record-edit-form/documentation)

[lightning-record-view-form](bundle/lightning-record-view-form/documentation)

[Create a Form To Work with Records](docs/component-library/documentation/lwc/lwc.data_get_user_input)
for more information and guidance about the record components.
