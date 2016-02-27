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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWE2QixlQUFlOztJQUFoQyxXQUFXOztvQkFDdUIsTUFBTTs7SUFFL0IsUUFBUTtBQUtoQixXQUxRLFFBQVEsQ0FLZixRQUFzQixFQUFFLFFBQXdCLEVBQUU7MEJBTDNDLFFBQVE7O0FBTXpCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0dBQzNCOztlQVJrQixRQUFROztXQVVmLHdCQUFTO0FBQ25CLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3BCLFlBQUksRUFBRSxXQUFXLENBQUMsZUFBZTtPQUNsQyxDQUFDLENBQUM7S0FDSjs7O1dBRXFCLGdDQUFDLGNBQThCLEVBQWU7OztBQUNsRSxVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUNwQixZQUFJLEVBQUUsV0FBVyxDQUFDLG1CQUFtQjtBQUNyQyxlQUFPLEVBQUUsRUFBQyxjQUFjLEVBQWQsY0FBYyxFQUFDO09BQzFCLENBQUMsQ0FBQzs7QUFFSCxhQUFPLDhCQUNMLHFCQUFlLFlBQU07QUFDbkIsY0FBSyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzFDLENBQUM7Ozs7O0FBS0Ysb0JBQWMsQ0FBQyxRQUFRLENBQ3BCLEdBQUcsQ0FBQyxVQUFBLE9BQU87ZUFBSztBQUNmLGNBQUksRUFBRSxXQUFXLENBQUMsZ0JBQWdCO0FBQ2xDLGlCQUFPLEVBQUU7QUFDUCxrQkFBTSxlQUNELE9BQU87QUFDVixvQkFBTSxFQUFFLGNBQWMsQ0FBQyxNQUFNO2NBQzlCO1dBQ0Y7U0FDRjtPQUFDLENBQUMsQ0FDRixTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUM3QixDQUFDO0tBQ0g7OztXQUVXLHNCQUFDLE1BQWMsRUFBUTtBQUNqQyxVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUNwQixZQUFJLEVBQUUsV0FBVyxDQUFDLGNBQWM7QUFDaEMsZUFBTyxFQUFFLEVBQUMsTUFBTSxFQUFOLE1BQU0sRUFBQztPQUNsQixDQUFDLENBQUM7S0FDSjs7O1dBRWlCLDRCQUFDLGVBQXVCLEVBQVE7QUFDaEQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDcEIsWUFBSSxFQUFFLFdBQVcsQ0FBQyx5QkFBeUI7QUFDM0MsZUFBTyxFQUFFLEVBQUMsZUFBZSxFQUFmLGVBQWUsRUFBQztPQUMzQixDQUFDLENBQUM7S0FDSjs7O1NBeERrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiJDb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtBcHBTdGF0ZSwgT3V0cHV0UHJvdmlkZXJ9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRzIHtcblxuICBfb2JzZXJ2ZXI6IHJ4JElPYnNlcnZlcjtcbiAgX2dldFN0YXRlOiAoKSA9PiBBcHBTdGF0ZTtcblxuICBjb25zdHJ1Y3RvcihvYnNlcnZlcjogcngkSU9ic2VydmVyLCBnZXRTdGF0ZTogKCkgPT4gQXBwU3RhdGUpIHtcbiAgICB0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuICAgIHRoaXMuX2dldFN0YXRlID0gZ2V0U3RhdGU7XG4gIH1cblxuICBjbGVhclJlY29yZHMoKTogdm9pZCB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFQ09SRFNfQ0xFQVJFRCxcbiAgICB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyT3V0cHV0UHJvdmlkZXIob3V0cHV0UHJvdmlkZXI6IE91dHB1dFByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5QUk9WSURFUl9SRUdJU1RFUkVELFxuICAgICAgcGF5bG9hZDoge291dHB1dFByb3ZpZGVyfSxcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgdGhpcy5yZW1vdmVTb3VyY2Uob3V0cHV0UHJvdmlkZXIuc291cmNlKTtcbiAgICAgIH0pLFxuXG4gICAgICAvLyBUcmFuc2Zvcm0gdGhlIG1lc3NhZ2VzIGludG8gYWN0aW9ucyBhbmQgbWVyZ2UgdGhlbSBpbnRvIHRoZSBhY3Rpb24gc3RyZWFtLlxuICAgICAgLy8gVE9ETzogQWRkIGVuYWJsaW5nL2Rpc2FibGluZyBvZiByZWdpc3RlcmVkIHNvdXJjZSBhbmQgb25seSBzdWJzY3JpYmUgd2hlbiBlbmFibGVkLiBUaGF0XG4gICAgICAvLyAgICAgICB3YXksIHdlIHdvbid0IHRyaWdnZXIgY29sZCBvYnNlcnZlciBzaWRlLWVmZmVjdHMgd2hlbiB3ZSBkb24ndCBuZWVkIHRoZSByZXN1bHRzLlxuICAgICAgb3V0cHV0UHJvdmlkZXIubWVzc2FnZXNcbiAgICAgICAgLm1hcChtZXNzYWdlID0+ICh7XG4gICAgICAgICAgdHlwZTogQWN0aW9uVHlwZXMuTUVTU0FHRV9SRUNFSVZFRCxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICByZWNvcmQ6IHtcbiAgICAgICAgICAgICAgLi4ubWVzc2FnZSxcbiAgICAgICAgICAgICAgc291cmNlOiBvdXRwdXRQcm92aWRlci5zb3VyY2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMuX29ic2VydmVyKSxcbiAgICApO1xuICB9XG5cbiAgcmVtb3ZlU291cmNlKHNvdXJjZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLlNPVVJDRV9SRU1PVkVELFxuICAgICAgcGF5bG9hZDoge3NvdXJjZX0sXG4gICAgfSk7XG4gIH1cblxuICBzZXRNYXhNZXNzYWdlQ291bnQobWF4TWVzc2FnZUNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuTUFYX01FU1NBR0VfQ09VTlRfVVBEQVRFRCxcbiAgICAgIHBheWxvYWQ6IHttYXhNZXNzYWdlQ291bnR9LFxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==