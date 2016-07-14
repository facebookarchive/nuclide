'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';
import type {TaskEvent, TaskInfo} from '../nuclide-task-runner/lib/types';

import {DisposableSubscription} from './stream';

/**
 * Subscribe to an observable and transform it into the TaskInfo interface. The TaskInfo interface
 * allows us to interop with other packages without forcing them to use Rx, but internally,
 * Observables are probably how we'll always build the functionality.
 */
export function observableToTaskInfo(observable: Observable<TaskEvent>): TaskInfo {
  const events = observable.share().publish();
  const subscription = events.connect();

  return {
    observeProgress(callback: (progress: ?number) => mixed): IDisposable {
      return new DisposableSubscription(
        events.map(event => event.progress).subscribe({next: callback, error: () => {}})
      );
    },
    onDidComplete(callback: () => mixed): IDisposable {
      return new DisposableSubscription(
        events.subscribe({complete: callback, error: () => {}})
      );
    },
    onDidError(callback: (error: Error) => mixed): IDisposable {
      return new DisposableSubscription(
        events.subscribe({error: callback})
      );
    },
    cancel(): void {
      subscription.unsubscribe();
    },
  };
}
