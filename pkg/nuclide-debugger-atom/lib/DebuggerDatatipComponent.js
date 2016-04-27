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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

function renderObject(evaluationResult) {
  var _type = evaluationResult._type;
  var _description = evaluationResult._description;

  return _type === 'object' ? _description : null;
}

function renderNullish(evaluationResult) {
  var _type = evaluationResult._type;

  return _type === 'undefined' || _type === 'null' ? _type : null;
}

function renderString(evaluationResult) {
  var _type = evaluationResult._type;
  var value = evaluationResult.value;

  return _type === 'string' ? '"' + value + '"' : null;
}

function renderDefault(evaluationResult) {
  return evaluationResult.value;
}

var valueRenderers = [renderObject, renderString, renderNullish, renderDefault];

var DebuggerDatatipComponent = (function (_React$Component) {
  _inherits(DebuggerDatatipComponent, _React$Component);

  function DebuggerDatatipComponent() {
    _classCallCheck(this, DebuggerDatatipComponent);

    _get(Object.getPrototypeOf(DebuggerDatatipComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DebuggerDatatipComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var expression = _props.expression;
      var evaluationResult = _props.evaluationResult;

      var displayValue = undefined;
      for (var renderer of valueRenderers) {
        displayValue = renderer(evaluationResult);
        if (displayValue != null) {
          break;
        }
      }
      if (displayValue == null || displayValue === '') {
        displayValue = '(N/A)';
      }
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-datatip' },
        expression,
        ':',
        ' ',
        _reactForAtom.React.createElement(
          'span',
          { className: 'nuclide-debugger-datatip-value' },
          displayValue
        )
      );
    }
  }]);

  return DebuggerDatatipComponent;
})(_reactForAtom.React.Component);

exports.DebuggerDatatipComponent = DebuggerDatatipComponent;