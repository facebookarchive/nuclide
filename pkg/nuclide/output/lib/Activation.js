var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _Commands = require('./Commands');

var _Commands2 = _interopRequireDefault(_Commands);

var _createOutputGadget = require('./createOutputGadget');

var _createOutputGadget2 = _interopRequireDefault(_createOutputGadget);

var _createStateStream = require('./createStateStream');

var _createStateStream2 = _interopRequireDefault(_createStateStream);

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _OutputService = require('./OutputService');

var _OutputService2 = _interopRequireDefault(_OutputService);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    var action$ = new _rx2['default'].Subject();
    this._state$ = (0, _createStateStream2['default'])(action$.asObservable(), deserializeAppState(rawState));
    this._commands = new _Commands2['default'](action$.asObserver(), function () {
      return _this._state$.getValue();
    });
    this._outputService = new _OutputService2['default'](this._commands);
    this._disposables = new _atom.CompositeDisposable(_featureConfig2['default'].observe('nuclide-output.maximumMessageCount', function (maxMessageCount) {
      return _this._commands.setMaxMessageCount(maxMessageCount);
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeGadgetsService',
    value: function consumeGadgetsService(gadgetsApi) {
      var OutputGadget = (0, _createOutputGadget2['default'])(this._state$.asObservable(), this._commands);
      return gadgetsApi.registerGadget(OutputGadget);
    }
  }, {
    key: 'provideOutputService',
    value: function provideOutputService() {
      return this._outputService;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      var state = this._state$.getValue();
      return {
        records: state.records
      };
    }
  }]);

  return Activation;
})();

function deserializeAppState(rawState) {
  rawState = rawState || {};
  return {
    records: rawState.records || [],
    providers: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

module.exports = Activation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBY2tDLE1BQU07O3dCQUNuQixZQUFZOzs7O2tDQUNGLHNCQUFzQjs7OztpQ0FDdkIscUJBQXFCOzs7OzZCQUN6QixzQkFBc0I7Ozs7NkJBQ3RCLGlCQUFpQjs7OztrQkFDNUIsSUFBSTs7OztJQUViLFVBQVU7QUFNSCxXQU5QLFVBQVUsQ0FNRixRQUFpQixFQUFFOzs7MEJBTjNCLFVBQVU7O0FBT1osUUFBTSxPQUFPLEdBQUcsSUFBSSxnQkFBRyxPQUFPLEVBQUUsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxHQUFHLG9DQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFDdEIsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQzlCLENBQUM7QUFDRixRQUFJLENBQUMsU0FBUyxHQUFHLDBCQUNmLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFDcEI7YUFBTSxNQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUU7S0FBQSxDQUM5QixDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLDJCQUFjLE9BQU8sQ0FDbkIsb0NBQW9DLEVBQ3BDLFVBQUEsZUFBZTthQUFJLE1BQUssU0FBUyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztLQUFBLENBQ3RFLENBQ0YsQ0FBQztHQUNIOztlQXZCRyxVQUFVOztXQXlCUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVvQiwrQkFBQyxVQUEwQixFQUFtQjtBQUNqRSxVQUFNLFlBQVksR0FBRyxxQ0FBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckYsYUFBTyxVQUFVLENBQUMsY0FBYyxDQUFHLFlBQVksQ0FBZ0IsQ0FBQztLQUNqRTs7O1dBRW1CLGdDQUFrQjtBQUNwQyxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDNUI7OztXQUVRLHFCQUFXO0FBQ2xCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdEMsYUFBTztBQUNMLGVBQU8sRUFBRSxLQUFLLENBQUMsT0FBTztPQUN2QixDQUFDO0tBQ0g7OztTQTNDRyxVQUFVOzs7QUErQ2hCLFNBQVMsbUJBQW1CLENBQUMsUUFBaUIsRUFBWTtBQUN4RCxVQUFRLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztBQUMxQixTQUFPO0FBQ0wsV0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRTtBQUMvQixhQUFTLEVBQUUsSUFBSSxHQUFHLEVBQUU7Ozs7QUFJcEIsbUJBQWUsRUFBRSxNQUFNLENBQUMsaUJBQWlCO0dBQzFDLENBQUM7Q0FDSDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldHNTZXJ2aWNlLCBHYWRnZXR9IGZyb20gJy4uLy4uL2dhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7QXBwU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IGNyZWF0ZU91dHB1dEdhZGdldCBmcm9tICcuL2NyZWF0ZU91dHB1dEdhZGdldCc7XG5pbXBvcnQgY3JlYXRlU3RhdGVTdHJlYW0gZnJvbSAnLi9jcmVhdGVTdGF0ZVN0cmVhbSc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgT3V0cHV0U2VydmljZSBmcm9tICcuL091dHB1dFNlcnZpY2UnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9jb21tYW5kczogQ29tbWFuZHM7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX291dHB1dFNlcnZpY2U6IE91dHB1dFNlcnZpY2U7XG4gIF9zdGF0ZSQ6IFJ4LkJlaGF2aW9yU3ViamVjdDxBcHBTdGF0ZT47XG5cbiAgY29uc3RydWN0b3IocmF3U3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBhY3Rpb24kID0gbmV3IFJ4LlN1YmplY3QoKTtcbiAgICB0aGlzLl9zdGF0ZSQgPSBjcmVhdGVTdGF0ZVN0cmVhbShcbiAgICAgIGFjdGlvbiQuYXNPYnNlcnZhYmxlKCksXG4gICAgICBkZXNlcmlhbGl6ZUFwcFN0YXRlKHJhd1N0YXRlKSxcbiAgICApO1xuICAgIHRoaXMuX2NvbW1hbmRzID0gbmV3IENvbW1hbmRzKFxuICAgICAgYWN0aW9uJC5hc09ic2VydmVyKCksXG4gICAgICAoKSA9PiB0aGlzLl9zdGF0ZSQuZ2V0VmFsdWUoKSxcbiAgICApO1xuICAgIHRoaXMuX291dHB1dFNlcnZpY2UgPSBuZXcgT3V0cHV0U2VydmljZSh0aGlzLl9jb21tYW5kcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGZlYXR1cmVDb25maWcub2JzZXJ2ZShcbiAgICAgICAgJ251Y2xpZGUtb3V0cHV0Lm1heGltdW1NZXNzYWdlQ291bnQnLFxuICAgICAgICBtYXhNZXNzYWdlQ291bnQgPT4gdGhpcy5fY29tbWFuZHMuc2V0TWF4TWVzc2FnZUNvdW50KG1heE1lc3NhZ2VDb3VudCksXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbnN1bWVHYWRnZXRzU2VydmljZShnYWRnZXRzQXBpOiBHYWRnZXRzU2VydmljZSk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgT3V0cHV0R2FkZ2V0ID0gY3JlYXRlT3V0cHV0R2FkZ2V0KHRoaXMuX3N0YXRlJC5hc09ic2VydmFibGUoKSwgdGhpcy5fY29tbWFuZHMpO1xuICAgIHJldHVybiBnYWRnZXRzQXBpLnJlZ2lzdGVyR2FkZ2V0KCgoT3V0cHV0R2FkZ2V0OiBhbnkpOiBHYWRnZXQpKTtcbiAgfVxuXG4gIHByb3ZpZGVPdXRwdXRTZXJ2aWNlKCk6IE91dHB1dFNlcnZpY2Uge1xuICAgIHJldHVybiB0aGlzLl9vdXRwdXRTZXJ2aWNlO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9zdGF0ZSQuZ2V0VmFsdWUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVjb3Jkczogc3RhdGUucmVjb3JkcyxcbiAgICB9O1xuICB9XG5cbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVBcHBTdGF0ZShyYXdTdGF0ZTogP09iamVjdCk6IEFwcFN0YXRlIHtcbiAgcmF3U3RhdGUgPSByYXdTdGF0ZSB8fCB7fTtcbiAgcmV0dXJuIHtcbiAgICByZWNvcmRzOiByYXdTdGF0ZS5yZWNvcmRzIHx8IFtdLFxuICAgIHByb3ZpZGVyczogbmV3IE1hcCgpLFxuXG4gICAgLy8gVGhpcyB2YWx1ZSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIHZhbHVlIGZvcm0gdGhlIGNvbmZpZy4gV2UganVzdCB1c2UgYFBPU0lUSVZFX0lORklOSVRZYFxuICAgIC8vIGhlcmUgdG8gY29uZm9ybSB0byB0aGUgQXBwU3RhdGUgdHlwZSBkZWZpbnRpb24uXG4gICAgbWF4TWVzc2FnZUNvdW50OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcbiJdfQ==