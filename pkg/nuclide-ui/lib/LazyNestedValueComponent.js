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

// TODO @jxg export debugger typedefs from main module. (t11406963)

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _bindObservableAsProps2;

function _bindObservableAsProps() {
  return _bindObservableAsProps2 = require('./bindObservableAsProps');
}

var _highlightOnUpdate2;

function _highlightOnUpdate() {
  return _highlightOnUpdate2 = require('./highlightOnUpdate');
}

var _ValueComponentClassNames2;

function _ValueComponentClassNames() {
  return _ValueComponentClassNames2 = require('./ValueComponentClassNames');
}

var _Tree2;

function _Tree() {
  return _Tree2 = require('./Tree');
}

var _LoadingSpinner2;

function _LoadingSpinner() {
  return _LoadingSpinner2 = require('./LoadingSpinner');
}

var SPINNER_DELAY = 100; /* ms */
var NOT_AVAILABLE_MESSAGE = '<not available>';

function isObjectValue(result) {
  return result._objectId != null;
}

function TreeItemWithLoadingSpinner() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Tree2 || _Tree()).TreeItem,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement((_LoadingSpinner2 || _LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL', delay: SPINNER_DELAY })
  );
}

/**
 * A wrapper that renders a (delayed) spinner while the list of child properties is being loaded.
 * Otherwise, it renders ValueComponent for each property in `children`.
 */
var LoadableValueComponent = function LoadableValueComponent(props) {
  var children = props.children;
  var fetchChildren = props.fetchChildren;
  var path = props.path;
  var expandedValuePaths = props.expandedValuePaths;
  var onExpandedStateChange = props.onExpandedStateChange;
  var simpleValueComponent = props.simpleValueComponent;
  var shouldCacheChildren = props.shouldCacheChildren;
  var getCachedChildren = props.getCachedChildren;
  var setCachedChildren = props.setCachedChildren;

  if (children == null) {
    return TreeItemWithLoadingSpinner();
  }
  if (shouldCacheChildren) {
    setCachedChildren(path, children);
  }
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    null,
    children.map(function (child) {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Tree2 || _Tree()).TreeItem,
        { key: child.name },
        (_reactForAtom2 || _reactForAtom()).React.createElement(ValueComponent, {
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
      );
    })
  );
};

// TODO allow passing action components (edit button, pin button) here
function renderValueLine(expression, value) {
  if (expression == null) {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      value
    );
  } else {
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions (t11408154)
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        { className: (_ValueComponentClassNames2 || _ValueComponentClassNames()).ValueComponentClassNames.identifier },
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

var ValueComponent = (function (_React$Component) {
  _inherits(ValueComponent, _React$Component);

  function ValueComponent(props) {
    _classCallCheck(this, ValueComponent);

    _get(Object.getPrototypeOf(ValueComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      isExpanded: false,
      children: null
    };
    this.state.children = null;
    this._toggleExpand = this._toggleExpand.bind(this);
  }

  _createClass(ValueComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _props = this.props;
      var path = _props.path;
      var expandedValuePaths = _props.expandedValuePaths;
      var fetchChildren = _props.fetchChildren;
      var evaluationResult = _props.evaluationResult;

      var nodeData = expandedValuePaths.get(path);
      if (!this.state.isExpanded && nodeData != null && nodeData.isExpanded && this._shouldFetch() && evaluationResult != null && evaluationResult._objectId != null && fetchChildren != null) {
        (0, (_assert2 || _assert()).default)(evaluationResult._objectId != null);
        this.setState({
          children: fetchChildren(evaluationResult._objectId),
          isExpanded: true
        });
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this._shouldFetch() && this.state.isExpanded && nextProps.evaluationResult != null && nextProps.fetchChildren != null) {
        var _objectId = nextProps.evaluationResult._objectId;

        if (_objectId == null) {
          return;
        }
        this.setState({
          children: nextProps.fetchChildren(_objectId)
        });
      }
    }
  }, {
    key: '_shouldFetch',
    value: function _shouldFetch() {
      var _props2 = this.props;
      var shouldCacheChildren = _props2.shouldCacheChildren;
      var getCachedChildren = _props2.getCachedChildren;
      var path = _props2.path;

      var children = getCachedChildren(path);
      return !shouldCacheChildren || children == null;
    }
  }, {
    key: '_toggleExpand',
    value: function _toggleExpand(event) {
      var _props3 = this.props;
      var fetchChildren = _props3.fetchChildren;
      var evaluationResult = _props3.evaluationResult;
      var onExpandedStateChange = _props3.onExpandedStateChange;
      var path = _props3.path;

      var newState = {
        children: null,
        isExpanded: !this.state.isExpanded
      };
      if (!this.state.isExpanded) {
        if (this._shouldFetch() && typeof fetchChildren === 'function' && evaluationResult != null && evaluationResult._objectId != null) {
          newState.children = fetchChildren(evaluationResult._objectId);
        }
      }
      onExpandedStateChange(path, newState.isExpanded);
      this.setState(newState);
      event.stopPropagation();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props4 = this.props;
      var evaluationResult = _props4.evaluationResult;
      var expression = _props4.expression;
      var fetchChildren = _props4.fetchChildren;
      var isRoot = _props4.isRoot;
      var path = _props4.path;
      var expandedValuePaths = _props4.expandedValuePaths;
      var onExpandedStateChange = _props4.onExpandedStateChange;
      var shouldCacheChildren = _props4.shouldCacheChildren;
      var getCachedChildren = _props4.getCachedChildren;
      var setCachedChildren = _props4.setCachedChildren;
      var SimpleValueComponent = _props4.simpleValueComponent;

      if (evaluationResult == null) {
        return renderValueLine(expression, NOT_AVAILABLE_MESSAGE);
      }
      if (!isObjectValue(evaluationResult)) {
        var simpleValueElement = (_reactForAtom2 || _reactForAtom()).React.createElement(SimpleValueComponent, {
          expression: expression,
          evaluationResult: evaluationResult,
          simpleValueComponent: SimpleValueComponent
        });
        return isRoot ? simpleValueElement : (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).TreeItem,
          null,
          simpleValueElement
        );
      }
      var _description = evaluationResult._description || '<no description provided>';
      var _state = this.state;
      var children = _state.children;
      var isExpanded = _state.isExpanded;

      var childListElement = null;
      if (isExpanded) {
        var _cachedChildren = getCachedChildren(path);
        if (shouldCacheChildren && _cachedChildren != null) {
          childListElement = (_reactForAtom2 || _reactForAtom()).React.createElement(LoadableValueComponent, {
            children: _cachedChildren,
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
          childListElement = (_reactForAtom2 || _reactForAtom()).React.createElement(TreeItemWithLoadingSpinner, null);
        } else {
          var ChildrenComponent = (0, (_bindObservableAsProps2 || _bindObservableAsProps()).bindObservableAsProps)(children.map(function (childrenValue) {
            return { children: childrenValue };
          }).startWith({ children: null }), LoadableValueComponent);
          childListElement = (_reactForAtom2 || _reactForAtom()).React.createElement(ChildrenComponent, {
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
      var title = renderValueLine(expression, _description);
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Tree2 || _Tree()).TreeList,
        { showArrows: true },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).NestedTreeItem,
          {
            collapsed: !this.state.isExpanded,
            onClick: this._toggleExpand,
            title: title },
          childListElement
        )
      );
    }
  }]);

  return ValueComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

/**
 * TopLevelValueComponent wraps all expandable value components. It is in charge of keeping track
 * of the set of recursively expanded values. The set is keyed by a "path", which is a string
 * containing the concatenated object keys of all recursive parent object for a given item. This
 * is necessary to preserve the expansion state while the values are temporarily unavailable, such
 * as after stepping in the debugger, which triggers a recursive re-fetch.
 */

var TopLevelLazyNestedValueComponent = (function (_React$Component2) {
  _inherits(TopLevelLazyNestedValueComponent, _React$Component2);

  function TopLevelLazyNestedValueComponent(props) {
    _classCallCheck(this, TopLevelLazyNestedValueComponent);

    _get(Object.getPrototypeOf(TopLevelLazyNestedValueComponent.prototype), 'constructor', this).call(this, props);
    this.expandedValuePaths = new Map();
    this.handleExpansionChange = this.handleExpansionChange.bind(this);
    this.getCachedChildren = this.getCachedChildren.bind(this);
    this.setCachedChildren = this.setCachedChildren.bind(this);
    this.shouldCacheChildren = this.props.shouldCacheChildren == null ? false : this.props.shouldCacheChildren;
  }

  _createClass(TopLevelLazyNestedValueComponent, [{
    key: 'handleExpansionChange',
    value: function handleExpansionChange(expandedValuePath, isExpanded) {
      var nodeData = this.expandedValuePaths.get(expandedValuePath) || { isExpanded: isExpanded, cachedChildren: null };
      if (isExpanded) {
        this.expandedValuePaths.set(expandedValuePath, _extends({}, nodeData, { isExpanded: true }));
      } else {
        this.expandedValuePaths.set(expandedValuePath, _extends({}, nodeData, { isExpanded: false }));
      }
    }
  }, {
    key: 'getCachedChildren',
    value: function getCachedChildren(path) {
      var nodeData = this.expandedValuePaths.get(path);
      if (nodeData == null) {
        return null;
      } else {
        return nodeData.cachedChildren;
      }
    }
  }, {
    key: 'setCachedChildren',
    value: function setCachedChildren(path, children) {
      var nodeData = this.expandedValuePaths.get(path);
      if (nodeData != null) {
        this.expandedValuePaths.set(path, _extends({}, nodeData, { cachedChildren: children }));
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        { className: 'nuclide-ui-lazy-nested-value' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(ValueComponent, _extends({}, this.props, {
          isRoot: true,
          expandedValuePaths: this.expandedValuePaths,
          onExpandedStateChange: this.handleExpansionChange,
          path: 'root',
          shouldCacheChildren: this.shouldCacheChildren,
          getCachedChildren: this.getCachedChildren,
          setCachedChildren: this.setCachedChildren
        }))
      );
    }
  }]);

  return TopLevelLazyNestedValueComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

function arePropsEqual(p1, p2) {
  var evaluationResult1 = p1.evaluationResult;
  var evaluationResult2 = p2.evaluationResult;
  if (evaluationResult1 === evaluationResult2) {
    return true;
  }
  if (evaluationResult1 == null || evaluationResult2 == null) {
    return false;
  }
  return evaluationResult1.value === evaluationResult2.value && evaluationResult1._type === evaluationResult2._type && evaluationResult1._description === evaluationResult2._description;
}
var LazyNestedValueComponent = (0, (_highlightOnUpdate2 || _highlightOnUpdate()).highlightOnUpdate)(TopLevelLazyNestedValueComponent, arePropsEqual, undefined, /* custom classname */
undefined);
exports.LazyNestedValueComponent = LazyNestedValueComponent;

// $FlowIssue -- Flow's object spread operator inference is buggy.

// $FlowIssue `evaluationResult` gets injected via HOC.
/* custom delay */