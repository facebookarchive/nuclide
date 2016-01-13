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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lc3NhZ2VTdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBaUIwQyxJQUFJOztvQkFDckIsTUFBTTs7c0JBQ1QsUUFBUTs7OztJQUVqQixZQUFZO0FBS1osV0FMQSxZQUFZLEdBS1Q7MEJBTEgsWUFBWTs7QUFNckIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbEMsUUFBSSxDQUFDLGNBQWMsR0FBRyx3QkFBb0IsRUFBRSxDQUFDLENBQUM7R0FDL0M7O2VBUlUsWUFBWTs7V0FVUix5QkFBQyxRQUE0QixFQUFtQjs7O0FBQzdELFVBQU0sWUFBWSxHQUNoQixRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFBLE9BQU87ZUFBSSxNQUFLLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ2pGLGFBQU8scUJBQWUsWUFBTTtBQUMxQixvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLGNBQUssZ0JBQWdCLFVBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxjQUFLLGdCQUFnQixFQUFFLENBQUM7T0FDekIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVlLDRCQUE2QztBQUMzRCxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDNUI7OztXQUVhLHdCQUFDLFFBQTRCLEVBQUUsT0FBMEIsRUFBUTtBQUM3RSxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hELFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixhQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNsQixZQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUM1QztBQUNELFVBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7QUFDN0IsYUFBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ2hDLE1BQU07QUFDTCxpQ0FBVSxPQUFPLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDO0FBQ3JDLGFBQUssVUFBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztPQUMxQjtBQUNELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7V0FFZSw0QkFBUztBQUN2QixVQUFNLFFBQXNDLEdBQUcsRUFBRSxDQUFDO0FBQ2xELFdBQUssSUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ2xELGFBQUssSUFBTSxPQUFPLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ3BDLGtCQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3hCO09BQ0Y7QUFDRCxVQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN0Qzs7O1NBL0NVLFlBQVkiLCJmaWxlIjoiTWVzc2FnZVN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBCdXN5U2lnbmFsUHJvdmlkZXIsXG4gIEJ1c3lTaWduYWxNZXNzYWdlLFxuICBCdXN5U2lnbmFsTWVzc2FnZUJ1c3ksXG59IGZyb20gJy4uLy4uL2J1c3ktc2lnbmFsLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge09ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdH0gZnJvbSAncngnO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VTdG9yZSB7XG4gIC8vIHByb3ZpZGVyIHRvIGlkIHRvIG1lc3NhZ2VzLlxuICBfY3VycmVudE1lc3NhZ2VzOiBNYXA8QnVzeVNpZ25hbFByb3ZpZGVyLCBNYXA8bnVtYmVyLCBCdXN5U2lnbmFsTWVzc2FnZUJ1c3k+PjtcbiAgX21lc3NhZ2VTdHJlYW06IEJlaGF2aW9yU3ViamVjdDxBcnJheTxCdXN5U2lnbmFsTWVzc2FnZUJ1c3k+PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jdXJyZW50TWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbWVzc2FnZVN0cmVhbSA9IG5ldyBCZWhhdmlvclN1YmplY3QoW10pO1xuICB9XG5cbiAgY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXIpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9XG4gICAgICBwcm92aWRlci5tZXNzYWdlcy5zdWJzY3JpYmUobWVzc2FnZSA9PiB0aGlzLl9wcm9jZXNzVXBkYXRlKHByb3ZpZGVyLCBtZXNzYWdlKSk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9jdXJyZW50TWVzc2FnZXMuZGVsZXRlKHByb3ZpZGVyKTtcbiAgICAgIHRoaXMuX3B1Ymxpc2hNZXNzYWdlcygpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0TWVzc2FnZVN0cmVhbSgpOiBPYnNlcnZhYmxlPEFycmF5PEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+IHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZVN0cmVhbTtcbiAgfVxuXG4gIF9wcm9jZXNzVXBkYXRlKHByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXIsIG1lc3NhZ2U6IEJ1c3lTaWduYWxNZXNzYWdlKTogdm9pZCB7XG4gICAgbGV0IGlkTWFwID0gdGhpcy5fY3VycmVudE1lc3NhZ2VzLmdldChwcm92aWRlcik7XG4gICAgaWYgKGlkTWFwID09IG51bGwpIHtcbiAgICAgIGlkTWFwID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5fY3VycmVudE1lc3NhZ2VzLnNldChwcm92aWRlciwgaWRNYXApO1xuICAgIH1cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09ICdidXN5Jykge1xuICAgICAgaWRNYXAuc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQobWVzc2FnZS5zdGF0dXMgPT09ICdkb25lJyk7XG4gICAgICBpZE1hcC5kZWxldGUobWVzc2FnZS5pZCk7XG4gICAgfVxuICAgIHRoaXMuX3B1Ymxpc2hNZXNzYWdlcygpO1xuICB9XG5cbiAgX3B1Ymxpc2hNZXNzYWdlcygpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlczogQXJyYXk8QnVzeVNpZ25hbE1lc3NhZ2VCdXN5PiA9IFtdO1xuICAgIGZvciAoY29uc3QgaWRNYXAgb2YgdGhpcy5fY3VycmVudE1lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgaWRNYXAudmFsdWVzKCkpIHtcbiAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fbWVzc2FnZVN0cmVhbS5vbk5leHQobWVzc2FnZXMpO1xuICB9XG59XG4iXX0=