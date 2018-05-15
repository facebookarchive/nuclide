'use strict';Object.defineProperty(exports, "__esModule", { value: true });













var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
var _react = _interopRequireWildcard(require('react'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _AtomInput;
function _load_AtomInput() {return _AtomInput = require('../../../../../nuclide-commons-ui/AtomInput');}var _bindObservableAsProps;
function _load_bindObservableAsProps() {return _bindObservableAsProps = require('../../../../../nuclide-commons-ui/bindObservableAsProps');}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _LazyNestedValueComponent;
function _load_LazyNestedValueComponent() {return _LazyNestedValueComponent = require('../../../../../nuclide-commons-ui/LazyNestedValueComponent');}var _SimpleValueComponent;
function _load_SimpleValueComponent() {return _SimpleValueComponent = _interopRequireDefault(require('../../../../../nuclide-commons-ui/SimpleValueComponent'));}var _Icon;
function _load_Icon() {return _Icon = require('../../../../../nuclide-commons-ui/Icon');}var _utils;
function _load_utils() {return _utils = require('../utils');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}

















class WatchExpressionComponent extends _react.Component


{








  constructor(props) {
    super(props);this.
























    _onConfirmNewExpression = () => {
      const text = (0, (_nullthrows || _load_nullthrows()).default)(this._newExpressionEditor).getText();
      this.addExpression(text);
      (0, (_nullthrows || _load_nullthrows()).default)(this._newExpressionEditor).setText('');
    };this.



















    _resetExpressionEditState = () => {
      if (this.coreCancelDisposable) {
        this.coreCancelDisposable.dispose();
        this.coreCancelDisposable = null;
      }
      this.setState({ rowBeingEdited: null });
    };this.

    _renderExpression =
    watchExpression =>
    {
      const { focusedProcess, focusedStackFrame } = this.props;
      const id = watchExpression.getId();
      let evalResult;
      if (id === this.state.rowBeingEdited) {
        return (
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            className: 'debugger-watch-expression-input',
            autofocus: true,
            startSelected: true,
            key: id,
            onConfirm: this._onConfirmExpressionEdit.bind(this, id),
            onCancel: this._resetExpressionEditState,
            onBlur: this._resetExpressionEditState,
            ref: input => {
              this._editExpressionEditor = input;
            },
            size: 'sm',
            initialValue: watchExpression.name }));


      } else if (focusedProcess == null) {
        evalResult = _rxjsBundlesRxMinJs.Observable.of(null);
      } else {
        evalResult = (0, (_utils || _load_utils()).expressionAsEvaluationResultStream)(
        watchExpression,
        focusedProcess,
        focusedStackFrame,
        'watch');

      }
      const ValueComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
      evalResult.map(evaluationResult => ({ evaluationResult })), (_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent);


      return (
        _react.createElement('div', {
            className: (0, (_classnames || _load_classnames()).default)(
            'debugger-expression-value-row',
            'debugger-watch-expression-row'),

            key: id },
          _react.createElement('div', {
              className: (0, (_classnames || _load_classnames()).default)(
              'debugger-expression-value-content',
              'debugger-watch-expression-value-content'),

              onDoubleClick: this._setRowBeingEdited.bind(this, id) },
            _react.createElement(ValueComponent, {
              expression: watchExpression.name,
              fetchChildren: (_utils || _load_utils()).fetchChildrenForLazyComponent,
              simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
              expansionStateId: this._getExpansionStateIdForExpression(
              watchExpression.name) })),



          _react.createElement('div', { className: 'debugger-watch-expression-controls' },
            _react.createElement((_Icon || _load_Icon()).Icon, {
              icon: 'pencil',
              className: 'debugger-watch-expression-control',
              onClick: this._setRowBeingEdited.bind(this, id) }),

            _react.createElement((_Icon || _load_Icon()).Icon, {
              icon: 'x',
              className: 'debugger-watch-expression-control',
              onClick: this.removeExpression.bind(this, id) }))));




    };this._expansionStates = new Map();this.state = { rowBeingEdited: null };}_getExpansionStateIdForExpression(expression) {let expansionStateId = this._expansionStates.get(expression);if (expansionStateId == null) {expansionStateId = {};this._expansionStates.set(expression, expansionStateId);}return expansionStateId;}removeExpression(id, event) {event.stopPropagation();this.props.onRemoveWatchExpression(id);}addExpression(expression) {this.props.onAddWatchExpression(expression);}_onConfirmExpressionEdit(id) {const text = (0, (_nullthrows || _load_nullthrows()).default)(this._editExpressionEditor).getText();this.props.onUpdateWatchExpression(id, text);this._resetExpressionEditState();}_setRowBeingEdited(id) {this.setState({ rowBeingEdited: id });if (this.coreCancelDisposable) {this.coreCancelDisposable.dispose();}this.coreCancelDisposable = atom.commands.add('atom-workspace', { 'core:cancel': () => this._resetExpressionEditState() });}

  render() {
    const expressions = this.props.watchExpressions.map(this._renderExpression);
    const addNewExpressionInput =
    _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      className: (0, (_classnames || _load_classnames()).default)(
      'debugger-watch-expression-input',
      'debugger-watch-expression-add-new-input'),

      onConfirm: this._onConfirmNewExpression,
      ref: input => {
        this._newExpressionEditor = input;
      },
      size: 'sm',
      placeholderText: 'Add new watch expression' });


    return (
      _react.createElement('div', { className: 'debugger-expression-value-list' },
        expressions,
        addNewExpressionInput));


  }}exports.default = WatchExpressionComponent; /**
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