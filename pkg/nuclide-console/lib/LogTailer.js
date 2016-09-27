Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

/**
 * A utility for writing packages that tail log sources. Just give it a cold observable and let it
 * handle the rest.
 */

var LogTailer = (function () {
  function LogTailer(options) {
    var _this = this;

    _classCallCheck(this, LogTailer);

    this._name = options.name;
    this._eventNames = options.trackingEvents;
    var messages = options.messages.share();
    this._ready = options.ready == null ? null
    // Guard against a never-ending ready stream.
    // $FlowFixMe: Add `materialize()` to Rx defs
    : options.ready.takeUntil(messages.materialize().takeLast(1));
    this._runningCallbacks = [];
    this._startCount = 0;
    this._statuses = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject('stopped');

    this._messages = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(messages, this._ready == null ? (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty() : this._ready.ignoreElements()). // For the errors.
    do({
      error: function error(err) {
        var wasStarting = _this._statuses.getValue() === 'starting';
        _this._stop(false);
        var errorWasHandled = wasStarting && !_this._invokeRunningCallbacks(err);
        if (!errorWasHandled) {
          _this._unhandledError(err);
        }
      },
      complete: function complete() {
        // If the process completed without ever entering the "running" state, invoke the
        // `onRunning` callback with a cancellation error.
        _this._invokeRunningCallbacks(new ProcessCancelledError(_this._name));
        _this._stop();
      }
    }).share().publish();

    // Whenever the status becomes "running," invoke all of the registered running callbacks.
    this._statuses.distinctUntilChanged().filter(function (status) {
      return status === 'running';
    }).subscribe(function () {
      _this._invokeRunningCallbacks();
    });
  }

  _createClass(LogTailer, [{
    key: 'start',
    value: function start(options) {
      this._startCount += 1;
      if (options != null && options.onRunning != null) {
        this._runningCallbacks.push(options.onRunning);
      }
      this._start(true);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var _this2 = this;

      // If the process is explicitly stopped, call all of the running callbacks with a cancelation
      // error.
      this._startCount = 0;
      this._runningCallbacks.forEach(function (cb) {
        cb(new ProcessCancelledError(_this2._name));
      });

      this._stop();
    }
  }, {
    key: 'restart',
    value: function restart() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.restart);
      this._stop(false);
      this._start(false);
    }
  }, {
    key: 'observeStatus',
    value: function observeStatus(cb) {
      return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._statuses.subscribe(cb));
    }

    /**
     * Invoke the running callbacks. Returns true if the error wasn't handled; otherwise false.
     */
  }, {
    key: '_invokeRunningCallbacks',
    value: function _invokeRunningCallbacks(err) {
      // Invoke all of the registered running callbacks.
      if (this._runningCallbacks.length > 0) {
        this._runningCallbacks.forEach(function (cb) {
          if (err == null) {
            cb();
          } else {
            cb(err);
          }
        });
      }

      var unhandledError = err != null && this._startCount !== this._runningCallbacks.length;
      this._runningCallbacks = [];
      this._startCount = 0;
      return unhandledError;
    }
  }, {
    key: '_unhandledError',
    value: function _unhandledError(err) {
      var _this3 = this;

      (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Error with ' + this._name + ' tailer.', err);
      var message = 'An unexpected error occurred while running the ' + this._name + ' process' + (err.message ? ':\n\n**' + err.message + '**' : '.');
      var notification = atom.notifications.addError(message, {
        dismissable: true,
        detail: err.stack == null ? '' : err.stack.toString(),
        buttons: [{
          text: 'Restart ' + this._name,
          className: 'icon icon-sync',
          onDidClick: function onDidClick() {
            notification.dismiss();
            _this3.restart();
          }
        }]
      });
    }
  }, {
    key: '_start',
    value: function _start(trackCall) {
      var _this4 = this;

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });

      var currentStatus = this._statuses.getValue();
      if (currentStatus === 'starting') {
        return;
      } else if (currentStatus === 'running') {
        this._invokeRunningCallbacks();
        return;
      }

      if (trackCall) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.start);
      }

      // If the LogTailer was created with a way of detecting when the source was ready, the initial
      // status is "starting." Otherwise, assume that it's started immediately.
      var initialStatus = this._ready == null ? 'running' : 'starting';
      this._statuses.next(initialStatus);

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }

      var sub = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subscription();
      if (this._ready != null) {
        sub.add(this._ready
        // Ignore errors here. We'll catch them above.
        .catch(function (error) {
          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
        }).takeUntil(this._statuses.filter(function (status) {
          return status !== 'starting';
        })).subscribe(function () {
          _this4._statuses.next('running');
        }));
      }
      sub.add(this._messages.connect());
      this._subscription = sub;
    }
  }, {
    key: '_stop',
    value: function _stop() {
      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }

      if (this._statuses.getValue() === 'stopped') {
        return;
      }
      if (trackCall) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.stop);
      }

      this._statuses.next('stopped');
    }
  }, {
    key: 'getMessages',
    value: function getMessages() {
      return this._messages;
    }
  }]);

  return LogTailer;
})();

exports.LogTailer = LogTailer;

var ProcessCancelledError = (function (_Error) {
  _inherits(ProcessCancelledError, _Error);

  function ProcessCancelledError(logProducerName) {
    _classCallCheck(this, ProcessCancelledError);

    // TODO: Remove `captureStackTrace()` call and `this.message` assignment when we remove our
    // class transform and switch to native classes.
    var message = logProducerName + ' was stopped';
    _get(Object.getPrototypeOf(ProcessCancelledError.prototype), 'constructor', this).call(this, message);
    this.name = 'ProcessCancelledError';
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }

  return ProcessCancelledError;
})(Error);

// Signals that the source is ready ("running"). This allows us to account for sources that need
// some initialization without having to worry about it in cases that don't.

// A node-style error-first callback. This API is used because: Atom commands don't let us return
// values (an Observable or Promise would work well here) and we want to have success and error
// messages use the same channel (instead of a separate `onRunning` and `onRunningError`
// callback).