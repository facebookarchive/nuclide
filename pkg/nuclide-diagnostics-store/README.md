# nuclide-diagnostics-store

## Overview

`nuclide-diagnostics-store` is responsible for consuming diagnostics from providers and sending
updates to a UI provider.
[`nuclide-diagnostics-ui`](https://github.com/facebook/nuclide/tree/master/pkg/nuclide-diagnostics-ui)
is our UI implementation.

We consume two APIs: Our own provider API, described below, and the
[`linter`](https://atom.io/packages/linter) [package
API](https://github.com/atom-community/linter/wiki/Linter-API) (with some extensions).

The Nuclide API is designed to support a "push" model where providers notify the store
asynchronously about new diagnostics (and when to invalidate old ones). A provider may choose to
publish diagnostics in response to file change events from a `TextEditor`, but it may also report
diagnostics in response to other events, such as file changes that occur outside of Atom. By
comparison, the `linter` API exclusively polls for changes in response to change events from a
`TextEditor`.

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

### Implementing a Provider

You are free to implement a provider using only the specification above, but you will duplicate a
lot of work -- most of it related to subscribing to the appropriate Atom events. To alleviate that
pain, we have created the
[`nuclide-diagnostics-provider-base`](https://github.com/facebook/nuclide/tree/master/pkg/nuclide-diagnostics-provider-base)
feature.

To see it in action, look at our [sample diagnostics
provider](https://github.com/facebook/nuclide/tree/master/pkg/sample/diagnostics-provider).

## Linter API

`nuclide-diagnostics` is compatible with
[providers](https://github.com/atom-community/linter/wiki/Linter-API) for the
[`linter`](https://atom.io/packages/linter) package.

We implement several extensions to the linter API. Here is the type for providers that we accept:

```js
type LinterProvider = {
  /**
   * Extension: Allows a provider to include a display name that will be shown with its messages.
   */
  providerName?: string;
  /**
   * Extension: Intended for developers who want to provide both interfaces to cater towards people
   * who use only the `linter` package. This way you can provide both, but tell Nuclide to ignore
   * the `linter` provider so that duplicate results do not appear.
   */
  disabledForNuclide?: boolean;
  grammarScopes: Array<string>;
  /**
   * Extension: Overrides `grammarScopes` and triggers the linter on changes to any file, rather
   * than just files with specific grammar scopes.
   */
  allGrammarScopes?: boolean;
  scope: 'file' | 'project';
  lintOnFly: boolean;
  lint: (textEditor: TextEditor) => Promise<Array<LinterMessage>>;
};
```
