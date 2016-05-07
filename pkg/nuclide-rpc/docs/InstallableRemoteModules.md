# Installable Remote Modules

Atom packages enable installing new code on the client side.
We don't currently have a way to install new code server side.
Installable Remote Modules enables new services to be added at
runtime, potentially even by packages outside Nuclide.

This will enable 3rd parties to write apm packages which work
correctly with remote nuclide directories.

## Usage

The apm package author must split their implementation into an apm package which runs in Atom,
and an npm package which may be run locally in Atom, or remotely on the Nuclide server. This npm
package is referred to as the 'Remote Module'.

The npm package must be a Remotable Module as described in the Nuclide Remoting Framework document.

### Remote Module Packaging

The remote module must export the implementation of the interface to be remoted.
Also, the un-transpiled interface file must be distributed with the package at the main file name
with the added '.flow' extension. For example with a package.json of:

```js
{
  "name": "sabor",
  "version": "0.6.0",
  "main": "index.js",
}
```

The distributed 'index.js' file contains the transpiled service implementation and the file 'index.js.flow'
must contain the untranspiled service definition file which includes the flow type annotations.

### Client Side Initialization

The apm package calls `NuclideProvider.installRemoteService` during its package install.
Then later it may call `NuclideProvider.getService/ByUri` to get access to the service for a particular
host/NuclideUri:

```js

// The nuclideProvider will be accessed from a TBD atom service-hub
// TODO: Rename nuclideProvider - NuclideRemoteService?
nuclideProvider = ...;

// Install the service from the client side.
await nuclideProvider.installRemoteService('MyService', 'my-npm-module', require);

// Once installed, the new service can be called like any other service.
const myService = await nuclideProvider.getService('MyService', uri);
myService.myServiceApi(...);
```

## Design

Add a new Remote Installation Service to NuclideProvider(D3154676):

```js
// Installs a service, both locally, and on all remote connections.
//  serviceName - the name of the new service. Must be unique.
//  moduleName is the name of the module to be installed. This is the name which can be used
//    with 'require' to locate the module.
//  module - is the client side module. This is typically the result of require(moduleName) by the
//    caller.
// Once called, getService & getServiceByNuclideUri for that service name
installRemoteService(serviceName string, moduleName: string, require: any): Promise<void>;
```

This API will:
- add the new remote service name on the client.
- validate that the client side module is present and has a valid interface. If not, then show errors to the user.
- getting the version number of the module from the module's package.json.

NuclideProvider.getService, will ensure that the requested service is installed on the ServerConnection.
Installation on the ServerConnection will include validating that the server side version number of the
module matches the client version number.

### Client Side

The apm package attempting to install the remote service must include the module in
its package.json dependencies.

### Server Side

The user will manually install the npm module containing the remote service to a well known directory
on the server.

By default the directory for nuclide packages is '~/.nuclide'.

TODO: How enable overriding this dir with an environment variable, or other runtime switch.
