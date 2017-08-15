'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerDatatipComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _LazyNestedValueComponent;

function _load_LazyNestedValueComponent() {
  return _LazyNestedValueComponent = require('../../nuclide-ui/LazyNestedValueComponent');
}

var _SimpleValueComponent;

function _load_SimpleValueComponent() {
  return _SimpleValueComponent = _interopRequireDefault(require('../../nuclide-ui/SimpleValueComponent'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _SelectableDiv;

function _load_SelectableDiv() {
  return _SelectableDiv = _interopRequireDefault(require('../../nuclide-ui/SelectableDiv'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class DebuggerDatatipComponent extends _react.default.Component {

  componentDidMount() {
    const domNode = _reactDom.default.findDOMNode(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add(domNode, 'core:copy', event => {
      document.execCommand('copy');
      event.stopPropagation();
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const { expression, evaluationResult, watchExpressionStore } = this.props;
    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    return _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-datatip' },
      _react.default.createElement(
        'span',
        { className: 'nuclide-debugger-datatip-value' },
        _react.default.createElement(
          (_SelectableDiv || _load_SelectableDiv()).default,
          null,
          _react.default.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
            evaluationResult: evaluationResult,
            expression: expression,
            fetchChildren: fetchChildren,
            simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
            expansionStateId: this
          })
        )
      )
    );
  }
}
exports.DebuggerDatatipComponent = DebuggerDatatipComponent;