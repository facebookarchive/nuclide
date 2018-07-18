"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _Model() {
  const data = _interopRequireDefault(require("../nuclide-commons/Model"));

  _Model = function () {
    return data;
  };

  return data;
}

function _Jest() {
  const data = _interopRequireDefault(require("./frontend/Jest"));

  _Jest = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const div = document.createElement('div');
(0, _nullthrows().default)(document.body).appendChild(div);
// Jest seems to be particular about this being a commonjs export
// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = class AtomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.model = new (_Model().default)({
      results: null
    });
    this._modelSubscription = new (_UniversalDisposable().default)(this.model.subscribe(state => {
      _reactDom.default.render(_react.default.createElement(_Jest().default, {
        results: state.results
      }), div);
    }));
  }

  onTestResult(config, result, results) {
    this.model.setState({
      results
    });
  }

  onRunComplete(contexts, results) {
    this.model.setState({
      results
    });

    this._modelSubscription.dispose();
  }

};