---
examples:
 - name: base
   label: Basic Address Input
   description: Address fields can be prepopulated and marked as required.
 - name: stateAndCountryPicklists
   label: Address With State and Country Picklists
   description: Address fields support predefined lists of states and countries.
---

A `lightning-input-address` component is an address compound field represented
by HTML `input` elements of type `text`. The country and province fields can
be an input field or a dropdown menu. An input field is displayed if
`country-options` and `province-options` are not provided.

This example creates an address compound field with a field for the street,
city, province, postal code, and country.

```html
<template>
    <div >
        <lightning-input-address
            address-label="Address"
            street-label="Street"
            city-label="City"
            country-label="Country"
            province-label="State"
            postal-code-label="PostalCode"
            street="1 Market St."
            city="San Francisco"
            country="US"
            province="CA"
            postal-code="94105">
        </lightning-input-address>
    </div>
</template>
```

To create a dropdown menu for the country and province, pass in an array of
label-value pairs to `country-options` and `province-options`. The `country` and
`province` values are used as the default values on the dropdown menus.

```html
<template>
    <div>
        <lightning-input-address
            address-label="Address"
            street-label="Street"
            city-label="City"
            country-label="Country"
            province-label="Province/State"
            postal-code-label="PostalCode"
            street="1 Market St."
            city="San Francisco"
            country="US"
            country-options={countryOptions}
            province-options={provinceOptions}
            postal-code="94105"
            required>
        </lightning-input-address>
    </div>
</template>
```

JavaScript file:

```javascript
import { LightningElement } from 'lwc';

export default class DemoInputAddress extends LightningElement {
    provinceOptions = [
        { label: 'California', value: 'CA' },
        { label: 'Texas', value: 'TX' },
        { label: 'Washington', value: 'WA' },
    ];

    countryOptions = [
        { label: 'United States', value: 'US' },
        { label: 'Japan', value: 'JP' },
        { label: 'China', value: 'CN' },
    ];

}
```

Alternatively, you can enable state and country picklists in your org, and
access the values by using a wire adapter.
See [Let Users Select State and Country from Picklists](https://help.salesforce.com/articleView?id=admin_state_country_picklists_overview.htm) in Salesforce Help and [getPicklistValues](docs/component-library/documentation/lwc/reference_wire_adapters_picklist_values) in the Lightning Web Components Developer Guide.

#### Using Autocomplete to Autofill an Address

To enable autocompletion of the address fields using an address lookup field, include the `show-address-lookup` attribute. The address lookup field is placed above the address fields you provide.

```html
<template>
    <lightning-input-address
            address-label="Address"
            street-label="Street"
            city-label="City"
            country-label="Country"
            province-label="State"
            postal-code-label="Zip Code"
            street="1 Market St."
            city="San Francisco"
            country="US"
            province="CA"
            show-address-lookup>
        </lightning-input-address>
</template>
```

When you start typing an address in the lookup field, a dropdown appears with matching addresses returned by the Google Maps Places API. Select an address from the dropdown to populate the address fields.

#### Usage Considerations

Using `show-address-lookup` is not supported in Communities, standalone apps, Lightning Out, and Lightning Components for Visualforce.

Your Salesforce locale setting determines the order and layout of your address fields. To display the field labels, use the label attributes, such as `address-label`, `street-label`, and so on.
You can also use custom labels that display translated values. For more information, see
[Access Labels](docs/component-library/documentation/lwc/lwc.create_labels).

When you set `required`, a red asterisk is displayed on every address
field to indicate that they are required. An error message is displayed below
a field if a user interacted with it and left it blank. The `required`
attribute is not enforced and you must validate it before submitting a form
that contains an address compound field.

Let's say you have a `lightning-button` component that calls the `handleClick`
function. You can display the error message when a user clicks the
button without providing a value on a field.


```
    function handleClick(e) {
        const address =
            this.template.querySelector('lightning-address');
        const isValid = address.checkValidity();
        if(isValid) {
            alert("Creating a new address);
        }

    }
```
#### Custom Events

**`change`**

The event fired when an item is changed in the `lightning-input-address` component.

The `change` event returns the following parameters.

Parameter|Type|Description
-----|-----|----------
street|string|The number and name of street.
city|string|The name of the city.
province|string|The name of the province/state.
country|string|The name of the country.
postalCode|string|The postal code for the address.
validity|object|The validity state of the element.


The `change` event properties are as follows.

Property|Value|Description
-----|-----|----------
bubbles|true|This event bubbles up through the DOM.
cancelable|false|This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event.
composed|true|This event propagates outside of the component in which it was dispatched.
