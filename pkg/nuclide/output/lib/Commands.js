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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _atom = require('atom');

var Commands = (function () {
  function Commands(observer, getState) {
    _classCallCheck(this, Commands);

    this._observer = observer;
    this._getState = getState;
  }

  _createClass(Commands, [{
    key: 'clearRecords',
    value: function clearRecords() {
      this._observer.onNext({
        type: ActionTypes.RECORDS_CLEARED
      });
    }
  }, {
    key: 'registerOutputProvider',
    value: function registerOutputProvider(outputProvider) {
      var _this = this;

      this._observer.onNext({
        type: ActionTypes.PROVIDER_REGISTERED,
        payload: { outputProvider: outputProvider }
      });

      return new _atom.CompositeDisposable(new _atom.Disposable(function () {
        _this.removeSource(outputProvider.source);
      }),

      // Transform the messages into actions and merge them into the action stream.
      // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
      //       way, we won't trigger cold observer side-effects when we don't need the results.
      outputProvider.messages.map(function (message) {
        return {
          type: ActionTypes.MESSAGE_RECEIVED,
          payload: {
            record: _extends({}, message, {
              source: outputProvider.source
            })
          }
        };
      }).subscribe(this._observer));
    }
  }, {
    key: 'removeSource',
    value: function removeSource(source) {
      this._observer.onNext({
        type: ActionTypes.SOURCE_REMOVED,
        payload: { source: source }
      });
    }
  }, {
    key: 'setMaxMessageCount',
    value: function setMaxMessageCount(maxMessageCount) {
      this._observer.onNext({
        type: ActionTypes.MAX_MESSAGE_COUNT_UPDATED,
        payload: { maxMessageCount: maxMessageCount }
      });
    }
  }]);

  return Commands;
})();

exports['default'] = Commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWE2QixlQUFlOztJQUFoQyxXQUFXOztvQkFDdUIsTUFBTTs7SUFFL0IsUUFBUTtBQUtoQixXQUxRLFFBQVEsQ0FLZixRQUFzQixFQUFFLFFBQXdCLEVBQUU7MEJBTDNDLFFBQVE7O0FBTXpCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0dBQzNCOztlQVJrQixRQUFROztXQVVmLHdCQUFTO0FBQ25CLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3BCLFlBQUksRUFBRSxXQUFXLENBQUMsZUFBZTtPQUNsQyxDQUFDLENBQUM7S0FDSjs7O1dBRXFCLGdDQUFDLGNBQThCLEVBQW9COzs7QUFDdkUsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDcEIsWUFBSSxFQUFFLFdBQVcsQ0FBQyxtQkFBbUI7QUFDckMsZUFBTyxFQUFFLEVBQUMsY0FBYyxFQUFkLGNBQWMsRUFBQztPQUMxQixDQUFDLENBQUM7O0FBRUgsYUFBTyw4QkFDTCxxQkFBZSxZQUFNO0FBQ25CLGNBQUssWUFBWSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMxQyxDQUFDOzs7OztBQUtGLG9CQUFjLENBQUMsUUFBUSxDQUNwQixHQUFHLENBQUMsVUFBQSxPQUFPO2VBQUs7QUFDZixjQUFJLEVBQUUsV0FBVyxDQUFDLGdCQUFnQjtBQUNsQyxpQkFBTyxFQUFFO0FBQ1Asa0JBQU0sZUFDRCxPQUFPO0FBQ1Ysb0JBQU0sRUFBRSxjQUFjLENBQUMsTUFBTTtjQUM5QjtXQUNGO1NBQ0Y7T0FBQyxDQUFDLENBQ0YsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDN0IsQ0FBQztLQUNIOzs7V0FFVyxzQkFBQyxNQUFjLEVBQVE7QUFDakMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDcEIsWUFBSSxFQUFFLFdBQVcsQ0FBQyxjQUFjO0FBQ2hDLGVBQU8sRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUM7T0FDbEIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVpQiw0QkFBQyxlQUF1QixFQUFRO0FBQ2hELFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3BCLFlBQUksRUFBRSxXQUFXLENBQUMseUJBQXlCO0FBQzNDLGVBQU8sRUFBRSxFQUFDLGVBQWUsRUFBZixlQUFlLEVBQUM7T0FDM0IsQ0FBQyxDQUFDO0tBQ0o7OztTQXhEa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiQ29tbWFuZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QXBwU3RhdGUsIE91dHB1dFByb3ZpZGVyfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0ICogYXMgQWN0aW9uVHlwZXMgZnJvbSAnLi9BY3Rpb25UeXBlcyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kcyB7XG5cbiAgX29ic2VydmVyOiByeCRJT2JzZXJ2ZXI7XG4gIF9nZXRTdGF0ZTogKCkgPT4gQXBwU3RhdGU7XG5cbiAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6IHJ4JElPYnNlcnZlciwgZ2V0U3RhdGU6ICgpID0+IEFwcFN0YXRlKSB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcbiAgICB0aGlzLl9nZXRTdGF0ZSA9IGdldFN0YXRlO1xuICB9XG5cbiAgY2xlYXJSZWNvcmRzKCk6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRUNPUkRTX0NMRUFSRUQsXG4gICAgfSk7XG4gIH1cblxuICByZWdpc3Rlck91dHB1dFByb3ZpZGVyKG91dHB1dFByb3ZpZGVyOiBPdXRwdXRQcm92aWRlcik6IGF0b20kSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5QUk9WSURFUl9SRUdJU1RFUkVELFxuICAgICAgcGF5bG9hZDoge291dHB1dFByb3ZpZGVyfSxcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgdGhpcy5yZW1vdmVTb3VyY2Uob3V0cHV0UHJvdmlkZXIuc291cmNlKTtcbiAgICAgIH0pLFxuXG4gICAgICAvLyBUcmFuc2Zvcm0gdGhlIG1lc3NhZ2VzIGludG8gYWN0aW9ucyBhbmQgbWVyZ2UgdGhlbSBpbnRvIHRoZSBhY3Rpb24gc3RyZWFtLlxuICAgICAgLy8gVE9ETzogQWRkIGVuYWJsaW5nL2Rpc2FibGluZyBvZiByZWdpc3RlcmVkIHNvdXJjZSBhbmQgb25seSBzdWJzY3JpYmUgd2hlbiBlbmFibGVkLiBUaGF0XG4gICAgICAvLyAgICAgICB3YXksIHdlIHdvbid0IHRyaWdnZXIgY29sZCBvYnNlcnZlciBzaWRlLWVmZmVjdHMgd2hlbiB3ZSBkb24ndCBuZWVkIHRoZSByZXN1bHRzLlxuICAgICAgb3V0cHV0UHJvdmlkZXIubWVzc2FnZXNcbiAgICAgICAgLm1hcChtZXNzYWdlID0+ICh7XG4gICAgICAgICAgdHlwZTogQWN0aW9uVHlwZXMuTUVTU0FHRV9SRUNFSVZFRCxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICByZWNvcmQ6IHtcbiAgICAgICAgICAgICAgLi4ubWVzc2FnZSxcbiAgICAgICAgICAgICAgc291cmNlOiBvdXRwdXRQcm92aWRlci5zb3VyY2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMuX29ic2VydmVyKSxcbiAgICApO1xuICB9XG5cbiAgcmVtb3ZlU291cmNlKHNvdXJjZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLlNPVVJDRV9SRU1PVkVELFxuICAgICAgcGF5bG9hZDoge3NvdXJjZX0sXG4gICAgfSk7XG4gIH1cblxuICBzZXRNYXhNZXNzYWdlQ291bnQobWF4TWVzc2FnZUNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuTUFYX01FU1NBR0VfQ09VTlRfVVBEQVRFRCxcbiAgICAgIHBheWxvYWQ6IHttYXhNZXNzYWdlQ291bnR9LFxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==