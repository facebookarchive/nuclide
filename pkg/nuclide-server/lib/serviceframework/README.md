# Nuclide Service Framework

The classes defined in this directory are used to integrate the service framework proxy-generation and marshalling code with the actual message passing layer. See the `nuclide-service-parser` package for steps related to definition parsing, proxy-generation, and type marshalling.

## ClientComponent
`ClientComponent` is used by the `RemoteConnection` class - all functions related to the service framework are delegated to a `ClientComponent` instance. These functions are `callRemoteFunction`, `createRemoteObject`, `callRemoteMethod`, and `disposeRemoteObject`.

## ServerComponent
`ServerComponent` is used by the `NuclideServer` class - all functions related to the service framework are delegated to a `ServerComponent` instance. All of the messages come in through the `handleMessage` function.

## Types
The file [type.js](./types.js) contains typing for message formats. The `RequestMessage` tagged union encodes the format of possible requests that can be sent from the client to the server, while the `ResponseMessage` union encodes the structure of messages that are sent back.
