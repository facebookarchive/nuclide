# Nuclide Language Service

This package provides `AtomLanguageService` which makes it easy to add new language integrations to
Nuclide including:

- auto complete
- goto definition(aka hyperclick)
- diagnostic errors and warnings
- outline view
- type coverage
- type hints
- automatic code preview (via context view)
- find references
- code formatting
- debugger expression evaluation

# Overview

Nuclide's language services are designed to provide rich language integration for both local files
as well as for remote files. Enabling remote editing impacts the design of Nuclide's language services.

When connected to a remote server, there are 2 processes: the Atom process which includes all the UI
running locally, and the NuclideServer process running on the remote machine. The Atom process
communicates with the NuclideServer process via the `nuclide-rpc` protocol. Note that the Atom
process contains an instance of the NuclideServer which handles local requests. In this way the
Atom/NuclideServer design handles both local and remote requests.

The `AtomLanguageService` class implements all of the code in the Atom process for integrating a new
language into the Atom UI. It communicates to the NuclideServer via the `LanguageService` interface.
An instance of the `LanguageService` interface provides the language specific analysis.

Creating a new language service includes:
- Adding a new remote package which can create instances of the `LanguageService` RPC interface.
- Adding a new package to Nuclide which creates an instance of `AtomLanguageService` during activation,
  and creates instances of the new `LanguageService` for each new `ServerConnection`.

# Implementing the `LanguageService` Interface

The `LanguageService` interface is a 'nuclide-rpc' compatible interface which provides a low level
API for providing language analysis. The API contains methods for all of the available Nuclide
language services. Add a new package to the `pkg` directory named `nuclide-<new-language>-rpc`.
The `-rpc` suffix indicates that the package runs on the server.

Add an implementation of the `LanguageService` interface to your new package.
Likely your language service will not provide every service. For services that
are unavailable for your language just provide an implementation which throws an exception.

## Using `FileVersion` and `getBufferAtVersion` For File Contents

Most of the APIs in the `LanguageService` interface require a file name and the contents of the file
to perform their operation. Including the entire file contents in each language service request would
be extremely inefficient. Instead, the current file state is sent in a `FileVersion` object.

The `FileVersion` object just contains the file name, version number and notifier. We'll come back
to the notifier in a bit. Note that the version number is internal to the Atom process. Each time
the file is edited (on each keystroke) in the Atom process the version number is incremented.

The `getBufferAtVersion` function in the `nuclide-open-files` package maps from a `FileVersion`
to an Atom compatible `TextBuffer`. This `TextBuffer` is a copy of the one in the Atom process.
It can be used to access the current file contents, map from Atom `Point` and `Range` objects to and
from the file contents. See the documentation at http://atom.io for details.

When the user types several characters in quick succession each character will send an edit to the
server. The first character will likely invoke language service APIs (in particular for
`getAutocompleteSuggestions`). As the autocomplete request is processed, there is a race between the
later edits and the `getBufferAtVersion` call made by autocomplete implementation. If the edit wins
the race the `getAutocompleteSuggestions` will make a request for an outdated version of the file.
When this occurs `getBufferAtVersion` will throw. Just let this exception propagate to the caller
as the request is outdated as well and a later request will come for the newer buffer version.

### `stripped-text-buffer`

Note that these `TextBuffer` objects in the NuclideServer process are stripped down from the full
Atom versions. They cannot save/load from disk, or use the marker portions of the TextBuffer API.
The source for the stripped TextBuffer is in the `simple-text-buffer` npm package if you need details.

## An Example API implementation

Let's take a look at an example API and what a typical implementation might look like. We'll use the

```js
getDefinition(
  fileVersion: FileVersion,
  position: atom$Point,
): Promise<?DefinitionQueryResult>,
```

API in our example. A typical implementation might look like:

```js
async getDefinition(
  fileVersion: FileVersion,
  position: atom$Point,
): Promise<?DefinitionQueryResult> {
  const filePath = fileVersion.filePath;

  // Get the file contents for this request
  // This will throw if the request is out of date...
  // ... that's ok, we'll just let the exception rip.
  const buffer = await getBufferAtVersion(fileVersion);
  const contents = buffer.getText();

  // Call the external language analysis process ...
  const result: ?Array<HackDefinition> = (await callHHClient(
    /* args */ ['--ide-get-definition', formatAtomLineColumn(position)],
    /* errorStream */ false,
    /* processInput */ contents,
    /* cwd */ filePath,
  ): any);
  if (result == null) {
    return null;
  }

  // Convert the result to Nuclide format
  return convertDefinitions(result);
}
```

Remember that if you cannot provide a given service for your language, just have the implementation
throw an Error:

```js
getCoverage(
  filePath: NuclideUri,
): Promise<?CoverageResult> {
  throw new Error('No type coverage information available');
}
```

# Adding Your Server package to the Nuclide Server

Once you have an implementation of the `LanguageService` interface in your new package, add it to the
nuclide server:

- Add an entry in `pkg/nuclide-server/services-3.json` for your new package.
  - The implementation entry is the path to your `LanguageService` implementation.
  - Assign your package a unique service name. Typically: `<my-language>Service`

# Enabling Your New Language in Nuclide

Once you have the `LanguageService` interface implemented for your new language create an Atom
package for your language named `nuclide-<my-language>`. In the package's `activate` method
create a new instance of the `AtomLanguageService` for your new language. Creating an `AtomLanguageService`
requires 2 things: a factory for your `LanguageService` implementation and an `AtomLanguageServiceConfig`
which indicates which services your new language supports.

A simplified version of your Atom package might look like:

```js
import type {ServerConnection} from '../../nuclide-remote-connection';
import typeof * as MyLanguageService from '../../nuclide-my-language-rpc';

import {getServiceByConnection} from '../../nuclide-remote-connection';
import {AtomLanguageService} from '../../nuclide-language-service';

let languageService = null;

async function languageServiceFactory(connection: ?ServerConnection): Promise<LanguageService> {
  const remoteService: MyLanguageService = getServiceByConnection('MyLanguageService', connection);

  // Get my custom configuration, from atom's config object
  const config = getConfig();

  // Create the remote LanguageService
  return remoteService.initialize(
    config);
}

export function activate() {
  languageService = new AtomLanguageService(
    languageServiceFactory,
    {
      name: 'MyLanguage',
      grammars: ['source.mylanguage'],
      outlines: {
        version: '0.0.0',
        priority: 1,
      },
      definition: {
        version: '0.0.0',
        priority: 20,
      },
    });
}

export function deactivate(): void {
  languageService.dispose();
  languageService = null;
}
```

And the nuclide-my-language-rpc implementation would be:

```js
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';

export async function initialize(
  config: MyLanguageConfig,
): Promise<LanguageService> {
  return new MyLanguageService(config);
}

export class MyLanguageService {
  constructor(config: MyLanguageConfig) { ... }

  // Implementation of the LanguageService interface goes here
  // ...
}
```

# Supporting Multiple Connections

A single NuclideServer process can be connected to from multiple Atom processes. A new Atom process
is created for each top level Atom window.
In the example code above, each connected Atom process will call `initialize` and create their own
`MyLanguageService` instance.

Each Atom process could open and edit the same file. Your language service could receive requests
for language services for the same file with wildly different content from 2 connections.

# Tracking Multiple Opened Files with Observable File Events

The `FileVersion` abstraction makes it easy to get the text for the file containing the request.
However, the user may have multiple files open and edited at a given time. The language service
analysis should reflect all of the edits in all open files.

Each connected Atom process creates a `FileCache` in the NuclideServer which tracks the current
state of all open files in the corresponding Atom process. Changes to files can be tracked via
the `observeFileEvents()` method on the `FileCache` instance.

The `FileCache` for a given connection can be retrieved on the Atom process with the `getNotifierByConnection()`
call. Its a good idea to pass this into your initialization function.

So your `languageServiceFactory` becomes:

```js
async function languageServiceFactory(connection: ?ServerConnection): Promise<LanguageService> {
  const remoteService: MyLanguageService = getServiceByConnection('MyLanguageService', connection);

  // Get my custom configuration, from atom's config object
  const config = getConfig();

  // Get the connection specific FileCache ...
  const fileNotifier = await getNotifierByConnection(connection);

  // Create the remote LanguageService
  return remoteService.initialize(
    fileNotifier,
    config);
}
```

And your initialization becomes:

```js
export async function initialize(
  fileNotifier: FileNotifier,
  config: MyLanguageConfig,
): Promise<LanguageService> {
  // The fileNotifier from Atom is always an instance of FileCache.
  invariant(fileNotifier instanceof FileCache);
  const fileCache = (fileNotifier: FileCache);
  return new MyLanguageService(
    fileCache,
    config);
}

export class MyLanguageService {
  constructor(fileCache: FileCache, config: MyLanguageConfig) { ... }

  // Implementation of the LanguageService interface goes here
  // ...
}
```

# Observable Diagnostics

TODO
