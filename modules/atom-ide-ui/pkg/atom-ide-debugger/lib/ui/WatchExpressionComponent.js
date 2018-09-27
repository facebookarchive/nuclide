"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _LazyNestedValueComponent() {
  const data = require("../../../../../nuclide-commons-ui/LazyNestedValueComponent");

  _LazyNestedValueComponent = function () {
    return data;
  };

  return data;
}

function _SimpleValueComponent() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/SimpleValueComponent"));

  _SimpleValueComponent = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
class WatchExpressionComponent extends React.Component {
  constructor(props) {
    super(props);

    this._onConfirmNewExpression = () => {
      const text = (0, _nullthrows().default)(this._newExpressionEditor).getText();
      this.addExpression(text);
      (0, _nullthrows().default)(this._newExpressionEditor).setText('');
    };

    this._resetExpressionEditState = () => {
      if (this.coreCancelDisposable) {
        this.coreCancelDisposable.dispose();
        this.coreCancelDisposable = null;
      }

      this.setState({
        rowBeingEdited: null
      });
    };

    this._renderExpression = watchExpression => {
      const {
        focusedProcess,
        focusedStackFrame
      } = this.props;
      const id = watchExpression.getId();
      let evalResult;

      if (id === this.state.rowBeingEdited) {
        return React.createElement(_AtomInput().AtomInput, {
          className: "debugger-watch-expression-input",
          autofocus: true,
          startSelected: true,
          key: id,
          onConfirm: this._onConfirmExpressionEdit.bind(this, id),
          onCancel: this._resetExpressionEditState,
          onBlur: this._resetExpressionEditState,
          ref: input => {
            this._editExpressionEditor = input;
          },
          size: "sm",
          initialValue: watchExpression.name
        });
      } else if (focusedProcess == null) {
        evalResult = _RxMin.Observable.of(null);
      } else {
        evalResult = (0, _utils().expressionAsEvaluationResultStream)(watchExpression, focusedProcess, focusedStackFrame, 'watch');
      }

      const ValueComponent = (0, _bindObservableAsProps().bindObservableAsProps)(evalResult.map(evaluationResult => ({
        evaluationResult
      })), _LazyNestedValueComponent().LazyNestedValueComponent);
      return React.createElement("div", {
        className: (0, _classnames().default)('debugger-expression-value-row', 'debugger-watch-expression-row'),
        key: id
      }, React.createElement("div", {
        className: (0, _classnames().default)('debugger-expression-value-content', 'debugger-watch-expression-value-content'),
        onDoubleClick: this._setRowBeingEdited.bind(this, id)
      }, React.createElement(ValueComponent, {
        expression: watchExpression.name,
        fetchChildren: _utils().fetchChildrenForLazyComponent,
        simpleValueComponent: _SimpleValueComponent().default,
        expansionStateId: this._getExpansionStateIdForExpression(watchExpression.name)
      })), React.createElement("div", {
        className: "debugger-watch-expression-controls"
      }, React.createElement(_Icon().Icon, {
        icon: "pencil",
        className: "debugger-watch-expression-control",
        onClick: this._setRowBeingEdited.bind(this, id)
      }), React.createElement(_Icon().Icon, {
        icon: "x",
        className: "debugger-watch-expression-control",
        onClick: this.removeExpression.bind(this, id)
      })));
    };

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

  removeExpression(id, event) {
    event.stopPropagation();
    this.props.onRemoveWatchExpression(id);
  }

  addExpression(expression) {
    this.props.onAddWatchExpression(expression);
  }

  _onConfirmExpressionEdit(id) {
    const text = (0, _nullthrows().default)(this._editExpressionEditor).getText();
    this.props.onUpdateWatchExpression(id, text);

    this._resetExpressionEditState();
  }

  _setRowBeingEdited(id) {
    this.setState({
      rowBeingEdited: id
    });

    if (this.coreCancelDisposable) {
      this.coreCancelDisposable.dispose();
    }

    this.coreCancelDisposable = atom.commands.add('atom-workspace', {
      'core:cancel': () => this._resetExpressionEditState()
    });
  }

  render() {
    const expressions = this.props.watchExpressions.map(this._renderExpression);
    const addNewExpressionInput = React.createElement(_AtomInput().AtomInput, {
      className: (0, _classnames().default)('debugger-watch-expression-input', 'debugger-watch-expression-add-new-input'),
      onConfirm: this._onConfirmNewExpression,
      ref: input => {
        this._newExpressionEditor = input;
      },
      size: "sm",
      placeholderText: "Add new watch expression"
    });
    return React.createElement("div", {
      className: "debugger-expression-value-list"
    }, expressions, addNewExpressionInput);
  }

}

exports.default = WatchExpressionComponent;