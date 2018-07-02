"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _bindObservableAsProps() {
  const data = require("../../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _Section() {
  const data = require("../../../../../nuclide-commons-ui/Section");

  _Section = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
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

function _expected() {
  const data = require("../../../../../nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
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
const NO_VARIABLES = React.createElement("div", {
  className: "debugger-expression-value-row"
}, React.createElement("span", {
  className: "debugger-expression-value-content"
}, "(no variables)"));
const LOADING = React.createElement("div", {
  className: "debugger-expression-value-row"
}, React.createElement("span", {
  className: "debugger-expression-value-content"
}, React.createElement(_LoadingSpinner().LoadingSpinner, {
  size: "MEDIUM"
})));

class ScopesComponent extends React.Component {
  constructor(props) {
    super(props);

    this._getExpansionStateIdForExpression = expression => {
      let expansionStateId = this._expansionStates.get(expression);

      if (expansionStateId == null) {
        expansionStateId = {};

        this._expansionStates.set(expression, expansionStateId);
      }

      return expansionStateId;
    };

    this.state = {
      scopes: _expected().Expect.value([]),
      // UX: Local scope names should be expanded by default.
      expandedScopes: new Set(['Local', 'Locals'])
    };
    this._expansionStates = new Map();
    this._disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    const {
      viewModel
    } = this.props.service;

    this._disposables.add(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, _event().observableFromSubscribeFunction)(viewModel.onDidChangeExpressionContext.bind(viewModel))).debounceTime(100).startWith(null).switchMap(() => this._getScopes()).subscribe(scopes => {
      this.setState({
        scopes
      });
    }));
  }

  _getScopes() {
    const {
      focusedStackFrame
    } = this.props.service.viewModel;

    if (focusedStackFrame == null) {
      return _RxMin.Observable.of(_expected().Expect.value([]));
    } else {
      return _RxMin.Observable.of(_expected().Expect.pending()).concat(_RxMin.Observable.fromPromise(focusedStackFrame.getScopes().then(scopes => _expected().Expect.value(scopes), error => _expected().Expect.error(error))));
    }
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _renderScopeSection(scope) {
    // Non-local scopes should be collapsed by default since users typically care less about them.
    const expanded = this._isScopeExpanded(scope);

    const {
      focusedProcess
    } = this.props.service.viewModel;
    const canSetVariables = focusedProcess != null && focusedProcess.session.capabilities.supportsSetVariable;

    let ScopeBodyComponent = () => null;

    if (expanded) {
      ScopeBodyComponent = (0, _bindObservableAsProps().bindObservableAsProps)(this._getScopeVariables(scope).map(variables => ({
        variables,
        canSetVariables,
        getExpansionStateIdForExpression: this._getExpansionStateIdForExpression
      })), ScopeComponent);
    }

    return React.createElement(_Section().Section, {
      key: scope.getId(),
      collapsable: true,
      collapsed: !expanded,
      onChange: isCollapsed => this._setScopeExpanded(scope, !isCollapsed),
      headline: scope.name,
      size: "small"
    }, React.createElement(ScopeBodyComponent, null));
  }

  _getScopeVariables(scope) {
    return _RxMin.Observable.of(_expected().Expect.pending()).concat(_RxMin.Observable.fromPromise(scope.getChildren().then(variables => _expected().Expect.value(variables), error => _expected().Expect.error(error))));
  }

  _isScopeExpanded(scope) {
    return this.state.expandedScopes.has(scope.name);
  }

  _setScopeExpanded(scope, expanded) {
    if (expanded === this.state.expandedScopes.has(scope.name)) {
      return;
    } // TODO: (wbinnssmith) T30771435 this setState depends on current state
    // and should use an updater function rather than an object
    // eslint-disable-next-line react/no-access-state-in-setstate


    const expandedScopes = new Set(this.state.expandedScopes);

    if (expanded) {
      expandedScopes.add(scope.name);
    } else {
      expandedScopes.delete(scope.name);
    }

    this.setState({
      expandedScopes
    });
  }

  render() {
    const {
      scopes
    } = this.state;
    const {
      service
    } = this.props;

    if (scopes.isError) {
      return React.createElement("span", null, "Error fetching scopes: ", scopes.error.toString());
    } else if (scopes.isPending) {
      return LOADING;
    } else if (scopes.value.length === 0) {
      return React.createElement("span", null, "(no variables)");
    }

    const scopeSections = scopes.value.map(scope => this._renderScopeSection(scope));
    const processName = (service.viewModel.focusedProcess == null || service.viewModel.focusedProcess.configuration.processName == null ? 'Unknown Process' : service.viewModel.focusedProcess.configuration.processName) + (service.viewModel.focusedStackFrame == null ? ' (Unknown Frame)' : ' (' + service.viewModel.focusedStackFrame.name + ')');
    return React.createElement("div", null, React.createElement("span", null, processName), React.createElement("div", {
      className: "debugger-expression-value-list"
    }, scopeSections));
  }

}

exports.default = ScopesComponent;

class ScopeComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._setVariable = (expression, newValue) => {
      const {
        variables
      } = this.props;

      if (!Boolean(expression) || !Boolean(newValue) || variables.isError || variables.isPending) {
        return;
      }

      const variable = variables.value.find(v => v.name === expression);

      if (variable == null) {
        return;
      }

      if (!(newValue != null)) {
        throw new Error("Invariant violation: \"newValue != null\"");
      }

      variable.setVariable(newValue).then(() => this.forceUpdate());
    }, _temp;
  }

  render() {
    const {
      variables
    } = this.props;

    if (variables.isError) {
      return React.createElement("div", null, "Error fetching scope variables ", variables.error.toString());
    } else if (variables.isPending) {
      return LOADING;
    } else if (variables.value.length === 0) {
      return NO_VARIABLES;
    } else {
      return variables.value.map(variable => this._renderVariable(variable));
    }
  }

  _renderVariable(expression) {
    return React.createElement("div", {
      className: "debugger-expression-value-row debugger-scope native-key-bindings",
      key: expression.getId()
    }, React.createElement("div", {
      className: "debugger-expression-value-content"
    }, React.createElement(_LazyNestedValueComponent().LazyNestedValueComponent, {
      expression: expression.name,
      evaluationResult: (0, _utils().expressionAsEvaluationResult)(expression),
      fetchChildren: _utils().fetchChildrenForLazyComponent,
      simpleValueComponent: _SimpleValueComponent().default,
      expansionStateId: this.props.getExpansionStateIdForExpression(expression.name),
      setVariable: this.props.canSetVariables ? this._setVariable : null
    })));
  }

}