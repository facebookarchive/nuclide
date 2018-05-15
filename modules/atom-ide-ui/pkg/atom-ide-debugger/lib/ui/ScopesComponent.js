'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _bindObservableAsProps;














function _load_bindObservableAsProps() {return _bindObservableAsProps = require('../../../../../nuclide-commons-ui/bindObservableAsProps');}
var _react = _interopRequireWildcard(require('react'));var _LazyNestedValueComponent;
function _load_LazyNestedValueComponent() {return _LazyNestedValueComponent = require('../../../../../nuclide-commons-ui/LazyNestedValueComponent');}var _SimpleValueComponent;
function _load_SimpleValueComponent() {return _SimpleValueComponent = _interopRequireDefault(require('../../../../../nuclide-commons-ui/SimpleValueComponent'));}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _Section;
function _load_Section() {return _Section = require('../../../../../nuclide-commons-ui/Section');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _event;
function _load_event() {return _event = require('../../../../../nuclide-commons/event');}var _utils;
function _load_utils() {return _utils = require('../utils');}var _expected;



function _load_expected() {return _expected = require('../../../../../nuclide-commons/expected');}var _LoadingSpinner;
function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../../../nuclide-commons-ui/LoadingSpinner');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}





const NO_VARIABLES =
_react.createElement('div', { className: 'debugger-expression-value-row' },
  _react.createElement('span', { className: 'debugger-expression-value-content' }, '(no variables)')); /**
                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                        * All rights reserved.
                                                                                                        *
                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                        *
                                                                                                        * 
                                                                                                        * @format
                                                                                                        */const LOADING = _react.createElement('div', { className: 'debugger-expression-value-row' }, _react.createElement('span', { className: 'debugger-expression-value-content' }, _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'MEDIUM' })));






class ScopesComponent extends _react.Component {






  constructor(props) {
    super(props);this.
















































































    _getExpansionStateIdForExpression = expression => {
      let expansionStateId = this._expansionStates.get(expression);
      if (expansionStateId == null) {
        expansionStateId = {};
        this._expansionStates.set(expression, expansionStateId);
      }
      return expansionStateId;
    };this.state = { scopes: (_expected || _load_expected()).Expect.value([]), // UX: Local scope names should be expanded by default.
      expandedScopes: new Set(['Local', 'Locals']) };this._expansionStates = new Map();this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();}componentDidMount() {const { viewModel } = this.props.service;this._disposables.add(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, (_event || _load_event()).observableFromSubscribeFunction)(viewModel.onDidChangeExpressionContext.bind(viewModel))).debounceTime(100).switchMap(() => this._getScopes()).subscribe(scopes => {this.setState({ scopes });}));}_getScopes() {const { focusedStackFrame } = this.props.service.viewModel;if (focusedStackFrame == null) {return _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.value([]));} else {return _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.pendingValue([])).concat(_rxjsBundlesRxMinJs.Observable.fromPromise(focusedStackFrame.getScopes().then(scopes => (_expected || _load_expected()).Expect.value(scopes), error => (_expected || _load_expected()).Expect.error(error))));}}componentWillUnmount() {this._disposables.dispose();}_renderScopeSection(scope) {// Non-local scopes should be collapsed by default since users typically care less about them.
    const expanded = this._isScopeExpanded(scope);const { focusedProcess } = this.props.service.viewModel;const canSetVariables = focusedProcess != null && focusedProcess.session.capabilities.supportsSetVariable;let ScopeBodyComponent = () => null;if (expanded) {ScopeBodyComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(this._getScopeVariables(scope).map(variables => ({ variables, canSetVariables, getExpansionStateIdForExpression: this._getExpansionStateIdForExpression })), ScopeComponent);}return _react.createElement((_Section || _load_Section()).Section, { key: scope.getId(), collapsable: true, collapsed: !expanded, onChange: isCollapsed => this._setScopeExpanded(scope, !isCollapsed), headline: scope.name, size: 'small' }, _react.createElement(ScopeBodyComponent, null));}_getScopeVariables(scope) {
    return _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.pendingValue([])).concat(
    _rxjsBundlesRxMinJs.Observable.fromPromise(
    scope.
    getChildren().
    then(
    variables => (_expected || _load_expected()).Expect.value(variables),
    error => (_expected || _load_expected()).Expect.error(error))));



  }

  _isScopeExpanded(scope) {
    return this.state.expandedScopes.has(scope.name);
  }

  _setScopeExpanded(scope, expanded) {
    if (expanded === this.state.expandedScopes.has(scope.name)) {
      return;
    }
    const expandedScopes = new Set(this.state.expandedScopes);
    if (expanded) {
      expandedScopes.add(scope.name);
    } else {
      expandedScopes.delete(scope.name);
    }
    this.setState({ expandedScopes });
  }

  render() {
    const { scopes } = this.state;
    if (scopes.isError) {
      return _react.createElement('span', null, 'Error fetching scopes: ', scopes.error.toString());
    } else if (scopes.isPending) {
      return LOADING;
    } else if (scopes.value.length === 0) {
      return _react.createElement('span', null, '(no variables)');
    }
    const scopeSections = scopes.value.map(scope =>
    this._renderScopeSection(scope));

    return (
      _react.createElement('div', { className: 'debugger-expression-value-list' }, scopeSections));

  }}exports.default = ScopesComponent;








class ScopeComponent extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.















    _setVariable = (expression, newValue) => {
      const { variables } = this.props;
      if (
      !Boolean(expression) ||
      !Boolean(newValue) ||
      variables.isError ||
      variables.isPending)
      {
        return;
      }
      const variable = variables.value.find(v => v.name === expression);
      if (variable == null) {
        return;
      }if (!(
      newValue != null)) {throw new Error('Invariant violation: "newValue != null"');}
      variable.setVariable(newValue).then(() => this.forceUpdate());
    }, _temp;}render() {const { variables } = this.props;if (variables.isError) {return _react.createElement('div', null, 'Error fetching scope variables ', variables.error.toString());} else if (variables.isPending) {return LOADING;} else if (variables.value.length === 0) {return NO_VARIABLES;} else {return variables.value.map(variable => this._renderVariable(variable));}}

  _renderVariable(expression) {
    return (
      _react.createElement('div', {
          className: 'debugger-expression-value-row debugger-scope',
          key: expression.getId() },
        _react.createElement('div', { className: 'debugger-expression-value-content' },
          _react.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
            expression: expression.name,
            evaluationResult: (0, (_utils || _load_utils()).expressionAsEvaluationResult)(expression),
            fetchChildren: (_utils || _load_utils()).fetchChildrenForLazyComponent,
            simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
            expansionStateId: this.props.getExpansionStateIdForExpression(
            expression.name),

            setVariable: this.props.canSetVariables ? this._setVariable : null }))));




  }}