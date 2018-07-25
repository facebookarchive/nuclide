"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _LazyNestedValueComponent() {
  const data = require("../../../../../nuclide-commons-ui/LazyNestedValueComponent");

  _LazyNestedValueComponent = function () {
    return data;
  };

  return data;
}

function _SimpleValueComponent() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/SimpleValueComponent"));

  _SimpleValueComponent = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class DebuggerDatatipComponent extends React.Component {
  render() {
    const {
      expression,
      evaluationResult
    } = this.props;
    let datatipElement;

    if (evaluationResult == null) {
      datatipElement = React.createElement(_LoadingSpinner().LoadingSpinner, {
        delay: 100,
        size: "EXTRA_SMALL"
      });
    } else {
      datatipElement = React.createElement("span", {
        className: "debugger-datatip-value"
      }, React.createElement(_LazyNestedValueComponent().LazyNestedValueComponent, {
        evaluationResult: evaluationResult,
        expression: expression,
        fetchChildren: _utils().fetchChildrenForLazyComponent,
        simpleValueComponent: _SimpleValueComponent().default,
        expansionStateId: this
      }));
    }

    return React.createElement("div", {
      className: "debugger-datatip"
    }, datatipElement);
  }

}

exports.default = DebuggerDatatipComponent;