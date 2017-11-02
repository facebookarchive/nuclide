'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.taskFromObservable = taskFromObservable;
exports.observableFromTask = observableFromTask;
exports.createMessage = createMessage;
exports.createResult = createResult;
exports.createStatus = createStatus;
exports.createStep = createStep;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
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
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

// It's really convenient to model processes with Observables but Atom use a more OO [Task
// interface](https://atom.io/docs/api/latest/Task). These are utilities for converting between the
// two.

function taskFromObservable(observable) {
  const events = observable.share().publish();
  let subscription;

  const task = {
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
    onMessage(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.filter(event => event.type === 'message').map(event => {
        if (!(event.type === 'message')) {
          throw new Error('Invariant violation: "event.type === \'message\'"');
        }

        return event.message;
      }).subscribe({ next: callback, error: () => {} }));
    },
    onProgress(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.filter(event => event.type === 'progress').map(event => {
        if (!(event.type === 'progress')) {
          throw new Error('Invariant violation: "event.type === \'progress\'"');
        }

        return event.progress;
      }).subscribe({ next: callback, error: () => {} }));
    },
    onResult(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.filter(event => event.type === 'result').map(event => {
        if (!(event.type === 'result')) {
          throw new Error('Invariant violation: "event.type === \'result\'"');
        }

        return event.result;
      }).subscribe({ next: callback, error: () => {} }));
    },
    onStatusChange(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.filter(event => event.type === 'status').map(event => {
        if (!(event.type === 'status')) {
          throw new Error('Invariant violation: "event.type === \'status\'"');
        }

        return event.status;
      }).subscribe({ next: callback, error: () => {} }));
    }
  };
  return task;
}

/**
 * Convert a task to an observable of events.
 */
function observableFromTask(task) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let finished = false;

    const messages = typeof task.onMessage === 'function' ? (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onMessage.bind(task)).map(message => ({ type: 'message', message })) : _rxjsBundlesRxMinJs.Observable.never();
    const progresses = typeof task.onProgress === 'function' ? (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onProgress.bind(task)).map(progress => ({ type: 'progress', progress })) : _rxjsBundlesRxMinJs.Observable.never();
    const results = typeof task.onResult === 'function' ? (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onResult.bind(task)).map(result => ({ type: 'result', result })) : _rxjsBundlesRxMinJs.Observable.never();
    const statuses = typeof task.onStatusChange === 'function' ? (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onStatusChange.bind(task)).map(status => ({ type: 'status', status })) : _rxjsBundlesRxMinJs.Observable.never();

    const completeEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onDidComplete.bind(task));
    const errors = (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onDidError.bind(task)).switchMap(_rxjsBundlesRxMinJs.Observable.throw);

    const subscription = new _rxjsBundlesRxMinJs.Subscription();

    subscription.add(() => {
      if (!finished) {
        task.cancel();
      }
    });

    subscription.add(_rxjsBundlesRxMinJs.Observable.merge(messages, progresses, results, statuses, errors).takeUntil(completeEvents).do({
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

function createMessage(text, level) {
  return _rxjsBundlesRxMinJs.Observable.of({
    type: 'message',
    message: { text, level }
  });
}

function createResult(result) {
  return _rxjsBundlesRxMinJs.Observable.of({
    type: 'result',
    result
  });
}

function createStatus(status) {
  return _rxjsBundlesRxMinJs.Observable.of({ type: 'status', status });
}

function createStep(stepName, action) {
  return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of({ type: 'progress', progress: null }),
  // flowlint-next-line sketchy-null-string:off
  stepName ? _rxjsBundlesRxMinJs.Observable.of({ type: 'status', status: stepName }) : _rxjsBundlesRxMinJs.Observable.empty(), _rxjsBundlesRxMinJs.Observable.defer(action));
}