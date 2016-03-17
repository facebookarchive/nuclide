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
      }).subscribe(function (action) {
        return _this._observer.onNext(action);
      }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWE2QixlQUFlOztJQUFoQyxXQUFXOztvQkFDdUIsTUFBTTs7SUFFL0IsUUFBUTtBQUtoQixXQUxRLFFBQVEsQ0FLZixRQUFzQixFQUFFLFFBQXdCLEVBQUU7MEJBTDNDLFFBQVE7O0FBTXpCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0dBQzNCOztlQVJrQixRQUFROztXQVVmLHdCQUFTO0FBQ25CLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3BCLFlBQUksRUFBRSxXQUFXLENBQUMsZUFBZTtPQUNsQyxDQUFDLENBQUM7S0FDSjs7O1dBRXFCLGdDQUFDLGNBQThCLEVBQWU7OztBQUNsRSxVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUNwQixZQUFJLEVBQUUsV0FBVyxDQUFDLG1CQUFtQjtBQUNyQyxlQUFPLEVBQUUsRUFBQyxjQUFjLEVBQWQsY0FBYyxFQUFDO09BQzFCLENBQUMsQ0FBQzs7QUFFSCxhQUFPLDhCQUNMLHFCQUFlLFlBQU07QUFDbkIsY0FBSyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzFDLENBQUM7Ozs7O0FBS0Ysb0JBQWMsQ0FBQyxRQUFRLENBQ3BCLEdBQUcsQ0FBQyxVQUFBLE9BQU87ZUFBSztBQUNmLGNBQUksRUFBRSxXQUFXLENBQUMsZ0JBQWdCO0FBQ2xDLGlCQUFPLEVBQUU7QUFDUCxrQkFBTSxlQUNELE9BQU87QUFDVixvQkFBTSxFQUFFLGNBQWMsQ0FBQyxNQUFNO2NBQzlCO1dBQ0Y7U0FDRjtPQUFDLENBQUMsQ0FDRixTQUFTLENBQUMsVUFBQSxNQUFNO2VBQUksTUFBSyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztPQUFBLENBQUMsQ0FDdEQsQ0FBQztLQUNIOzs7V0FFVyxzQkFBQyxNQUFjLEVBQVE7QUFDakMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDcEIsWUFBSSxFQUFFLFdBQVcsQ0FBQyxjQUFjO0FBQ2hDLGVBQU8sRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUM7T0FDbEIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVpQiw0QkFBQyxlQUF1QixFQUFRO0FBQ2hELFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3BCLFlBQUksRUFBRSxXQUFXLENBQUMseUJBQXlCO0FBQzNDLGVBQU8sRUFBRSxFQUFDLGVBQWUsRUFBZixlQUFlLEVBQUM7T0FDM0IsQ0FBQyxDQUFDO0tBQ0o7OztTQXhEa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiQ29tbWFuZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QXBwU3RhdGUsIE91dHB1dFByb3ZpZGVyfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0ICogYXMgQWN0aW9uVHlwZXMgZnJvbSAnLi9BY3Rpb25UeXBlcyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kcyB7XG5cbiAgX29ic2VydmVyOiByeCRJT2JzZXJ2ZXI7XG4gIF9nZXRTdGF0ZTogKCkgPT4gQXBwU3RhdGU7XG5cbiAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6IHJ4JElPYnNlcnZlciwgZ2V0U3RhdGU6ICgpID0+IEFwcFN0YXRlKSB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcbiAgICB0aGlzLl9nZXRTdGF0ZSA9IGdldFN0YXRlO1xuICB9XG5cbiAgY2xlYXJSZWNvcmRzKCk6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRUNPUkRTX0NMRUFSRUQsXG4gICAgfSk7XG4gIH1cblxuICByZWdpc3Rlck91dHB1dFByb3ZpZGVyKG91dHB1dFByb3ZpZGVyOiBPdXRwdXRQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuUFJPVklERVJfUkVHSVNURVJFRCxcbiAgICAgIHBheWxvYWQ6IHtvdXRwdXRQcm92aWRlcn0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMucmVtb3ZlU291cmNlKG91dHB1dFByb3ZpZGVyLnNvdXJjZSk7XG4gICAgICB9KSxcblxuICAgICAgLy8gVHJhbnNmb3JtIHRoZSBtZXNzYWdlcyBpbnRvIGFjdGlvbnMgYW5kIG1lcmdlIHRoZW0gaW50byB0aGUgYWN0aW9uIHN0cmVhbS5cbiAgICAgIC8vIFRPRE86IEFkZCBlbmFibGluZy9kaXNhYmxpbmcgb2YgcmVnaXN0ZXJlZCBzb3VyY2UgYW5kIG9ubHkgc3Vic2NyaWJlIHdoZW4gZW5hYmxlZC4gVGhhdFxuICAgICAgLy8gICAgICAgd2F5LCB3ZSB3b24ndCB0cmlnZ2VyIGNvbGQgb2JzZXJ2ZXIgc2lkZS1lZmZlY3RzIHdoZW4gd2UgZG9uJ3QgbmVlZCB0aGUgcmVzdWx0cy5cbiAgICAgIG91dHB1dFByb3ZpZGVyLm1lc3NhZ2VzXG4gICAgICAgIC5tYXAobWVzc2FnZSA9PiAoe1xuICAgICAgICAgIHR5cGU6IEFjdGlvblR5cGVzLk1FU1NBR0VfUkVDRUlWRUQsXG4gICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgcmVjb3JkOiB7XG4gICAgICAgICAgICAgIC4uLm1lc3NhZ2UsXG4gICAgICAgICAgICAgIHNvdXJjZTogb3V0cHV0UHJvdmlkZXIuc291cmNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSlcbiAgICAgICAgLnN1YnNjcmliZShhY3Rpb24gPT4gdGhpcy5fb2JzZXJ2ZXIub25OZXh0KGFjdGlvbikpLFxuICAgICk7XG4gIH1cblxuICByZW1vdmVTb3VyY2Uoc291cmNlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuU09VUkNFX1JFTU9WRUQsXG4gICAgICBwYXlsb2FkOiB7c291cmNlfSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldE1heE1lc3NhZ2VDb3VudChtYXhNZXNzYWdlQ291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5NQVhfTUVTU0FHRV9DT1VOVF9VUERBVEVELFxuICAgICAgcGF5bG9hZDoge21heE1lc3NhZ2VDb3VudH0sXG4gICAgfSk7XG4gIH1cblxufVxuIl19