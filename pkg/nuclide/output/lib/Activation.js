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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBY2tDLE1BQU07O3dCQUNuQixZQUFZOzs7O2tDQUNGLHNCQUFzQjs7OztpQ0FDdkIscUJBQXFCOzs7OzZCQUN6QixzQkFBc0I7Ozs7NkJBQ3RCLGlCQUFpQjs7OztrQkFDNUIsSUFBSTs7OztJQUViLFVBQVU7QUFNSCxXQU5QLFVBQVUsQ0FNRixRQUFpQixFQUFFOzs7MEJBTjNCLFVBQVU7O0FBT1osUUFBTSxPQUFPLEdBQUcsSUFBSSxnQkFBRyxPQUFPLEVBQUUsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxHQUFHLG9DQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFDdEIsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQzlCLENBQUM7QUFDRixRQUFJLENBQUMsU0FBUyxHQUFHLDBCQUNmLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFDcEI7YUFBTSxNQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUU7S0FBQSxDQUM5QixDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLDJCQUFjLE9BQU8sQ0FDbkIsb0NBQW9DLEVBQ3BDLFVBQUEsZUFBZTthQUFJLE1BQUssU0FBUyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztLQUFBLENBQ3RFLENBQ0YsQ0FBQztHQUNIOztlQXZCRyxVQUFVOztXQXlCUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVvQiwrQkFBQyxVQUEwQixFQUFlO0FBQzdELFVBQU0sWUFBWSxHQUFHLHFDQUFtQixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyRixhQUFPLFVBQVUsQ0FBQyxjQUFjLENBQUcsWUFBWSxDQUFnQixDQUFDO0tBQ2pFOzs7V0FFbUIsZ0NBQWtCO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztLQUM1Qjs7O1dBRVEscUJBQVc7QUFDbEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN0QyxhQUFPO0FBQ0wsZUFBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO09BQ3ZCLENBQUM7S0FDSDs7O1NBM0NHLFVBQVU7OztBQStDaEIsU0FBUyxtQkFBbUIsQ0FBQyxRQUFpQixFQUFZO0FBQ3hELFVBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO0FBQzFCLFNBQU87QUFDTCxXQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFO0FBQy9CLGFBQVMsRUFBRSxJQUFJLEdBQUcsRUFBRTs7OztBQUlwQixtQkFBZSxFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7R0FDMUMsQ0FBQztDQUNIOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0c1NlcnZpY2UsIEdhZGdldH0gZnJvbSAnLi4vLi4vZ2FkZ2V0cy1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtBcHBTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9Db21tYW5kcyc7XG5pbXBvcnQgY3JlYXRlT3V0cHV0R2FkZ2V0IGZyb20gJy4vY3JlYXRlT3V0cHV0R2FkZ2V0JztcbmltcG9ydCBjcmVhdGVTdGF0ZVN0cmVhbSBmcm9tICcuL2NyZWF0ZVN0YXRlU3RyZWFtJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcbmltcG9ydCBPdXRwdXRTZXJ2aWNlIGZyb20gJy4vT3V0cHV0U2VydmljZSc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2NvbW1hbmRzOiBDb21tYW5kcztcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfb3V0cHV0U2VydmljZTogT3V0cHV0U2VydmljZTtcbiAgX3N0YXRlJDogUnguQmVoYXZpb3JTdWJqZWN0PEFwcFN0YXRlPjtcblxuICBjb25zdHJ1Y3RvcihyYXdTdGF0ZTogP09iamVjdCkge1xuICAgIGNvbnN0IGFjdGlvbiQgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMuX3N0YXRlJCA9IGNyZWF0ZVN0YXRlU3RyZWFtKFxuICAgICAgYWN0aW9uJC5hc09ic2VydmFibGUoKSxcbiAgICAgIGRlc2VyaWFsaXplQXBwU3RhdGUocmF3U3RhdGUpLFxuICAgICk7XG4gICAgdGhpcy5fY29tbWFuZHMgPSBuZXcgQ29tbWFuZHMoXG4gICAgICBhY3Rpb24kLmFzT2JzZXJ2ZXIoKSxcbiAgICAgICgpID0+IHRoaXMuX3N0YXRlJC5nZXRWYWx1ZSgpLFxuICAgICk7XG4gICAgdGhpcy5fb3V0cHV0U2VydmljZSA9IG5ldyBPdXRwdXRTZXJ2aWNlKHRoaXMuX2NvbW1hbmRzKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFxuICAgICAgICAnbnVjbGlkZS1vdXRwdXQubWF4aW11bU1lc3NhZ2VDb3VudCcsXG4gICAgICAgIG1heE1lc3NhZ2VDb3VudCA9PiB0aGlzLl9jb21tYW5kcy5zZXRNYXhNZXNzYWdlQ291bnQobWF4TWVzc2FnZUNvdW50KSxcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29uc3VtZUdhZGdldHNTZXJ2aWNlKGdhZGdldHNBcGk6IEdhZGdldHNTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IE91dHB1dEdhZGdldCA9IGNyZWF0ZU91dHB1dEdhZGdldCh0aGlzLl9zdGF0ZSQuYXNPYnNlcnZhYmxlKCksIHRoaXMuX2NvbW1hbmRzKTtcbiAgICByZXR1cm4gZ2FkZ2V0c0FwaS5yZWdpc3RlckdhZGdldCgoKE91dHB1dEdhZGdldDogYW55KTogR2FkZ2V0KSk7XG4gIH1cblxuICBwcm92aWRlT3V0cHV0U2VydmljZSgpOiBPdXRwdXRTZXJ2aWNlIHtcbiAgICByZXR1cm4gdGhpcy5fb3V0cHV0U2VydmljZTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5fc3RhdGUkLmdldFZhbHVlKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlY29yZHM6IHN0YXRlLnJlY29yZHMsXG4gICAgfTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGRlc2VyaWFsaXplQXBwU3RhdGUocmF3U3RhdGU6ID9PYmplY3QpOiBBcHBTdGF0ZSB7XG4gIHJhd1N0YXRlID0gcmF3U3RhdGUgfHwge307XG4gIHJldHVybiB7XG4gICAgcmVjb3JkczogcmF3U3RhdGUucmVjb3JkcyB8fCBbXSxcbiAgICBwcm92aWRlcnM6IG5ldyBNYXAoKSxcblxuICAgIC8vIFRoaXMgdmFsdWUgd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSB2YWx1ZSBmb3JtIHRoZSBjb25maWcuIFdlIGp1c3QgdXNlIGBQT1NJVElWRV9JTkZJTklUWWBcbiAgICAvLyBoZXJlIHRvIGNvbmZvcm0gdG8gdGhlIEFwcFN0YXRlIHR5cGUgZGVmaW50aW9uLlxuICAgIG1heE1lc3NhZ2VDb3VudDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=