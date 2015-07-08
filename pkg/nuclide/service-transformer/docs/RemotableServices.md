# Remotable Services

A remotable service is part of an npm package which may execute locally, or may execute on a remote host.

A remotable service consists of a service specification file, an implementation file and a config which ties the 2 together. The implementation file is designed to run locally and needn't have any knowledge of the remoting process. The remoting infrastructure enables the implementation to be executed on a remote machine when needed.

## Usage

A remotable service consists of a service specification file.

```js
// FileService.js
//
// This file contains the remotable service specification.

// A remotable service may contain functions ...
function getFileList(host: NuclideHost): Promise<Array<NuclideUri>> {}

// ... and interfaces ...
class File {
  constructor(fileUri: NuclideUri) {}

  getName(): Promise<NuclideUri> {}
  readText(): Promise<string> {}

  addOnChange(callback: (file: File): void): Promise<Disposable> {}
}

// ... which must be exported from the service specification file.
module.exports = {
  getFileList,
  File
};
```

Clients of a remotable service use `require('nuclide-remotable-service').getService` instead of standard npm `require` to reference the exports of the remotable service. Usage of a remotable service is just like a regular npm package.

```js
// Client.js
async testFileService(fileName: NuclideUri) {
  var host = require('nuclide-remote-uri').getHost(fileName);

  // getService returns a proxy ...
  var fs = require('nuclide-remotable-service').getService('FileService');

  // ... the proxy entrypoints use their arguments to determine
  // which host to execute on.
  var fileNames = await fs.getFileList(host);
  fileNames.foreach(fileName => console.log(fileName));

  // Remotable entrypoints may include constructors...
  var file = new fs.File(fileName);
  console.log(await file.readText());

  var onChange = async (file: File): void => { console.log(await file.getName()); };

  var disposable = await file.addOnChange(onChange);
  disposable.dispose();
}

// The remotable service may be used with local values, in which case
// the calls to the proxy resolve to the local implementation.
testFileService('/usr/local/local-file.txt');
// With remote values, the proxy dispatches all calls to the remote host.
testFileService('nuclide://myhost.org:22/usr/local/file.txt');
```
The implementation of a remotable service looks just like the implementation of a regular npm module. The implementation is not aware of whether the caller is local or from another host.

```js
// LocalFileService.js
//
// A remotable service includes an implementation for the local host.

require('./FileService');

function getFileList(host: NuclideHostname): Promise<Array<NuclideUri>> {
  return require('fs').readdir('/');
}

class File {
  constructor(fileUri: NuclideUri) {
    this._fileName = fileUri;
    this._callbacks = [];
    this._watcher = null;
  }

  async getName(): Promise<NuclideUri> {
    return this._fileName;
  }

  readText(): Promise<string> {
    return require('fs').readFile(this._fileName);
  }

  async addOnChange(callback: (file: File): void): Promise<Disposable> {
    if (!this._watcher) {
      this._watcher = () => this._fireOnChange();
      require('fs').watchfile(this._fileName, this._watcher);
    }
    this._callbacks.push(callback);
    return { dispose: () => this._removeOnChange(callback) };
  }

  _removeOnChange(callback: (file: File): void): void {
    this._callbacks.remove(callback);
    if (this._callbacks.is_empty() && this._watcher) {
      require('fs').unwatchFile(this._watcher);
      this._watcher = null;
    }
  }

  _fireOnChange() {
    this._callbacks.foreach((callback) => callback(this));
  }
}

// The exports of a service implementation must match the exports
// of the service specification.
module.exports = {
  getFileList,
  File
};
```

## Specification

A remotable service consists of a service specification file, an implementation file and a config. The implementation file is designed to run locally without any knowledge of remoting. The remoting infrastructure enables the implementation to be executed on a remote machine when needed.

Note that an npm package containing a remotable service may also contain code which is not part of the remotable service. An npm package may contain multiple remotable services. An npm package may be a client of remotable services which are implemented in the same package.

### Remotable Service Specification

A remotable service's interface is specified in a service specification file.
A service specification file defines a module.exports similar to a normal node module, however it has a few differences:
- it may only contain
  - remote entrypoint specifications
  - remote interface specifications
  - module.exports
- it may not contain anything else. Specifically;
  - no variables, statements
  - all function bodies must be empty (or are discarded).

Remotable service specification files must export a remote entrypoint.

#### Remote Entrypoints

A remote entrypoint is a function or constructor which can use
its argument list to determine the host where the function should be executed.

Specifically, a remote entrypoint must include at least one host aware
parameter in its signature. It is an error to invoke a remote entrypoint with
multiple host aware parameters where the host aware parameters resolve
to different hosts.

Ex:

```js
// Functions may be remote entrypoints ...
function getFileList(host: NuclideHost): Promise<Array<NuclideUri>> {}

class File {
// ... and constructors may be entrypoints.
  constructor(fileUri: NuclideUri) {}
}
```

An object literal whose field values are remote entrypoints is also a remote entrypoint. This enables a remote service specification to export multiple entrypoints.

Ex:

```js
module.exports = {
  getFileList,
  File
};
```

Note that class methods may be remotable, but they are never remote entrypoints.

#### Host Aware Parameter

A parameter is host aware if the parameter can be used to determine
which host a call must be executed on - the server or the client. Examples include:

- NuclideUri
- NuclideHost
- Any Remotable interface

Note that even though functions are marshalled by reference, they are not
location aware.

Host aware parameters are translated to be relative to the host of the service implementation when marshalled across hosts. The service implementation only sees the local version of the host aware parameters.

TODO: Specifics of translation.

The following are never host aware parameters:
- nullable types

TODO: What about other constructed types: array types, host aware object fields?


#### Remotable API

A remotable API is a function, method (instance or static) or constructor which may be executed on a different host than the caller. A remotable API must have a remotable signature.

A function signature is remotable if:
- arguments are of Remotable Type
- the return type is either void, or Promise of a Remotable Type

##### Remotable Types
- primitives
  - number, string, boolean
- nullable of remotable type
- array of remotable type
- object literal, whose fields are of remotable type
- function with remotable signature
- remotable interfaces
- Any location aware type

Types Which are not Remotable Include:
- classes which are not remotable interfaces
- nullable, array or object literals of non-Remotable type
- functions which are not remotable.
- objects whose fields are of non-remotable types

TODO:
- mixed?
- Union Types?
- Object?
- varargs?

#### Remotable Interfaces

A remotable interface is a class with the following properties:
- all member functions are remotable
- may optionally include a remotable constructor
- static member functions are remote entrypoints

A remote interface with a constructor is a remote entrypoint. Note that a remote interfaces need not be a remote entrypoints. Remote interfaces may also be passed to or returned from remotable APIs.

#### Remotable Constructor

A constructor of a remote interface is remotable if its arguments make it a remote entrypoint.

### Implementing a Remotable Service

A remote service is implemented by a node module. The exports of the remote service implementation must have the same structure (names and types) as the exports of the remote service it is implementing.

The implementation of a remotable service may assume that all host aware arguments to its APIs have been translated to be relative to the local host.

TODO: We should have a tool which verifies this.

### Remotable Service Configuration

A remote service configuration ties together the specification and implementation of a remotable service.

```json
{
  "name": "FileService",
  "specification": "nuclide-file-service/lib/FileService.js",
  "implementation": "nuclide-file-service/lib/FileServiceImpl.js"
}
```

TODO: Specify where this config should live and how the transpilers find them.

## Implementation

Remotable services are implemented by 2 transpilation layers. The first transpilation layer chooses the host to which a remotable entrypoint will be dispatched. The second transpilation layer handles marshalling remotable APIs across hosts.

### Package `nuclide-remotable-service`: Remotable Entrypoint Transpiler

The `nuclide-remotable-service` npm package is the entrypoint for all clients of remotable services. Remotable services are used like regular npm modules however instead of loading them with `require` they are loaded via `require('nuclide-remotable-service').getService`.

#### `getService(serviceName: string): mixed`

`getService` returns a generated module with the shape of the remote service specification's `module.exports`. The entrypoints of the generated module will identify the target host for a call based on the host aware parameters of the call and will then delegate the call to that host. `serviceName` is the name of the service requested. The service name provided must be found in a remotable service configuration.

TODO: Specify the location of remotable service configs. Ideally these would live with their containing npm package. Perhaps as part of their package.json? No - should be independent of package.json...

Example:

For this remotable service specification:

```js
function getFileList(host: NuclideHost): Promise<Array<NuclideUri>> {}

class File {
  constructor(fileUri: NuclideUri) {}

  getName(): Promise<NuclideUri> {}
  readText(): Promise<string> {}

  addOnChange(callback: (file: File): void): Promise<Disposable> {}
}

module.exports = {
  getFileList,
  File
};
```

`getService` would return generated code looking like:

```js
// NOTE: Autogenerated by nuclide-remotable-service
function getFileList(host: NuclideHost): Promise<Array<NuclideUri>> {
  if (require('nuclide-remote-uri').isRemote(host)) {
    return require('nuclide-remote-shim').
      getServiceByUri('FileService', host).getFileList(host);
  } else {
    return require('./FileServiceImpl').getFileList(host);
  }
}

function File(fileUri: NuclideUri) {
  if (require('nuclide-remote-uri').isRemote(fileUri)) {
    return new require('nuclide-remote-shim').
      getServiceByUri('FileService', fileUri).File(fileUri);
  } else {
    return new require('./FileServiceImpl').File(fileUri);
  }
}

module.exports = {
  getFileList,
  File
};
```

The generated shim contains entries for remotable entrypoints only. It does not contain entries for remotable APIs which are not entrypoints.

### Package `nuclide-remote-shim`: Breaking the Dependency Cycle

We want remotable services to be used both from within atom as well as from server npm packages. The code generated by `nuclide-remotable-service` must be able to dispatch calls on remote host aware parameters to the remote server. Adding a static link from this generated code to the server transport layer (aka EventBus) yields a circular package dependency. The `nuclide-remote-shim` package is introduced to break this static cycle.

The `nuclide-remote-shim` package has 2 entrypoints, comprising solely of:

```js
var remotingServiceTransformer:
  (serviceName: string, uri: NuclideUri) => mixed = null;

function getServiceByUri(serviceName: string, uri: NuclideUri) : mixed {
  if (registeredCallback === null) {
    throw new Error('Must register remoting service transformer ' +
      'before invoking remote services.');
  }
  return registeredCallback(string, uri);
}

function registerRemotingServiceTransformer(transformer:
    (serviceName: string, uri: NuclideUri) => mixed): void {
  if (remotingServiceTransformer !== null) {
    throw new Error('Attempt to register multiple remoting services.');
  }
  remotingServiceTransformer = transformer;
}

module.exports = {
  getServiceByUri,
  registerRemotingServiceTransformer
};
```

In atom, `registerRemotingServiceTransformer` must be called before any calls to remotable services are made which must be executed on the server. This can be safely done in the package initialization of the remote transport (aka EventBus). Note that it is an error to make calls on remote (Note remote not remotable) services before package loading in atom is complete.

In the server process, `registerRemotingServiceTransformer` is never called and the `isRemote` branch of the entrypoints generated by `getService` will be dead code. TODO: As an optimization, we could have a `setLocalOnly` method in `nuclide-remotable-service` which when called would cause `getService` to return the remotable service's implementation directly with no generated code. `setLocalOnly` would be called during server package initialization.

Note that the contents of `nuclide-remote-shim` can be merged into `nuclide-remotable-service`. It is identified here separately purely for ease of exposition.

### Package: `nuclide-client`

The `nuclide-client` package calls `registerRemotingServiceTransformer` during package initialization at atom startup time. It ties together the service location, transport layer and remoting stub generation.

TODO: Is nuclide-client the best name here?

### Package: `nuclide-remote-transformer`

The `nuclide-remote-transformer` package generates code to marshal remotable APIs across host machines. The generated code translates host aware parameters to be relative to the destination host, marshals the call to the destination host, and marshals results back from the destination host to the calling host.

TODO: Specific examples of generated remote stubs.
TODO: Identity and marshaling

## Implementation Plan and Priorities

We have a good start on the `nuclide-remote-transformer` package.

Next phase is to enable automatic host dispatch and enable use of remotable services from server packages:
  - enable multiple entrypoints
  - function entrypoints
  - constructor entrypoints
  - `nuclide-remotable-service` getService (aka entrypoint transpiler)
  - `nuclide-remote-shim`

Remaining Work includes:
  - lifetime management of generated proxies. (Likely use dispose and/or weak maps)
  - proxying remaining types (functions, remotable interfaces) as arguments/return values
  - events (Do the previous 2 items give us a good event story?)
  - write a validator which ensures that a service's specification matches its implementation.
