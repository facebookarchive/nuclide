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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('../../atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _LldbDebuggerInstance = require('./LldbDebuggerInstance');

var AttachProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(AttachProcessInfo, _DebuggerProcessInfo);

  function AttachProcessInfo(targetUri, targetInfo) {
    _classCallCheck(this, AttachProcessInfo);

    _get(Object.getPrototypeOf(AttachProcessInfo.prototype), 'constructor', this).call(this, 'lldb', targetUri);
    this._targetInfo = targetInfo;
  }

  _createClass(AttachProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      var rpcService = this._getRpcService();
      var connection = yield rpcService.attach(this._targetInfo.pid);
      rpcService.dispose();
      // Start websocket server with Chrome after attach completed.
      return new _LldbDebuggerInstance.LldbDebuggerInstance(this, connection);
    })
  }, {
    key: '_getRpcService',
    value: function _getRpcService() {
      var _require$getServiceByNuclideUri = require('../../../client').getServiceByNuclideUri('LLDBDebuggerRpcService', this.getTargetUri());

      var DebuggerRpcService = _require$getServiceByNuclideUri.DebuggerRpcService;

      return new DebuggerRpcService();
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof AttachProcessInfo);
      return this.displayString() === other.displayString() ? this.pid - other.pid : this.displayString() < other.displayString() ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._targetInfo.name + '(' + this._targetInfo.pid + ')';
    }
  }, {
    key: 'pid',
    get: function get() {
      return this._targetInfo.pid;
    }
  }]);

  return AttachProcessInfo;
})(_atom.DebuggerProcessInfo);

exports.AttachProcessInfo = AttachProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFrQmtDLFlBQVk7O3NCQUN4QixRQUFROzs7O29DQUNLLHdCQUF3Qjs7SUFFOUMsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsU0FBcUIsRUFBRSxVQUE0QixFQUFFOzBCQUh0RCxpQkFBaUI7O0FBSTFCLCtCQUpTLGlCQUFpQiw2Q0FJcEIsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztHQUMvQjs7ZUFOVSxpQkFBaUI7OzZCQVFqQixhQUE4QjtBQUN2QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekMsVUFBTSxVQUFVLEdBQUcsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakUsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFckIsYUFBTywrQ0FBeUIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFYSwwQkFBMkI7NENBQ1YsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQ3JELHNCQUFzQixDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7VUFEaEUsa0JBQWtCLG1DQUFsQixrQkFBa0I7O0FBRXpCLGFBQU8sSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0tBQ2pDOzs7V0FNYSx3QkFBQyxLQUEwQixFQUFVO0FBQ2pELCtCQUFVLEtBQUssWUFBWSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlDLGFBQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FDaEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUNyQixBQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFWSx5QkFBVztBQUN0QixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7S0FDakU7OztTQWJNLGVBQVc7QUFDaEIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztLQUM3Qjs7O1NBeEJVLGlCQUFpQiIsImZpbGUiOiJBdHRhY2hQcm9jZXNzSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuLi8uLi9hdG9tJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgQXR0YWNoVGFyZ2V0SW5mbyxcbiAgRGVidWdnZXJScGNTZXJ2aWNlIGFzIERlYnVnZ2VyUnBjU2VydmljZVR5cGUsXG59IGZyb20gJy4uLy4uL2xsZGItc2VydmVyL2xpYi9EZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UnO1xuXG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtMbGRiRGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi9MbGRiRGVidWdnZXJJbnN0YW5jZSc7XG5cbmV4cG9ydCBjbGFzcyBBdHRhY2hQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBfdGFyZ2V0SW5mbzogQXR0YWNoVGFyZ2V0SW5mbztcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRVcmk6IE51Y2xpZGVVcmksIHRhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm8pIHtcbiAgICBzdXBlcignbGxkYicsIHRhcmdldFVyaSk7XG4gICAgdGhpcy5fdGFyZ2V0SW5mbyA9IHRhcmdldEluZm87XG4gIH1cblxuICBhc3luYyBkZWJ1ZygpOiBQcm9taXNlPERlYnVnZ2VySW5zdGFuY2U+IHtcbiAgICBjb25zdCBycGNTZXJ2aWNlID0gdGhpcy5fZ2V0UnBjU2VydmljZSgpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBycGNTZXJ2aWNlLmF0dGFjaCh0aGlzLl90YXJnZXRJbmZvLnBpZCk7XG4gICAgcnBjU2VydmljZS5kaXNwb3NlKCk7XG4gICAgLy8gU3RhcnQgd2Vic29ja2V0IHNlcnZlciB3aXRoIENocm9tZSBhZnRlciBhdHRhY2ggY29tcGxldGVkLlxuICAgIHJldHVybiBuZXcgTGxkYkRlYnVnZ2VySW5zdGFuY2UodGhpcywgY29ubmVjdGlvbik7XG4gIH1cblxuICBfZ2V0UnBjU2VydmljZSgpOiBEZWJ1Z2dlclJwY1NlcnZpY2VUeXBlIHtcbiAgICBjb25zdCB7RGVidWdnZXJScGNTZXJ2aWNlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NsaWVudCcpLlxuICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTExEQkRlYnVnZ2VyUnBjU2VydmljZScsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIHJldHVybiBuZXcgRGVidWdnZXJScGNTZXJ2aWNlKCk7XG4gIH1cblxuICBnZXQgcGlkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldEluZm8ucGlkO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIGludmFyaWFudChvdGhlciBpbnN0YW5jZW9mIEF0dGFjaFByb2Nlc3NJbmZvKTtcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5U3RyaW5nKCkgPT09IG90aGVyLmRpc3BsYXlTdHJpbmcoKVxuICAgICAgPyAodGhpcy5waWQgLSBvdGhlci5waWQpXG4gICAgICA6ICh0aGlzLmRpc3BsYXlTdHJpbmcoKSA8IG90aGVyLmRpc3BsYXlTdHJpbmcoKSkgPyAtMSA6IDE7XG4gIH1cblxuICBkaXNwbGF5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldEluZm8ubmFtZSArICcoJyArIHRoaXMuX3RhcmdldEluZm8ucGlkICsgJyknO1xuICB9XG59XG4iXX0=