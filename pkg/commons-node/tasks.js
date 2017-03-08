'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.taskFromObservable = taskFromObservable;
exports.observableFromTask = observableFromTask;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('./UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('./event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Subscribe to an observable and transform it into the Task interface. The Task interface allows us
 * to interop nicely with Atom and Atom packages without forcing them to use Rx, but internally,
 * Observables are probably how we'll always build the functionality.
 */


// FIXME: This should really be an interface, but we're currently transpiling with Babel 5, which
//   doesn't support that.


// Currently, there's only one type of task event (for progress), but there may be more in the
// future.
function taskFromObservable(observable) {
  const events = observable.share().publish();
  let subscription;

  return {
    start() {
      if (subscription == null) {
        subscription = events.connect();
      }
    },
    cancel() {
      if (subscription != null) {
        subscription.unsubscribe();
      }
    },
    onDidComplete(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.subscribe({ complete: callback, error: () => {} }));
    },
    onDidError(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.subscribe({ error: callback }));
    },
    onProgress(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.filter(event => event.type === 'progress').map(event => {
        if (!(event.type === 'progress')) {
          throw new Error('Invariant violation: "event.type === \'progress\'"');
        }

        return event.progress;
      }).subscribe({ next: callback, error: () => {} }));
    }
  };
}

/**
 * Convert a task to an observable of events.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

// It's really convenient to model processes with Observables but Atom use a more OO [Task
// interface](https://atom.io/docs/api/latest/Task). These are utilities for converting between the
// two.

function observableFromTask(task) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let finished = false;

    const events = typeof task.onProgress === 'function' ? (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onProgress.bind(task)).map(progress => ({ type: 'progress', progress })) : _rxjsBundlesRxMinJs.Observable.never();
    const completeEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onDidComplete.bind(task));
    const errors = (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onDidError.bind(task)).switchMap(_rxjsBundlesRxMinJs.Observable.throw);

    const subscription = new _rxjsBundlesRxMinJs.Subscription();

    subscription.add(() => {
      if (!finished) {
        task.cancel();
      }
    });

    subscription.add(_rxjsBundlesRxMinJs.Observable.merge(events, errors).takeUntil(completeEvents).do({
      complete: () => {
        finished = true;
      },
      error: () => {
        finished = true;
      }
    }).subscribe(observer));

    task.start();

    return subscription;
  });
}