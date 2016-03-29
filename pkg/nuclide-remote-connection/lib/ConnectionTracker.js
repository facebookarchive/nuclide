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

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

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

      (0, _nuclideAnalytics.track)(CONNECTION_EVENT, {
        error: succeed ? '0' : '1',
        errorType: errorType || '',
        exception: e ? _nuclideCommons.error.stringifyError(e) : '',
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

exports['default'] = ConnectionTracker;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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cEMsQ0FDRixDQUFDOztBQUVGLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ3RCOzs7U0FoRWtCLGlCQUFpQjs7O3FCQUFqQixpQkFBaUIiLCJmaWxlIjoiQ29ubmVjdGlvblRyYWNrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5pbXBvcnQgdHlwZSB7U3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sIFNzaEhhbmRzaGFrZUVycm9yVHlwZX0gZnJvbSAnLi9Tc2hIYW5kc2hha2UnO1xuXG5jb25zdCBDT05ORUNUSU9OX0VWRU5UID0gJ251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0aW9uVHJhY2tlciB7XG5cbiAgX2NvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb247XG4gIF9jb25uZWN0aW9uU3RhcnRUaW1lOiBudW1iZXI7XG4gIF9wcm9tcHRZdWJpa2V5VGltZTogbnVtYmVyO1xuICBfZmluaXNoWXViaWtleVRpbWU6IG51bWJlcjtcbiAgX2V4cGlyZWQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9leHBpcmVkID0gZmFsc2U7XG4gICAgdGhpcy5fY29ubmVjdGlvblN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5fcHJvbXB0WXViaWtleVRpbWUgPSAwO1xuICAgIHRoaXMuX2ZpbmlzaFl1YmlrZXlUaW1lID0gMDtcbiAgfVxuXG4gIHRyYWNrUHJvbXB0WXViaWtleUlucHV0KCk6IHZvaWQge1xuICAgIHRoaXMuX3Byb21wdFl1YmlrZXlUaW1lID0gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHRyYWNrRmluaXNoWXViaWtleUlucHV0KCk6IHZvaWQge1xuICAgIHRoaXMuX2ZpbmlzaFl1YmlrZXlUaW1lID0gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHRyYWNrU3VjY2VzcygpOiB2b2lkIHtcbiAgICB0aGlzLl90cmFja0Nvbm5lY3Rpb25SZXN1bHQodHJ1ZSk7XG4gIH1cblxuICB0cmFja0ZhaWx1cmUoZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsIGU6IEVycm9yKTogdm9pZCB7XG4gICAgdGhpcy5fdHJhY2tDb25uZWN0aW9uUmVzdWx0KGZhbHNlLCBlcnJvclR5cGUsIGUpO1xuICB9XG5cbiAgX3RyYWNrQ29ubmVjdGlvblJlc3VsdChzdWNjZWVkOiBib29sZWFuLCBlcnJvclR5cGU/OiBTc2hIYW5kc2hha2VFcnJvclR5cGUsIGU/OiBFcnJvcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9leHBpcmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJlWXViaWtleUR1cmF0aW9uID1cbiAgICAgIHRoaXMuX3Byb21wdFl1YmlrZXlUaW1lID4gMCA/ICh0aGlzLl9wcm9tcHRZdWJpa2V5VGltZSAtIHRoaXMuX2Nvbm5lY3Rpb25TdGFydFRpbWUpIDogMDtcbiAgICBjb25zdCBwb3N0WXViaWtleUR1cmF0aW9uID1cbiAgICAgIHRoaXMuX2ZpbmlzaFl1YmlrZXlUaW1lID4gMCA/IChEYXRlLm5vdygpIC0gdGhpcy5fZmluaXNoWXViaWtleVRpbWUpIDogMDtcbiAgICBjb25zdCByZWFsRHVyYXRpb24gPSAocHJlWXViaWtleUR1cmF0aW9uID4gMCAmJiBwb3N0WXViaWtleUR1cmF0aW9uID4gMCkgP1xuICAgICAgKHByZVl1YmlrZXlEdXJhdGlvbiArIHBvc3RZdWJpa2V5RHVyYXRpb24pIDogMDtcblxuICAgIHRyYWNrKFxuICAgICAgQ09OTkVDVElPTl9FVkVOVCxcbiAgICAgIHtcbiAgICAgICAgZXJyb3I6IHN1Y2NlZWQgPyAnMCcgOiAnMScsXG4gICAgICAgIGVycm9yVHlwZTogZXJyb3JUeXBlIHx8ICcnLFxuICAgICAgICBleGNlcHRpb246IGUgPyBlcnJvci5zdHJpbmdpZnlFcnJvcihlKSA6ICcnLFxuICAgICAgICBkdXJhdGlvbjogKERhdGUubm93KCkgLSB0aGlzLl9jb25uZWN0aW9uU3RhcnRUaW1lKS50b1N0cmluZygpLFxuICAgICAgICBwcmVZdWJpa2V5RHVyYXRpb246IHByZVl1YmlrZXlEdXJhdGlvbi50b1N0cmluZygpLFxuICAgICAgICBwb3N0WXViaWtleUR1cmF0aW9uOiBwb3N0WXViaWtleUR1cmF0aW9uLnRvU3RyaW5nKCksXG4gICAgICAgIHJlYWxEdXJhdGlvbjogcmVhbER1cmF0aW9uLnRvU3RyaW5nKCksXG4gICAgICAgIGhvc3Q6IHRoaXMuX2NvbmZpZy5ob3N0LFxuICAgICAgICBzc2hQb3J0OiB0aGlzLl9jb25maWcuc3NoUG9ydC50b1N0cmluZygpLFxuICAgICAgICB1c2VybmFtZTogdGhpcy5fY29uZmlnLnVzZXJuYW1lLFxuICAgICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kOiB0aGlzLl9jb25maWcucmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgICAgY3dkOiB0aGlzLl9jb25maWcuY3dkLFxuICAgICAgICBhdXRoTWV0aG9kOiB0aGlzLl9jb25maWcuYXV0aE1ldGhvZCxcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIHRoaXMuX2V4cGlyZWQgPSB0cnVlO1xuICB9XG59XG4iXX0=