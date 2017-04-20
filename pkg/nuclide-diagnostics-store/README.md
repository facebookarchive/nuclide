# nuclide-diagnostics-store

## Overview

`nuclide-diagnostics-store` is responsible for consuming diagnostics from providers and sending
updates to a UI provider.
[`nuclide-diagnostics-ui`](https://github.com/facebook/nuclide/tree/master/pkg/nuclide-diagnostics-ui)
is our UI implementation.

We consume two APIs: Our own provider API, described below, and the
[`linter`](https://atom.io/packages/linter) [package
API](http://steelbrain.me/linter) (with some extensions).

The Nuclide API is designed to support a "push" model where providers notify the store
asynchronously about new diagnostics (and when to invalidate old ones). A provider may choose to
publish diagnostics in response to file change events from a `TextEditor`, but it may also report
diagnostics in response to other events, such as file changes that occur outside of Atom. By
comparison, the `linter` API exclusively polls for changes in response to change events from a
`TextEditor`.

For simple use cases, we recommend just using the pull-based Linter API.

## Provider API

### API Overview

The Flow types that describe a provider are available in
[`types.js`](https://github.com/facebook/nuclide/blob/master/pkg/nuclide-diagnostics-common/lib/types.js).
A `DiagnosticProvider`, in particular, is simply an object that allows a consumer to register for
two events:

```js
type DiagnosticProvider = {
  onMessageUpdate: (callback: MessageUpdateCallback) => Disposable;
  onMessageInvalidation: (callback: MessageInvalidationCallback) => Disposable;
};
```

Where the callbacks are:

```js
type MessageUpdateCallback = (update: DiagnosticProviderUpdate) => mixed;
type MessageInvalidationCallback = (message: InvalidationMessage) => mixed;
```

And the messages themselves are:

```js
type DiagnosticProviderUpdate = {
  filePathToMessages?: Map<string, Array<FileDiagnosticMessage>>;
  projectMessages?: Array<ProjectDiagnosticMessage>;
};

type FileDiagnosticMessage = {
  scope: 'file';
  providerName: string;
  type: MessageType;
  filePath: string;
  text?: string;
  html?: string;
  range?: Range;
  trace?: Array<Trace>;
};

type ProjectDiagnosticMessage = {
  scope: 'project';
  providerName: string;
  type: MessageType;
  text?: string;
  html?: string;
  range?: Range;
  trace?: Array<Trace>;
};

type Trace = {
  type: 'Trace';
  text?: string;
  html?: string;
  filePath: string;
  range?: Range;
};

type InvalidationMessage = {
  scope: 'file';
  filePaths: Array<string>;
} | {
  scope: 'project';
} | {
  scope: 'all';
};
```

Note that when an update is sent, any file names that are keys in `filePathToMessages` implicitly
have their previous messages invalidated. This means that simple providers that act only on the
currently active file need not ever send an invalidation message.

## Linter API

`nuclide-diagnostics` is compatible with the
[Standard Linter v1 API](https://github.com/steelbrain/linter/blob/v1/docs/types/standard-linter-v1.md)
for the [`linter`](https://atom.io/packages/linter) package.
