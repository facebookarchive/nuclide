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
exports.LocalsComponent = undefined;

var _WatchExpressionStore;

function _load_WatchExpressionStore() {
  return _WatchExpressionStore = require('./WatchExpressionStore');
}

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

let LocalsComponent = exports.LocalsComponent = class LocalsComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._renderExpression = this._renderExpression.bind(this);
  }

  _renderExpression(fetchChildren, local, index) {
    if (local == null) {
      // `local` might be `null` while switching threads.
      return null;
    }
    const name = local.name,
          value = local.value;

    return _reactForAtom.React.createElement(
      'div',
      {
        className: 'nuclide-debugger-expression-value-row',
        key: index },
      _reactForAtom.React.createElement(
        'div',
        {
          className: 'nuclide-debugger-expression-value-content' },
        _reactForAtom.React.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
          expression: name,
          evaluationResult: value,
          fetchChildren: fetchChildren,
          simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default
        })
      )
    );
  }

  render() {
    var _props = this.props;
    const watchExpressionStore = _props.watchExpressionStore,
          locals = _props.locals;

    if (locals == null || locals.length === 0) {
      return _reactForAtom.React.createElement(
        'span',
        null,
        '(no variables)'
      );
    }
    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    const expressions = locals.map(this._renderExpression.bind(this, fetchChildren));
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-expression-value-list' },
      expressions
    );
  }
};