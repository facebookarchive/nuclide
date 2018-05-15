'use strict';var _UniversalDisposable;













function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireDefault(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _Model;

function _load_Model() {return _Model = _interopRequireDefault(require('../nuclide-commons/Model'));}var _Jest;
function _load_Jest() {return _Jest = _interopRequireDefault(require('./frontend/Jest'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const div = document.createElement('div'); /**
                                            * Copyright (c) 2017-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the BSD-style license found in the
                                            * LICENSE file in the root directory of this source tree. An additional grant
                                            * of patent rights can be found in the PATENTS file in the same directory.
                                            *
                                            * 
                                            * @format
                                            */(0, (_nullthrows || _load_nullthrows()).default)(document.body).appendChild(div); // Jest seems to be particular about this being a commonjs export
// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = class AtomReporter {


  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;

    this.model = new (_Model || _load_Model()).default({ results: null });
    this._modelSubscription = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    this.model.subscribe(state => {
      _reactDom.default.render(_react.default.createElement((_Jest || _load_Jest()).default, { results: state.results }), div);
    }));

  }

  onTestResult(
  config,
  result,
  results)
  {
    this.model.setState({ results });
  }

  onRunComplete(contexts, results) {
    this.model.setState({ results });
    this._modelSubscription.dispose();
  }};