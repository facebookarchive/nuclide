# nuclide-diagnostics-provider-base

This feature solves some common problems for diagnostics providers. It manages consumer
subscriptions and also subscribes to the appropriate text editor events, such as file save.

Take a look at our [sample diagnostics
provider](https://github.com/facebook/nuclide/tree/master/pkg/sample/diagnostics-provider) to see
this in action.

The `DiagnosticsProviderBase` constructor takes a single argument: A `ProviderBaseOptions` object.

```js
type ProviderBaseOptions = {
  /** The callback by which a provider is notified of text events, such as a file save. */
  onTextEditorEvent?: (editor: TextEditor) => mixed;
  /**
   * The callback by which a provider is notified that a new consumer has subscribed to diagnostic
   * updates.
   */
  onNewUpdateSubscriber?: (callback: MessageUpdateCallback) => mixed;
  /**
   * The callback by which a provider is notified that a new consumer has subscribed to diagnostic
   * invalidations.
   */
  onNewInvalidateSubscriber?: (callback: MessageInvalidationCallback) => mixed;
  /**
   * If true, this will cause onTextEditorEvent to get called more often -- approximately whenever
   * the user stops typing. If false, it will get called only when the user saves.
   */
  shouldRunOnTheFly?: boolean;
  /**
   * The following two options specify which grammars the provider is interested in. Most providers
   * will include a set of grammarScopes, and will therefore get notifications only about
   * TextEditors that are associated with those grammarScopes. Instead, a provider may set
   * enableForAllGrammars to true, and then it will get notified of changes in all TextEditors. If
   * enableForAllGrammars is true, it overrides the grammars in grammarScopes.
   */
  grammarScopes?: Set<string>;
  enableForAllGrammars?: boolean;
}
```

A provider should delegate to a `DiagnosticsProviderBase` object once it is constructed.

A provider should call `providerBase.publishMessageUpdate(update)` and
`providerBase.publishMessageInvalidation(invalidation)` when they wish to publish messages. In most
cases, these should be called, directly or indirectly, from the callback passed as
`onTextEditorEvent` in the options.

A provider may call `providerBase.setRunOnTheFly(runOnFly)` to alter this setting after it has been
constructed. This is useful if you would like to provide a setting to allow users to change this at
will.

A provider should delegate to `providerBase.onMessageUpdate(callback)` and
`providerBase.onMessageInvalidation(callback)` to allow the provider base to manage event
subscriptions.
