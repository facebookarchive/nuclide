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

var _commons = require('../../commons');

var _analytics = require('../../analytics');

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
    value: function trackFailure(e) {
      this._trackConnectionResult(false, e);
    }
  }, {
    key: '_trackConnectionResult',
    value: function _trackConnectionResult(succeed, e) {
      if (this._expired) {
        return;
      }

      var preYubikeyDuration = this._promptYubikeyTime > 0 ? this._promptYubikeyTime - this._connectionStartTime : 0;
      var postYubikeyDuration = this._finishYubikeyTime > 0 ? Date.now() - this._finishYubikeyTime : 0;
      var realDuration = preYubikeyDuration > 0 && postYubikeyDuration > 0 ? preYubikeyDuration + postYubikeyDuration : 0;

      (0, _analytics.track)(CONNECTION_EVENT, {
        error: succeed ? '0' : '1',
        exception: e ? _commons.error.stringifyError(e) : '',
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
//# sourceMappingURL=data:application/json;base64,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aUI7OztxQkFBakIsaUJBQWlCIiwiZmlsZSI6IkNvbm5lY3Rpb25UcmFja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQgdHlwZSB7U3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb259IGZyb20gJy4vU3NoSGFuZHNoYWtlJztcblxuY29uc3QgQ09OTkVDVElPTl9FVkVOVCA9ICdudWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvblRyYWNrZXIge1xuXG4gIF9jb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfY29ubmVjdGlvblN0YXJ0VGltZTogbnVtYmVyO1xuICBfcHJvbXB0WXViaWtleVRpbWU6IG51bWJlcjtcbiAgX2ZpbmlzaFl1YmlrZXlUaW1lOiBudW1iZXI7XG4gIF9leHBpcmVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fZXhwaXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25TdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX3Byb21wdFl1YmlrZXlUaW1lID0gMDtcbiAgICB0aGlzLl9maW5pc2hZdWJpa2V5VGltZSA9IDA7XG4gIH1cblxuICB0cmFja1Byb21wdFl1YmlrZXlJbnB1dCgpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm9tcHRZdWJpa2V5VGltZSA9IERhdGUubm93KCk7XG4gIH1cblxuICB0cmFja0ZpbmlzaFl1YmlrZXlJbnB1dCgpOiB2b2lkIHtcbiAgICB0aGlzLl9maW5pc2hZdWJpa2V5VGltZSA9IERhdGUubm93KCk7XG4gIH1cblxuICB0cmFja1N1Y2Nlc3MoKTogdm9pZCB7XG4gICAgdGhpcy5fdHJhY2tDb25uZWN0aW9uUmVzdWx0KHRydWUpO1xuICB9XG5cbiAgdHJhY2tGYWlsdXJlKGU6IEVycm9yKTogdm9pZCB7XG4gICAgdGhpcy5fdHJhY2tDb25uZWN0aW9uUmVzdWx0KGZhbHNlLCBlKTtcbiAgfVxuXG4gIF90cmFja0Nvbm5lY3Rpb25SZXN1bHQoc3VjY2VlZDogYm9vbGVhbiwgZTogP0Vycm9yKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2V4cGlyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmVZdWJpa2V5RHVyYXRpb24gPVxuICAgICAgdGhpcy5fcHJvbXB0WXViaWtleVRpbWUgPiAwID8gKHRoaXMuX3Byb21wdFl1YmlrZXlUaW1lIC0gdGhpcy5fY29ubmVjdGlvblN0YXJ0VGltZSkgOiAwO1xuICAgIGNvbnN0IHBvc3RZdWJpa2V5RHVyYXRpb24gPVxuICAgICAgdGhpcy5fZmluaXNoWXViaWtleVRpbWUgPiAwID8gKERhdGUubm93KCkgLSB0aGlzLl9maW5pc2hZdWJpa2V5VGltZSkgOiAwO1xuICAgIGNvbnN0IHJlYWxEdXJhdGlvbiA9IChwcmVZdWJpa2V5RHVyYXRpb24gPiAwICYmIHBvc3RZdWJpa2V5RHVyYXRpb24gPiAwKSA/XG4gICAgICAocHJlWXViaWtleUR1cmF0aW9uICsgcG9zdFl1YmlrZXlEdXJhdGlvbikgOiAwO1xuXG4gICAgdHJhY2soXG4gICAgICBDT05ORUNUSU9OX0VWRU5ULFxuICAgICAge1xuICAgICAgICBlcnJvcjogc3VjY2VlZCA/ICcwJyA6ICcxJyxcbiAgICAgICAgZXhjZXB0aW9uOiBlID8gZXJyb3Iuc3RyaW5naWZ5RXJyb3IoZSkgOiAnJyxcbiAgICAgICAgZHVyYXRpb246IChEYXRlLm5vdygpIC0gdGhpcy5fY29ubmVjdGlvblN0YXJ0VGltZSkudG9TdHJpbmcoKSxcbiAgICAgICAgcHJlWXViaWtleUR1cmF0aW9uOiBwcmVZdWJpa2V5RHVyYXRpb24udG9TdHJpbmcoKSxcbiAgICAgICAgcG9zdFl1YmlrZXlEdXJhdGlvbjogcG9zdFl1YmlrZXlEdXJhdGlvbi50b1N0cmluZygpLFxuICAgICAgICByZWFsRHVyYXRpb246IHJlYWxEdXJhdGlvbi50b1N0cmluZygpLFxuICAgICAgICBob3N0OiB0aGlzLl9jb25maWcuaG9zdCxcbiAgICAgICAgc3NoUG9ydDogdGhpcy5fY29uZmlnLnNzaFBvcnQudG9TdHJpbmcoKSxcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMuX2NvbmZpZy51c2VybmFtZSxcbiAgICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZDogdGhpcy5fY29uZmlnLnJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICAgIGN3ZDogdGhpcy5fY29uZmlnLmN3ZCxcbiAgICAgICAgYXV0aE1ldGhvZDogdGhpcy5fY29uZmlnLmF1dGhNZXRob2QsXG4gICAgICB9LFxuICAgICk7XG5cbiAgICB0aGlzLl9leHBpcmVkID0gdHJ1ZTtcbiAgfVxufVxuIl19