'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WatchExpressionComponent = undefined;

var _WatchExpressionStore;

function _load_WatchExpressionStore() {
  return _WatchExpressionStore = require('./WatchExpressionStore');
}

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _LazyNestedValueComponent;

function _load_LazyNestedValueComponent() {
  return _LazyNestedValueComponent = require('../../nuclide-ui/LazyNestedValueComponent');
}

var _SimpleValueComponent;

function _load_SimpleValueComponent() {
  return _SimpleValueComponent = _interopRequireDefault(require('../../nuclide-ui/SimpleValueComponent'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const EDIT_WATCH_EXPRESSION_BLUR_DEBOUNCE_MS = 50;

class WatchExpressionComponent extends _react.PureComponent {

  constructor(props) {
    super(props);

    this._onConfirmNewExpression = () => {
      const text = this.refs.newExpressionEditor.getText();
      this.addExpression(text);
      this.refs.newExpressionEditor.setText('');
    };

    this._onEditorCancel = () => {
      this._resetExpressionEditState();
    };

    this._resetExpressionEditState = () => {
      if (this.coreCancelDisposable) {
        this.coreCancelDisposable.dispose();
        this.coreCancelDisposable = null;
      }
      this.setState({ rowBeingEdited: null });
    };

    this._renderExpression = (fetchChildren, watchExpression, index) => {
      const { expression, value } = watchExpression;
      if (index === this.state.rowBeingEdited) {
        return _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          className: 'nuclide-debugger-watch-expression-input',
          autofocus: true,
          startSelected: true,
          key: index,
          onConfirm: this._onConfirmExpressionEdit.bind(this, index),
          onCancel: this._onEditorCancel,
          onBlur: this._debouncedEditorBlur,
          ref: 'editExpressionEditor',
          size: 'sm',
          initialValue: expression
        });
      }
      const ValueComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(value.map(v => ({ evaluationResult: v })), (_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent);
      return _react.createElement(
        'div',
        {
          className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-expression-value-row', 'nuclide-debugger-watch-expression-row'),
          key: index },
        _react.createElement(
          'div',
          {
            className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-expression-value-content', 'nuclide-debugger-watch-expression-value-content'),
            onDoubleClick: this._setRowBeingEdited.bind(this, index) },
          _react.createElement(ValueComponent, {
            expression: expression,
            fetchChildren: fetchChildren,
            simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default,
            expansionStateId: this._getExpansionStateIdForExpression(expression)
          })
        ),
        _react.createElement(
          'div',
          { className: 'nuclide-debugger-watch-expression-controls' },
          _react.createElement((_Icon || _load_Icon()).Icon, {
            icon: 'pencil',
            className: 'nuclide-debugger-watch-expression-control',
            onClick: this._setRowBeingEdited.bind(this, index)
          }),
          _react.createElement((_Icon || _load_Icon()).Icon, {
            icon: 'x',
            className: 'nuclide-debugger-watch-expression-control',
            onClick: this.removeExpression.bind(this, index)
          })
        )
      );
    };

    this._debouncedEditorBlur = (0, (_debounce || _load_debounce()).default)(this._onEditorBlur.bind(this), EDIT_WATCH_EXPRESSION_BLUR_DEBOUNCE_MS);
    this._expansionStates = new Map();
    this.state = {
      rowBeingEdited: null
    };
  }

  _getExpansionStateIdForExpression(expression) {
    let expansionStateId = this._expansionStates.get(expression);
    if (expansionStateId == null) {
      expansionStateId = {};
      this._expansionStates.set(expression, expansionStateId);
    }
    return expansionStateId;
  }

  removeExpression(index, event) {
    event.stopPropagation();
    this.props.onRemoveWatchExpression(index);
  }

  addExpression(expression) {
    this.props.onAddWatchExpression(expression);
  }

  _onConfirmExpressionEdit(index) {
    const text = this.refs.editExpressionEditor.getText();
    this.props.onUpdateWatchExpression(index, text);
    this._resetExpressionEditState();
  }

  _onEditorBlur() {
    if (this.refs.editExpressionEditor == null) {
      return;
    }
    if (!this.refs.editExpressionEditor.getTextEditorElement().hasFocus()) {
      this._resetExpressionEditState();
    }
  }

  _setRowBeingEdited(index) {
    this.setState({
      rowBeingEdited: index
    });
    if (this.coreCancelDisposable) {
      this.coreCancelDisposable.dispose();
    }
    this.coreCancelDisposable = atom.commands.add('atom-workspace', {
      'core:cancel': () => this._resetExpressionEditState()
    });
  }

  render() {
    const { watchExpressions, watchExpressionStore } = this.props;
    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    const expressions = watchExpressions.map(this._renderExpression.bind(this, fetchChildren));
    const addNewExpressionInput = _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-watch-expression-input', 'nuclide-debugger-watch-expression-add-new-input'),
      onConfirm: this._onConfirmNewExpression,
      ref: 'newExpressionEditor',
      size: 'sm',
      placeholderText: 'add new watch expression'
    });
    return _react.createElement(
      'div',
      { className: 'nuclide-debugger-expression-value-list' },
      expressions,
      addNewExpressionInput
    );
  }
}
exports.WatchExpressionComponent = WatchExpressionComponent;