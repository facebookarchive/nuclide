'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogTailer = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ConsoleContainer;

function _load_ConsoleContainer() {
  return _ConsoleContainer = require('./ui/ConsoleContainer');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A utility for writing packages that tail log sources. Just give it a cold observable and let it
 * handle the rest.
 *
 * This class:
 *   1. Provides an imperative interface to the underlying observable. (`start()`, `stop()`)
 *   2. Manages subscriptions to treat the process like a singleton.
 *   3. Exposes a way of observing the status of the process.
 *   4. Provides centralized (and fallback) error handling for errors that occur during the
 *      "startup" phase (before the process has signalled that it's ready), and afterwards.
 */
class LogTailer {

  constructor(options) {
    this._name = options.name;
    this._eventNames = options.trackingEvents;
    this._errorHandler = options.handleError;
    const messages = options.messages.share();
    this._ready = options.ready == null ? null : // Guard against a never-ending ready stream.
    // $FlowFixMe: Add `materialize()` to Rx defs
    options.ready.takeUntil(messages.materialize().takeLast(1));
    this._runningCallbacks = [];
    this._startCount = 0;
    this._statuses = new _rxjsBundlesRxMinJs.BehaviorSubject('stopped');

    this._messages = _rxjsBundlesRxMinJs.Observable.merge(messages, this._ready == null ? _rxjsBundlesRxMinJs.Observable.empty() : this._ready.ignoreElements()).do({
      complete: () => {
        // If the process completed without ever entering the "running" state, invoke the
        // `onRunning` callback with a cancellation error.
        this._invokeRunningCallbacks(new ProcessCancelledError(this._name));
        this._stop();
      }
    }).catch(err => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-console').error(`Error with ${this._name} tailer.`, err);
      const wasStarting = this._statuses.getValue() === 'starting';
      this._stop(false);

      let errorWasHandled = wasStarting && !this._invokeRunningCallbacks(err);

      // Give the LogTailer instance a chance to handle it.
      if (!errorWasHandled && this._errorHandler != null) {
        try {
          this._errorHandler(err);
          errorWasHandled = true;
        } catch (errorHandlerError) {
          if (err !== errorHandlerError) {
            // Uh oh. Another error was raised while handling this one!
            throw errorHandlerError;
          }
        }
      }

      if (!errorWasHandled) {
        // Default error handling.
        const message = `An unexpected error occurred while running the ${this._name} process` + (err.message ? `:\n\n**${err.message}**` : '.');
        const notification = atom.notifications.addError(message, {
          dismissable: true,
          detail: err.stack == null ? '' : err.stack.toString(),
          buttons: [{
            text: `Restart ${this._name}`,
            className: 'icon icon-sync',
            onDidClick: () => {
              notification.dismiss();
              this.restart();
            }
          }]
        });
      }

      return _rxjsBundlesRxMinJs.Observable.empty();
    }).share().publish();

    // Whenever the status becomes "running," invoke all of the registered running callbacks.
    this._statuses.distinctUntilChanged().filter(status => status === 'running').subscribe(() => {
      this._invokeRunningCallbacks();
    });
  }

  start(options) {
    this._startCount += 1;
    if (options != null && options.onRunning != null) {
      this._runningCallbacks.push(options.onRunning);
    }
    this._start(true);
  }

  stop() {
    // If the process is explicitly stopped, call all of the running callbacks with a cancelation
    // error.
    this._startCount = 0;
    this._runningCallbacks.forEach(cb => {
      cb(new ProcessCancelledError(this._name));
    });

    this._stop();
  }

  restart() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(this._eventNames.restart);
    this._stop(false);
    this._start(false);
  }

  observeStatus(cb) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._statuses.subscribe(cb));
  }

  /**
   * Invoke the running callbacks. Returns true if the error wasn't handled; otherwise false.
   */
  _invokeRunningCallbacks(err) {
    // Invoke all of the registered running callbacks.
    if (this._runningCallbacks.length > 0) {
      this._runningCallbacks.forEach(cb => {
        if (err == null) {
          cb();
        } else {
          cb(err);
        }
      });
    }

    const unhandledError = err != null && this._startCount !== this._runningCallbacks.length;
    this._runningCallbacks = [];
    this._startCount = 0;
    return unhandledError;
  }

  _start(trackCall) {
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open((_ConsoleContainer || _load_ConsoleContainer()).WORKSPACE_VIEW_URI, { searchAllPanes: true });

    const currentStatus = this._statuses.getValue();
    if (currentStatus === 'starting') {
      return;
    } else if (currentStatus === 'running') {
      this._invokeRunningCallbacks();
      return;
    }

    if (trackCall) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(this._eventNames.start);
    }

    // If the LogTailer was created with a way of detecting when the source was ready, the initial
    // status is "starting." Otherwise, assume that it's started immediately.
    const initialStatus = this._ready == null ? 'running' : 'starting';
    this._statuses.next(initialStatus);

    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }

    const sub = new _rxjsBundlesRxMinJs.Subscription();
    if (this._ready != null) {
      sub.add(this._ready
      // Ignore errors here. We'll catch them above.
      .catch(error => _rxjsBundlesRxMinJs.Observable.empty()).takeUntil(this._statuses.filter(status => status !== 'starting')).subscribe(() => {
        this._statuses.next('running');
      }));
    }
    sub.add(this._messages.connect());
    this._subscription = sub;
  }

  _stop(trackCall = true) {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }

    if (this._statuses.getValue() === 'stopped') {
      return;
    }
    if (trackCall) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(this._eventNames.stop);
    }

    this._statuses.next('stopped');
  }

  getMessages() {
    return this._messages;
  }
}

exports.LogTailer = LogTailer; /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                * 
                                * @format
                                */

class ProcessCancelledError extends Error {
  constructor(logProducerName) {
    super(`${logProducerName} was stopped`);
    this.name = 'ProcessCancelledError';
  }
}