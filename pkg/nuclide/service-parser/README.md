# Nuclide Service 3.0 Parser

## Types
### Valid Types
- string
- number
- boolean
- NuclideUri
- `Array<T>`, where T is a valid type
- Any Struct Type
- Any Remote Interface Type

Extra Credit:
- Regex and Date

Furthermore, any type can be nullable.

Things that are not allowed:
- Union Types - I don't think it's possible to distinguish between all of the types in a reliable way. Instead, a Union can be represented in Protobuf-like fashion, with a wrapper class that has nullable components.
  ```js
  export type UnionType = {
    a: ?PossibleTypeA;
    b: ?PossibleTypeB;
    c: ?PossibleTypeC;
  }
  ```
- Anonymous Object Types
  ```js
  export function RemoteFunction(): Promise<{propA: string; propB: number;}> {
    ...
  }
  ```
  This can be added in the future.
- Optional Keys in a Struct Type - Unclear how this should differ from a nullable value in a Struct Type.

### Struct Types
Struct types are pass-by-value, in that, when they are returned or passed, their entire contents are sent over the wire.

### Interface
Interfaces are pass-by-reference. When they are returned from the server, the RPC framework returns a unique ID for the object. On the client side, this is wrapped inside of a proxy object, where methods can be dispatched as if the object was present locally.

### Return Types
Functions or methods can return one of three things.

#### `Void`
Methods that return `void` are fire-and-forget. They have no concept of completion, and the client is never returned a result.

#### `Promise<A>`
Methods can return a `Promise<A>`, where `A` is any valid type.

#### `Observable<A>`
Methods can return a `Promise<A>`, where `A` is any valid type.


## Marshalling / Unmarshalling
Every type actually has four transformation functions - it has a Marshaller and an Unmarshaller on both the client and the server. See the table below for why four separate actions are required in the case of Remotable Interfaces.

| Location | Marshaller | Unmarshaller |
|----------|---------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Server | Return the Object's ID as a string. If the Object doesn't have an ID, generate one and put it into a map that keys from ID => Object. | Lookup the string ID in the global registry and return the Object. |
| Client | Extract the ID of the Proxy Object, and send it as a string. | Return the Proxy object associated from the string ID. If no proxy exists, create one and bake in the ID. |
