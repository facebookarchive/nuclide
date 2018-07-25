"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.taskFromObservable = taskFromObservable;
exports.observableFromTask = observableFromTask;
exports.createMessage = createMessage;
exports.createResult = createResult;
exports.createStatus = createStatus;
exports.createStep = createStep;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Subscribe to an observable and transform it into the Task interface. The Task interface allows us
 * to interop nicely with Atom and Atom packages without forcing them to use Rx, but internally,
 * Observables are probably how we'll always build the functionality.
 */
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
      return new (_UniversalDisposable().default)(events.subscribe({
        complete: callback,
        error: () => {}
      }));
    },

    onDidError(callback) {
      return new (_UniversalDisposable().default)(events.subscribe({
        error: callback
      }));
    },

    onMessage(callback) {
      return new (_UniversalDisposable().default)(events.filter(event => event.type === 'message').map(event => {
        if (!(event.type === 'message')) {
          throw new Error("Invariant violation: \"event.type === 'message'\"");
        }

        return event.message;
      }).subscribe({
        next: callback,
        error: () => {}
      }));
    },

    onProgress(callback) {
      return new (_UniversalDisposable().default)(events.filter(event => event.type === 'progress').map(event => {
        if (!(event.type === 'progress')) {
          throw new Error("Invariant violation: \"event.type === 'progress'\"");
        }

        return event.progress;
      }).subscribe({
        next: callback,
        error: () => {}
      }));
    },

    onResult(callback) {
      return new (_UniversalDisposable().default)(events.filter(event => event.type === 'result').map(event => {
        if (!(event.type === 'result')) {
          throw new Error("Invariant violation: \"event.type === 'result'\"");
        }

        return event.result;
      }).subscribe({
        next: callback,
        error: () => {}
      }));
    },

    onStatusChange(callback) {
      return new (_UniversalDisposable().default)(events.filter(event => event.type === 'status').map(event => {
        if (!(event.type === 'status')) {
          throw new Error("Invariant violation: \"event.type === 'status'\"");
        }

        return event.status;
      }).subscribe({
        next: callback,
        error: () => {}
      }));
    }

  };
  return task;
}
/**
 * Convert a task to an observable of events.
 */


function observableFromTask(task) {
  return _RxMin.Observable.create(observer => {
    let finished = false;
    const messages = typeof task.onMessage === 'function' ? (0, _event().observableFromSubscribeFunction)(task.onMessage.bind(task)).map(message => ({
      type: 'message',
      message
    })) : _RxMin.Observable.never();
    const progresses = typeof task.onProgress === 'function' ? (0, _event().observableFromSubscribeFunction)(task.onProgress.bind(task)).map(progress => ({
      type: 'progress',
      progress
    })) : _RxMin.Observable.never();
    const results = typeof task.onResult === 'function' ? (0, _event().observableFromSubscribeFunction)(task.onResult.bind(task)).map(result => ({
      type: 'result',
      result
    })) : _RxMin.Observable.never();
    const statuses = typeof task.onStatusChange === 'function' ? (0, _event().observableFromSubscribeFunction)(task.onStatusChange.bind(task)).map(status => ({
      type: 'status',
      status
    })) : _RxMin.Observable.never();
    const completeEvents = (0, _event().observableFromSubscribeFunction)(task.onDidComplete.bind(task));
    const errors = (0, _event().observableFromSubscribeFunction)(task.onDidError.bind(task)).switchMap(_RxMin.Observable.throw);
    const subscription = new _RxMin.Subscription();
    subscription.add(() => {
      if (!finished) {
        task.cancel();
      }
    });
    subscription.add(_RxMin.Observable.merge(messages, progresses, results, statuses, errors).takeUntil(completeEvents).do({
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
  return _RxMin.Observable.of({
    type: 'message',
    message: {
      text,
      level
    }
  });
}

function createResult(result) {
  return _RxMin.Observable.of({
    type: 'result',
    result
  });
}

function createStatus(status) {
  return _RxMin.Observable.of({
    type: 'status',
    status
  });
}

function createStep(stepName, action) {
  return _RxMin.Observable.concat(_RxMin.Observable.of({
    type: 'progress',
    progress: null
  }), // flowlint-next-line sketchy-null-string:off
  stepName ? _RxMin.Observable.of({
    type: 'status',
    status: stepName
  }) : _RxMin.Observable.empty(), _RxMin.Observable.defer(action));
}