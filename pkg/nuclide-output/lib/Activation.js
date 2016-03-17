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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

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
    this._disposables = new _atom.CompositeDisposable(_nuclideFeatureConfig2['default'].observe('nuclide-output.maximumMessageCount', function (maxMessageCount) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBY2tDLE1BQU07O3dCQUNuQixZQUFZOzs7O2tDQUNGLHNCQUFzQjs7OztpQ0FDdkIscUJBQXFCOzs7O29DQUN6Qiw4QkFBOEI7Ozs7NkJBQzlCLGlCQUFpQjs7OztrQkFDNUIsSUFBSTs7OztJQUViLFVBQVU7QUFNSCxXQU5QLFVBQVUsQ0FNRixRQUFpQixFQUFFOzs7MEJBTjNCLFVBQVU7O0FBT1osUUFBTSxPQUFPLEdBQUcsSUFBSSxnQkFBRyxPQUFPLEVBQUUsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxHQUFHLG9DQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFDdEIsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQzlCLENBQUM7QUFDRixRQUFJLENBQUMsU0FBUyxHQUFHLDBCQUNmLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFDcEI7YUFBTSxNQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUU7S0FBQSxDQUM5QixDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLGtDQUFjLE9BQU8sQ0FDbkIsb0NBQW9DLEVBQ3BDLFVBQUEsZUFBZTthQUFJLE1BQUssU0FBUyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztLQUFBLENBQ3RFLENBQ0YsQ0FBQztHQUNIOztlQXZCRyxVQUFVOztXQXlCUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVvQiwrQkFBQyxVQUEwQixFQUFlO0FBQzdELFVBQU0sWUFBWSxHQUFHLHFDQUFtQixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyRixhQUFPLFVBQVUsQ0FBQyxjQUFjLENBQUcsWUFBWSxDQUFnQixDQUFDO0tBQ2pFOzs7V0FFbUIsZ0NBQWtCO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztLQUM1Qjs7O1dBRVEscUJBQVc7QUFDbEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN0QyxhQUFPO0FBQ0wsZUFBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO09BQ3ZCLENBQUM7S0FDSDs7O1NBM0NHLFVBQVU7OztBQStDaEIsU0FBUyxtQkFBbUIsQ0FBQyxRQUFpQixFQUFZO0FBQ3hELFVBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO0FBQzFCLFNBQU87QUFDTCxXQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFO0FBQy9CLGFBQVMsRUFBRSxJQUFJLEdBQUcsRUFBRTs7OztBQUlwQixtQkFBZSxFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7R0FDMUMsQ0FBQztDQUNIOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0c1NlcnZpY2UsIEdhZGdldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0FwcFN0YXRlfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBDb21tYW5kcyBmcm9tICcuL0NvbW1hbmRzJztcbmltcG9ydCBjcmVhdGVPdXRwdXRHYWRnZXQgZnJvbSAnLi9jcmVhdGVPdXRwdXRHYWRnZXQnO1xuaW1wb3J0IGNyZWF0ZVN0YXRlU3RyZWFtIGZyb20gJy4vY3JlYXRlU3RhdGVTdHJlYW0nO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgT3V0cHV0U2VydmljZSBmcm9tICcuL091dHB1dFNlcnZpY2UnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9jb21tYW5kczogQ29tbWFuZHM7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX291dHB1dFNlcnZpY2U6IE91dHB1dFNlcnZpY2U7XG4gIF9zdGF0ZSQ6IFJ4LkJlaGF2aW9yU3ViamVjdDxBcHBTdGF0ZT47XG5cbiAgY29uc3RydWN0b3IocmF3U3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBhY3Rpb24kID0gbmV3IFJ4LlN1YmplY3QoKTtcbiAgICB0aGlzLl9zdGF0ZSQgPSBjcmVhdGVTdGF0ZVN0cmVhbShcbiAgICAgIGFjdGlvbiQuYXNPYnNlcnZhYmxlKCksXG4gICAgICBkZXNlcmlhbGl6ZUFwcFN0YXRlKHJhd1N0YXRlKSxcbiAgICApO1xuICAgIHRoaXMuX2NvbW1hbmRzID0gbmV3IENvbW1hbmRzKFxuICAgICAgYWN0aW9uJC5hc09ic2VydmVyKCksXG4gICAgICAoKSA9PiB0aGlzLl9zdGF0ZSQuZ2V0VmFsdWUoKSxcbiAgICApO1xuICAgIHRoaXMuX291dHB1dFNlcnZpY2UgPSBuZXcgT3V0cHV0U2VydmljZSh0aGlzLl9jb21tYW5kcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGZlYXR1cmVDb25maWcub2JzZXJ2ZShcbiAgICAgICAgJ251Y2xpZGUtb3V0cHV0Lm1heGltdW1NZXNzYWdlQ291bnQnLFxuICAgICAgICBtYXhNZXNzYWdlQ291bnQgPT4gdGhpcy5fY29tbWFuZHMuc2V0TWF4TWVzc2FnZUNvdW50KG1heE1lc3NhZ2VDb3VudCksXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbnN1bWVHYWRnZXRzU2VydmljZShnYWRnZXRzQXBpOiBHYWRnZXRzU2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBPdXRwdXRHYWRnZXQgPSBjcmVhdGVPdXRwdXRHYWRnZXQodGhpcy5fc3RhdGUkLmFzT2JzZXJ2YWJsZSgpLCB0aGlzLl9jb21tYW5kcyk7XG4gICAgcmV0dXJuIGdhZGdldHNBcGkucmVnaXN0ZXJHYWRnZXQoKChPdXRwdXRHYWRnZXQ6IGFueSk6IEdhZGdldCkpO1xuICB9XG5cbiAgcHJvdmlkZU91dHB1dFNlcnZpY2UoKTogT3V0cHV0U2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuX291dHB1dFNlcnZpY2U7XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuX3N0YXRlJC5nZXRWYWx1ZSgpO1xuICAgIHJldHVybiB7XG4gICAgICByZWNvcmRzOiBzdGF0ZS5yZWNvcmRzLFxuICAgIH07XG4gIH1cblxufVxuXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZUFwcFN0YXRlKHJhd1N0YXRlOiA/T2JqZWN0KTogQXBwU3RhdGUge1xuICByYXdTdGF0ZSA9IHJhd1N0YXRlIHx8IHt9O1xuICByZXR1cm4ge1xuICAgIHJlY29yZHM6IHJhd1N0YXRlLnJlY29yZHMgfHwgW10sXG4gICAgcHJvdmlkZXJzOiBuZXcgTWFwKCksXG5cbiAgICAvLyBUaGlzIHZhbHVlIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCB0aGUgdmFsdWUgZm9ybSB0aGUgY29uZmlnLiBXZSBqdXN0IHVzZSBgUE9TSVRJVkVfSU5GSU5JVFlgXG4gICAgLy8gaGVyZSB0byBjb25mb3JtIHRvIHRoZSBBcHBTdGF0ZSB0eXBlIGRlZmludGlvbi5cbiAgICBtYXhNZXNzYWdlQ291bnQ6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19