'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

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

class TestClassTree extends _react.default.Component {

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
    const emptyRenderMessage = _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'h5',
        null,
        'Running tests'
      ),
      _react.default.createElement(
        'ol',
        null,
        _react.default.createElement(
          'li',
          null,
          'Open the file you want to test'
        ),
        _react.default.createElement(
          'li',
          null,
          'Choose the appropriate runner from the dropdown'
        ),
        _react.default.createElement(
          'li',
          null,
          'Click "Test" to run tests for that file\'s directory'
        )
      )
    );

    return _react.default.createElement(
      (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
      null,
      _react.default.createElement(
        'div',
        { className: 'padded' },
        _react.default.createElement((_TreeRootComponent || _load_TreeRootComponent()).TreeRootComponent, {
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