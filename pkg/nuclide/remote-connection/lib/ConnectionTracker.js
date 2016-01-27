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

      (0, _analytics.track)(CONNECTION_EVENT, {
        error: succeed ? '0' : '1',
        errorType: errorType || '',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25UcmFja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBV29CLGVBQWU7O3lCQUNmLGlCQUFpQjs7QUFJckMsSUFBTSxnQkFBZ0IsR0FBRywyQkFBMkIsQ0FBQzs7SUFFaEMsaUJBQWlCO0FBUXpCLFdBUlEsaUJBQWlCLENBUXhCLE1BQWtDLEVBQUU7MEJBUjdCLGlCQUFpQjs7QUFTbEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN2QyxRQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7R0FDN0I7O2VBZGtCLGlCQUFpQjs7V0FnQmIsbUNBQVM7QUFDOUIsVUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUN0Qzs7O1dBRXNCLG1DQUFTO0FBQzlCLFVBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDdEM7OztXQUVXLHdCQUFTO0FBQ25CLFVBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNuQzs7O1dBRVcsc0JBQUMsU0FBZ0MsRUFBRSxDQUFRLEVBQVE7QUFDN0QsVUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDbEQ7OztXQUVxQixnQ0FBQyxPQUFnQixFQUFFLFNBQWlDLEVBQUUsQ0FBUyxFQUFRO0FBQzNGLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixlQUFPO09BQ1I7O0FBRUQsVUFBTSxrQkFBa0IsR0FDdEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsR0FBSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFJLENBQUMsQ0FBQztBQUMxRixVQUFNLG1CQUFtQixHQUN2QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxHQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEdBQUksQ0FBQyxDQUFDO0FBQzNFLFVBQU0sWUFBWSxHQUFHLEFBQUMsa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLG1CQUFtQixHQUFHLENBQUMsR0FDcEUsa0JBQWtCLEdBQUcsbUJBQW1CLEdBQUksQ0FBQyxDQUFDOztBQUVqRCw0QkFDRSxnQkFBZ0IsRUFDaEI7QUFDRSxhQUFLLEVBQUUsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQzFCLGlCQUFTLEVBQUUsU0FBUyxJQUFJLEVBQUU7QUFDMUIsaUJBQVMsRUFBRSxDQUFDLEdBQUcsZUFBTSxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtBQUMzQyxnQkFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQSxDQUFFLFFBQVEsRUFBRTtBQUM3RCwwQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRLEVBQUU7QUFDakQsMkJBQW1CLEVBQUUsbUJBQW1CLENBQUMsUUFBUSxFQUFFO0FBQ25ELG9CQUFZLEVBQUUsWUFBWSxDQUFDLFFBQVEsRUFBRTtBQUNyQyxZQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO0FBQ3ZCLGVBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFDeEMsZ0JBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVE7QUFDL0IsMkJBQW1CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUI7QUFDckQsV0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRztBQUNyQixrQkFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVTtPQUNwQyxDQUNGLENBQUM7O0FBRUYsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7S0FDdEI7OztTQWhFa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiJDb25uZWN0aW9uVHJhY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHR5cGUge1NzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLCBTc2hIYW5kc2hha2VFcnJvclR5cGV9IGZyb20gJy4vU3NoSGFuZHNoYWtlJztcblxuY29uc3QgQ09OTkVDVElPTl9FVkVOVCA9ICdudWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvblRyYWNrZXIge1xuXG4gIF9jb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfY29ubmVjdGlvblN0YXJ0VGltZTogbnVtYmVyO1xuICBfcHJvbXB0WXViaWtleVRpbWU6IG51bWJlcjtcbiAgX2ZpbmlzaFl1YmlrZXlUaW1lOiBudW1iZXI7XG4gIF9leHBpcmVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fZXhwaXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25TdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX3Byb21wdFl1YmlrZXlUaW1lID0gMDtcbiAgICB0aGlzLl9maW5pc2hZdWJpa2V5VGltZSA9IDA7XG4gIH1cblxuICB0cmFja1Byb21wdFl1YmlrZXlJbnB1dCgpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm9tcHRZdWJpa2V5VGltZSA9IERhdGUubm93KCk7XG4gIH1cblxuICB0cmFja0ZpbmlzaFl1YmlrZXlJbnB1dCgpOiB2b2lkIHtcbiAgICB0aGlzLl9maW5pc2hZdWJpa2V5VGltZSA9IERhdGUubm93KCk7XG4gIH1cblxuICB0cmFja1N1Y2Nlc3MoKTogdm9pZCB7XG4gICAgdGhpcy5fdHJhY2tDb25uZWN0aW9uUmVzdWx0KHRydWUpO1xuICB9XG5cbiAgdHJhY2tGYWlsdXJlKGVycm9yVHlwZTogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLCBlOiBFcnJvcik6IHZvaWQge1xuICAgIHRoaXMuX3RyYWNrQ29ubmVjdGlvblJlc3VsdChmYWxzZSwgZXJyb3JUeXBlLCBlKTtcbiAgfVxuXG4gIF90cmFja0Nvbm5lY3Rpb25SZXN1bHQoc3VjY2VlZDogYm9vbGVhbiwgZXJyb3JUeXBlPzogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLCBlPzogRXJyb3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZXhwaXJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByZVl1YmlrZXlEdXJhdGlvbiA9XG4gICAgICB0aGlzLl9wcm9tcHRZdWJpa2V5VGltZSA+IDAgPyAodGhpcy5fcHJvbXB0WXViaWtleVRpbWUgLSB0aGlzLl9jb25uZWN0aW9uU3RhcnRUaW1lKSA6IDA7XG4gICAgY29uc3QgcG9zdFl1YmlrZXlEdXJhdGlvbiA9XG4gICAgICB0aGlzLl9maW5pc2hZdWJpa2V5VGltZSA+IDAgPyAoRGF0ZS5ub3coKSAtIHRoaXMuX2ZpbmlzaFl1YmlrZXlUaW1lKSA6IDA7XG4gICAgY29uc3QgcmVhbER1cmF0aW9uID0gKHByZVl1YmlrZXlEdXJhdGlvbiA+IDAgJiYgcG9zdFl1YmlrZXlEdXJhdGlvbiA+IDApID9cbiAgICAgIChwcmVZdWJpa2V5RHVyYXRpb24gKyBwb3N0WXViaWtleUR1cmF0aW9uKSA6IDA7XG5cbiAgICB0cmFjayhcbiAgICAgIENPTk5FQ1RJT05fRVZFTlQsXG4gICAgICB7XG4gICAgICAgIGVycm9yOiBzdWNjZWVkID8gJzAnIDogJzEnLFxuICAgICAgICBlcnJvclR5cGU6IGVycm9yVHlwZSB8fCAnJyxcbiAgICAgICAgZXhjZXB0aW9uOiBlID8gZXJyb3Iuc3RyaW5naWZ5RXJyb3IoZSkgOiAnJyxcbiAgICAgICAgZHVyYXRpb246IChEYXRlLm5vdygpIC0gdGhpcy5fY29ubmVjdGlvblN0YXJ0VGltZSkudG9TdHJpbmcoKSxcbiAgICAgICAgcHJlWXViaWtleUR1cmF0aW9uOiBwcmVZdWJpa2V5RHVyYXRpb24udG9TdHJpbmcoKSxcbiAgICAgICAgcG9zdFl1YmlrZXlEdXJhdGlvbjogcG9zdFl1YmlrZXlEdXJhdGlvbi50b1N0cmluZygpLFxuICAgICAgICByZWFsRHVyYXRpb246IHJlYWxEdXJhdGlvbi50b1N0cmluZygpLFxuICAgICAgICBob3N0OiB0aGlzLl9jb25maWcuaG9zdCxcbiAgICAgICAgc3NoUG9ydDogdGhpcy5fY29uZmlnLnNzaFBvcnQudG9TdHJpbmcoKSxcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMuX2NvbmZpZy51c2VybmFtZSxcbiAgICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZDogdGhpcy5fY29uZmlnLnJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICAgIGN3ZDogdGhpcy5fY29uZmlnLmN3ZCxcbiAgICAgICAgYXV0aE1ldGhvZDogdGhpcy5fY29uZmlnLmF1dGhNZXRob2QsXG4gICAgICB9LFxuICAgICk7XG5cbiAgICB0aGlzLl9leHBpcmVkID0gdHJ1ZTtcbiAgfVxufVxuIl19