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

// TODO @jxg export debugger typedefs from main module. (t11406963)

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _ValueComponentClassNames;

function _load_ValueComponentClassNames() {
  return _ValueComponentClassNames = require('./ValueComponentClassNames');
}

var _TextRenderer;

function _load_TextRenderer() {
  return _TextRenderer = require('./TextRenderer');
}

function renderNullish(evaluationResult) {
  var type = evaluationResult.type;

  return type === 'undefined' || type === 'null' ? (_reactForAtom || _load_reactForAtom()).React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.nullish },
    type
  ) : null;
}

function renderString(evaluationResult) {
  var type = evaluationResult.type;
  var value = evaluationResult.value;

  return type === 'string' ? (_reactForAtom || _load_reactForAtom()).React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.string },
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringOpeningQuote },
      '"'
    ),
    value,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringClosingQuote },
      '"'
    )
  ) : null;
}

function renderNumber(evaluationResult) {
  var type = evaluationResult.type;
  var value = evaluationResult.value;

  return type === 'number' ? (_reactForAtom || _load_reactForAtom()).React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.number },
    value
  ) : null;
}

function renderBoolean(evaluationResult) {
  var type = evaluationResult.type;
  var value = evaluationResult.value;

  return type === 'boolean' ? (_reactForAtom || _load_reactForAtom()).React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.boolean },
    String(value)
  ) : null;
}

function renderDefault(evaluationResult) {
  return evaluationResult.value;
}

var valueRenderers = [(_TextRenderer || _load_TextRenderer()).TextRenderer, renderString, renderNumber, renderNullish, renderBoolean, renderDefault];

var SimpleValueComponent = (function (_React$Component) {
  _inherits(SimpleValueComponent, _React$Component);

  function SimpleValueComponent() {
    _classCallCheck(this, SimpleValueComponent);

    _get(Object.getPrototypeOf(SimpleValueComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SimpleValueComponent, [{
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
        displayValue = evaluationResult.description || '(N/A)';
      }
      if (expression == null) {
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          null,
          displayValue
        );
      }
      // TODO @jxg use a text editor to apply proper syntax highlighting for expressions
      // (t11408154)
      var renderedExpression = (_reactForAtom || _load_reactForAtom()).React.createElement(
        'span',
        { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.identifier },
        expression
      );
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'span',
        null,
        renderedExpression,
        ': ',
        displayValue
      );
    }
  }]);

  return SimpleValueComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = SimpleValueComponent;
module.exports = exports.default;