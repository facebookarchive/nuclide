Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('../../atom');

var _HhvmDebuggerInstance = require('./HhvmDebuggerInstance');

var AttachProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(AttachProcessInfo, _DebuggerProcessInfo);

  function AttachProcessInfo(targetUri) {
    _classCallCheck(this, AttachProcessInfo);

    _get(Object.getPrototypeOf(AttachProcessInfo.prototype), 'constructor', this).call(this, 'hhvm', targetUri);
  }

  _createClass(AttachProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      return new _HhvmDebuggerInstance.HhvmDebuggerInstance(this);
    })
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof AttachProcessInfo);
      return compareString(this._targetUri, other._targetUri);
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      var remoteUri = require('../../../remote-uri');
      return remoteUri.getHostname(this._targetUri);
    }
  }]);

  return AttachProcessInfo;
})(_atom.DebuggerProcessInfo);

exports.AttachProcessInfo = AttachProcessInfo;

function compareString(value1, value2) {
  return value1 === value2 ? 0 : value1 < value2 ? -1 : 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7OztvQkFDSSxZQUFZOztvQ0FDWCx3QkFBd0I7O0lBSTlDLGlCQUFpQjtZQUFqQixpQkFBaUI7O0FBQ2pCLFdBREEsaUJBQWlCLENBQ2hCLFNBQXFCLEVBQUU7MEJBRHhCLGlCQUFpQjs7QUFFMUIsK0JBRlMsaUJBQWlCLDZDQUVwQixNQUFNLEVBQUUsU0FBUyxFQUFFO0dBQzFCOztlQUhVLGlCQUFpQjs7NkJBS2pCLGFBQWtDO0FBQzNDLGFBQU8sK0NBQXlCLElBQUksQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFYSx3QkFBQyxLQUEwQixFQUFVO0FBQ2pELCtCQUFVLEtBQUssWUFBWSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlDLGFBQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3pEOzs7V0FFWSx5QkFBVztBQUN0QixVQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNqRCxhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQy9DOzs7U0FqQlUsaUJBQWlCOzs7OztBQW9COUIsU0FBUyxhQUFhLENBQUMsTUFBYyxFQUFFLE1BQWMsRUFBVTtBQUM3RCxTQUFPLE1BQU0sS0FBSyxNQUFNLEdBQUcsQ0FBQyxHQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUFDLENBQUM7Q0FDM0QiLCJmaWxlIjoiQXR0YWNoUHJvY2Vzc0luZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IHtIaHZtRGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi9IaHZtRGVidWdnZXJJbnN0YW5jZSc7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcblxuZXhwb3J0IGNsYXNzIEF0dGFjaFByb2Nlc3NJbmZvIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHRhcmdldFVyaTogTnVjbGlkZVVyaSkge1xuICAgIHN1cGVyKCdoaHZtJywgdGFyZ2V0VXJpKTtcbiAgfVxuXG4gIGFzeW5jIGRlYnVnKCk6IFByb21pc2U8SGh2bURlYnVnZ2VySW5zdGFuY2U+IHtcbiAgICByZXR1cm4gbmV3IEhodm1EZWJ1Z2dlckluc3RhbmNlKHRoaXMpO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIGludmFyaWFudChvdGhlciBpbnN0YW5jZW9mIEF0dGFjaFByb2Nlc3NJbmZvKTtcbiAgICByZXR1cm4gY29tcGFyZVN0cmluZyh0aGlzLl90YXJnZXRVcmksIG90aGVyLl90YXJnZXRVcmkpO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgICByZXR1cm4gcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRoaXMuX3RhcmdldFVyaSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcGFyZVN0cmluZyh2YWx1ZTE6IHN0cmluZywgdmFsdWUyOiBzdHJpbmcpOiBudW1iZXIge1xuICByZXR1cm4gdmFsdWUxID09PSB2YWx1ZTIgPyAwIDogKHZhbHVlMSA8IHZhbHVlMiA/IC0xIDogMSk7XG59XG4iXX0=