'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _ValueComponentClassNames;

function _load_ValueComponentClassNames() {
  return _ValueComponentClassNames = require('./ValueComponentClassNames');
}

var _TextRenderer;

function _load_TextRenderer() {
  return _TextRenderer = require('./TextRenderer');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

// TODO @jxg export debugger typedefs from main module. (t11406963)
function renderNullish(evaluationResult) {
  const { type } = evaluationResult;
  return type === 'undefined' || type === 'null' ? _react.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.nullish },
    type
  ) : null;
}

function renderString(evaluationResult) {
  const { type, value } = evaluationResult;
  return type === 'string' ? _react.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.string },
    _react.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringOpeningQuote },
      '"'
    ),
    value,
    _react.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringClosingQuote },
      '"'
    )
  ) : null;
}

function renderNumber(evaluationResult) {
  const { type, value } = evaluationResult;
  return type === 'number' ? _react.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.number },
    String(value)
  ) : null;
}

function renderBoolean(evaluationResult) {
  const { type, value } = evaluationResult;
  return type === 'boolean' ? _react.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.boolean },
    String(value)
  ) : null;
}

function renderDefault(evaluationResult) {
  return evaluationResult.value;
}

const valueRenderers = [(_TextRenderer || _load_TextRenderer()).TextRenderer, renderString, renderNumber, renderNullish, renderBoolean, renderDefault];

class SimpleValueComponent extends _react.Component {
  render() {
    const { expression, evaluationResult } = this.props;
    let displayValue;
    for (const renderer of valueRenderers) {
      displayValue = renderer(evaluationResult);
      if (displayValue != null) {
        break;
      }
    }
    if (displayValue == null || displayValue === '') {
      // flowlint-next-line sketchy-null-string:off
      displayValue = evaluationResult.description || '(N/A)';
    }
    if (expression == null) {
      return _react.createElement(
        'span',
        null,
        displayValue
      );
    }
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions
    // (t11408154)
    const renderedExpression = _react.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.identifier },
      expression
    );
    return _react.createElement(
      'span',
      null,
      renderedExpression,
      ': ',
      displayValue
    );
  }
}
exports.default = SimpleValueComponent;