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

var _reactivexRxjs = require('@reactivex/rxjs');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var MessageStore = (function () {
  function MessageStore() {
    _classCallCheck(this, MessageStore);

    this._currentMessages = new Map();
    this._messageStream = new _reactivexRxjs.BehaviorSubject([]);
  }

  _createClass(MessageStore, [{
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      var _this = this;

      var subscription = provider.messages.subscribe(function (message) {
        return _this._processUpdate(provider, message);
      });
      return new _atom.Disposable(function () {
        subscription.unsubscribe();
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
      this._messageStream.next(messages);
    }
  }]);

  return MessageStore;
})();

exports.MessageStore = MessageStore;

// provider to id to messages.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lc3NhZ2VTdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBaUIwQyxpQkFBaUI7O29CQUNsQyxNQUFNOztzQkFDVCxRQUFROzs7O0lBRWpCLFlBQVk7QUFLWixXQUxBLFlBQVksR0FLVDswQkFMSCxZQUFZOztBQU1yQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNsQyxRQUFJLENBQUMsY0FBYyxHQUFHLG1DQUFvQixFQUFFLENBQUMsQ0FBQztHQUMvQzs7ZUFSVSxZQUFZOztXQVVSLHlCQUFDLFFBQTRCLEVBQWU7OztBQUN6RCxVQUFNLFlBQVksR0FDaEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBQSxPQUFPO2VBQUksTUFBSyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQztBQUNqRixhQUFPLHFCQUFlLFlBQU07QUFDMUIsb0JBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQixjQUFLLGdCQUFnQixVQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsY0FBSyxnQkFBZ0IsRUFBRSxDQUFDO09BQ3pCLENBQUMsQ0FBQztLQUNKOzs7V0FFZSw0QkFBNkM7QUFDM0QsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0tBQzVCOzs7V0FFYSx3QkFBQyxRQUE0QixFQUFFLE9BQTBCLEVBQVE7QUFDN0UsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoRCxVQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsYUFBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbEIsWUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDNUM7QUFDRCxVQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO0FBQzdCLGFBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUNoQyxNQUFNO0FBQ0wsaUNBQVUsT0FBTyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQztBQUNyQyxhQUFLLFVBQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDMUI7QUFDRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7O1dBRWUsNEJBQVM7QUFDdkIsVUFBTSxRQUFzQyxHQUFHLEVBQUUsQ0FBQztBQUNsRCxXQUFLLElBQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUNsRCxhQUFLLElBQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUNwQyxrQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN4QjtPQUNGO0FBQ0QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDcEM7OztTQS9DVSxZQUFZIiwiZmlsZSI6Ik1lc3NhZ2VTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgQnVzeVNpZ25hbFByb3ZpZGVyLFxuICBCdXN5U2lnbmFsTWVzc2FnZSxcbiAgQnVzeVNpZ25hbE1lc3NhZ2VCdXN5LFxufSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBCZWhhdmlvclN1YmplY3R9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZVN0b3JlIHtcbiAgLy8gcHJvdmlkZXIgdG8gaWQgdG8gbWVzc2FnZXMuXG4gIF9jdXJyZW50TWVzc2FnZXM6IE1hcDxCdXN5U2lnbmFsUHJvdmlkZXIsIE1hcDxudW1iZXIsIEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+O1xuICBfbWVzc2FnZVN0cmVhbTogQmVoYXZpb3JTdWJqZWN0PEFycmF5PEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2N1cnJlbnRNZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9tZXNzYWdlU3RyZWFtID0gbmV3IEJlaGF2aW9yU3ViamVjdChbXSk7XG4gIH1cblxuICBjb25zdW1lUHJvdmlkZXIocHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPVxuICAgICAgcHJvdmlkZXIubWVzc2FnZXMuc3Vic2NyaWJlKG1lc3NhZ2UgPT4gdGhpcy5fcHJvY2Vzc1VwZGF0ZShwcm92aWRlciwgbWVzc2FnZSkpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuX2N1cnJlbnRNZXNzYWdlcy5kZWxldGUocHJvdmlkZXIpO1xuICAgICAgdGhpcy5fcHVibGlzaE1lc3NhZ2VzKCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRNZXNzYWdlU3RyZWFtKCk6IE9ic2VydmFibGU8QXJyYXk8QnVzeVNpZ25hbE1lc3NhZ2VCdXN5Pj4ge1xuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlU3RyZWFtO1xuICB9XG5cbiAgX3Byb2Nlc3NVcGRhdGUocHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlciwgbWVzc2FnZTogQnVzeVNpZ25hbE1lc3NhZ2UpOiB2b2lkIHtcbiAgICBsZXQgaWRNYXAgPSB0aGlzLl9jdXJyZW50TWVzc2FnZXMuZ2V0KHByb3ZpZGVyKTtcbiAgICBpZiAoaWRNYXAgPT0gbnVsbCkge1xuICAgICAgaWRNYXAgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLl9jdXJyZW50TWVzc2FnZXMuc2V0KHByb3ZpZGVyLCBpZE1hcCk7XG4gICAgfVxuICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gJ2J1c3knKSB7XG4gICAgICBpZE1hcC5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChtZXNzYWdlLnN0YXR1cyA9PT0gJ2RvbmUnKTtcbiAgICAgIGlkTWFwLmRlbGV0ZShtZXNzYWdlLmlkKTtcbiAgICB9XG4gICAgdGhpcy5fcHVibGlzaE1lc3NhZ2VzKCk7XG4gIH1cblxuICBfcHVibGlzaE1lc3NhZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IG1lc3NhZ2VzOiBBcnJheTxCdXN5U2lnbmFsTWVzc2FnZUJ1c3k+ID0gW107XG4gICAgZm9yIChjb25zdCBpZE1hcCBvZiB0aGlzLl9jdXJyZW50TWVzc2FnZXMudmFsdWVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiBpZE1hcC52YWx1ZXMoKSkge1xuICAgICAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9tZXNzYWdlU3RyZWFtLm5leHQobWVzc2FnZXMpO1xuICB9XG59XG4iXX0=