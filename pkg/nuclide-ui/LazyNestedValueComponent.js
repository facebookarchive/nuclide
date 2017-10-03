'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LazyNestedValueComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _highlightOnUpdate;

function _load_highlightOnUpdate() {
  return _highlightOnUpdate = require('./highlightOnUpdate');
}

var _ValueComponentClassNames;

function _load_ValueComponentClassNames() {
  return _ValueComponentClassNames = require('./ValueComponentClassNames');
}

var _Tree;

function _load_Tree() {
  return _Tree = require('./Tree');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

var _ignoreTextSelectionEvents;

function _load_ignoreTextSelectionEvents() {
  return _ignoreTextSelectionEvents = _interopRequireDefault(require('nuclide-commons-ui/ignoreTextSelectionEvents'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
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

// TODO @jxg export debugger typedefs from main module. (t11406963)
const SPINNER_DELAY = 100; /* ms */
const NOT_AVAILABLE_MESSAGE = '<not available>';

function isObjectValue(result) {
  return result.objectId != null;
}

function TreeItemWithLoadingSpinner() {
  return _react.createElement(
    (_Tree || _load_Tree()).TreeItem,
    { className: 'nuclide-ui-lazy-nested-value-spinner' },
    _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL', delay: SPINNER_DELAY })
  );
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
  return _react.createElement(
    'span',
    null,
    children.map(child => _react.createElement(
      (_Tree || _load_Tree()).TreeItem,
      { key: child.name },
      _react.createElement(ValueComponent, {
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
      })
    ))
  );
};

// TODO allow passing action components (edit button, pin button) here
function renderValueLine(expression, value) {
  if (expression == null) {
    return _react.createElement(
      'div',
      { className: 'nuclide-ui-lazy-nested-value-container' },
      value
    );
  } else {
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions (t11408154)
    return _react.createElement(
      'div',
      { className: 'nuclide-ui-lazy-nested-value-container' },
      _react.createElement(
        'span',
        { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.identifier },
        expression
      ),
      ': ',
      value
    );
  }
}

/**
 * A component that knows how to render recursive, interactive expression/evaluationResult pairs.
 * The rendering of non-expandable "leaf" values is delegated to the SimpleValueComponent.
 */
class ValueComponent extends _react.Component {

  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      children: null
    };
    this._toggleExpandFiltered = (0, (_ignoreTextSelectionEvents || _load_ignoreTextSelectionEvents()).default)(this._toggleExpand.bind(this));
  }

  componentDidMount() {
    this.setState(this._getNextState(this.props));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this._getNextState(nextProps));
  }

  _toggleExpand(event) {
    const { onExpandedStateChange, path } = this.props;
    const newState = this._getNextState(this.props, true /* toggleExpansion */);
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
    let isExpanded = false;
    let children = null;
    // The value of isExpanded is taken from its cached value in nodeData
    // unless it is being toggled. In that case, we toggle the current value.
    if (!toggleExpansion) {
      const { path, expandedValuePaths } = props;
      const nodeData = expandedValuePaths.get(path);
      isExpanded = nodeData != null && nodeData.isExpanded;
    } else {
      isExpanded = !this.state.isExpanded;
    }
    // Children are loaded if the component will be expanded
    // and other conditions (see shouldFetchChildren()) are true
    if (isExpanded && shouldFetchChildren(props)) {
      if (!(props.fetchChildren != null)) {
        throw new Error('Invariant violation: "props.fetchChildren != null"');
      }

      if (!(props.evaluationResult != null)) {
        throw new Error('Invariant violation: "props.evaluationResult != null"');
      }

      if (!(props.evaluationResult.objectId != null)) {
        throw new Error('Invariant violation: "props.evaluationResult.objectId != null"');
      }

      children = props.fetchChildren(props.evaluationResult.objectId);
    }

    return { isExpanded, children };
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
      const simpleValueElement = _react.createElement(SimpleValueComponent, {
        expression: expression,
        evaluationResult: evaluationResult,
        simpleValueComponent: SimpleValueComponent
      });
      return isRoot ? simpleValueElement : _react.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        simpleValueElement
      );
    }
    const description =
    // flowlint-next-line sketchy-null-string:off
    evaluationResult.description || '<no description provided>';
    const { children, isExpanded } = this.state;
    let childListElement = null;
    if (isExpanded) {
      const cachedChildren = getCachedChildren(path);
      if (shouldCacheChildren && cachedChildren != null) {
        childListElement = _react.createElement(LoadableValueComponent, {
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
        childListElement = _react.createElement(TreeItemWithLoadingSpinner, null);
      } else {
        const ChildrenComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(children.map(childrenValue => ({ children: childrenValue })).startWith({ children: null }), LoadableValueComponent);
        childListElement = _react.createElement(ChildrenComponent, {
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
    const title = renderValueLine(expression, description);
    return _react.createElement(
      (_Tree || _load_Tree()).TreeList,
      {
        showArrows: true,
        className: 'nuclide-ui-lazy-nested-value-treelist' },
      _react.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        {
          collapsed: !this.state.isExpanded,
          onClick: this._toggleExpandFiltered,
          title: title },
        childListElement
      )
    );
  }
}

function shouldFetchChildren(props) {
  const { fetchChildren, evaluationResult } = props;
  return shouldFetchBecauseNothingIsCached(props) && typeof fetchChildren === 'function' && evaluationResult != null && evaluationResult.objectId != null;
}

function shouldFetchBecauseNothingIsCached(props) {
  const { shouldCacheChildren, getCachedChildren, path } = props;
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
class TopLevelLazyNestedValueComponent extends _react.PureComponent {

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
    const className = (0, (_classnames || _load_classnames()).default)(this.props.className, {
      'native-key-bindings': true,
      // Note(vjeux): the following line should probably be `: true`
      'nuclide-ui-lazy-nested-value': this.props.className == null
    });
    return _react.createElement(
      'span',
      { className: className, tabIndex: -1 },
      _react.createElement(ValueComponent, Object.assign({}, this.props, {
        isRoot: true,
        expandedValuePaths: this.getExpandedValuePaths(),
        onExpandedStateChange: this.handleExpansionChange,
        path: 'root',
        shouldCacheChildren: this.shouldCacheChildren,
        getCachedChildren: this.getCachedChildren,
        setCachedChildren: this.setCachedChildren
      }))
    );
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
const LazyNestedValueComponent = exports.LazyNestedValueComponent = (0, (_highlightOnUpdate || _load_highlightOnUpdate()).highlightOnUpdate)(TopLevelLazyNestedValueComponent, arePropsEqual, undefined /* custom classname */
, undefined /* custom delay */
);