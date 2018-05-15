'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _LoadingSpinner;













function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../../../nuclide-commons-ui/LoadingSpinner');}
var _react = _interopRequireWildcard(require('react'));var _LazyNestedValueComponent;
function _load_LazyNestedValueComponent() {return _LazyNestedValueComponent = require('../../../../../nuclide-commons-ui/LazyNestedValueComponent');}var _SimpleValueComponent;
function _load_SimpleValueComponent() {return _SimpleValueComponent = _interopRequireDefault(require('../../../../../nuclide-commons-ui/SimpleValueComponent'));}var _utils;
function _load_utils() {return _utils = require('../utils');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                            * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                            * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                            * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                            * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                            * 
                                                                                                                                                                                                                                                                                                                                                                                                                            * @format
                                                                                                                                                                                                                                                                                                                                                                                                                            */class DebuggerDatatipComponent extends _react.Component {render() {const { expression, evaluationResult } = this.props;let datatipElement;
    if (evaluationResult == null) {
      datatipElement = _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { delay: 100, size: 'EXTRA_SMALL' });
    } else {
      datatipElement =
      _react.createElement('span', { className: 'debugger-datatip-value' },
        _react.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
          evaluationResult: evaluationResult,
          expression: expression,
          fetchChildren: (_utils || _load_utils()).fetchChildrenForLazyComponent,
          simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
          expansionStateId: this }));



    }
    return _react.createElement('div', { className: 'debugger-datatip' }, datatipElement);
  }}exports.default = DebuggerDatatipComponent;