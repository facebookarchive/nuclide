'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScopesComponent = undefined;

var _ScopesStore;

function _load_ScopesStore() {
  return _ScopesStore = _interopRequireDefault(require('./ScopesStore'));
}

var _WatchExpressionStore;

function _load_WatchExpressionStore() {
  return _WatchExpressionStore = require('./WatchExpressionStore');
}

var _react = _interopRequireWildcard(require('react'));

var _LazyNestedValueComponent;

function _load_LazyNestedValueComponent() {
  return _LazyNestedValueComponent = require('nuclide-commons-ui/LazyNestedValueComponent');
}

var _SimpleValueComponent;

function _load_SimpleValueComponent() {
  return _SimpleValueComponent = _interopRequireDefault(require('nuclide-commons-ui/SimpleValueComponent'));
}

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const NO_VARIABLES = _react.createElement(
  'div',
  { className: 'nuclide-debugger-expression-value-row' },
  _react.createElement(
    'span',
    { className: 'nuclide-debugger-expression-value-content' },
    '(no variables)'
  )
);

const LOADING = _react.createElement(
  'div',
  { className: 'nuclide-debugger-expression-value-row' },
  _react.createElement(
    'span',
    { className: 'nuclide-debugger-expression-value-content' },
    'Loading...'
  )
);

class ScopesComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._setVariable = (scopeObjectId, scopeName, expression, newValue) => {
      if (Boolean(expression) && Boolean(newValue)) {
        if (!(expression != null)) {
          throw new Error('Invariant violation: "expression != null"');
        }

        if (!(newValue != null)) {
          throw new Error('Invariant violation: "newValue != null"');
        }

        this.props.scopesStore.sendSetVariableRequest(scopeObjectId, scopeName, expression, newValue);
      }
    };

    this._renderExpression = (fetchChildren, setVariable, binding, index) => {
      if (binding == null) {
        // `binding` might be `null` while switching threads.
        return null;
      }
      const { name, value } = binding;

      return _react.createElement(
        'div',
        {
          className: 'nuclide-debugger-expression-value-row nuclide-debugger-scope',
          key: index },
        _react.createElement(
          'div',
          { className: 'nuclide-debugger-expression-value-content' },
          _react.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
            expression: name,
            evaluationResult: value,
            fetchChildren: fetchChildren,
            simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
            expansionStateId: this._getExpansionStateIdForExpression(name),
            setVariable: setVariable
          })
        )
      );
    };

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

  _renderScopeSection(fetchChildren, scope) {
    const { scopesStore } = this.props;
    const { loaded, expanded, name, scopeObjectId, scopeVariables } = scope;
    // Non-local scopes should be collapsed by default since users typically care less about them.

    const setVariableHandler = scopesStore.supportsSetVariable() ? this._setVariable.bind(this, scopeObjectId, name) : null;

    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        (_Section || _load_Section()).Section,
        {
          collapsable: true,
          collapsed: !expanded,
          onChange: isCollapsed => scopesStore.setExpanded(name, !isCollapsed),
          headline: name,
          size: 'small' },
        !expanded ? null : !loaded ? LOADING : scopeVariables.length > 0 ? scopeVariables.map(this._renderExpression.bind(this, fetchChildren, setVariableHandler)) : NO_VARIABLES
      )
    );
  }

  render() {
    const { watchExpressionStore, scopes } = this.props;
    if (scopes == null || scopes.size === 0) {
      return _react.createElement(
        'span',
        null,
        '(no variables)'
      );
    }
    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    const scopeSections = Array.from(scopes.values()).map(this._renderScopeSection.bind(this, fetchChildren));
    return _react.createElement(
      'div',
      { className: 'nuclide-debugger-expression-value-list' },
      scopeSections
    );
  }
}
exports.ScopesComponent = ScopesComponent;