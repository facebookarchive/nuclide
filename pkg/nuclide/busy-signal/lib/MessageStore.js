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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rx = require('rx');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var MessageStore = (function () {
  function MessageStore() {
    _classCallCheck(this, MessageStore);

    this._currentMessages = new Map();
    this._messageStream = new _rx.BehaviorSubject([]);
  }

  _createClass(MessageStore, [{
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      var _this = this;

      var subscription = provider.messages.subscribe(function (message) {
        return _this._processUpdate(provider, message);
      });
      return new _atom.Disposable(function () {
        subscription.dispose();
        _this._currentMessages['delete'](provider);
        _this._publishMessages();
      });
    }
  }, {
    key: 'getMessageStream',
    value: function getMessageStream() {
      return this._messageStream;
    }
  }, {
    key: '_processUpdate',
    value: function _processUpdate(provider, message) {
      var idMap = this._currentMessages.get(provider);
      if (idMap == null) {
        idMap = new Map();
        this._currentMessages.set(provider, idMap);
      }
      if (message.status === 'busy') {
        idMap.set(message.id, message);
      } else {
        (0, _assert2['default'])(message.status === 'done');
        idMap['delete'](message.id);
      }
      this._publishMessages();
    }
  }, {
    key: '_publishMessages',
    value: function _publishMessages() {
      var messages = [];
      for (var idMap of this._currentMessages.values()) {
        for (var message of idMap.values()) {
          messages.push(message);
        }
      }
      this._messageStream.onNext(messages);
    }
  }]);

  return MessageStore;
})();

exports.MessageStore = MessageStore;

// provider to id to messages.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lc3NhZ2VTdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBaUIwQyxJQUFJOztvQkFDckIsTUFBTTs7c0JBQ1QsUUFBUTs7OztJQUVqQixZQUFZO0FBS1osV0FMQSxZQUFZLEdBS1Q7MEJBTEgsWUFBWTs7QUFNckIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbEMsUUFBSSxDQUFDLGNBQWMsR0FBRyx3QkFBb0IsRUFBRSxDQUFDLENBQUM7R0FDL0M7O2VBUlUsWUFBWTs7V0FVUix5QkFBQyxRQUE0QixFQUFlOzs7QUFDekQsVUFBTSxZQUFZLEdBQ2hCLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFVBQUEsT0FBTztlQUFJLE1BQUssY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDakYsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsY0FBSyxnQkFBZ0IsVUFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLGNBQUssZ0JBQWdCLEVBQUUsQ0FBQztPQUN6QixDQUFDLENBQUM7S0FDSjs7O1dBRWUsNEJBQTZDO0FBQzNELGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztLQUM1Qjs7O1dBRWEsd0JBQUMsUUFBNEIsRUFBRSxPQUEwQixFQUFRO0FBQzdFLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEQsVUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGFBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQzVDO0FBQ0QsVUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtBQUM3QixhQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDaEMsTUFBTTtBQUNMLGlDQUFVLE9BQU8sQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLENBQUM7QUFDckMsYUFBSyxVQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQzFCO0FBQ0QsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7OztXQUVlLDRCQUFTO0FBQ3ZCLFVBQU0sUUFBc0MsR0FBRyxFQUFFLENBQUM7QUFDbEQsV0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDbEQsYUFBSyxJQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDcEMsa0JBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEI7T0FDRjtBQUNELFVBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDOzs7U0EvQ1UsWUFBWSIsImZpbGUiOiJNZXNzYWdlU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEJ1c3lTaWduYWxQcm92aWRlcixcbiAgQnVzeVNpZ25hbE1lc3NhZ2UsXG4gIEJ1c3lTaWduYWxNZXNzYWdlQnVzeSxcbn0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZSwgQmVoYXZpb3JTdWJqZWN0fSBmcm9tICdyeCc7XG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZVN0b3JlIHtcbiAgLy8gcHJvdmlkZXIgdG8gaWQgdG8gbWVzc2FnZXMuXG4gIF9jdXJyZW50TWVzc2FnZXM6IE1hcDxCdXN5U2lnbmFsUHJvdmlkZXIsIE1hcDxudW1iZXIsIEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+O1xuICBfbWVzc2FnZVN0cmVhbTogQmVoYXZpb3JTdWJqZWN0PEFycmF5PEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2N1cnJlbnRNZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9tZXNzYWdlU3RyZWFtID0gbmV3IEJlaGF2aW9yU3ViamVjdChbXSk7XG4gIH1cblxuICBjb25zdW1lUHJvdmlkZXIocHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPVxuICAgICAgcHJvdmlkZXIubWVzc2FnZXMuc3Vic2NyaWJlKG1lc3NhZ2UgPT4gdGhpcy5fcHJvY2Vzc1VwZGF0ZShwcm92aWRlciwgbWVzc2FnZSkpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY3VycmVudE1lc3NhZ2VzLmRlbGV0ZShwcm92aWRlcik7XG4gICAgICB0aGlzLl9wdWJsaXNoTWVzc2FnZXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldE1lc3NhZ2VTdHJlYW0oKTogT2JzZXJ2YWJsZTxBcnJheTxCdXN5U2lnbmFsTWVzc2FnZUJ1c3k+PiB7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VTdHJlYW07XG4gIH1cblxuICBfcHJvY2Vzc1VwZGF0ZShwcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyLCBtZXNzYWdlOiBCdXN5U2lnbmFsTWVzc2FnZSk6IHZvaWQge1xuICAgIGxldCBpZE1hcCA9IHRoaXMuX2N1cnJlbnRNZXNzYWdlcy5nZXQocHJvdmlkZXIpO1xuICAgIGlmIChpZE1hcCA9PSBudWxsKSB7XG4gICAgICBpZE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX2N1cnJlbnRNZXNzYWdlcy5zZXQocHJvdmlkZXIsIGlkTWFwKTtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSAnYnVzeScpIHtcbiAgICAgIGlkTWFwLnNldChtZXNzYWdlLmlkLCBtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW52YXJpYW50KG1lc3NhZ2Uuc3RhdHVzID09PSAnZG9uZScpO1xuICAgICAgaWRNYXAuZGVsZXRlKG1lc3NhZ2UuaWQpO1xuICAgIH1cbiAgICB0aGlzLl9wdWJsaXNoTWVzc2FnZXMoKTtcbiAgfVxuXG4gIF9wdWJsaXNoTWVzc2FnZXMoKTogdm9pZCB7XG4gICAgY29uc3QgbWVzc2FnZXM6IEFycmF5PEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGlkTWFwIG9mIHRoaXMuX2N1cnJlbnRNZXNzYWdlcy52YWx1ZXMoKSkge1xuICAgICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIGlkTWFwLnZhbHVlcygpKSB7XG4gICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX21lc3NhZ2VTdHJlYW0ub25OZXh0KG1lc3NhZ2VzKTtcbiAgfVxufVxuIl19