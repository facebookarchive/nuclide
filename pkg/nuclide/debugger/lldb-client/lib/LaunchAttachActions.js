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

var _client = require('../../../client');

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
    key: '_startDebugging',
    value: _asyncToGenerator(function* (processInfo) {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');

      var debuggerService = yield require('../../../service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
      yield debuggerService.startDebugging(processInfo);
    })
  }, {
    key: 'updateAttachTargetList',
    value: _asyncToGenerator(function* () {
      var rpcService = (0, _client.getServiceByNuclideUri)('LLDBDebuggerRpcService', this._targetUri);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaEF0dGFjaEFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBbUJzQixRQUFROzs7O3lCQUNPLGFBQWE7O2lDQUNsQixxQkFBcUI7O2lDQUNyQixxQkFBcUI7O3NCQUNoQixpQkFBaUI7O0lBRXpDLG1CQUFtQjtBQUluQixXQUpBLG1CQUFtQixDQUlsQixVQUFzQixFQUFFLFNBQXFCLEVBQUU7MEJBSmhELG1CQUFtQjs7QUFLNUIsUUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDOUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7R0FDN0I7O2VBUFUsbUJBQW1COztXQVNoQix3QkFBQyxZQUE4QixFQUFpQjtBQUM1RCxVQUFNLFVBQVUsR0FBRyx5Q0FBc0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN4RSxhQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDekM7OztXQUVhLHdCQUFDLFlBQThCLEVBQWlCO0FBQzVELFVBQU0sVUFBVSxHQUFHLHlDQUFzQixJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3hFLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN6Qzs7OzZCQUVvQixXQUFDLFdBQWdDLEVBQWlCO0FBQ3JFLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLHVDQUF1QyxDQUN4QyxDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsdUJBQXVCLENBQ3hCLENBQUM7O0FBRUYsVUFBTSxlQUFlLEdBQUcsTUFBTSxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FDM0Qsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUN2RCxZQUFNLGVBQWUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDbkQ7Ozs2QkFFMkIsYUFBa0I7QUFDNUMsVUFBTSxVQUFVLEdBQUcsb0NBQXVCLHdCQUF3QixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRiwrQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixVQUFNLGdCQUFnQixHQUFHLE1BQU0sVUFBVSxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFDcEUsVUFBSSxDQUFDLGNBQWMsQ0FBQyxrQ0FBdUIseUJBQXlCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUN6Rjs7O1dBRWEsd0JBQUMsVUFBa0IsRUFBRSxJQUFZLEVBQVE7QUFDckQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBVixVQUFVO0FBQ1YsWUFBSSxFQUFKLElBQUk7T0FDTCxDQUFDLENBQUM7S0FDSjs7O1NBOUNVLG1CQUFtQiIsImZpbGUiOiJMYXVuY2hBdHRhY2hBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IHR5cGUge1xuICBBdHRhY2hUYXJnZXRJbmZvLFxuICBMYXVuY2hUYXJnZXRJbmZvLFxufSBmcm9tICcuLi8uLi9sbGRiLXNlcnZlci9saWIvRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm8gZnJvbSAnLi4vLi4vYXRvbS9saWIvRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7TGF1bmNoQXR0YWNoQWN0aW9uQ29kZX0gZnJvbSAnLi9Db25zdGFudHMnO1xuaW1wb3J0IHtBdHRhY2hQcm9jZXNzSW5mb30gZnJvbSAnLi9BdHRhY2hQcm9jZXNzSW5mbyc7XG5pbXBvcnQge0xhdW5jaFByb2Nlc3NJbmZvfSBmcm9tICcuL0xhdW5jaFByb2Nlc3NJbmZvJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vY2xpZW50JztcblxuZXhwb3J0IGNsYXNzIExhdW5jaEF0dGFjaEFjdGlvbnMge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3RhcmdldFVyaTogTnVjbGlkZVVyaTtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyLCB0YXJnZXRVcmk6IE51Y2xpZGVVcmkpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLl90YXJnZXRVcmkgPSB0YXJnZXRVcmk7XG4gIH1cblxuICBhdHRhY2hEZWJ1Z2dlcihhdHRhY2hUYXJnZXQ6IEF0dGFjaFRhcmdldEluZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBhdHRhY2hJbmZvID0gbmV3IEF0dGFjaFByb2Nlc3NJbmZvKHRoaXMuX3RhcmdldFVyaSwgYXR0YWNoVGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy5fc3RhcnREZWJ1Z2dpbmcoYXR0YWNoSW5mbyk7XG4gIH1cblxuICBsYXVuY2hEZWJ1Z2dlcihsYXVuY2hUYXJnZXQ6IExhdW5jaFRhcmdldEluZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBsYXVuY2hJbmZvID0gbmV3IExhdW5jaFByb2Nlc3NJbmZvKHRoaXMuX3RhcmdldFVyaSwgbGF1bmNoVGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy5fc3RhcnREZWJ1Z2dpbmcobGF1bmNoSW5mbyk7XG4gIH1cblxuICBhc3luYyBfc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1sYXVuY2gtYXR0YWNoJ1xuICAgICk7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93J1xuICAgICk7XG5cbiAgICBjb25zdCBkZWJ1Z2dlclNlcnZpY2UgPSBhd2FpdCByZXF1aXJlKCcuLi8uLi8uLi9zZXJ2aWNlLWh1Yi1wbHVzJylcbiAgICAgICAgICAuY29uc3VtZUZpcnN0UHJvdmlkZXIoJ251Y2xpZGUtZGVidWdnZXIucmVtb3RlJyk7XG4gICAgYXdhaXQgZGVidWdnZXJTZXJ2aWNlLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUF0dGFjaFRhcmdldExpc3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcnBjU2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0xMREJEZWJ1Z2dlclJwY1NlcnZpY2UnLCB0aGlzLl90YXJnZXRVcmkpO1xuICAgIGludmFyaWFudChycGNTZXJ2aWNlKTtcbiAgICBjb25zdCBhdHRhY2hUYXJnZXRMaXN0ID0gYXdhaXQgcnBjU2VydmljZS5nZXRBdHRhY2hUYXJnZXRJbmZvTGlzdCgpO1xuICAgIHRoaXMuX2VtaXROZXdBY3Rpb24oTGF1bmNoQXR0YWNoQWN0aW9uQ29kZS5VUERBVEVfQVRUQUNIX1RBUkdFVF9MSVNULCBhdHRhY2hUYXJnZXRMaXN0KTtcbiAgfVxuXG4gIF9lbWl0TmV3QWN0aW9uKGFjdGlvblR5cGU6IHN0cmluZywgZGF0YTogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlLFxuICAgICAgZGF0YSxcbiAgICB9KTtcbiAgfVxufVxuIl19