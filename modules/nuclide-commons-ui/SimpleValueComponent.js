'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.STRING_REGEX = undefined;














var _react = _interopRequireWildcard(require('react'));var _ValueComponentClassNames;
function _load_ValueComponentClassNames() {return _ValueComponentClassNames = require('./ValueComponentClassNames');}var _TextRenderer;
function _load_TextRenderer() {return _TextRenderer = require('./TextRenderer');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                   * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                   * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                   * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                   * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                   * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                   * 
                                                                                                                                                                                                                                                                                                                                                   * @format
                                                                                                                                                                                                                                                                                                                                                   */ // TODO @jxg export debugger typedefs from main module. (t11406963)
const booleanRegex = /^true|false$/i;const STRING_REGEX = exports.STRING_REGEX = /^(['"]).*\1$/;function renderNullish(evaluationResult)
{
  const { type } = evaluationResult;
  return type === 'undefined' || type === 'null' ?
  _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.nullish }, type) :
  null;
}

function renderString(evaluationResult) {
  const { type, value } = evaluationResult;
  if (value == null) {
    return null;
  }
  if (STRING_REGEX.test(value)) {
    return _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.string }, value);
  } else if (type === 'string') {
    return (
      _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.string },
        _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringOpeningQuote }, '"'),
        value,
        _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.stringClosingQuote }, '"')));


  } else {
    return null;
  }
}

function renderNumber(evaluationResult) {
  const { type, value } = evaluationResult;
  if (value == null) {
    return null;
  }
  return type === 'number' || !isNaN(Number(value)) ?
  _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.number }, String(value)) :
  null;
}

function renderBoolean(
evaluationResult)
{
  const { type, value } = evaluationResult;
  if (value == null) {
    return null;
  }
  return type === 'boolean' || booleanRegex.test(value) ?
  _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.boolean }, String(value)) :
  null;
}

function renderDefault(evaluationResult) {
  return evaluationResult.value;
}

const valueRenderers = [(_TextRenderer || _load_TextRenderer()).TextRenderer,

renderString,
renderNumber,
renderNullish,
renderBoolean,
renderDefault];


class SimpleValueComponent extends _react.Component {
  shouldComponentUpdate(nextProps) {
    const { expression, evaluationResult } = this.props;
    return (
      expression !== nextProps.expression ||
      evaluationResult.type !== nextProps.evaluationResult.type ||
      evaluationResult.value !== nextProps.evaluationResult.value ||
      evaluationResult.description !== nextProps.evaluationResult.description);

  }

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
      return (
        _react.createElement('span', { tabIndex: -1, className: 'native-key-bindings' },
          displayValue));


    }
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions
    // (t11408154)
    const renderedExpression =
    _react.createElement('span', { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.identifier }, expression);

    return (
      _react.createElement('span', { tabIndex: -1, className: 'native-key-bindings' },
        renderedExpression, ': ',
        displayValue));


  }}exports.default = SimpleValueComponent;