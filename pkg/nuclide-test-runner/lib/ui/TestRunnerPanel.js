"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _Console() {
  const data = _interopRequireDefault(require("./Console"));

  _Console = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _Toolbar() {
  const data = require("../../../../modules/nuclide-commons-ui/Toolbar");

  _Toolbar = function () {
    return data;
  };

  return data;
}

function _ToolbarLeft() {
  const data = require("../../../../modules/nuclide-commons-ui/ToolbarLeft");

  _ToolbarLeft = function () {
    return data;
  };

  return data;
}

function _ToolbarRight() {
  const data = require("../../../../modules/nuclide-commons-ui/ToolbarRight");

  _ToolbarRight = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../../modules/nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
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

function _createPaneContainer() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons-atom/create-pane-container"));

  _createPaneContainer = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _TestClassTree() {
  const data = _interopRequireDefault(require("./TestClassTree"));

  _TestClassTree = function () {
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
class TestRunnerPanel extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      treeContainer: null,
      consoleContainer: null,
      // If there are test runners, start with the first one selected. Otherwise store -1 to
      // later indicate there were no active test runners.
      selectedTestRunnerIndex: this.props.testRunners.length > 0 ? 0 : -1,
      filterMethodsShown: false,
      filterMethodsText: this.props.filterMethodsValue || ''
    }, this.setSelectedTestRunnerIndex = selectedTestRunnerIndex => {
      this.setState({
        selectedTestRunnerIndex
      });
    }, this.onFilterMethodButtonClick = () => {
      this.setState(prevState => ({
        filterMethodsShown: !prevState.filterMethodsShown
      }));
    }, this.onFilterMethodTextChanged = newValue => {
      this.setState({
        filterMethodsText: newValue
      });
    }, _temp;
  }

  componentDidMount() {
    this._paneContainer = (0, _createPaneContainer().default)();

    const leftPane = this._paneContainer.getActivePane();

    const rightPane = leftPane.splitRight({
      // Prevent Atom from cloning children on splitting; this panel wants an empty container.
      copyActiveItem: false,
      // Make the right pane 2/3 the width of the parent since console output is generally wider
      // than the test tree.
      flexScale: 2
    });
    (0, _nullthrows().default)(this._paneContainerElement).appendChild(atom.views.getView(this._paneContainer));
    this.setState({
      treeContainer: atom.views.getView(leftPane).querySelector('.item-views'),
      consoleContainer: atom.views.getView(rightPane).querySelector('.item-views')
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const currSelectedIndex = this.state.selectedTestRunnerIndex;

    if (currSelectedIndex === -1 && nextProps.testRunners.length > 0) {
      this.setState({
        selectedTestRunnerIndex: 0
      });
    } else if (nextProps.testRunners.length === 0 && currSelectedIndex >= 0) {
      this.setState({
        selectedTestRunnerIndex: -1
      });
    }
  }

  componentWillUnmount() {
    this._paneContainer.destroy();
  }

  render() {
    let runStopButton;

    switch (this.props.executionState) {
      case TestRunnerPanel.ExecutionState.RUNNING:
        runStopButton = React.createElement(_Button().Button, {
          size: _Button().ButtonSizes.SMALL,
          className: "inline-block",
          icon: "primitive-square",
          buttonType: _Button().ButtonTypes.ERROR,
          onClick: this.props.onClickStop
        }, "Stop");
        break;

      case TestRunnerPanel.ExecutionState.STOPPED:
        const initialTest = this.props.path === undefined;
        runStopButton = React.createElement(_Button().Button, {
          size: _Button().ButtonSizes.SMALL,
          className: "inline-block",
          icon: initialTest ? 'playback-play' : 'sync',
          buttonType: _Button().ButtonTypes.PRIMARY,
          disabled: this.isDisabled(),
          onClick: this.props.onClickRun
        }, initialTest ? 'Test' : 'Re-Test');
        break;
    } // Assign `value` only when needed so a null/undefined value will show an indeterminate
    // progress bar.


    let progressAttrs = undefined; // flowlint-next-line sketchy-null-number:off

    if (this.props.progressValue) {
      // `key` is set to force React to treat this as a new element when the `value` attr should be
      // removed. Currently it just sets `value="0"`, which is styled differently from no `value`
      // attr at all.
      // TODO: Remove the `key` once https://github.com/facebook/react/issues/1448 is resolved.
      progressAttrs = {
        key: 1,
        value: this.props.progressValue
      };
    }

    let runMsg;

    if (this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING) {
      runMsg = React.createElement("span", {
        className: "inline-block"
      }, "Running"); // flowlint-next-line sketchy-null-number:off
    } else if (this.props.runDuration) {
      runMsg = React.createElement("span", {
        className: "inline-block"
      }, "Done (in ", this.props.runDuration / 1000, "s)");
    }

    let pathMsg; // flowlint-next-line sketchy-null-string:off

    if (this.props.path) {
      pathMsg = React.createElement("span", {
        title: this.props.path,
        className: "inline-block"
      }, _nuclideUri().default.basename(this.props.path));
    }

    let dropdown;

    if (this.isDisabled()) {
      dropdown = React.createElement("span", {
        className: "inline-block text-warning"
      }, "No registered test runners");
    } else {
      dropdown = React.createElement(_Dropdown().Dropdown, {
        className: "inline-block nuclide-test-runner__runner-dropdown",
        disabled: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
        options: this.props.testRunners.map((testRunner, index) => ({
          label: testRunner.label,
          value: index
        })),
        onChange: this.setSelectedTestRunnerIndex,
        value: this.state.selectedTestRunnerIndex,
        size: "sm",
        title: "Choose a test runner"
      });
    }

    let attachDebuggerCheckbox = null;

    if (this.props.attachDebuggerBeforeRunning != null) {
      attachDebuggerCheckbox = React.createElement(_Checkbox().Checkbox, {
        className: "inline-block",
        checked: this.props.attachDebuggerBeforeRunning,
        label: "Enable Debugger",
        onChange: this.props.onDebuggerCheckboxChanged
      });
    }

    const filterMethodsProps = this.getSelectedTestRunnerSupportedOptions().get('filter');
    let filterTestMethodsButton = null;
    let filterTestMethodsTextbox = null;

    if (filterMethodsProps) {
      // flowlint-next-line sketchy-null-string:off
      const buttonLabel = filterMethodsProps.label || 'Filter';
      filterTestMethodsButton = React.createElement(_Button().Button, {
        className: "btn",
        icon: "nuclicon-funnel",
        size: "EXTRA_SMALL",
        buttonType: this.state.filterMethodsShown ? _Button().ButtonTypes.PRIMARY : null,
        onClick: this.onFilterMethodButtonClick,
        tooltip: {
          title: this.state.filterMethodsShown ? buttonLabel + ' (hide)' : buttonLabel + ' (show)'
        }
      });

      if (this.state.filterMethodsShown) {
        filterTestMethodsTextbox = React.createElement(_AtomInput().AtomInput, {
          className: "inline-block",
          value: this.state.filterMethodsText,
          size: "sm",
          placeholderText: filterMethodsProps.placeholderText,
          onDidChange: this.onFilterMethodTextChanged,
          width: 250,
          tooltip: {
            title: filterMethodsProps.tooltip
          }
        });
      }
    }

    const running = this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING;
    const progressBar = running ? React.createElement("progress", Object.assign({
      className: "inline-block",
      max: "100",
      title: "Test progress"
    }, progressAttrs)) : null;
    const tree = this.state.treeContainer == null ? null : _reactDom.default.createPortal(React.createElement(_TestClassTree().default, {
      isRunning: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
      testSuiteModel: this.props.testSuiteModel
    }), this.state.treeContainer);
    const console = this.state.consoleContainer == null ? null : _reactDom.default.createPortal(React.createElement(_Console().default, {
      textBuffer: this.props.buffer
    }), this.state.consoleContainer);
    return React.createElement("div", {
      className: "nuclide-test-runner-panel"
    }, tree, console, React.createElement(_Toolbar().Toolbar, {
      location: "top"
    }, React.createElement(_ToolbarLeft().ToolbarLeft, null, dropdown, runStopButton, attachDebuggerCheckbox, pathMsg, filterTestMethodsButton, filterTestMethodsTextbox), React.createElement(_ToolbarRight().ToolbarRight, null, runMsg, progressBar, React.createElement(_Button().Button, {
      size: _Button().ButtonSizes.SMALL,
      className: "inline-block",
      disabled: this.isDisabled() || running,
      onClick: this.props.onClickClear
    }, "Clear"))), React.createElement("div", {
      className: "nuclide-test-runner-console",
      ref: el => {
        this._paneContainerElement = el;
      }
    }));
  }

  isDisabled() {
    return this.props.testRunners.length === 0;
  }

  getSelectedTestRunner() {
    const selectedTestRunnerIndex = this.state.selectedTestRunnerIndex;

    if (selectedTestRunnerIndex >= 0) {
      return this.props.testRunners[selectedTestRunnerIndex];
    }
  }

  getSelectedTestRunnerSupportedOptions() {
    const runner = this.getSelectedTestRunner();
    const supportedOptions = runner && runner.supportedOptions;
    return supportedOptions || new Map();
  }

  getFilterMethodsValue() {
    if (this.state.filterMethodsShown) {
      return this.state.filterMethodsText;
    } else {
      return '';
    }
  }

}

exports.default = TestRunnerPanel;
TestRunnerPanel.ExecutionState = Object.freeze({
  RUNNING: 0,
  STOPPED: 1
});