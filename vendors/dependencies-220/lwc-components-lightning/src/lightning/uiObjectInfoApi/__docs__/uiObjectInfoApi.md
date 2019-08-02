The `lightning/uiObjectInfoApi` module includes wire adapters to get object metadata and picklist values. The wire adapters are:
* getObjectInfo
* getPicklistValues
* getPicklistValuesByRecordType

#### `getObjectInfo`

Use this wire adapter to get metadata about a specific object. The response includes metadata describing fields, child relationships, record type, and theme.

**Syntax**
```javascript
import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class Example extends LightningElement {
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    propertyOrFunction;
}
```

**Parameters**
Name|Type|Description
-----|-----|-----
`objectApiName`|String|Required. A [supported object](docs/component-library/documentation/lwc/lwc.reference_supported_objects) like Account or Case.
`propertyOrFunction`|Property or Function|A private property or function that receives the stream of data from the wire service. If a property is decorated with `@wire`, the results are returned to the property's data property or error property. If a function is decorated with `@wire`, the results are returned in an object with a data property and an error property.

**Returns**
* data - [Object Info](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_object_info.htm)
* error - [FetchResponse](docs/component-library/documentation/lwc/lwc.data_error)

#### `getPicklistValues`

Use this wire adapter to get the picklist values for a specified field.

**Syntax**
```javascript
import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class Example extends LightningElement {
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: INDUSTRY_FIELD })
    propertyOrFunction;
}
```

**Parameters**
Name|Type|Description
-----|-----|-----
`recordTypeId`|String|Required.The ID of the record type. Use the Object Info `defaultRecordTypeId` property, which is returned from `getObjectInfo` or `getRecordUi`.
`fieldApiName`|String|Required. The API name of the picklist field on a [supported object](docs/component-library/documentation/lwc/lwc.reference_supported_objects).
`propertyOrFunction`|Property or Function|A private property or function that receives the stream of data from the wire service. If a property is decorated with `@wire`, the results are returned to the property's data property or error property. If a function is decorated with `@wire`, the results are returned in an object with a data property and an error property.

**Returns**
* data - [Picklist Values](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_picklist_values.htm)
* error - [FetchResponse](docs/component-library/documentation/lwc/lwc.data_error)

#### `getPicklistValuesByRecordType`

Use this wire adapter to get the values for every picklist of a specified record type.

**Syntax**
```javascript
import { LightningElement, wire } from 'lwc';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class Example extends LightningElement {
    @wire(getPicklistValuesByRecordType, { objectApiName: ACCOUNT_OBJECT, recordTypeId: '012000000000000AAA' })
    propertyOrFunction
}
```

**Parameters**
Name|Type|Description
-----|-----|-----
`objectApiName`|String|Required. The API name of a [supported object](docs/component-library/documentation/lwc/lwc.reference_supported_objects) like Account or Case.
`recordTypeId`|String|Required.The ID of the record type. Use the Object Info `defaultRecordTypeId` property, which is returned from `getObjectInfo` or `getRecordUi`.
`propertyOrFunction`|Property or Function|A private property or function that receives the stream of data from the wire service. If a property is decorated with `@wire`, the results are returned to the property's data property or error property. If a function is decorated with `@wire`, the results are returned in an object with a data property and an error property.

**Returns**
* data - [Picklist Values Collection](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_picklist_values_collection.htm)
* error - [FetchResponse](docs/component-library/documentation/lwc/lwc.data_error)

#### See Also
[Use the Wire Service to Get Data](docs/component-library/documentation/lwc/lwc.data_wire_service_about)


