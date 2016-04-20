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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _getCurrentExecutorId = require('./getCurrentExecutorId');

var _getCurrentExecutorId2 = _interopRequireDefault(_getCurrentExecutorId);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var Commands = (function () {
  function Commands(observer, getState) {
    _classCallCheck(this, Commands);

    this._observer = observer;
    this._getState = getState;
  }

  _createClass(Commands, [{
    key: 'clearRecords',
    value: function clearRecords() {
      this._observer.next({
        type: ActionTypes.RECORDS_CLEARED
      });
    }

    /**
     * Execute the provided code using the current executor.
     */
  }, {
    key: 'execute',
    value: function execute(code) {
      var currentExecutorId = (0, _getCurrentExecutorId2['default'])(this._getState());
      (0, _assert2['default'])(currentExecutorId);

      var executor = this._getState().executors.get(currentExecutorId);
      (0, _assert2['default'])(executor != null);

      // TODO: Is this the best way to do this? Might want to go through nuclide-executors and have
      //       that register output sources?
      this._observer.next({
        type: ActionTypes.MESSAGE_RECEIVED,
        payload: {
          record: {
            kind: 'request',
            level: 'log',
            text: code,
            scopeName: executor.scopeName
          }
        }
      });

      this._observer.next({
        type: ActionTypes.EXECUTE,
        payload: {
          executorId: currentExecutorId,
          code: code
        }
      });
    }
  }, {
    key: 'registerExecutor',
    value: function registerExecutor(executor) {
      this._observer.next({
        type: ActionTypes.REGISTER_EXECUTOR,
        payload: { executor: executor }
      });
      this._registerRecordProvider({
        source: executor.id,
        records: executor.output.map(function (message) {
          return _extends({}, message, {
            kind: 'response',
            source: executor.id,
            scopeName: null });
        })
      });
    }
  }, {
    key: 'registerOutputProvider',
    // The output won't be in the language's grammar.
    value: function registerOutputProvider(outputProvider) {
      // Transform the messages into actions and merge them into the action stream.
      // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
      //       way, we won't trigger cold observer side-effects when we don't need the results.
      return this._registerRecordProvider(_extends({}, outputProvider, {
        records: outputProvider.messages.map(function (message) {
          return _extends({}, message, {
            kind: 'message',
            source: outputProvider.source,
            scopeName: null
          });
        })
      }));
    }
  }, {
    key: '_registerRecordProvider',
    value: function _registerRecordProvider(recordProvider) {
      var _this = this;

      // Transform the messages into actions and merge them into the action stream.
      // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
      //       way, we won't trigger cold observer side-effects when we don't need the results.
      var subscription = recordProvider.records.map(function (record) {
        return {
          type: ActionTypes.MESSAGE_RECEIVED,
          payload: { record: record }
        };
      }).subscribe(function (action) {
        return _this._observer.next(action);
      });

      this._observer.next({
        type: ActionTypes.PROVIDER_REGISTERED,
        payload: {
          recordProvider: recordProvider,
          subscription: subscription
        }
      });
    }
  }, {
    key: 'removeSource',
    value: function removeSource(source) {
      var subscription = this._getState().providerSubscriptions.get(source);
      if (subscription == null) {
        return;
      }
      subscription.unsubscribe();
      this._observer.next({
        type: ActionTypes.SOURCE_REMOVED,
        payload: { source: source }
      });
    }
  }, {
    key: 'selectExecutor',
    value: function selectExecutor(executorId) {
      this._observer.next({
        type: ActionTypes.SELECT_EXECUTOR,
        payload: { executorId: executorId }
      });
    }
  }, {
    key: 'setMaxMessageCount',
    value: function setMaxMessageCount(maxMessageCount) {
      this._observer.next({
        type: ActionTypes.MAX_MESSAGE_COUNT_UPDATED,
        payload: { maxMessageCount: maxMessageCount }
      });
    }
  }, {
    key: 'unregisterExecutor',
    value: function unregisterExecutor(executor) {
      this._observer.next({
        type: ActionTypes.UNREGISTER_EXECUTOR,
        payload: { executor: executor }
      });
      this.removeSource(executor.id);
    }
  }]);

  return Commands;
})();

exports['default'] = Commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBYTZCLGVBQWU7O0lBQWhDLFdBQVc7O29DQUNVLHdCQUF3Qjs7OztzQkFDbkMsUUFBUTs7OztJQUVULFFBQVE7QUFLaEIsV0FMUSxRQUFRLENBS2YsUUFBc0IsRUFBRSxRQUF3QixFQUFFOzBCQUwzQyxRQUFROztBQU16QixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMxQixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztHQUMzQjs7ZUFSa0IsUUFBUTs7V0FVZix3QkFBUztBQUNuQixVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNsQixZQUFJLEVBQUUsV0FBVyxDQUFDLGVBQWU7T0FDbEMsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7V0FLTSxpQkFBQyxJQUFZLEVBQVE7QUFDMUIsVUFBTSxpQkFBaUIsR0FBRyx1Q0FBcUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDakUsK0JBQVUsaUJBQWlCLENBQUMsQ0FBQzs7QUFFN0IsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNuRSwrQkFBVSxRQUFRLElBQUksSUFBSSxDQUFDLENBQUM7Ozs7QUFJNUIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDbEIsWUFBSSxFQUFFLFdBQVcsQ0FBQyxnQkFBZ0I7QUFDbEMsZUFBTyxFQUFFO0FBQ1AsZ0JBQU0sRUFBRTtBQUNOLGdCQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFLLEVBQUUsS0FBSztBQUNaLGdCQUFJLEVBQUUsSUFBSTtBQUNWLHFCQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVM7V0FDOUI7U0FDRjtPQUNGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNsQixZQUFJLEVBQUUsV0FBVyxDQUFDLE9BQU87QUFDekIsZUFBTyxFQUFFO0FBQ1Asb0JBQVUsRUFBRSxpQkFBaUI7QUFDN0IsY0FBSSxFQUFKLElBQUk7U0FDTDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFZSwwQkFBQyxRQUFrQixFQUFRO0FBQ3pDLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ2xCLFlBQUksRUFBRSxXQUFXLENBQUMsaUJBQWlCO0FBQ25DLGVBQU8sRUFBRSxFQUFDLFFBQVEsRUFBUixRQUFRLEVBQUM7T0FDcEIsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLHVCQUF1QixDQUFDO0FBQzNCLGNBQU0sRUFBRSxRQUFRLENBQUMsRUFBRTtBQUNuQixlQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPOzhCQUMvQixPQUFPO0FBQ1YsZ0JBQUksRUFBRSxVQUFVO0FBQ2hCLGtCQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUU7QUFDbkIscUJBQVMsRUFBRSxJQUFJO1NBQ2YsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7O1dBRXFCLGdDQUFDLGNBQThCLEVBQVE7Ozs7QUFJM0QsYUFBTyxJQUFJLENBQUMsdUJBQXVCLGNBQzlCLGNBQWM7QUFDakIsZUFBTyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQzdCLEdBQUcsQ0FBQyxVQUFBLE9BQU87OEJBQ1AsT0FBTztBQUNWLGdCQUFJLEVBQUUsU0FBUztBQUNmLGtCQUFNLEVBQUUsY0FBYyxDQUFDLE1BQU07QUFDN0IscUJBQVMsRUFBRSxJQUFJOztTQUNmLENBQUM7U0FDTCxDQUFDO0tBQ0o7OztXQUVzQixpQ0FBQyxjQUE4QixFQUFROzs7Ozs7QUFJNUQsVUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FDeEMsR0FBRyxDQUFDLFVBQUEsTUFBTTtlQUFLO0FBQ2QsY0FBSSxFQUFFLFdBQVcsQ0FBQyxnQkFBZ0I7QUFDbEMsaUJBQU8sRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUM7U0FDbEI7T0FBQyxDQUFDLENBQ0YsU0FBUyxDQUFDLFVBQUEsTUFBTTtlQUFJLE1BQUssU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXBELFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ2xCLFlBQUksRUFBRSxXQUFXLENBQUMsbUJBQW1CO0FBQ3JDLGVBQU8sRUFBRTtBQUNQLHdCQUFjLEVBQWQsY0FBYztBQUNkLHNCQUFZLEVBQVosWUFBWTtTQUNiO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVXLHNCQUFDLE1BQWMsRUFBUTtBQUNqQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hFLFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixlQUFPO09BQ1I7QUFDRCxrQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ2xCLFlBQUksRUFBRSxXQUFXLENBQUMsY0FBYztBQUNoQyxlQUFPLEVBQUUsRUFBQyxNQUFNLEVBQU4sTUFBTSxFQUFDO09BQ2xCLENBQUMsQ0FBQztLQUNKOzs7V0FFYSx3QkFBQyxVQUFrQixFQUFRO0FBQ3ZDLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ2xCLFlBQUksRUFBRSxXQUFXLENBQUMsZUFBZTtBQUNqQyxlQUFPLEVBQUUsRUFBQyxVQUFVLEVBQVYsVUFBVSxFQUFDO09BQ3RCLENBQUMsQ0FBQztLQUNKOzs7V0FFaUIsNEJBQUMsZUFBdUIsRUFBUTtBQUNoRCxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNsQixZQUFJLEVBQUUsV0FBVyxDQUFDLHlCQUF5QjtBQUMzQyxlQUFPLEVBQUUsRUFBQyxlQUFlLEVBQWYsZUFBZSxFQUFDO09BQzNCLENBQUMsQ0FBQztLQUNKOzs7V0FFaUIsNEJBQUMsUUFBa0IsRUFBUTtBQUMzQyxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNsQixZQUFJLEVBQUUsV0FBVyxDQUFDLG1CQUFtQjtBQUNyQyxlQUFPLEVBQUUsRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFDO09BQ3BCLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ2hDOzs7U0FySWtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6IkNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0FwcFN0YXRlLCBFeGVjdXRvciwgT3V0cHV0UHJvdmlkZXIsIFJlY29yZFByb3ZpZGVyfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0ICogYXMgQWN0aW9uVHlwZXMgZnJvbSAnLi9BY3Rpb25UeXBlcyc7XG5pbXBvcnQgZ2V0Q3VycmVudEV4ZWN1dG9ySWQgZnJvbSAnLi9nZXRDdXJyZW50RXhlY3V0b3JJZCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRzIHtcblxuICBfb2JzZXJ2ZXI6IHJ4JElPYnNlcnZlcjtcbiAgX2dldFN0YXRlOiAoKSA9PiBBcHBTdGF0ZTtcblxuICBjb25zdHJ1Y3RvcihvYnNlcnZlcjogcngkSU9ic2VydmVyLCBnZXRTdGF0ZTogKCkgPT4gQXBwU3RhdGUpIHtcbiAgICB0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuICAgIHRoaXMuX2dldFN0YXRlID0gZ2V0U3RhdGU7XG4gIH1cblxuICBjbGVhclJlY29yZHMoKTogdm9pZCB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRUNPUkRTX0NMRUFSRUQsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSB0aGUgcHJvdmlkZWQgY29kZSB1c2luZyB0aGUgY3VycmVudCBleGVjdXRvci5cbiAgICovXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudEV4ZWN1dG9ySWQgPSBnZXRDdXJyZW50RXhlY3V0b3JJZCh0aGlzLl9nZXRTdGF0ZSgpKTtcbiAgICBpbnZhcmlhbnQoY3VycmVudEV4ZWN1dG9ySWQpO1xuXG4gICAgY29uc3QgZXhlY3V0b3IgPSB0aGlzLl9nZXRTdGF0ZSgpLmV4ZWN1dG9ycy5nZXQoY3VycmVudEV4ZWN1dG9ySWQpO1xuICAgIGludmFyaWFudChleGVjdXRvciAhPSBudWxsKTtcblxuICAgIC8vIFRPRE86IElzIHRoaXMgdGhlIGJlc3Qgd2F5IHRvIGRvIHRoaXM/IE1pZ2h0IHdhbnQgdG8gZ28gdGhyb3VnaCBudWNsaWRlLWV4ZWN1dG9ycyBhbmQgaGF2ZVxuICAgIC8vICAgICAgIHRoYXQgcmVnaXN0ZXIgb3V0cHV0IHNvdXJjZXM/XG4gICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5NRVNTQUdFX1JFQ0VJVkVELFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICByZWNvcmQ6IHtcbiAgICAgICAgICBraW5kOiAncmVxdWVzdCcsXG4gICAgICAgICAgbGV2ZWw6ICdsb2cnLFxuICAgICAgICAgIHRleHQ6IGNvZGUsXG4gICAgICAgICAgc2NvcGVOYW1lOiBleGVjdXRvci5zY29wZU5hbWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5FWEVDVVRFLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBleGVjdXRvcklkOiBjdXJyZW50RXhlY3V0b3JJZCxcbiAgICAgICAgY29kZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICByZWdpc3RlckV4ZWN1dG9yKGV4ZWN1dG9yOiBFeGVjdXRvcik6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuUkVHSVNURVJfRVhFQ1VUT1IsXG4gICAgICBwYXlsb2FkOiB7ZXhlY3V0b3J9LFxuICAgIH0pO1xuICAgIHRoaXMuX3JlZ2lzdGVyUmVjb3JkUHJvdmlkZXIoe1xuICAgICAgc291cmNlOiBleGVjdXRvci5pZCxcbiAgICAgIHJlY29yZHM6IGV4ZWN1dG9yLm91dHB1dC5tYXAobWVzc2FnZSA9PiAoe1xuICAgICAgICAuLi5tZXNzYWdlLFxuICAgICAgICBraW5kOiAncmVzcG9uc2UnLFxuICAgICAgICBzb3VyY2U6IGV4ZWN1dG9yLmlkLFxuICAgICAgICBzY29wZU5hbWU6IG51bGwsIC8vIFRoZSBvdXRwdXQgd29uJ3QgYmUgaW4gdGhlIGxhbmd1YWdlJ3MgZ3JhbW1hci5cbiAgICAgIH0pKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyT3V0cHV0UHJvdmlkZXIob3V0cHV0UHJvdmlkZXI6IE91dHB1dFByb3ZpZGVyKTogdm9pZCB7XG4gICAgLy8gVHJhbnNmb3JtIHRoZSBtZXNzYWdlcyBpbnRvIGFjdGlvbnMgYW5kIG1lcmdlIHRoZW0gaW50byB0aGUgYWN0aW9uIHN0cmVhbS5cbiAgICAvLyBUT0RPOiBBZGQgZW5hYmxpbmcvZGlzYWJsaW5nIG9mIHJlZ2lzdGVyZWQgc291cmNlIGFuZCBvbmx5IHN1YnNjcmliZSB3aGVuIGVuYWJsZWQuIFRoYXRcbiAgICAvLyAgICAgICB3YXksIHdlIHdvbid0IHRyaWdnZXIgY29sZCBvYnNlcnZlciBzaWRlLWVmZmVjdHMgd2hlbiB3ZSBkb24ndCBuZWVkIHRoZSByZXN1bHRzLlxuICAgIHJldHVybiB0aGlzLl9yZWdpc3RlclJlY29yZFByb3ZpZGVyKHtcbiAgICAgIC4uLm91dHB1dFByb3ZpZGVyLFxuICAgICAgcmVjb3Jkczogb3V0cHV0UHJvdmlkZXIubWVzc2FnZXNcbiAgICAgICAgLm1hcChtZXNzYWdlID0+ICh7XG4gICAgICAgICAgLi4ubWVzc2FnZSxcbiAgICAgICAgICBraW5kOiAnbWVzc2FnZScsXG4gICAgICAgICAgc291cmNlOiBvdXRwdXRQcm92aWRlci5zb3VyY2UsXG4gICAgICAgICAgc2NvcGVOYW1lOiBudWxsLFxuICAgICAgICB9KSksXG4gICAgfSk7XG4gIH1cblxuICBfcmVnaXN0ZXJSZWNvcmRQcm92aWRlcihyZWNvcmRQcm92aWRlcjogUmVjb3JkUHJvdmlkZXIpOiB2b2lkIHtcbiAgICAvLyBUcmFuc2Zvcm0gdGhlIG1lc3NhZ2VzIGludG8gYWN0aW9ucyBhbmQgbWVyZ2UgdGhlbSBpbnRvIHRoZSBhY3Rpb24gc3RyZWFtLlxuICAgIC8vIFRPRE86IEFkZCBlbmFibGluZy9kaXNhYmxpbmcgb2YgcmVnaXN0ZXJlZCBzb3VyY2UgYW5kIG9ubHkgc3Vic2NyaWJlIHdoZW4gZW5hYmxlZC4gVGhhdFxuICAgIC8vICAgICAgIHdheSwgd2Ugd29uJ3QgdHJpZ2dlciBjb2xkIG9ic2VydmVyIHNpZGUtZWZmZWN0cyB3aGVuIHdlIGRvbid0IG5lZWQgdGhlIHJlc3VsdHMuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gcmVjb3JkUHJvdmlkZXIucmVjb3Jkc1xuICAgICAgLm1hcChyZWNvcmQgPT4gKHtcbiAgICAgICAgdHlwZTogQWN0aW9uVHlwZXMuTUVTU0FHRV9SRUNFSVZFRCxcbiAgICAgICAgcGF5bG9hZDoge3JlY29yZH0sXG4gICAgICB9KSlcbiAgICAgIC5zdWJzY3JpYmUoYWN0aW9uID0+IHRoaXMuX29ic2VydmVyLm5leHQoYWN0aW9uKSk7XG5cbiAgICB0aGlzLl9vYnNlcnZlci5uZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLlBST1ZJREVSX1JFR0lTVEVSRUQsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHJlY29yZFByb3ZpZGVyLFxuICAgICAgICBzdWJzY3JpcHRpb24sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlU291cmNlKHNvdXJjZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZ2V0U3RhdGUoKS5wcm92aWRlclN1YnNjcmlwdGlvbnMuZ2V0KHNvdXJjZSk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX29ic2VydmVyLm5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuU09VUkNFX1JFTU9WRUQsXG4gICAgICBwYXlsb2FkOiB7c291cmNlfSxcbiAgICB9KTtcbiAgfVxuXG4gIHNlbGVjdEV4ZWN1dG9yKGV4ZWN1dG9ySWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuU0VMRUNUX0VYRUNVVE9SLFxuICAgICAgcGF5bG9hZDoge2V4ZWN1dG9ySWR9LFxuICAgIH0pO1xuICB9XG5cbiAgc2V0TWF4TWVzc2FnZUNvdW50KG1heE1lc3NhZ2VDb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5NQVhfTUVTU0FHRV9DT1VOVF9VUERBVEVELFxuICAgICAgcGF5bG9hZDoge21heE1lc3NhZ2VDb3VudH0sXG4gICAgfSk7XG4gIH1cblxuICB1bnJlZ2lzdGVyRXhlY3V0b3IoZXhlY3V0b3I6IEV4ZWN1dG9yKTogdm9pZCB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5VTlJFR0lTVEVSX0VYRUNVVE9SLFxuICAgICAgcGF5bG9hZDoge2V4ZWN1dG9yfSxcbiAgICB9KTtcbiAgICB0aGlzLnJlbW92ZVNvdXJjZShleGVjdXRvci5pZCk7XG4gIH1cblxufVxuIl19