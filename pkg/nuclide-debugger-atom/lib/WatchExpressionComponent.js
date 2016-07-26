Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _WatchExpressionStore2;

function _WatchExpressionStore() {
  return _WatchExpressionStore2 = require('./WatchExpressionStore');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
}

var _nuclideUiLibLazyNestedValueComponent2;

function _nuclideUiLibLazyNestedValueComponent() {
  return _nuclideUiLibLazyNestedValueComponent2 = require('../../nuclide-ui/lib/LazyNestedValueComponent');
}

var _nuclideUiLibSimpleValueComponent2;

function _nuclideUiLibSimpleValueComponent() {
  return _nuclideUiLibSimpleValueComponent2 = _interopRequireDefault(require('../../nuclide-ui/lib/SimpleValueComponent'));
}

var WatchExpressionComponent = (function (_React$Component) {
  _inherits(WatchExpressionComponent, _React$Component);

  function WatchExpressionComponent(props) {
    _classCallCheck(this, WatchExpressionComponent);

    _get(Object.getPrototypeOf(WatchExpressionComponent.prototype), 'constructor', this).call(this, props);
    this._renderExpression = this._renderExpression.bind(this);
    this._onConfirmNewExpression = this._onConfirmNewExpression.bind(this);
    this._resetExpressionEditState = this._resetExpressionEditState.bind(this);
    this._onEditorCancel = this._onEditorCancel.bind(this);
    this._onEditorBlur = this._onEditorBlur.bind(this);
    this.state = {
      rowBeingEdited: null
    };
  }

  _createClass(WatchExpressionComponent, [{
    key: 'removeExpression',
    value: function removeExpression(index, event) {
      event.stopPropagation();
      this.props.onRemoveWatchExpression(index);
    }
  }, {
    key: 'addExpression',
    value: function addExpression(expression) {
      this.props.onAddWatchExpression(expression);
    }
  }, {
    key: '_onConfirmNewExpression',
    value: function _onConfirmNewExpression() {
      var text = this.refs.newExpressionEditor.getText();
      this.addExpression(text);
      this.refs.newExpressionEditor.setText('');
    }
  }, {
    key: '_onConfirmExpressionEdit',
    value: function _onConfirmExpressionEdit(index) {
      var text = this.refs.editExpressionEditor.getText();
      this.props.onUpdateWatchExpression(index, text);
      this._resetExpressionEditState();
    }
  }, {
    key: '_onEditorCancel',
    value: function _onEditorCancel() {
      this._resetExpressionEditState();
    }
  }, {
    key: '_onEditorBlur',
    value: function _onEditorBlur() {
      this._resetExpressionEditState();
    }
  }, {
    key: '_setRowBeingEdited',
    value: function _setRowBeingEdited(index) {
      var _this = this;

      this.setState({
        rowBeingEdited: index
      });
      if (this.coreCancelDisposable) {
        this.coreCancelDisposable.dispose();
      }
      this.coreCancelDisposable = atom.commands.add('atom-workspace', {
        'core:cancel': function coreCancel() {
          return _this._resetExpressionEditState();
        }
      });
      setTimeout(function () {
        if (_this.refs.editExpressionEditor) {
          _this.refs.editExpressionEditor.focus();
        }
      }, 16);
    }
  }, {
    key: '_resetExpressionEditState',
    value: function _resetExpressionEditState() {
      if (this.coreCancelDisposable) {
        this.coreCancelDisposable.dispose();
        this.coreCancelDisposable = null;
      }
      this.setState({ rowBeingEdited: null });
    }
  }, {
    key: '_renderExpression',
    value: function _renderExpression(fetchChildren, watchExpression, index) {
      var expression = watchExpression.expression;
      var value = watchExpression.value;

      if (index === this.state.rowBeingEdited) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
          className: 'nuclide-debugger-atom-watch-expression-input',
          key: index,
          onConfirm: this._onConfirmExpressionEdit.bind(this, index),
          onCancel: this._onEditorCancel,
          onBlur: this._onEditorBlur,
          ref: 'editExpressionEditor',
          size: 'sm',
          initialValue: expression
        });
      }
      var ValueComponent = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(value.map(function (v) {
        return { evaluationResult: v };
      }), (_nuclideUiLibLazyNestedValueComponent2 || _nuclideUiLibLazyNestedValueComponent()).LazyNestedValueComponent);
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: (0, (_classnames2 || _classnames()).default)('nuclide-debugger-atom-expression-value-row', 'nuclide-debugger-atom-watch-expression-row'),
          key: index },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          {
            className: 'nuclide-debugger-atom-expression-value-content',
            onDoubleClick: this._setRowBeingEdited.bind(this, index) },
          (_reactForAtom2 || _reactForAtom()).React.createElement(ValueComponent, {
            expression: expression,
            fetchChildren: fetchChildren,
            simpleValueComponent: (_nuclideUiLibSimpleValueComponent2 || _nuclideUiLibSimpleValueComponent()).default
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement('i', {
          className: 'icon icon-x nuclide-debugger-atom-watch-expression-xout',
          onMouseDown: this.removeExpression.bind(this, index)
        })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var watchExpressions = _props.watchExpressions;
      var watchExpressionStore = _props.watchExpressionStore;

      var fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
      var expressions = watchExpressions.map(this._renderExpression.bind(this, fetchChildren));
      var addNewExpressionInput = (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
        className: (0, (_classnames2 || _classnames()).default)('nuclide-debugger-atom-watch-expression-input', 'nuclide-debugger-atom-watch-expression-add-new-input'),
        onConfirm: this._onConfirmNewExpression,
        ref: 'newExpressionEditor',
        size: 'sm',
        placeholderText: 'add new watch expression'
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-debugger-atom-expression-value-list' },
        expressions,
        addNewExpressionInput
      );
    }
  }]);

  return WatchExpressionComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.WatchExpressionComponent = WatchExpressionComponent;