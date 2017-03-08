'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScopesComponent = undefined;

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

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
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
 */

class ScopesComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._renderExpression = this._renderExpression.bind(this);
    this._expansionStates = new Map();
  }

  _getExpansionStateIdForExpression(expression) {
    let expansionStateId = this._expansionStates.get(expression);
    if (expansionStateId == null) {
      expansionStateId = {};
      this._expansionStates.set(expression, expansionStateId);
    }
    return expansionStateId;
  }

  _renderExpression(fetchChildren, binding, index) {
    if (binding == null) {
      // `binding` might be `null` while switching threads.
      return null;
    }
    const {
      name,
      value
    } = binding;
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
          simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
          expansionStateId: this._getExpansionStateIdForExpression(name)
        })
      )
    );
  }

  _renderScopeSection(fetchChildren, scope) {
    // Non-local scopes should be collapsed by default since users typically care less about them.
    const collapsedByDefault = scope.name !== 'Locals';
    const noLocals = scope.name !== 'Locals' || scope.scopeVariables.length > 0 ? null : _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-expression-value-row' },
      _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-debugger-expression-value-content' },
        '(no variables)'
      )
    );

    return _reactForAtom.React.createElement(
      (_Section || _load_Section()).Section,
      {
        collapsable: true,
        headline: scope.name,
        size: 'small',
        collapsedByDefault: collapsedByDefault },
      noLocals,
      scope.scopeVariables.map(this._renderExpression.bind(this, fetchChildren))
    );
  }

  render() {
    const {
      watchExpressionStore,
      scopes
    } = this.props;
    if (scopes == null || scopes.length === 0) {
      return _reactForAtom.React.createElement(
        'span',
        null,
        '(no variables)'
      );
    }
    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    const scopeSections = scopes.map(this._renderScopeSection.bind(this, fetchChildren));
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-expression-value-list' },
      scopeSections
    );
  }
}
exports.ScopesComponent = ScopesComponent;