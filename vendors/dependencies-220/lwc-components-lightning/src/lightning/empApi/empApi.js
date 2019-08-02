import {
    _subscribe,
    _unsubscribe,
    _onError,
    _setDebugFlag,
    _isEmpEnabled,
} from 'force/empApiInternal';
/**
 * Exposes the EmpJs Streaming API library which subscribes to a streaming channel and listens to event messages using a shared CometD
 * connection.
 * This component requires API version 44.0 or later.
 *
 */

/**
 * Subscribes to a given channel and returns a promise that holds a subscription object, which you use to unsubscribe later.
 *
 * @param {String} channel - The channel name to subscribe to.
 * @param {Number} replayId - Indicates what point in the stream to replay events from.
 *                            Specify -1 to get new events from the tip of the stream,
 *                            -2 to replay from the last saved event,
 *                            or a specific event replay ID to get all saved and new events after that ID.
 * @param {Function} callback - A callback function that's invoked for every event received.
 */
export const subscribe = _subscribe;

/**
 * Unsubscribes from the channel using the given subscription object and returns a promise. The result of this operation is passed
 * in to the callback function. The result object holds the successful Boolean field which indicates whether the unsubscribe()
 * operation was successful.
 *
 * @param {Object} subscription
 * @param {Function} callback
 */
export const unsubscribe = _unsubscribe;

/**
 * Registers a listener to errors that the server returns.
 *
 * @param {Function} callback - A callback function that's called when an error response is received from the server for handshake,
 *                              connect, subscribe, and unsubscribe meta channels.
 */
export const onError = _onError;

/**
 * Turns console logging on or off.
 *
 * @param {Boolean} flag - Set to true or false to turn console logging on or off respectively.
 */
export const setDebugFlag = _setDebugFlag;

/**
 * @returns a promise that holds a Boolean value. The value is true if the EmpJs Streaming API library can be used in this context;
 * otherwise false.
 */
export const isEmpEnabled = _isEmpEnabled;
