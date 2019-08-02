The `lightning/uiListApi` (Beta) module provides the `getListUi` wire adapter.
`getListUi` gets list view records and metadata for a list view by:
* List view API name
* List view ID
* API name of supported object

You can also get list view records and metadata for an MRU list view by object.

#### Get list view records and metadata by list view API name

**Syntax**
```javascript
import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class Example extends LightningElement {
    @wire(getListUi, { objectApiName: ACCOUNT_OBJECT, listViewApiName: 'AllAccounts' })
    propertyOrFunction;
}
```

**Parameters**
Name|Type|Description
-----|-----|-----
`objectApiName`|String|Required. A [supported object](docs/component-library/documentation/lwc/lwc.reference_supported_objects) like Account or Case.
`listViewApiName`|String|Required. The API name of a list view, such as `AllAccounts`.
`propertyOrFunction`|Property or Function|A private property or function that receives the stream of data from the wire service. If a property is decorated with `@wire`, the results are returned to the property's data property or error property. If a function is decorated with `@wire`, the results are returned in an object with a data property and an error property.

You can also pass the parameters listed in this [Request Parameters table](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_resources_list_views_records_md.htm#request_parameters).

**Returns**
* data - [List UI](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_list_ui.htm)
* error - [FetchResponse](docs/component-library/documentation/lwc/lwc.data_error)

#### Get list view records and metadata by list view ID

**Syntax**
```javascript
import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
export default class Example extends LightningElement {
    @wire(getListUi, { listViewId: '00BT0000001TONQMA4'})
    propertyOrFunction;
}
```

**Parameters**
Name|Type|Description
-----|-----|-----
`listViewId`|String|Required. The ID of a list view.
`propertyOrFunction`|Property or Function|A private property or function that receives the stream of data from the wire service. If a property is decorated with `@wire`, the results are returned to the property’s data property or error property. If a function is decorated with `@wire`, the results are returned in an object with a data property and an error property.

**Returns**
* data - [List UI](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_list_ui.htm)
* error - [FetchResponse](docs/component-library/documentation/lwc/lwc.data_error)

#### Get list view records and metadata by API name of supported object

**Syntax**
```javascript
import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class Example extends LightningElement {
    @wire(getListUi, { objectApiName: ACCOUNT_OBJECT })
    propertyOrFunction;
}
```

**Parameters**
Name|Type|Description
-----|-----|-----
`objectApiName`|String|Required. A [supported object](docs/component-library/documentation/lwc/lwc.reference_supported_objects) like Account or Case.
`propertyOrFunction`|Property or Function|A private property or function that receives the stream of data from the wire service. If a property is decorated with `@wire`, the results are returned to the property's data property or error property. If a function is decorated with `@wire`, the results are returned in an object with a data property and an error property.

You can also pass the parameters listed in this [Request Parameters table](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_resources_list_views_records_md.htm#request_parameters).

**Returns**
* data - [List View Summary Collection](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_list_view_summary_collection.htm)
* error - [FetchResponse](docs/component-library/documentation/lwc/lwc.data_error)

#### Get list view records and metadata for an MRU list view by object

**Syntax**
```javascript
import { LightningElement, wire } from 'lwc';
import { getListUi, MRU } from 'lightning/uiListApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class Example extends LightningElement {
    @wire(getListUi, { objectApiName: ACCOUNT_OBJECT, listViewApiName: MRU })
    propertyOrFunction;
}
```

**Parameters**
Name|Type|Description
-----|-----|-----
`objectApiName`|String|Required. A [supported object](docs/component-library/documentation/lwc/lwc.reference_supported_objects) like Account or Case.
`listViewApiName`|String|Required. The API name of the MRU list view.
`propertyOrFunction`|Property or Function|A private property or function that receives the stream of data from the wire service. If a property is decorated with `@wire`, the results are returned to the property's data property or error property. If a function is decorated with `@wire`, the results are returned in an object with a data property and an error property.

You can also pass the parameters listed in this [Request Parameters table](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_resources_list_views_records_md.htm#request_parameters).

**Returns**
* data - [MRU List Record Collection](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_mru_list_record_collection_representation.htm)
* error - [FetchResponse](docs/component-library/documentation/lwc/lwc.data_error)

#### See Also
[Use the Wire Service to Get Data](docs/component-library/documentation/lwc/lwc.data_wire_service_about)

