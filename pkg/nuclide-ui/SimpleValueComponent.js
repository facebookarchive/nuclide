'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO @jxg export debugger typedefs from main module. (t11406963)

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _ValueComponentClassNames;

function _load_ValueComponentClassNames() {
  return _ValueComponentClassNames = require('./ValueComponentClassNames');
}

var _TextRenderer;

function _load_TextRenderer() {
  return _TextRenderer = require('./TextRenderer');
}

function renderNullish(evaluationResult) {
  const type = evaluationResult.type;

  return type === 'undefined' || type === 'null' ? _reactForAtom.React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.nullish },
    type
  ) : null;
}

function renderString(evaluationResult) {
  const type = evaluationResult.type,
        value = evaluationResult.value;

  return type === 'string' ? _reactForAtom.React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.string },
    _reactForAtom.React.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringOpeningQuote },
      '"'
    ),
    value,
    _reactForAtom.React.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringClosingQuote },
      '"'
    )
  ) : null;
}

function renderNumber(evaluationResult) {
  const type = evaluationResult.type,
        value = evaluationResult.value;

  return type === 'number' ? _reactForAtom.React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.number },
    value
  ) : null;
}

function renderBoolean(evaluationResult) {
  const type = evaluationResult.type,
        value = evaluationResult.value;

  return type === 'boolean' ? _reactForAtom.React.createElement(
    'span',
    { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.boolean },
    String(value)
  ) : null;
}

function renderDefault(evaluationResult) {
  return evaluationResult.value;
}

const valueRenderers = [(_TextRenderer || _load_TextRenderer()).TextRenderer, renderString, renderNumber, renderNullish, renderBoolean, renderDefault];

let SimpleValueComponent = class SimpleValueComponent extends _reactForAtom.React.Component {

  render() {
    var _props = this.props;
    const expression = _props.expression,
          evaluationResult = _props.evaluationResult;

    let displayValue;
    for (const renderer of valueRenderers) {
      displayValue = renderer(evaluationResult);
      if (displayValue != null) {
        break;
      }
    }
    if (displayValue == null || displayValue === '') {
      displayValue = evaluationResult.description || '(N/A)';
    }
    if (expression == null) {
      return _reactForAtom.React.createElement(
        'span',
        null,
        displayValue
      );
    }
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions
    // (t11408154)
    const renderedExpression = _reactForAtom.React.createElement(
      'span',
      { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.identifier },
      expression
    );
    return _reactForAtom.React.createElement(
      'span',
      null,
      renderedExpression,
      ': ',
      displayValue
    );
  }
};
exports.default = SimpleValueComponent;
module.exports = exports['default'];