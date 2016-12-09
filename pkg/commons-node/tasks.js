/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

// It's really convenient to model processes with Observables but Atom use a more OO [Task
// interface](https://atom.io/docs/api/latest/Task). These are utilities for converting between the
// two.

import UniversalDisposable from './UniversalDisposable';
import {observableFromSubscribeFunction} from './event';
import invariant from 'assert';
import {Observable, Subscription} from 'rxjs';

// FIXME: This should really be an interface, but we're currently transpiling with Babel 5, which
//   doesn't support that.
export type Task = {
  start: () => void,
  cancel: () => void,
  onDidComplete: (callback: () => mixed) => IDisposable,
  onDidError: (callback: (err: Error) => mixed) => IDisposable,
  onProgress?: (callback: (progress: ?number) => mixed) => IDisposable,
};

type ProgressEvent = {
  type: 'progress',
  progress: ?number,
};

// Currently, there's only one type of task event (for progress), but there may be more in the
// future.
export type TaskEvent = ProgressEvent;

/**
 * Subscribe to an observable and transform it into the Task interface. The Task interface allows us
 * to interop nicely with Atom and Atom packages without forcing them to use Rx, but internally,
 * Observables are probably how we'll always build the functionality.
 */
export function taskFromObservable(observable: Observable<TaskEvent>): Task {
  const events = observable.share().publish();
  let subscription;

  return {
    start(): void {
      if (subscription == null) {
        subscription = events.connect();
      }
    },
    cancel(): void {
      if (subscription != null) {
        subscription.unsubscribe();
      }
    },
    onDidComplete(callback: () => mixed): IDisposable {
      return new UniversalDisposable(
        events.subscribe({complete: callback, error: () => {}}),
      );
    },
    onDidError(callback: (err: Error) => mixed): IDisposable {
      return new UniversalDisposable(events.subscribe({error: callback}));
    },
    onProgress(callback: (progress: ?number) => mixed): IDisposable {
      return new UniversalDisposable(
        events
          .filter(event => event.type === 'progress')
          .map(event => {
            invariant(event.type === 'progress');
            return event.progress;
          })
          .subscribe({next: callback, error: () => {}}),
      );
    },
  };
}

/**
 * Convert a task to an observable of events.
 */
export function observableFromTask(task: Task): Observable<TaskEvent> {
  return Observable.create(observer => {
    let finished = false;

    const events = typeof task.onProgress === 'function'
      ? observableFromSubscribeFunction(task.onProgress.bind(task))
          .map(progress => ({type: 'progress', progress}))
      : Observable.never();
    const completeEvents = observableFromSubscribeFunction(task.onDidComplete.bind(task));
    const errors = observableFromSubscribeFunction(task.onDidError.bind(task))
      .switchMap(Observable.throw);

    const subscription = new Subscription();

    subscription.add(() => {
      if (!finished) {
        task.cancel();
      }
    });

    subscription.add(
      Observable.merge(events, errors)
        .takeUntil(completeEvents)
        .do({
          complete: () => { finished = true; },
          error: () => { finished = true; },
        })
        .subscribe(observer),
    );

    task.start();

    return subscription;
  });
}
