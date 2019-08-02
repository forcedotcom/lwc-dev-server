A `lightning-record-view-form` component is a wrapper component that accepts a
record ID and is used to display one or more fields and labels associated with
that record using `lightning-output-field`.

`lightning-record-view-form` requires
a record ID to display the fields on the record. It doesn't require additional
Apex controllers or Lightning Data Service to display record data. This
component also takes care of field-level security and sharing for you, so
users see only the data they have access to.

#### Supported Objects

This component doesn't support all Salesforce standard objects. For example,
the Event and Task objects are not supported. This limitation also applies to a record
that references a field that belongs to an unsupported object.

For a list of supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

#### Displaying Record Fields

To display the fields on a record, specify the fields using
`lightning-output-field`.

```html
<template>
    <lightning-record-view-form
            record-id="001XXXXXXXXXXXXXXX"
            object-api-name="My_Contact__c">
        <div class="slds-box">
            <lightning-output-field field-name="Name">
            </lightning-output-field>
            <lightning-output-field field-name="Email__c">
            </lightning-output-field>
            </div>
    </lightning-record-view-form>
</template>
```
For more information, see the [`lightning-output-field`](bundle/lightning-output-field/documentation) documentation.

#### Working with the View Layout

To create a multi-column layout for your record view, use the [Grid utility
classes](https://www.lightningdesignsystem.com/utilities/grid/) in Lightning Design System.
This example creates a two-column layout.

```html
<template>
    <lightning-record-view-form
            record-id="001XXXXXXXXXXXXXXX"
            object-api-name="My_Contact__c">
        <div class="slds-grid">
            <div class="slds-col slds-size_1-of-2">
                <!-- Your lightning-output-field components here -->
            </div>
            <div class="slds-col slds-size_1-of-2">
                <!-- More lightning-output-field components here -->
            </div>
        </div>
    </lightning-record-view-form>
</template>
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


#### Usage Considerations

Consider using the [`lightning-record-form`](bundle/lightning-record-form/documentation)
component to create record forms more easily.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](docs/component-library/documentation/lwc/lwc.migrate_map_aura_lwc_components) in the Lightning Web Components Developer Guide.

#### Custom Events

**`load`**

The event fired when the record view form loads record data.

The `load` event returns the following parameters.

Parameter|Type|Description
-----|-----|----------
data|Object|Record data

The event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|false|This event does not bubble.
cancelable|false|This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event.
composed|false|This event does not propagate outside the template in which it was dispatched.

#### See Also

[Create a Form To Work with Records](docs/component-library/documentation/lwc/lwc.data_get_user_input)

