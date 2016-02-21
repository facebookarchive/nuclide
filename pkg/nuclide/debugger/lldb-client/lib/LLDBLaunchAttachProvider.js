Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('../../atom');

var LLDBLaunchAttachProvider = (function (_DebuggerLaunchAttachProvider) {
  _inherits(LLDBLaunchAttachProvider, _DebuggerLaunchAttachProvider);

  function LLDBLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, LLDBLaunchAttachProvider);

    _get(Object.getPrototypeOf(LLDBLaunchAttachProvider.prototype), 'constructor', this).call(this, debuggingTypeName, targetUri);
  }

  _createClass(LLDBLaunchAttachProvider, [{
    key: 'getActions',
    value: function getActions() {
      return ['Attach', 'Launch'];
    }
  }, {
    key: 'getComponent',
    value: function getComponent(action) {
      return null;
    }
  }]);

  return LLDBLaunchAttachProvider;
})(_atom.DebuggerLaunchAttachProvider);

exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxMREJMYXVuY2hBdHRhY2hQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFXMkMsWUFBWTs7SUFFMUMsd0JBQXdCO1lBQXhCLHdCQUF3Qjs7QUFDeEIsV0FEQSx3QkFBd0IsQ0FDdkIsaUJBQXlCLEVBQUUsU0FBaUIsRUFBRTswQkFEL0Msd0JBQXdCOztBQUVqQywrQkFGUyx3QkFBd0IsNkNBRTNCLGlCQUFpQixFQUFFLFNBQVMsRUFBRTtHQUNyQzs7ZUFIVSx3QkFBd0I7O1dBS3pCLHNCQUFrQjtBQUMxQixhQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFVyxzQkFBQyxNQUFjLEVBQWlCO0FBQzFDLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQVhVLHdCQUF3QiIsImZpbGUiOiJMTERCTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0RlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXJ9IGZyb20gJy4uLy4uL2F0b20nO1xuXG5leHBvcnQgY2xhc3MgTExEQkxhdW5jaEF0dGFjaFByb3ZpZGVyIGV4dGVuZHMgRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKGRlYnVnZ2luZ1R5cGVOYW1lOiBzdHJpbmcsIHRhcmdldFVyaTogc3RyaW5nKSB7XG4gICAgc3VwZXIoZGVidWdnaW5nVHlwZU5hbWUsIHRhcmdldFVyaSk7XG4gIH1cblxuICBnZXRBY3Rpb25zKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiBbJ0F0dGFjaCcsICdMYXVuY2gnXTtcbiAgfVxuXG4gIGdldENvbXBvbmVudChhY3Rpb246IHN0cmluZyk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=