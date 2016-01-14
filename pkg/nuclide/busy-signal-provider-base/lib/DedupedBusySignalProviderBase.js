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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _BusySignalProviderBase2 = require('./BusySignalProviderBase');

var DedupedBusySignalProviderBase = (function (_BusySignalProviderBase) {
  _inherits(DedupedBusySignalProviderBase, _BusySignalProviderBase);

  function DedupedBusySignalProviderBase() {
    _classCallCheck(this, DedupedBusySignalProviderBase);

    _get(Object.getPrototypeOf(DedupedBusySignalProviderBase.prototype), 'constructor', this).call(this);
    this._messageRecords = new Map();
  }

  _createClass(DedupedBusySignalProviderBase, [{
    key: 'displayMessage',
    value: function displayMessage(message, options) {
      var _this = this;

      this._incrementCount(message, options);
      return new _atom.Disposable(function () {
        _this._decrementCount(message, options);
      });
    }
  }, {
    key: '_incrementCount',
    value: function _incrementCount(message, options) {
      var key = this._getKey(message, options);
      var record = this._messageRecords.get(key);
      if (record == null) {
        record = {
          disposable: _get(Object.getPrototypeOf(DedupedBusySignalProviderBase.prototype), 'displayMessage', this).call(this, message, options),
          count: 1
        };
        this._messageRecords.set(key, record);
      } else {
        record.count++;
      }
    }
  }, {
    key: '_decrementCount',
    value: function _decrementCount(message, options) {
      var key = this._getKey(message, options);
      var record = this._messageRecords.get(key);
      (0, _assert2['default'])(record != null);
      (0, _assert2['default'])(record.count > 0);
      if (record.count === 1) {
        record.disposable.dispose();
        this._messageRecords['delete'](key);
      } else {
        record.count--;
      }
    }
  }, {
    key: '_getKey',
    value: function _getKey(message, options) {
      return JSON.stringify({
        message: message,
        options: options
      });
    }
  }]);

  return DedupedBusySignalProviderBase;
})(_BusySignalProviderBase2.BusySignalProviderBase);

exports.DedupedBusySignalProviderBase = DedupedBusySignalProviderBase;

// The disposable to call to remove the message

// The number of messages outstanding

// Invariant: All contained MessageRecords must have a count greater than or equal to one.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlZHVwZWRCdXN5U2lnbmFsUHJvdmlkZXJCYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7b0JBRUwsTUFBTTs7dUNBRU0sMEJBQTBCOztJQVNsRCw2QkFBNkI7WUFBN0IsNkJBQTZCOztBQUs3QixXQUxBLDZCQUE2QixHQUsxQjswQkFMSCw2QkFBNkI7O0FBTXRDLCtCQU5TLDZCQUE2Qiw2Q0FNOUI7QUFDUixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7R0FDbEM7O2VBUlUsNkJBQTZCOztXQVUxQix3QkFBQyxPQUFlLEVBQUUsT0FBK0IsRUFBbUI7OztBQUNoRixVQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2QyxhQUFPLHFCQUFlLFlBQU07QUFDMUIsY0FBSyxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ3hDLENBQUMsQ0FBQztLQUNKOzs7V0FFYyx5QkFBQyxPQUFlLEVBQUUsT0FBK0IsRUFBUTtBQUN0RSxVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMzQyxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQyxVQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDbEIsY0FBTSxHQUFHO0FBQ1Asb0JBQVUsNkJBdEJMLDZCQUE2QixnREFzQkQsT0FBTyxFQUFFLE9BQU8sQ0FBQztBQUNsRCxlQUFLLEVBQUUsQ0FBQztTQUNULENBQUM7QUFDRixZQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDdkMsTUFBTTtBQUNMLGNBQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNoQjtLQUNGOzs7V0FFYyx5QkFBQyxPQUFlLEVBQUUsT0FBK0IsRUFBUTtBQUN0RSxVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMzQyxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QywrQkFBVSxNQUFNLElBQUksSUFBSSxDQUFDLENBQUM7QUFDMUIsK0JBQVUsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QixVQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLGNBQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLGVBQWUsVUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ2xDLE1BQU07QUFDTCxjQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDaEI7S0FDRjs7O1dBRU0saUJBQUMsT0FBZSxFQUFFLE9BQStCLEVBQVU7QUFDaEUsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3BCLGVBQU8sRUFBUCxPQUFPO0FBQ1AsZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDLENBQUM7S0FDSjs7O1NBakRVLDZCQUE2QiIsImZpbGUiOiJEZWR1cGVkQnVzeVNpZ25hbFByb3ZpZGVyQmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtNZXNzYWdlRGlzcGxheU9wdGlvbnN9IGZyb20gJy4vQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuL0J1c3lTaWduYWxQcm92aWRlckJhc2UnO1xuXG50eXBlIE1lc3NhZ2VSZWNvcmQgPSB7XG4gIC8vIFRoZSBkaXNwb3NhYmxlIHRvIGNhbGwgdG8gcmVtb3ZlIHRoZSBtZXNzYWdlXG4gIGRpc3Bvc2FibGU6IGF0b20kRGlzcG9zYWJsZSxcbiAgLy8gVGhlIG51bWJlciBvZiBtZXNzYWdlcyBvdXRzdGFuZGluZ1xuICBjb3VudDogbnVtYmVyLFxufVxuXG5leHBvcnQgY2xhc3MgRGVkdXBlZEJ1c3lTaWduYWxQcm92aWRlckJhc2UgZXh0ZW5kcyBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlIHtcblxuICAvLyBJbnZhcmlhbnQ6IEFsbCBjb250YWluZWQgTWVzc2FnZVJlY29yZHMgbXVzdCBoYXZlIGEgY291bnQgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIG9uZS5cbiAgX21lc3NhZ2VSZWNvcmRzOiBNYXA8c3RyaW5nLCBNZXNzYWdlUmVjb3JkPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX21lc3NhZ2VSZWNvcmRzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgZGlzcGxheU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9pbmNyZW1lbnRDb3VudChtZXNzYWdlLCBvcHRpb25zKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fZGVjcmVtZW50Q291bnQobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICBfaW5jcmVtZW50Q291bnQobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5fZ2V0S2V5KG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIGxldCByZWNvcmQgPSB0aGlzLl9tZXNzYWdlUmVjb3Jkcy5nZXQoa2V5KTtcbiAgICBpZiAocmVjb3JkID09IG51bGwpIHtcbiAgICAgIHJlY29yZCA9IHtcbiAgICAgICAgZGlzcG9zYWJsZTogc3VwZXIuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgb3B0aW9ucyksXG4gICAgICAgIGNvdW50OiAxLFxuICAgICAgfTtcbiAgICAgIHRoaXMuX21lc3NhZ2VSZWNvcmRzLnNldChrZXksIHJlY29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC5jb3VudCsrO1xuICAgIH1cbiAgfVxuXG4gIF9kZWNyZW1lbnRDb3VudChtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM/OiBNZXNzYWdlRGlzcGxheU9wdGlvbnMpOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9nZXRLZXkobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgY29uc3QgcmVjb3JkID0gdGhpcy5fbWVzc2FnZVJlY29yZHMuZ2V0KGtleSk7XG4gICAgaW52YXJpYW50KHJlY29yZCAhPSBudWxsKTtcbiAgICBpbnZhcmlhbnQocmVjb3JkLmNvdW50ID4gMCk7XG4gICAgaWYgKHJlY29yZC5jb3VudCA9PT0gMSkge1xuICAgICAgcmVjb3JkLmRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fbWVzc2FnZVJlY29yZHMuZGVsZXRlKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC5jb3VudC0tO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRLZXkobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogc3RyaW5nIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbWVzc2FnZSxcbiAgICAgIG9wdGlvbnMsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==