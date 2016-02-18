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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlZHVwZWRCdXN5U2lnbmFsUHJvdmlkZXJCYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7b0JBRUwsTUFBTTs7dUNBRU0sMEJBQTBCOztJQVNsRCw2QkFBNkI7WUFBN0IsNkJBQTZCOztBQUs3QixXQUxBLDZCQUE2QixHQUsxQjswQkFMSCw2QkFBNkI7O0FBTXRDLCtCQU5TLDZCQUE2Qiw2Q0FNOUI7QUFDUixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7R0FDbEM7O2VBUlUsNkJBQTZCOztXQVUxQix3QkFBQyxPQUFlLEVBQUUsT0FBK0IsRUFBZTs7O0FBQzVFLFVBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZDLGFBQU8scUJBQWUsWUFBTTtBQUMxQixjQUFLLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDeEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLHlCQUFDLE9BQWUsRUFBRSxPQUErQixFQUFRO0FBQ3RFLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLFVBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixjQUFNLEdBQUc7QUFDUCxvQkFBVSw2QkF0QkwsNkJBQTZCLGdEQXNCRCxPQUFPLEVBQUUsT0FBTyxDQUFDO0FBQ2xELGVBQUssRUFBRSxDQUFDO1NBQ1QsQ0FBQztBQUNGLFlBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztPQUN2QyxNQUFNO0FBQ0wsY0FBTSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2hCO0tBQ0Y7OztXQUVjLHlCQUFDLE9BQWUsRUFBRSxPQUErQixFQUFRO0FBQ3RFLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdDLCtCQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUMxQiwrQkFBVSxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFVBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDdEIsY0FBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsZUFBZSxVQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDbEMsTUFBTTtBQUNMLGNBQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNoQjtLQUNGOzs7V0FFTSxpQkFBQyxPQUFlLEVBQUUsT0FBK0IsRUFBVTtBQUNoRSxhQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDcEIsZUFBTyxFQUFQLE9BQU87QUFDUCxlQUFPLEVBQVAsT0FBTztPQUNSLENBQUMsQ0FBQztLQUNKOzs7U0FqRFUsNkJBQTZCIiwiZmlsZSI6IkRlZHVwZWRCdXN5U2lnbmFsUHJvdmlkZXJCYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge01lc3NhZ2VEaXNwbGF5T3B0aW9uc30gZnJvbSAnLi9CdXN5U2lnbmFsUHJvdmlkZXJCYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4vQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSc7XG5cbnR5cGUgTWVzc2FnZVJlY29yZCA9IHtcbiAgLy8gVGhlIGRpc3Bvc2FibGUgdG8gY2FsbCB0byByZW1vdmUgdGhlIG1lc3NhZ2VcbiAgZGlzcG9zYWJsZTogSURpc3Bvc2FibGUsXG4gIC8vIFRoZSBudW1iZXIgb2YgbWVzc2FnZXMgb3V0c3RhbmRpbmdcbiAgY291bnQ6IG51bWJlcixcbn1cblxuZXhwb3J0IGNsYXNzIERlZHVwZWRCdXN5U2lnbmFsUHJvdmlkZXJCYXNlIGV4dGVuZHMgQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSB7XG5cbiAgLy8gSW52YXJpYW50OiBBbGwgY29udGFpbmVkIE1lc3NhZ2VSZWNvcmRzIG11c3QgaGF2ZSBhIGNvdW50IGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBvbmUuXG4gIF9tZXNzYWdlUmVjb3JkczogTWFwPHN0cmluZywgTWVzc2FnZVJlY29yZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9tZXNzYWdlUmVjb3JkcyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGRpc3BsYXlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IE1lc3NhZ2VEaXNwbGF5T3B0aW9ucyk6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9pbmNyZW1lbnRDb3VudChtZXNzYWdlLCBvcHRpb25zKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fZGVjcmVtZW50Q291bnQobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICBfaW5jcmVtZW50Q291bnQobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5fZ2V0S2V5KG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIGxldCByZWNvcmQgPSB0aGlzLl9tZXNzYWdlUmVjb3Jkcy5nZXQoa2V5KTtcbiAgICBpZiAocmVjb3JkID09IG51bGwpIHtcbiAgICAgIHJlY29yZCA9IHtcbiAgICAgICAgZGlzcG9zYWJsZTogc3VwZXIuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgb3B0aW9ucyksXG4gICAgICAgIGNvdW50OiAxLFxuICAgICAgfTtcbiAgICAgIHRoaXMuX21lc3NhZ2VSZWNvcmRzLnNldChrZXksIHJlY29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC5jb3VudCsrO1xuICAgIH1cbiAgfVxuXG4gIF9kZWNyZW1lbnRDb3VudChtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM/OiBNZXNzYWdlRGlzcGxheU9wdGlvbnMpOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9nZXRLZXkobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgY29uc3QgcmVjb3JkID0gdGhpcy5fbWVzc2FnZVJlY29yZHMuZ2V0KGtleSk7XG4gICAgaW52YXJpYW50KHJlY29yZCAhPSBudWxsKTtcbiAgICBpbnZhcmlhbnQocmVjb3JkLmNvdW50ID4gMCk7XG4gICAgaWYgKHJlY29yZC5jb3VudCA9PT0gMSkge1xuICAgICAgcmVjb3JkLmRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fbWVzc2FnZVJlY29yZHMuZGVsZXRlKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC5jb3VudC0tO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRLZXkobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogc3RyaW5nIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbWVzc2FnZSxcbiAgICAgIG9wdGlvbnMsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==