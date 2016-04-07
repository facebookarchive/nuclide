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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lc3NhZ2VTdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBaUIwQyxJQUFJOztvQkFDckIsTUFBTTs7c0JBQ1QsUUFBUTs7OztJQUVqQixZQUFZO0FBS1osV0FMQSxZQUFZLEdBS1Q7MEJBTEgsWUFBWTs7QUFNckIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbEMsUUFBSSxDQUFDLGNBQWMsR0FBRyx3QkFBb0IsRUFBRSxDQUFDLENBQUM7R0FDL0M7O2VBUlUsWUFBWTs7V0FVUix5QkFBQyxRQUE0QixFQUFlOzs7QUFDekQsVUFBTSxZQUFZLEdBQ2hCLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFVBQUEsT0FBTztlQUFJLE1BQUssY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDakYsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsY0FBSyxnQkFBZ0IsVUFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLGNBQUssZ0JBQWdCLEVBQUUsQ0FBQztPQUN6QixDQUFDLENBQUM7S0FDSjs7O1dBRWUsNEJBQTZDO0FBQzNELGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztLQUM1Qjs7O1dBRWEsd0JBQUMsUUFBNEIsRUFBRSxPQUEwQixFQUFRO0FBQzdFLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEQsVUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGFBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQzVDO0FBQ0QsVUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtBQUM3QixhQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDaEMsTUFBTTtBQUNMLGlDQUFVLE9BQU8sQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLENBQUM7QUFDckMsYUFBSyxVQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQzFCO0FBQ0QsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7OztXQUVlLDRCQUFTO0FBQ3ZCLFVBQU0sUUFBc0MsR0FBRyxFQUFFLENBQUM7QUFDbEQsV0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDbEQsYUFBSyxJQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDcEMsa0JBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEI7T0FDRjtBQUNELFVBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDOzs7U0EvQ1UsWUFBWSIsImZpbGUiOiJNZXNzYWdlU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEJ1c3lTaWduYWxQcm92aWRlcixcbiAgQnVzeVNpZ25hbE1lc3NhZ2UsXG4gIEJ1c3lTaWduYWxNZXNzYWdlQnVzeSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idXN5LXNpZ25hbC1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBCZWhhdmlvclN1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCB7RGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlU3RvcmUge1xuICAvLyBwcm92aWRlciB0byBpZCB0byBtZXNzYWdlcy5cbiAgX2N1cnJlbnRNZXNzYWdlczogTWFwPEJ1c3lTaWduYWxQcm92aWRlciwgTWFwPG51bWJlciwgQnVzeVNpZ25hbE1lc3NhZ2VCdXN5Pj47XG4gIF9tZXNzYWdlU3RyZWFtOiBCZWhhdmlvclN1YmplY3Q8QXJyYXk8QnVzeVNpZ25hbE1lc3NhZ2VCdXN5Pj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fY3VycmVudE1lc3NhZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX21lc3NhZ2VTdHJlYW0gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFtdKTtcbiAgfVxuXG4gIGNvbnN1bWVQcm92aWRlcihwcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9XG4gICAgICBwcm92aWRlci5tZXNzYWdlcy5zdWJzY3JpYmUobWVzc2FnZSA9PiB0aGlzLl9wcm9jZXNzVXBkYXRlKHByb3ZpZGVyLCBtZXNzYWdlKSk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9jdXJyZW50TWVzc2FnZXMuZGVsZXRlKHByb3ZpZGVyKTtcbiAgICAgIHRoaXMuX3B1Ymxpc2hNZXNzYWdlcygpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0TWVzc2FnZVN0cmVhbSgpOiBPYnNlcnZhYmxlPEFycmF5PEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+IHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZVN0cmVhbTtcbiAgfVxuXG4gIF9wcm9jZXNzVXBkYXRlKHByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXIsIG1lc3NhZ2U6IEJ1c3lTaWduYWxNZXNzYWdlKTogdm9pZCB7XG4gICAgbGV0IGlkTWFwID0gdGhpcy5fY3VycmVudE1lc3NhZ2VzLmdldChwcm92aWRlcik7XG4gICAgaWYgKGlkTWFwID09IG51bGwpIHtcbiAgICAgIGlkTWFwID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5fY3VycmVudE1lc3NhZ2VzLnNldChwcm92aWRlciwgaWRNYXApO1xuICAgIH1cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09ICdidXN5Jykge1xuICAgICAgaWRNYXAuc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQobWVzc2FnZS5zdGF0dXMgPT09ICdkb25lJyk7XG4gICAgICBpZE1hcC5kZWxldGUobWVzc2FnZS5pZCk7XG4gICAgfVxuICAgIHRoaXMuX3B1Ymxpc2hNZXNzYWdlcygpO1xuICB9XG5cbiAgX3B1Ymxpc2hNZXNzYWdlcygpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlczogQXJyYXk8QnVzeVNpZ25hbE1lc3NhZ2VCdXN5PiA9IFtdO1xuICAgIGZvciAoY29uc3QgaWRNYXAgb2YgdGhpcy5fY3VycmVudE1lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgaWRNYXAudmFsdWVzKCkpIHtcbiAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fbWVzc2FnZVN0cmVhbS5vbk5leHQobWVzc2FnZXMpO1xuICB9XG59XG4iXX0=