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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.makeDiagnosticsDatatipComponent = makeDiagnosticsDatatipComponent;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibDiagnosticsMessage = require('../../nuclide-ui/lib/DiagnosticsMessage');

var NOOP = function NOOP() {};

var DiagnosticsDatatipComponent = (function (_React$Component) {
  _inherits(DiagnosticsDatatipComponent, _React$Component);

  function DiagnosticsDatatipComponent() {
    _classCallCheck(this, DiagnosticsDatatipComponent);

    _get(Object.getPrototypeOf(DiagnosticsDatatipComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiagnosticsDatatipComponent, [{
    key: 'render',
    value: function render() {
      // Remove the `fix` property to prevent the fix button from showing up (for now).
      var message = _extends({}, this.props.message, { fix: undefined });
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diagnostics-datatip' },
        _reactForAtom.React.createElement(_nuclideUiLibDiagnosticsMessage.DiagnosticsMessage, {
          message: message,
          goToLocation: _nuclideAtomHelpers.goToLocation,
          fixer: NOOP
        })
      );
    }
  }]);

  return DiagnosticsDatatipComponent;
})(_reactForAtom.React.Component);

exports.DiagnosticsDatatipComponent = DiagnosticsDatatipComponent;

function makeDiagnosticsDatatipComponent(message) {
  return function () {
    return _reactForAtom.React.createElement(DiagnosticsDatatipComponent, { message: message });
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzRGF0YXRpcENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0NBZTJCLDRCQUE0Qjs7NEJBQ25DLGdCQUFnQjs7OENBQ0gseUNBQXlDOztBQU0xRSxJQUFNLElBQUksR0FBRyxTQUFQLElBQUksR0FBUyxFQUFFLENBQUM7O0lBRVQsMkJBQTJCO1lBQTNCLDJCQUEyQjs7V0FBM0IsMkJBQTJCOzBCQUEzQiwyQkFBMkI7OytCQUEzQiwyQkFBMkI7OztlQUEzQiwyQkFBMkI7O1dBR2hDLGtCQUFrQjs7QUFFdEIsVUFBTSxPQUFPLGdCQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFFLEdBQUcsRUFBRSxTQUFTLEdBQUMsQ0FBQztBQUN4RCxhQUNFOztVQUFLLFNBQVMsRUFBQyw2QkFBNkI7UUFDMUM7QUFDRSxpQkFBTyxFQUFFLE9BQU8sQUFBQztBQUNqQixzQkFBWSxrQ0FBZTtBQUMzQixlQUFLLEVBQUUsSUFBSSxBQUFDO1VBQ1o7T0FDRSxDQUNOO0tBQ0g7OztTQWZVLDJCQUEyQjtHQUFTLG9CQUFNLFNBQVM7Ozs7QUFrQnpELFNBQVMsK0JBQStCLENBQUMsT0FBOEIsRUFBYztBQUMxRixTQUFPO1dBQU0sa0NBQUMsMkJBQTJCLElBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHO0dBQUEsQ0FBQztDQUNoRSIsImZpbGUiOiJEaWFnbm9zdGljc0RhdGF0aXBDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1iYXNlJztcblxuaW1wb3J0IHtnb1RvTG9jYXRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7RGlhZ25vc3RpY3NNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9EaWFnbm9zdGljc01lc3NhZ2UnO1xuXG50eXBlIERpYWdub3N0aWNzRGF0YXRpcENvbXBvbmVudFByb3BzID0ge1xuICBtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2U7XG59O1xuXG5jb25zdCBOT09QID0gKCkgPT4ge307XG5cbmV4cG9ydCBjbGFzcyBEaWFnbm9zdGljc0RhdGF0aXBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlhZ25vc3RpY3NEYXRhdGlwQ29tcG9uZW50UHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIC8vIFJlbW92ZSB0aGUgYGZpeGAgcHJvcGVydHkgdG8gcHJldmVudCB0aGUgZml4IGJ1dHRvbiBmcm9tIHNob3dpbmcgdXAgKGZvciBub3cpLlxuICAgIGNvbnN0IG1lc3NhZ2UgPSB7Li4udGhpcy5wcm9wcy5tZXNzYWdlLCBmaXg6IHVuZGVmaW5lZH07XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1kYXRhdGlwXCI+XG4gICAgICAgIDxEaWFnbm9zdGljc01lc3NhZ2VcbiAgICAgICAgICBtZXNzYWdlPXttZXNzYWdlfVxuICAgICAgICAgIGdvVG9Mb2NhdGlvbj17Z29Ub0xvY2F0aW9ufVxuICAgICAgICAgIGZpeGVyPXtOT09QfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURpYWdub3N0aWNzRGF0YXRpcENvbXBvbmVudChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpOiBSZWFjdENsYXNzIHtcbiAgcmV0dXJuICgpID0+IDxEaWFnbm9zdGljc0RhdGF0aXBDb21wb25lbnQgbWVzc2FnZT17bWVzc2FnZX0gLz47XG59XG4iXX0=