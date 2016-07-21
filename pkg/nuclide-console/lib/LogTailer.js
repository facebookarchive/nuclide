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

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
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
    this._ready = options.ready;
    this._messages = options.messages.do({
      complete: function complete() {
        _this._stop();
      }
    }).catch(function (err) {
      _this._stop(false);
      (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Error with ' + _this._name + ' tailer.', err);
      var message = 'An unexpected error occurred while running the ' + _this._name + ' process' + (err.message ? ':\n\n**' + err.message + '**' : '.');
      var notification = atom.notifications.addError(message, {
        dismissable: true,
        detail: err.stack == null ? '' : err.stack.toString(),
        buttons: [{
          text: 'Restart ' + _this._name,
          className: 'icon icon-sync',
          onDidClick: function onDidClick() {
            notification.dismiss();
            _this.restart();
          }
        }]
      });
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }).share().publish();
    this._statuses = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).BehaviorSubject('stopped');
  }

  _createClass(LogTailer, [{
    key: 'start',
    value: function start(options) {
      this._start(true, options);
    }
  }, {
    key: 'stop',
    value: function stop() {
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
      return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._statuses.subscribe(cb));
    }
  }, {
    key: '_start',
    value: function _start(trackCall, options) {
      var _this2 = this;

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

      var shouldRun = this._statuses.getValue() === 'stopped';

      if (shouldRun) {
        if (trackCall) {
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.start);
        }

        // If the LogTailer was created with a way of detecting when the source was ready, the initial
        // status is "starting." Otherwise, assume that it's started immediately.
        var initialStatus = this._ready == null ? 'running' : 'starting';
        this._statuses.next(initialStatus);
      }

      // If the user provided an `onRunning` callback, hook it up.
      if (options != null) {
        (function () {
          var onRunning = options.onRunning;

          (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(_this2._statuses, _this2._messages.ignoreElements()). // For the errors
          takeWhile(function (status) {
            return status !== 'stopped';
          }).first(function (status) {
            return status === 'running';
          }).catch(function (err) {
            // If it's stopped before it starts running, emit a special error.
            if (err.name === 'EmptyError') {
              throw new ProcessCancelledError(_this2._name);
            }
            throw err;
          }).mapTo(undefined).subscribe(function () {
            onRunning();
          }, function (err) {
            onRunning(err);
          });
        })();
      }

      if (!shouldRun) {
        return;
      }

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }

      var sub = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subscription();

      if (this._ready != null) {
        sub.add(this._ready.takeUntil(this._statuses.filter(function (status) {
          return status !== 'starting';
        })).subscribe(function () {
          _this2._statuses.next('running');
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

    _get(Object.getPrototypeOf(ProcessCancelledError.prototype), 'constructor', this).call(this, logProducerName + ' was stopped');
    this.name = 'ProcessCancelledError';
  }

  return ProcessCancelledError;
})(Error);

// Signals that the source is ready ("running"). This allows us to account for sources that need
// some initialization without having to worry about it in cases that don't.

// A node-style error-first callback. This API is used because: Atom commands don't let us return
// values (an Observable or Promise would work well here) and we want to have success and error
// messages use the same channel (instead of a separate `onRunning` and `onRunningError`
// callback).