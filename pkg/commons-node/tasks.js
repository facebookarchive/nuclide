Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.taskFromObservable = taskFromObservable;
exports.observableFromTask = observableFromTask;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// It's really convenient to model processes with Observables but Atom use a more OO [Task
// interface](https://atom.io/docs/api/latest/Task). These are utilities for converting between the
// two.

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('./UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('./event');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

// FIXME: This should really be an interface, but we're currently transpiling with Babel 5, which
//   doesn't support that.

// Currently, there's only one type of task event (for progress), but there may be more in the
// future.

/**
 * Subscribe to an observable and transform it into the Task interface. The Task interface allows us
 * to interop nicely with Atom and Atom packages without forcing them to use Rx, but internally,
 * Observables are probably how we'll always build the functionality.
 */

function taskFromObservable(observable) {
  var events = observable.share().publish();
  var subscription = undefined;

  return {
    start: function start() {
      if (subscription == null) {
        subscription = events.connect();
      }
    },
    cancel: function cancel() {
      if (subscription != null) {
        subscription.unsubscribe();
      }
    },
    onDidComplete: function onDidComplete(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.subscribe({ complete: callback, error: function error() {} }));
    },
    onDidError: function onDidError(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.subscribe({ error: callback }));
    },
    onProgress: function onProgress(callback) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.filter(function (event) {
        return event.type === 'progress';
      }).map(function (event) {
        (0, (_assert || _load_assert()).default)(event.type === 'progress');
        return event.progress;
      }).subscribe({ next: callback, error: function error() {} }));
    }
  };
}

/**
 * Convert a task to an observable of events.
 */

function observableFromTask(task) {
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var finished = false;

    var events = typeof task.onProgress === 'function' ? (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onProgress.bind(task)).map(function (progress) {
      return { type: 'progress', progress: progress };
    }) : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.never();
    var completeEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onDidComplete.bind(task));
    var errors = (0, (_event || _load_event()).observableFromSubscribeFunction)(task.onDidError.bind(task)).switchMap((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw);

    var subscription = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subscription();

    subscription.add(function () {
      if (!finished) {
        task.cancel();
      }
    });

    subscription.add((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(events, errors).takeUntil(completeEvents).do({
      complete: function complete() {
        finished = true;
      },
      error: function error() {
        finished = true;
      }
    }).subscribe(observer));

    task.start();

    return subscription;
  });
}