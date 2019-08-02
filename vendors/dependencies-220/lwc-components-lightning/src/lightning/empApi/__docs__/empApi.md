The `lightning/empApi` module provides access to methods for subscribing to a streaming channel and listening to event messages. All streaming channels are supported, including channels for platform events, PushTopic events, generic events, and Change Data Capture events. This component requires API version 44.0 or later.

The `lightning/empApi` module uses a shared CometD connection.

In a component's Javascript file, import methods from the `lightning/empApi` module using this syntax.

```javascript
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
```

The available methods are described below.

This example subscribes to a streaming channel when you click the Subscribe button. It logs received event messages to the JavaScript console in your browser. The Unsubscribe button lets you stop the subscription and stop receiving event messages. This example uses the default streaming channel of `/event/Test__e` and assumes that the `Test__e` platform event is defined. Replace the default value with the desired channel name.

```html
<template>
    <lightning-card title="EmpApi Example" icon-name="custom:custom14">
        <div class="slds-m-around_medium">
            <p>Use the buttons below to subscribe and unsubscribe to a streaming channel!</p>
            <lightning-input label="Channel Name" value={channelName}
                onchange={handleChannelName}></lightning-input>
            <lightning-button variant="success" label="Subscribe" title="Subscribe"
                onclick={handleSubscribe} disabled={isSubscribeDisabled}
                class="slds-m-left_x-small"></lightning-button>
            <lightning-button variant="destructive" label="Unsubscribe" title="Unsubscribe"
                onclick={handleUnsubscribe} disabled={isUnsubscribeDisabled}
                class="slds-m-left_x-small"></lightning-button>
        </div>
    </lightning-card>
</template>
```

In the component's JavaScript, event handlers invoke `empApi` methods.

```javascript
import { LightningElement, track } from 'lwc';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';

export default class EmpApiLWC extends LightningElement {
    @track channelName = '/event/Test__e';
    @track isSubscribeDisabled = false;
    @track isUnsubscribeDisabled = !this.isSubscribeDisabled;

    subscription = {};

    // Tracks changes to channelName text field
    handleChannelName(event) {
        this.channelName = event.target.value;
    }

    // Handles subscribe button click
    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const messageCallback = function(response) {
            console.log('New message received : ', JSON.stringify(response));
            // Response contains the payload of the new message received
        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback).then(response => {
            // Response contains the subscription information on successful subscribe call
            console.log('Successfully subscribed to : ', JSON.stringify(response.channel));
            this.subscription = response;
            this.toggleSubscribeButton(true);
        });
    }

    // Handles unsubscribe button click
    handleUnsubscribe() {
        this.toggleSubscribeButton(false);

        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }

    toggleSubscribeButton(enableSubscribe) {
        this.isSubscribeDisabled = enableSubscribe;
        this.isUnsubscribeDisabled = !enableSubscribe;
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }
}
```

#### Usage Considerations

The `lightning/empApi` module is supported in desktop browsers with web worker or shared worker support. For more information about web workers and browser support, see the [Web Workers W3C specification](https://www.w3.org/TR/workers/) and [Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) in the Mozilla Developer Network documentation.

#### Methods

**`subscribe`**

Subscribes to a given channel and returns a promise that holds a subscription object, which you use to unsubscribe later.

Parameter|Type|Description
-----|-----|----------
channel|string|The channel name to subscribe to.
replayId|number|Indicates what point in the stream to replay events from. Specify -1 to get new events from the tip of the stream, -2 to replay from the last saved event, or a specific event replay ID to get all saved and new events after that ID.
onMessageCallback|function|A callback function that's invoked for every event received.


**`unsubscribe`**

Unsubscribes from the channel using the given subscription object and returns a promise. The result of this operation is passed in to the callback function. The result object holds the successful boolean field which indicates whether the `unsubscribe` operation was successful. The result fields are based on the CometD protocol for the unsubscribe operation. See [CometD Reference Doc](https://docs.cometd.org/current3/reference/#_bayeux_meta_unsubscribe).

Parameter|Type|Description
-----|-----|----------
subscription|object|Subscription object that the subscribe call returned.
callback|function|A callback function that's called with a server response for the unsubscribe call.


**`onError`**

Registers a listener to errors that the server returns.

Parameter|Type|Description
-----|-----|----------
callback|function|A callback function that's called when an error response is received from the server for handshake, connect, subscribe, and unsubscribe meta channels.


**`setDebugFlag`**

Set to true or false to turn console logging on or off respectively.

Parameter|Type|Description
-----|-----|----------
flag|boolean|Set to true or false to turn console logging on or off respectively.


**`isEmpEnabled`**

Returns a promise that holds a Boolean value. The value is true if the EmpJs Streaming API library can be used in this context; otherwise false.

#### See Also
* [Platform Events Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_intro.htm)
* [Streaming API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_streaming.meta/api_streaming/intro_stream.htm)
