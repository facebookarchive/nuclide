'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerDatatipComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _LazyNestedValueComponent;

function _load_LazyNestedValueComponent() {
  return _LazyNestedValueComponent = require('../../nuclide-ui/LazyNestedValueComponent');
}

var _SimpleValueComponent;

function _load_SimpleValueComponent() {
  return _SimpleValueComponent = _interopRequireDefault(require('../../nuclide-ui/SimpleValueComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DebuggerDatatipComponent extends _react.Component {
  render() {
    const { expression, evaluationResult, watchExpressionStore } = this.props;
    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    return _react.createElement(
      'div',
      { className: 'nuclide-debugger-datatip' },
      _react.createElement(
        'span',
        { className: 'nuclide-debugger-datatip-value' },
        _react.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
          evaluationResult: evaluationResult,
          expression: expression,
          fetchChildren: fetchChildren,
          simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
          expansionStateId: this
        })
      )
    );
  }
}
exports.DebuggerDatatipComponent = DebuggerDatatipComponent; /**
                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                              * All rights reserved.
                                                              *
                                                              * This source code is licensed under the license found in the LICENSE file in
                                                              * the root directory of this source tree.
                                                              *
                                                              * 
                                                              * @format
                                                              */