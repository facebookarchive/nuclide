"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LazyNestedValueComponent = void 0;

function _AtomInput() {
  const data = require("./AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("./Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _bindObservableAsProps() {
  const data = require("./bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _highlightOnUpdate() {
  const data = require("./highlightOnUpdate");

  _highlightOnUpdate = function () {
    return data;
  };

  return data;
}

function _SimpleValueComponent() {
  const data = require("./SimpleValueComponent");

  _SimpleValueComponent = function () {
    return data;
  };

  return data;
}

function _ValueComponentClassNames() {
  const data = require("./ValueComponentClassNames");

  _ValueComponentClassNames = function () {
    return data;
  };

  return data;
}

function _Tree() {
  const data = require("./Tree");

  _Tree = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("./LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _ignoreTextSelectionEvents() {
  const data = _interopRequireDefault(require("./ignoreTextSelectionEvents"));

  _ignoreTextSelectionEvents = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
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
// TODO @jxg export debugger typedefs from main module. (t11406963)
const {
  track
} = _analytics().default;

const EDIT_VALUE_FROM_ICON = 'edit-value-from-icon';
const NOT_AVAILABLE_MESSAGE = '<not available>';
const SPINNER_DELAY = 100;
/* ms */

function isObjectValue(result) {
  return result.objectId != null;
}

function TreeItemWithLoadingSpinner() {
  return React.createElement(_Tree().TreeItem, {
    className: "nuclide-ui-lazy-nested-value-spinner"
  }, React.createElement(_LoadingSpinner().LoadingSpinner, {
    size: "EXTRA_SMALL",
    delay: SPINNER_DELAY
  }));
}

/**
 * A wrapper that renders a (delayed) spinner while the list of child properties is being loaded.
 * Otherwise, it renders ValueComponent for each property in `children`.
 */
const LoadableValueComponent = props => {
  const {
    children,
    fetchChildren,
    path,
    expandedValuePaths,
    onExpandedStateChange,
    simpleValueComponent,
    shouldCacheChildren,
    getCachedChildren,
    setCachedChildren
  } = props;

  if (children == null) {
    return TreeItemWithLoadingSpinner();
  }

  if (shouldCacheChildren) {
    setCachedChildren(path, children);
  }

  return React.createElement("span", null, children.map(child => React.createElement(_Tree().TreeItem, {
    key: child.name
  }, React.createElement(ValueComponent, {
    evaluationResult: child.value,
    fetchChildren: fetchChildren,
    expression: child.name,
    expandedValuePaths: expandedValuePaths,
    onExpandedStateChange: onExpandedStateChange,
    path: path + '.' + child.name,
    simpleValueComponent: simpleValueComponent,
    shouldCacheChildren: shouldCacheChildren,
    getCachedChildren: getCachedChildren,
    setCachedChildren: setCachedChildren
  }))));
}; // TODO allow passing action components (edit button, pin button) here


function renderValueLine(expression, value) {
  if (expression == null) {
    return React.createElement("div", {
      className: "nuclide-ui-lazy-nested-value-container"
    }, value);
  } else {
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions (t11408154)
    return React.createElement("div", {
      className: "nuclide-ui-lazy-nested-value-container"
    }, React.createElement("span", {
      className: _ValueComponentClassNames().ValueComponentClassNames.identifier
    }, expression), ": ", value);
  }
}

/**
 * A component that knows how to render recursive, interactive expression/evaluationResult pairs.
 * The rendering of non-expandable "leaf" values is delegated to the SimpleValueComponent.
 */
class ValueComponent extends React.Component {
  constructor(props) {
    super(props);

    this._showSetVariableDisplay = () => {
      const {
        isRoot,
        setVariable
      } = this.props;

      if (isRoot && setVariable) {
        this.setState({
          isBeingEdited: true
        });
      }
    };

    this._hideSetVariableDisplay = () => {
      this.setState({
        isBeingEdited: false,
        newValueForExpression: null
      });
    };

    this._setVariable = () => {
      const {
        setVariable,
        expression
      } = this.props;

      if (setVariable) {
        setVariable(expression, this.state.newValueForExpression);
        this.setState({
          isBeingEdited: false
        });
      }
    };

    this.state = {
      isExpanded: false,
      children: null,
      isBeingEdited: false,
      newValueForExpression: null
    };
    this._toggleExpandFiltered = (0, _ignoreTextSelectionEvents().default)(this._toggleExpand.bind(this));
  }

  componentDidMount() {
    this.setState(this._getNextState(this.props));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(this._getNextState(nextProps));
  }

  _toggleExpand(event) {
    const {
      onExpandedStateChange,
      path
    } = this.props;

    const newState = this._getNextState(this.props, true
    /* toggleExpansion */
    );

    onExpandedStateChange(path, newState.isExpanded);
    this.setState(newState);
    event.stopPropagation();
  }
  /**
   * Constructs the corresponding state object based on the provided props.
   *
   * NOTE: This should be used to set the state when the props change or when
   *       the expansion state of the object is being toggled by the user.
   *
   * The expansion state (isExpanded) of this component is cached so it can
   * be saved across re-renders. Because of this isExpanded is set to the
   * cached value, with a default of false. If the expansion state is being
   * toggled, it is instead set to the opposite of its current state value.
   *
   * This component is also responsible for loading its children, if they
   * exist, by calling props.fetchChildren() and storing the result in the
   * state. This needs to happen when the component is expanded and the
   * children exist and have not already been loaded and cached. So based on
   * the new value of isExpanded, children is set appropriately
   * (see shouldFetchChildren()).
   */


  _getNextState(props, toggleExpansion) {
    const {
      evaluationResult,
      expandedValuePaths,
      fetchChildren,
      path
    } = props;
    let isExpanded = false;
    let children = null; // The value of isExpanded is taken from its cached value in nodeData
    // unless it is being toggled. In that case, we toggle the current value.

    if (!toggleExpansion) {
      const nodeData = expandedValuePaths.get(path);
      isExpanded = nodeData != null && nodeData.isExpanded;
    } else {
      isExpanded = !this.state.isExpanded;
    } // Children are loaded if the component will be expanded
    // and other conditions (see shouldFetchChildren()) are true


    if (isExpanded && shouldFetchChildren(props)) {
      if (!(fetchChildren != null)) {
        throw new Error("Invariant violation: \"fetchChildren != null\"");
      }

      if (!(evaluationResult != null)) {
        throw new Error("Invariant violation: \"evaluationResult != null\"");
      }

      if (!(evaluationResult.objectId != null)) {
        throw new Error("Invariant violation: \"evaluationResult.objectId != null\"");
      }

      children = fetchChildren(evaluationResult.objectId);
    }

    return {
      isExpanded,
      children,
      isBeingEdited: false,
      newValueForExpression: null
    };
  }

  _getStringRepresentationForEvaluationResult(evaluationResult) {
    if (evaluationResult) {
      if (evaluationResult.value != null) {
        if (evaluationResult.type === 'string' && !_SimpleValueComponent().STRING_REGEX.test(evaluationResult.value)) {
          return '"' + evaluationResult.value + '"';
        } else {
          return evaluationResult.value;
        }
      } else if (evaluationResult.description != null) {
        return evaluationResult.description;
      }
    }

    return '';
  }

  _renderEditView() {
    return React.createElement("div", {
      className: "nuclide-ui-lazy-nested-value-container"
    }, React.createElement(_AtomInput().AtomInput, {
      className: "debugger-watch-expression-input",
      size: "sm",
      autofocus: true,
      startSelected: true,
      initialValue: this._getStringRepresentationForEvaluationResult(this.props.evaluationResult),
      onDidChange: newValueForExpression => {
        this.setState({
          newValueForExpression
        });
      },
      onConfirm: this._setVariable,
      onCancel: this._hideSetVariableDisplay,
      onBlur: this._hideSetVariableDisplay
    }));
  }

  _renderEditableScopeView() {
    const {
      isRoot,
      setVariable
    } = this.props;
    return isRoot && setVariable && !this.state.isBeingEdited ? React.createElement("div", {
      className: "debugger-scopes-view-controls"
    }, React.createElement(_Icon().Icon, {
      icon: "pencil",
      className: "debugger-scopes-view-edit-control",
      onClick: _ => {
        track(EDIT_VALUE_FROM_ICON);

        this._showSetVariableDisplay();
      }
    })) : null;
  }

  render() {
    const {
      evaluationResult,
      expression,
      fetchChildren,
      isRoot,
      path,
      expandedValuePaths,
      onExpandedStateChange,
      shouldCacheChildren,
      getCachedChildren,
      setCachedChildren,
      simpleValueComponent: SimpleValueComponent
    } = this.props;

    if (evaluationResult == null) {
      return renderValueLine(expression, NOT_AVAILABLE_MESSAGE);
    }

    if (!isObjectValue(evaluationResult)) {
      const simpleValueElement = this.state.isBeingEdited ? this._renderEditView() : React.createElement("div", {
        onDoubleClick: this._showSetVariableDisplay
      }, React.createElement(SimpleValueComponent, {
        expression: expression,
        evaluationResult: evaluationResult,
        simpleValueComponent: SimpleValueComponent
      }), this._renderEditableScopeView());
      return isRoot ? simpleValueElement : React.createElement(_Tree().TreeItem, null, simpleValueElement);
    }

    const description = // flowlint-next-line sketchy-null-string:off
    evaluationResult.description || '<no description provided>';
    const {
      children,
      isExpanded
    } = this.state;
    let childListElement = null;

    if (isExpanded) {
      const cachedChildren = getCachedChildren(path);

      if (shouldCacheChildren && cachedChildren != null) {
        childListElement = React.createElement(LoadableValueComponent, {
          children: cachedChildren,
          fetchChildren: fetchChildren,
          path: path,
          expandedValuePaths: expandedValuePaths,
          onExpandedStateChange: onExpandedStateChange,
          simpleValueComponent: SimpleValueComponent,
          shouldCacheChildren: shouldCacheChildren,
          getCachedChildren: getCachedChildren,
          setCachedChildren: setCachedChildren
        });
      } else if (children == null) {
        childListElement = React.createElement(TreeItemWithLoadingSpinner, null);
      } else {
        const ChildrenComponent = (0, _bindObservableAsProps().bindObservableAsProps)(children.map(childrenValue => ({
          children: childrenValue
        })).startWith({
          children: null
        }), LoadableValueComponent);
        childListElement = React.createElement(ChildrenComponent, {
          fetchChildren: fetchChildren,
          path: path,
          expandedValuePaths: expandedValuePaths,
          onExpandedStateChange: onExpandedStateChange,
          simpleValueComponent: SimpleValueComponent,
          shouldCacheChildren: shouldCacheChildren,
          getCachedChildren: getCachedChildren,
          setCachedChildren: setCachedChildren
        });
      }
    }

    const title = this.state.isBeingEdited ? this._renderEditView() : renderValueLine(expression, description);
    return React.createElement(_Tree().TreeList, {
      showArrows: true,
      className: "nuclide-ui-lazy-nested-value-treelist"
    }, React.createElement(_Tree().NestedTreeItem, {
      collapsed: !this.state.isExpanded,
      onConfirm: this._showSetVariableDisplay,
      onSelect: this.state.isBeingEdited ? () => {} : this._toggleExpandFiltered,
      title: title
    }, childListElement), this._renderEditableScopeView());
  }

}

function shouldFetchChildren(props) {
  const {
    fetchChildren,
    evaluationResult
  } = props;
  return shouldFetchBecauseNothingIsCached(props) && typeof fetchChildren === 'function' && evaluationResult != null && evaluationResult.objectId != null;
}

function shouldFetchBecauseNothingIsCached(props) {
  const {
    shouldCacheChildren,
    getCachedChildren,
    path
  } = props;
  const children = getCachedChildren(path);
  return !shouldCacheChildren || children == null;
}

const expansionStates = new WeakMap();
/**
 * TopLevelValueComponent wraps all expandable value components. It is in charge of keeping track
 * of the set of recursively expanded values. The set is keyed by a "path", which is a string
 * containing the concatenated object keys of all recursive parent object for a given item. This
 * is necessary to preserve the expansion state while the values are temporarily unavailable, such
 * as after stepping in the debugger, which triggers a recursive re-fetch.
 */

class TopLevelLazyNestedValueComponent extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleExpansionChange = (expandedValuePath, isExpanded) => {
      const expandedValuePaths = this.getExpandedValuePaths();
      const nodeData = expandedValuePaths.get(expandedValuePath) || {
        isExpanded,
        cachedChildren: null
      };

      if (isExpanded) {
        expandedValuePaths.set(expandedValuePath, Object.assign({}, nodeData, {
          isExpanded: true
        }));
      } else {
        expandedValuePaths.set(expandedValuePath, Object.assign({}, nodeData, {
          isExpanded: false
        }));
      }
    };

    this.getCachedChildren = path => {
      const nodeData = this.getExpandedValuePaths().get(path);

      if (nodeData == null) {
        return null;
      } else {
        return nodeData.cachedChildren;
      }
    };

    this.setCachedChildren = (path, children) => {
      const nodeData = this.getExpandedValuePaths().get(path);

      if (nodeData != null) {
        this.getExpandedValuePaths().set(path, Object.assign({}, nodeData, {
          cachedChildren: children
        }));
      }
    };

    this.shouldCacheChildren = this.props.shouldCacheChildren == null ? false : this.props.shouldCacheChildren;
  }

  getExpandedValuePaths() {
    const reference = this.props.expansionStateId;
    let expandedValuePaths = expansionStates.get(reference);

    if (expandedValuePaths == null) {
      expandedValuePaths = new Map();
      expansionStates.set(reference, expandedValuePaths);
    }

    return expandedValuePaths;
  }

  render() {
    const className = (0, _classnames().default)(this.props.className, {
      // Note(vjeux): the following line should probably be `: true`
      'nuclide-ui-lazy-nested-value': this.props.className == null
    });
    return React.createElement("span", {
      className: className,
      tabIndex: -1
    }, React.createElement(ValueComponent, Object.assign({}, this.props, {
      isRoot: true,
      expandedValuePaths: this.getExpandedValuePaths(),
      onExpandedStateChange: this.handleExpansionChange,
      path: "root",
      shouldCacheChildren: this.shouldCacheChildren,
      getCachedChildren: this.getCachedChildren,
      setCachedChildren: this.setCachedChildren
    })));
  }

}

function arePropsEqual(p1, p2) {
  const evaluationResult1 = p1.evaluationResult;
  const evaluationResult2 = p2.evaluationResult;

  if (evaluationResult1 === evaluationResult2) {
    return true;
  }

  if (evaluationResult1 == null || evaluationResult2 == null) {
    return false;
  }

  return evaluationResult1.value === evaluationResult2.value && evaluationResult1.type === evaluationResult2.type && evaluationResult1.description === evaluationResult2.description;
}

const LazyNestedValueComponent = (0, _highlightOnUpdate().highlightOnUpdate)(TopLevelLazyNestedValueComponent, arePropsEqual, undefined
/* custom classname */
, undefined
/* custom delay */
);
exports.LazyNestedValueComponent = LazyNestedValueComponent;