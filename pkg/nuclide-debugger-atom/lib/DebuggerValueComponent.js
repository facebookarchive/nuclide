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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideUiLibHighlightOnUpdate2;

function _nuclideUiLibHighlightOnUpdate() {
  return _nuclideUiLibHighlightOnUpdate2 = require('../../nuclide-ui/lib/highlightOnUpdate');
}

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

var ValueComponent = (function (_React$Component) {
  _inherits(ValueComponent, _React$Component);

  function ValueComponent() {
    _classCallCheck(this, ValueComponent);

    _get(Object.getPrototypeOf(ValueComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ValueComponent, [{
    key: 'render',
    value: function render() {
      var evaluationResult = this.props.evaluationResult;

      var displayValue = undefined;
      if (evaluationResult == null) {
        displayValue = '<not available>';
      } else {
        if (!displayValue) {
          for (var renderer of valueRenderers) {
            (0, (_assert2 || _assert()).default)(evaluationResult);
            displayValue = renderer(evaluationResult);
            if (displayValue != null) {
              break;
            }
          }
        }
        if (displayValue == null || displayValue === '') {
          displayValue = '(N/A)';
        }
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        null,
        displayValue
      );
    }
  }]);

  return ValueComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

function arePropsEqual(p1, p2) {
  var evaluationResult1 = p1.evaluationResult;
  var evaluationResult2 = p2.evaluationResult;
  if (evaluationResult1 === evaluationResult2) {
    return true;
  }
  if (evaluationResult1 == null || evaluationResult2 == null) {
    return false;
  }
  return evaluationResult1.value === evaluationResult2.value && evaluationResult1._type === evaluationResult2._type && evaluationResult1._description === evaluationResult2._description;
}
var DebuggerValueComponent = (0, (_nuclideUiLibHighlightOnUpdate2 || _nuclideUiLibHighlightOnUpdate()).highlightOnUpdate)(ValueComponent, arePropsEqual, undefined, /* custom classname */
undefined);
exports.DebuggerValueComponent = DebuggerValueComponent;
/* custom delay */