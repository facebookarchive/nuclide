"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _PanelComponentScroller() {
  const data = require("../../../../modules/nuclide-commons-ui/PanelComponentScroller");

  _PanelComponentScroller = function () {
    return data;
  };

  return data;
}

function _TestClassTreeNode() {
  const data = _interopRequireDefault(require("./TestClassTreeNode"));

  _TestClassTreeNode = function () {
    return data;
  };

  return data;
}

function _TreeRootComponent() {
  const data = require("../../../nuclide-ui/TreeRootComponent");

  _TreeRootComponent = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

class TestClassTree extends React.Component {
  componentDidUpdate(prevProps) {
    const {
      testSuiteModel
    } = this.props;

    if (testSuiteModel !== prevProps.testSuiteModel) {
      const roots = [];

      if (testSuiteModel) {
        for (const testClass of testSuiteModel.testClasses.values()) {
          roots.push(new (_TestClassTreeNode().default)(testClass));
        }
      }

      (0, _nullthrows().default)(this._tree).setRoots(roots);
    }

    this.rowClassNameForNode = this.rowClassNameForNode.bind(this);
  }

  render() {
    const emptyRenderMessage = React.createElement("div", null, React.createElement("h5", null, "Running tests"), React.createElement("ol", null, React.createElement("li", null, "Open the file you want to test"), React.createElement("li", null, "Choose the appropriate runner from the dropdown"), React.createElement("li", null, 'Click "Test" to run tests for that file\'s directory')));
    return React.createElement(_PanelComponentScroller().PanelComponentScroller, null, React.createElement("div", {
      className: "padded"
    }, React.createElement(_TreeRootComponent().TreeRootComponent, {
      elementToRenderWhenEmpty: emptyRenderMessage,
      eventHandlerSelector: ".nuclide-test-runner-tree",
      initialRoots: [],
      labelClassNameForNode: labelClassNameForNode,
      onKeepSelection: () => {},
      ref: tree => {
        this._tree = tree;
      },
      rowClassNameForNode: this.rowClassNameForNode
    })));
  }

  rowClassNameForNode(node) {
    const {
      testSuiteModel
    } = this.props;

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