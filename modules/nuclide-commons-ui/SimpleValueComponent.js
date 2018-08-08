"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STRING_REGEX = void 0;

var React = _interopRequireWildcard(require("react"));

function _ValueComponentClassNames() {
  const data = require("./ValueComponentClassNames");

  _ValueComponentClassNames = function () {
    return data;
  };

  return data;
}

function _TextRenderer() {
  const data = require("./TextRenderer");

  _TextRenderer = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// TODO @jxg export debugger typedefs from main module. (t11406963)
const booleanRegex = /^true|false$/i;
const STRING_REGEX = /^(['"]).*\1$/;
exports.STRING_REGEX = STRING_REGEX;

function renderNullish(evaluationResult) {
  const {
    type
  } = evaluationResult;
  return type === 'undefined' || type === 'null' ? React.createElement("span", {
    className: _ValueComponentClassNames().ValueComponentClassNames.nullish
  }, type) : null;
}

function renderString(evaluationResult) {
  const {
    type,
    value
  } = evaluationResult;

  if (value == null) {
    return null;
  }

  if (STRING_REGEX.test(value)) {
    return React.createElement("span", {
      className: _ValueComponentClassNames().ValueComponentClassNames.string
    }, value);
  } else if (type === 'string') {
    return React.createElement("span", {
      className: _ValueComponentClassNames().ValueComponentClassNames.string
    }, React.createElement("span", {
      className: _ValueComponentClassNames().ValueComponentClassNames.stringOpeningQuote
    }, "\""), value, React.createElement("span", {
      className: _ValueComponentClassNames().ValueComponentClassNames.stringClosingQuote
    }, "\""));
  } else {
    return null;
  }
}

function renderNumber(evaluationResult) {
  const {
    type,
    value
  } = evaluationResult;

  if (value == null) {
    return null;
  }

  return type === 'number' || !isNaN(Number(value)) ? React.createElement("span", {
    className: _ValueComponentClassNames().ValueComponentClassNames.number
  }, String(value)) : null;
}

function renderBoolean(evaluationResult) {
  const {
    type,
    value
  } = evaluationResult;

  if (value == null) {
    return null;
  }

  return type === 'boolean' || booleanRegex.test(value) ? React.createElement("span", {
    className: _ValueComponentClassNames().ValueComponentClassNames.boolean
  }, String(value)) : null;
}

function renderDefault(evaluationResult) {
  return evaluationResult.value;
}

const valueRenderers = [_TextRenderer().TextRenderer, renderString, renderNumber, renderNullish, renderBoolean, renderDefault];

class SimpleValueComponent extends React.Component {
  shouldComponentUpdate(nextProps) {
    const {
      expression,
      evaluationResult
    } = this.props;
    return expression !== nextProps.expression || evaluationResult.type !== nextProps.evaluationResult.type || evaluationResult.value !== nextProps.evaluationResult.value || evaluationResult.description !== nextProps.evaluationResult.description;
  }

  render() {
    const {
      expression,
      evaluationResult
    } = this.props;
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
      return React.createElement("span", {
        tabIndex: -1,
        className: "native-key-bindings"
      }, displayValue);
    } // TODO @jxg use a text editor to apply proper syntax highlighting for expressions
    // (t11408154)


    const renderedExpression = React.createElement("span", {
      className: _ValueComponentClassNames().ValueComponentClassNames.identifier
    }, expression);
    return React.createElement("span", {
      tabIndex: -1,
      className: "native-key-bindings"
    }, renderedExpression, ": ", displayValue);
  }

}

exports.default = SimpleValueComponent;