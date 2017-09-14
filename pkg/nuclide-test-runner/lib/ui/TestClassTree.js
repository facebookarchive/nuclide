'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('nuclide-commons-ui/PanelComponentScroller');
}

var _TestClassTreeNode;

function _load_TestClassTreeNode() {
  return _TestClassTreeNode = _interopRequireDefault(require('./TestClassTreeNode'));
}

var _TreeRootComponent;

function _load_TreeRootComponent() {
  return _TreeRootComponent = require('../../../nuclide-ui/TreeRootComponent');
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

function labelClassNameForNode() {
  return 'icon icon-code';
}

class TestClassTree extends _react.Component {
  componentDidUpdate(prevProps) {
    const { testSuiteModel } = this.props;
    if (testSuiteModel !== prevProps.testSuiteModel) {
      const roots = [];
      if (testSuiteModel) {
        for (const testClass of testSuiteModel.testClasses.values()) {
          roots.push(new (_TestClassTreeNode || _load_TestClassTreeNode()).default(testClass));
        }
      }
      this.refs.tree.setRoots(roots);
    }

    this.rowClassNameForNode = this.rowClassNameForNode.bind(this);
  }

  render() {
    const emptyRenderMessage = _react.createElement(
      'div',
      null,
      _react.createElement(
        'h5',
        null,
        'Running tests'
      ),
      _react.createElement(
        'ol',
        null,
        _react.createElement(
          'li',
          null,
          'Open the file you want to test'
        ),
        _react.createElement(
          'li',
          null,
          'Choose the appropriate runner from the dropdown'
        ),
        _react.createElement(
          'li',
          null,
          'Click "Test" to run tests for that file\'s directory'
        )
      )
    );

    return _react.createElement(
      (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
      null,
      _react.createElement(
        'div',
        { className: 'padded' },
        _react.createElement((_TreeRootComponent || _load_TreeRootComponent()).TreeRootComponent, {
          elementToRenderWhenEmpty: emptyRenderMessage,
          eventHandlerSelector: '.nuclide-test-runner-tree',
          initialRoots: [],
          labelClassNameForNode: labelClassNameForNode,
          onKeepSelection: () => {},
          ref: 'tree',
          rowClassNameForNode: this.rowClassNameForNode
        })
      )
    );
  }

  rowClassNameForNode(node) {
    const { testSuiteModel } = this.props;
    if (!testSuiteModel) {
      return '';
    }

    const item = node.getItem();
    const testRun = testSuiteModel.testRuns.get(item.id);
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

    return '';
  }
}
exports.default = TestClassTree;