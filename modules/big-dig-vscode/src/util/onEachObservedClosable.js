/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Observable} from 'rxjs';
import type {AnyTeardown as UniversalAnyTeardownType} from 'nuclide-commons/UniversalDisposable';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {isPromise} from 'nuclide-commons/promise';

export type AnyTeardown =
  | ?UniversalAnyTeardownType
  | Promise<?UniversalAnyTeardownType>;

/**
 * Applies a construct-destruct pattern to a stream of resources that can be
 * closed/disposed. This is useful for services that need to be registered
 * when a resource (e.g. a filesystem or active connection) becomes available,
 * and torn down when the resource is no longer available. The main point of
 * this function is to control when the services are torn down and make sure
 * that everything is disposed of properly.
 *
 * @param observable a stream of resources; `handler` will be called on each.
 * @param handler a callback that listens for resources and returns a disposable
 * to be called when the resource is no longer available. The returned
 * disposable may be `null` (do nothing), implement `IDisposable`, implement
 * `ISubscription`, be a function (it will be called), or else a `Promise` to
 * the aforementioned.
 * @param onDisposed a function to register a listener for when a resource is
 * no longer available. It should itself return a disposable to stop listening
 * for this event.
 * @param options
 * - `disposeHandlersOnUnsubscribe` - dispose all handlers upon unsubscription.
 * - `disposeHandlerOnNext` - if a handler is active and another resource is
 *    observed, then first dispose the current handler before handling the next.
 *    If the first disposable is a `Promise`, then there is no guarantee that it
 *    will complete before the next handler is run.
 * @return a disposable that will unsubscribe from `observable`. If
 * `disposeHandlersOnUnsubscribe` is true, then all active handlers will also be
 * disposed.
 */
export default function onEachObservedClosable<T>(
  observable: Observable<T>,
  handler: T => AnyTeardown,
  onDisposed: (T, () => mixed) => IDisposable,
  options: {
    disposeHandlersOnUnsubscribe?: boolean,
    disposeHandlerOnNext?: boolean,
  } = {},
): IDisposable {
  const disposeOnUnsubscribe = options.disposeHandlersOnUnsubscribe || false;
  const disposeHandlerOnNext = options.disposeHandlerOnNext || false;

  // Stops listening to observable and possibly disposes all handlers.
  const unsubscribe = new UniversalDisposable();

  let currentCleanup: ?UniversalDisposable = null;

  unsubscribe.add(
    observable.subscribe(item => {
      if (disposeHandlerOnNext && currentCleanup != null) {
        currentCleanup.dispose();
      }

      const teardown: any = handler(item);
      const cleanup = (currentCleanup = new UniversalDisposable());

      cleanup.add(
        () => dispose(teardown),
        onDisposed(item, () => {
          // Don't keep around a long list of disposed disposables (in case
          // disposeOnUnsubscribe is true).
          unsubscribe.remove(cleanup);

          cleanup.dispose();
        }),
      );

      if (disposeOnUnsubscribe) {
        // Unsubscribing will cause any active services/handlers to be disposed.
        unsubscribe.add(cleanup);
      }
    }),
  );
  return unsubscribe;
}

/**
 * Helper to dispose of `AnyTeardown`.
 */
function dispose(teardown: any): void {
  if (teardown == null) {
    return;
  }

  if (isPromise(teardown)) {
    teardown.then(dispose);
  } else if (typeof teardown.dispose === 'function') {
    teardown.dispose();
  } else if (typeof teardown.unsubscribe === 'function') {
    teardown.unsubscribe();
  } else if (typeof teardown === 'function') {
    teardown();
  }
}
