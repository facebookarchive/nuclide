'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerDatatipComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _LazyNestedValueComponent;

function _load_LazyNestedValueComponent() {
  return _LazyNestedValueComponent = require('../../nuclide-ui/LazyNestedValueComponent');
}

var _SimpleValueComponent;

function _load_SimpleValueComponent() {
  return _SimpleValueComponent = _interopRequireDefault(require('../../nuclide-ui/SimpleValueComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DebuggerDatatipComponent = exports.DebuggerDatatipComponent = class DebuggerDatatipComponent extends _reactForAtom.React.Component {

  render() {
    var _props = this.props;
    const expression = _props.expression,
          evaluationResult = _props.evaluationResult,
          watchExpressionStore = _props.watchExpressionStore;

    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-datatip' },
      _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-debugger-datatip-value' },
        _reactForAtom.React.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
          evaluationResult: evaluationResult,
          expression: expression,
          fetchChildren: fetchChildren,
          simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default
        })
      )
    );
  }
};