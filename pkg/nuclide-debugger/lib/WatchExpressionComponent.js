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
exports.WatchExpressionComponent = undefined;

var _WatchExpressionStore;

function _load_WatchExpressionStore() {
  return _WatchExpressionStore = require('./WatchExpressionStore');
}

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _LazyNestedValueComponent;

function _load_LazyNestedValueComponent() {
  return _LazyNestedValueComponent = require('../../nuclide-ui/LazyNestedValueComponent');
}

var _SimpleValueComponent;

function _load_SimpleValueComponent() {
  return _SimpleValueComponent = _interopRequireDefault(require('../../nuclide-ui/SimpleValueComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let WatchExpressionComponent = exports.WatchExpressionComponent = class WatchExpressionComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._renderExpression = this._renderExpression.bind(this);
    this._onConfirmNewExpression = this._onConfirmNewExpression.bind(this);
    this._resetExpressionEditState = this._resetExpressionEditState.bind(this);
    this._onEditorCancel = this._onEditorCancel.bind(this);
    this._onEditorBlur = this._onEditorBlur.bind(this);
    this.state = {
      rowBeingEdited: null
    };
  }

  removeExpression(index, event) {
    event.stopPropagation();
    this.props.onRemoveWatchExpression(index);
  }

  addExpression(expression) {
    this.props.onAddWatchExpression(expression);
  }

  _onConfirmNewExpression() {
    const text = this.refs.newExpressionEditor.getText();
    this.addExpression(text);
    this.refs.newExpressionEditor.setText('');
  }

  _onConfirmExpressionEdit(index) {
    const text = this.refs.editExpressionEditor.getText();
    this.props.onUpdateWatchExpression(index, text);
    this._resetExpressionEditState();
  }

  _onEditorCancel() {
    this._resetExpressionEditState();
  }

  _onEditorBlur() {
    this._resetExpressionEditState();
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
    setTimeout(() => {
      if (this.refs.editExpressionEditor) {
        this.refs.editExpressionEditor.focus();
      }
    }, 16);
  }

  _resetExpressionEditState() {
    if (this.coreCancelDisposable) {
      this.coreCancelDisposable.dispose();
      this.coreCancelDisposable = null;
    }
    this.setState({ rowBeingEdited: null });
  }

  _renderExpression(fetchChildren, watchExpression, index) {
    const expression = watchExpression.expression,
          value = watchExpression.value;

    if (index === this.state.rowBeingEdited) {
      return _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        className: 'nuclide-debugger-watch-expression-input',
        key: index,
        onConfirm: this._onConfirmExpressionEdit.bind(this, index),
        onCancel: this._onEditorCancel,
        onBlur: this._onEditorBlur,
        ref: 'editExpressionEditor',
        size: 'sm',
        initialValue: expression
      });
    }
    const ValueComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(value.map(v => ({ evaluationResult: v })), (_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent);
    return _reactForAtom.React.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-expression-value-row', 'nuclide-debugger-watch-expression-row'),
        key: index },
      _reactForAtom.React.createElement(
        'div',
        {
          className: 'nuclide-debugger-expression-value-content',
          onDoubleClick: this._setRowBeingEdited.bind(this, index) },
        _reactForAtom.React.createElement(ValueComponent, {
          expression: expression,
          fetchChildren: fetchChildren,
          simpleValueComponent: (_SimpleValueComponent || _load_SimpleValueComponent()).default
        })
      ),
      _reactForAtom.React.createElement('i', {
        className: 'icon icon-x nuclide-debugger-watch-expression-xout',
        onClick: this.removeExpression.bind(this, index)
      })
    );
  }

  render() {
    var _props = this.props;
    const watchExpressions = _props.watchExpressions,
          watchExpressionStore = _props.watchExpressionStore;

    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    const expressions = watchExpressions.map(this._renderExpression.bind(this, fetchChildren));
    const addNewExpressionInput = _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-watch-expression-input', 'nuclide-debugger-watch-expression-add-new-input'),
      onConfirm: this._onConfirmNewExpression,
      ref: 'newExpressionEditor',
      size: 'sm',
      placeholderText: 'add new watch expression'
    });
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-expression-value-list' },
      expressions,
      addNewExpressionInput
    );
  }
};