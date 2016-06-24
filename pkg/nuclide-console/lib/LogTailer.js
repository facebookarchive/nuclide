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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

/**
 * A utility for writing packages that tail log sources. Just give it a cold observable and let it
 * handle the rest.
 */

var LogTailer = (function () {
  function LogTailer(input$, eventNames) {
    _classCallCheck(this, LogTailer);

    this._input$ = input$;
    this._eventNames = eventNames;
    this._message$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
    this._running = false;
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
    key: '_start',
    value: function _start() {
      var _this = this;

      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

      if (this._running) {
        return;
      }
      if (trackCall) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.start);
      }

      this._running = true;

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }

      this._subscription = this._input$.subscribe(function (message) {
        _this._message$.next(message);
      }, function (err) {
        _this._stop(false);
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(_this._eventNames.error, { message: err.message });
      });
    }
  }, {
    key: '_stop',
    value: function _stop() {
      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (!this._running) {
        return;
      }
      if (trackCall) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(this._eventNames.stop);
      }

      this._running = false;

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }
    }
  }, {
    key: 'getMessages',
    value: function getMessages() {
      return this._message$.asObservable();
    }
  }]);

  return LogTailer;
})();

exports.LogTailer = LogTailer;