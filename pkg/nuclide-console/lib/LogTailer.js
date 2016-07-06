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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
    this._running = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).BehaviorSubject(false);
  }

  _createClass(LogTailer, [{
    key: 'start',
    value: function start() {
      this._start();
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
      return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._running.map(function (isRunning) {
        return isRunning ? 'running' : 'stopped';
      }).subscribe(cb));
    }
  }, {
    key: '_start',
    value: function _start() {
      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

      if (this._running.getValue()) {
        return;
      }
      if (trackCall) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.start);
      }

      this._running.next(true);

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }

      this._subscription = this._messages.connect();
    }
  }, {
    key: '_stop',
    value: function _stop() {
      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }

      if (!this._running.getValue()) {
        return;
      }
      if (trackCall) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.stop);
      }

      this._running.next(false);
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