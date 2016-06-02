Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var CONNECTION_EVENT = 'nuclide-remote-connection';

var ConnectionTracker = (function () {
  function ConnectionTracker(config) {
    _classCallCheck(this, ConnectionTracker);

    this._config = config;
    this._expired = false;
    this._connectionStartTime = Date.now();
    this._promptYubikeyTime = 0;
    this._finishYubikeyTime = 0;
  }

  _createClass(ConnectionTracker, [{
    key: 'trackPromptYubikeyInput',
    value: function trackPromptYubikeyInput() {
      this._promptYubikeyTime = Date.now();
    }
  }, {
    key: 'trackFinishYubikeyInput',
    value: function trackFinishYubikeyInput() {
      this._finishYubikeyTime = Date.now();
    }
  }, {
    key: 'trackSuccess',
    value: function trackSuccess() {
      this._trackConnectionResult(true);
    }
  }, {
    key: 'trackFailure',
    value: function trackFailure(errorType, e) {
      this._trackConnectionResult(false, errorType, e);
    }
  }, {
    key: '_trackConnectionResult',
    value: function _trackConnectionResult(succeed, errorType, e) {
      if (this._expired) {
        return;
      }

      var preYubikeyDuration = this._promptYubikeyTime > 0 ? this._promptYubikeyTime - this._connectionStartTime : 0;
      var postYubikeyDuration = this._finishYubikeyTime > 0 ? Date.now() - this._finishYubikeyTime : 0;
      var realDuration = preYubikeyDuration > 0 && postYubikeyDuration > 0 ? preYubikeyDuration + postYubikeyDuration : 0;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(CONNECTION_EVENT, {
        error: succeed ? '0' : '1',
        errorType: errorType || '',
        exception: e ? (0, (_commonsNodeString2 || _commonsNodeString()).stringifyError)(e) : '',
        duration: (Date.now() - this._connectionStartTime).toString(),
        preYubikeyDuration: preYubikeyDuration.toString(),
        postYubikeyDuration: postYubikeyDuration.toString(),
        realDuration: realDuration.toString(),
        host: this._config.host,
        sshPort: this._config.sshPort.toString(),
        username: this._config.username,
        remoteServerCommand: this._config.remoteServerCommand,
        cwd: this._config.cwd,
        authMethod: this._config.authMethod
      });

      this._expired = true;
    }
  }]);

  return ConnectionTracker;
})();

exports.default = ConnectionTracker;
module.exports = exports.default;