var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibPanelComponentScroller2;

function _nuclideUiLibPanelComponentScroller() {
  return _nuclideUiLibPanelComponentScroller2 = require('../../../nuclide-ui/lib/PanelComponentScroller');
}

var _TestClassTreeNode2;

function _TestClassTreeNode() {
  return _TestClassTreeNode2 = _interopRequireDefault(require('./TestClassTreeNode'));
}

var _nuclideUiLibTreeRootComponent2;

function _nuclideUiLibTreeRootComponent() {
  return _nuclideUiLibTreeRootComponent2 = require('../../../nuclide-ui/lib/TreeRootComponent');
}

var PropTypes = (_reactForAtom2 || _reactForAtom()).React.PropTypes;

function labelClassNameForNode() {
  return 'icon icon-code';
}

var TestClassTree = (function (_React$Component) {
  _inherits(TestClassTree, _React$Component);

  function TestClassTree() {
    _classCallCheck(this, TestClassTree);

    _get(Object.getPrototypeOf(TestClassTree.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(TestClassTree, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.testSuiteModel !== prevProps.testSuiteModel) {
        var roots = [];
        if (this.props.testSuiteModel) {
          for (var testClass of this.props.testSuiteModel.testClasses.values()) {
            roots.push(new (_TestClassTreeNode2 || _TestClassTreeNode()).default(testClass));
          }
        }
        this.refs.tree.setRoots(roots);
      }

      this.rowClassNameForNode = this.rowClassNameForNode.bind(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var emptyRenderMessage = (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h5',
          null,
          'Running tests'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'ol',
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'li',
            null,
            'Open the file you want to test'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'li',
            null,
            'Choose the appropriate runner from the dropdown'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'li',
            null,
            'Click "Test" to run tests for that file\'s directory'
          )
        )
      );

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibPanelComponentScroller2 || _nuclideUiLibPanelComponentScroller()).PanelComponentScroller,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'padded' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibTreeRootComponent2 || _nuclideUiLibTreeRootComponent()).TreeRootComponent, {
            elementToRenderWhenEmpty: emptyRenderMessage,
            eventHandlerSelector: '.nuclide-test-runner-tree',
            initialRoots: [],
            labelClassNameForNode: labelClassNameForNode,
            onKeepSelection: function () {},
            ref: 'tree',
            rowClassNameForNode: this.rowClassNameForNode
          })
        )
      );
    }
  }, {
    key: 'rowClassNameForNode',
    value: function rowClassNameForNode(node) {
      if (!this.props.testSuiteModel) {
        return;
      }

      var item = node.getItem();
      var testRun = this.props.testSuiteModel.testRuns.get(item.id);
      if (testRun) {
        if (testRun.numFailures > 0) {
          // Red/error if the test class had errors.
          return 'status-removed';
        } else if (testRun.numSkipped > 0) {
          // Yellow/warning if the class skipped tests.
          return 'status-modified';
        } else {
          // Green/success if all tests passed without skipping any.
          return 'status-added';
        }
      } else if (!this.props.isRunning) {
        return 'status-ignored';
      }
    }
  }], [{
    key: 'propTypes',
    value: {
      isRunning: PropTypes.bool.isRequired,
      testSuiteModel: PropTypes.object
    },
    enumerable: true
  }]);

  return TestClassTree;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = TestClassTree;