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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _Constants = require('./Constants');

var _AttachProcessInfo = require('./AttachProcessInfo');

var _LaunchProcessInfo = require('./LaunchProcessInfo');

var _nuclideClient = require('../../nuclide-client');

var LaunchAttachActions = (function () {
  function LaunchAttachActions(dispatcher, targetUri) {
    _classCallCheck(this, LaunchAttachActions);

    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
  }

  _createClass(LaunchAttachActions, [{
    key: 'attachDebugger',
    value: function attachDebugger(attachTarget) {
      var attachInfo = new _AttachProcessInfo.AttachProcessInfo(this._targetUri, attachTarget);
      return this._startDebugging(attachInfo);
    }
  }, {
    key: 'launchDebugger',
    value: function launchDebugger(launchTarget) {
      var launchInfo = new _LaunchProcessInfo.LaunchProcessInfo(this._targetUri, launchTarget);
      return this._startDebugging(launchInfo);
    }
  }, {
    key: 'toggleLaunchAttachDialog',
    value: function toggleLaunchAttachDialog() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
    }
  }, {
    key: 'showDebuggerPanel',
    value: function showDebuggerPanel() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    }
  }, {
    key: '_startDebugging',
    value: _asyncToGenerator(function* (processInfo) {
      var debuggerService = yield require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
      yield debuggerService.startDebugging(processInfo);
    })
  }, {
    key: 'updateAttachTargetList',
    value: _asyncToGenerator(function* () {
      var rpcService = (0, _nuclideClient.getServiceByNuclideUri)('LLDBDebuggerRpcService', this._targetUri);
      (0, _assert2['default'])(rpcService);
      var attachTargetList = yield rpcService.getAttachTargetInfoList();
      this._emitNewAction(_Constants.LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST, attachTargetList);
    })
  }, {
    key: '_emitNewAction',
    value: function _emitNewAction(actionType, data) {
      this._dispatcher.dispatch({
        actionType: actionType,
        data: data
      });
    }
  }]);

  return LaunchAttachActions;
})();

exports.LaunchAttachActions = LaunchAttachActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaEF0dGFjaEFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBbUJzQixRQUFROzs7O3lCQUNPLGFBQWE7O2lDQUNsQixxQkFBcUI7O2lDQUNyQixxQkFBcUI7OzZCQUNoQixzQkFBc0I7O0lBRTlDLG1CQUFtQjtBQUluQixXQUpBLG1CQUFtQixDQUlsQixVQUFzQixFQUFFLFNBQXFCLEVBQUU7MEJBSmhELG1CQUFtQjs7QUFLNUIsUUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDOUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7R0FDN0I7O2VBUFUsbUJBQW1COztXQVNoQix3QkFBQyxZQUE4QixFQUFpQjtBQUM1RCxVQUFNLFVBQVUsR0FBRyx5Q0FBc0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN4RSxhQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDekM7OztXQUVhLHdCQUFDLFlBQThCLEVBQWlCO0FBQzVELFVBQU0sVUFBVSxHQUFHLHlDQUFzQixJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3hFLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN6Qzs7O1dBRXVCLG9DQUFTO0FBQy9CLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLHVDQUF1QyxDQUN4QyxDQUFDO0tBQ0g7OztXQUVnQiw2QkFBUztBQUN4QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUNsQyx1QkFBdUIsQ0FDeEIsQ0FBQztLQUNIOzs7NkJBRW9CLFdBQUMsV0FBZ0MsRUFBaUI7QUFDckUsVUFBTSxlQUFlLEdBQUcsTUFBTSxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FDaEUsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUN2RCxZQUFNLGVBQWUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDbkQ7Ozs2QkFFMkIsYUFBa0I7QUFDNUMsVUFBTSxVQUFVLEdBQUcsMkNBQXVCLHdCQUF3QixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRiwrQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixVQUFNLGdCQUFnQixHQUFHLE1BQU0sVUFBVSxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFDcEUsVUFBSSxDQUFDLGNBQWMsQ0FBQyxrQ0FBdUIseUJBQXlCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUN6Rjs7O1dBRWEsd0JBQUMsVUFBa0IsRUFBRSxJQUFZLEVBQVE7QUFDckQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBVixVQUFVO0FBQ1YsWUFBSSxFQUFKLElBQUk7T0FDTCxDQUFDLENBQUM7S0FDSjs7O1NBbkRVLG1CQUFtQiIsImZpbGUiOiJMYXVuY2hBdHRhY2hBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IHR5cGUge1xuICBBdHRhY2hUYXJnZXRJbmZvLFxuICBMYXVuY2hUYXJnZXRJbmZvLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWxsZGItc2VydmVyL2xpYi9EZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvIGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbS9saWIvRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7TGF1bmNoQXR0YWNoQWN0aW9uQ29kZX0gZnJvbSAnLi9Db25zdGFudHMnO1xuaW1wb3J0IHtBdHRhY2hQcm9jZXNzSW5mb30gZnJvbSAnLi9BdHRhY2hQcm9jZXNzSW5mbyc7XG5pbXBvcnQge0xhdW5jaFByb2Nlc3NJbmZvfSBmcm9tICcuL0xhdW5jaFByb2Nlc3NJbmZvJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jbGllbnQnO1xuXG5leHBvcnQgY2xhc3MgTGF1bmNoQXR0YWNoQWN0aW9ucyB7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfdGFyZ2V0VXJpOiBOdWNsaWRlVXJpO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHRhcmdldFVyaTogTnVjbGlkZVVyaSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX3RhcmdldFVyaSA9IHRhcmdldFVyaTtcbiAgfVxuXG4gIGF0dGFjaERlYnVnZ2VyKGF0dGFjaFRhcmdldDogQXR0YWNoVGFyZ2V0SW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGF0dGFjaEluZm8gPSBuZXcgQXR0YWNoUHJvY2Vzc0luZm8odGhpcy5fdGFyZ2V0VXJpLCBhdHRhY2hUYXJnZXQpO1xuICAgIHJldHVybiB0aGlzLl9zdGFydERlYnVnZ2luZyhhdHRhY2hJbmZvKTtcbiAgfVxuXG4gIGxhdW5jaERlYnVnZ2VyKGxhdW5jaFRhcmdldDogTGF1bmNoVGFyZ2V0SW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxhdW5jaEluZm8gPSBuZXcgTGF1bmNoUHJvY2Vzc0luZm8odGhpcy5fdGFyZ2V0VXJpLCBsYXVuY2hUYXJnZXQpO1xuICAgIHJldHVybiB0aGlzLl9zdGFydERlYnVnZ2luZyhsYXVuY2hJbmZvKTtcbiAgfVxuXG4gIHRvZ2dsZUxhdW5jaEF0dGFjaERpYWxvZygpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1sYXVuY2gtYXR0YWNoJ1xuICAgICk7XG4gIH1cblxuICBzaG93RGVidWdnZXJQYW5lbCgpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIF9zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGRlYnVnZ2VyU2VydmljZSA9IGF3YWl0IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtc2VydmljZS1odWItcGx1cycpXG4gICAgICAgICAgLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpO1xuICAgIGF3YWl0IGRlYnVnZ2VyU2VydmljZS5zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbyk7XG4gIH1cblxuICBhc3luYyB1cGRhdGVBdHRhY2hUYXJnZXRMaXN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJwY1NlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdMTERCRGVidWdnZXJScGNTZXJ2aWNlJywgdGhpcy5fdGFyZ2V0VXJpKTtcbiAgICBpbnZhcmlhbnQocnBjU2VydmljZSk7XG4gICAgY29uc3QgYXR0YWNoVGFyZ2V0TGlzdCA9IGF3YWl0IHJwY1NlcnZpY2UuZ2V0QXR0YWNoVGFyZ2V0SW5mb0xpc3QoKTtcbiAgICB0aGlzLl9lbWl0TmV3QWN0aW9uKExhdW5jaEF0dGFjaEFjdGlvbkNvZGUuVVBEQVRFX0FUVEFDSF9UQVJHRVRfTElTVCwgYXR0YWNoVGFyZ2V0TGlzdCk7XG4gIH1cblxuICBfZW1pdE5ld0FjdGlvbihhY3Rpb25UeXBlOiBzdHJpbmcsIGRhdGE6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZSxcbiAgICAgIGRhdGEsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==