'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _Console;

function _load_Console() {
  return _Console = _interopRequireDefault(require('./Console'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../../modules/nuclide-commons-ui/AtomInput');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../../modules/nuclide-commons-ui/Dropdown');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('../../../../modules/nuclide-commons-ui/Toolbar');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('../../../../modules/nuclide-commons-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('../../../../modules/nuclide-commons-ui/ToolbarRight');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../../../modules/nuclide-commons-ui/Checkbox');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../modules/nuclide-commons-ui/Button');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _createPaneContainer;

function _load_createPaneContainer() {
  return _createPaneContainer = _interopRequireDefault(require('../../../../modules/nuclide-commons-atom/create-pane-container'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _TestClassTree;

function _load_TestClassTree() {
  return _TestClassTree = _interopRequireDefault(require('./TestClassTree'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class TestRunnerPanel extends _react.Component {
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
      this.setState({ selectedTestRunnerIndex });
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
  // Bound Functions for use as callbacks.


  componentDidMount() {
    this._paneContainer = (0, (_createPaneContainer || _load_createPaneContainer()).default)();
    const leftPane = this._paneContainer.getActivePane();
    const rightPane = leftPane.splitRight({
      // Prevent Atom from cloning children on splitting; this panel wants an empty container.
      copyActiveItem: false,
      // Make the right pane 2/3 the width of the parent since console output is generally wider
      // than the test tree.
      flexScale: 2
    });

    (0, (_nullthrows || _load_nullthrows()).default)(this._paneContainerElement).appendChild(atom.views.getView(this._paneContainer));

    this.setState({
      treeContainer: atom.views.getView(leftPane).querySelector('.item-views'),
      consoleContainer: atom.views.getView(rightPane).querySelector('.item-views')
    });
  }

  componentWillReceiveProps(nextProps) {
    const currSelectedIndex = this.state.selectedTestRunnerIndex;
    if (currSelectedIndex === -1 && nextProps.testRunners.length > 0) {
      this.setState({ selectedTestRunnerIndex: 0 });
    } else if (nextProps.testRunners.length === 0 && currSelectedIndex >= 0) {
      this.setState({ selectedTestRunnerIndex: -1 });
    }
  }

  componentWillUnmount() {
    this._paneContainer.destroy();
  }

  render() {
    let runStopButton;
    switch (this.props.executionState) {
      case TestRunnerPanel.ExecutionState.RUNNING:
        runStopButton = _react.createElement(
          (_Button || _load_Button()).Button,
          {
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            className: 'inline-block',
            icon: 'primitive-square',
            buttonType: (_Button || _load_Button()).ButtonTypes.ERROR,
            onClick: this.props.onClickStop },
          'Stop'
        );
        break;
      case TestRunnerPanel.ExecutionState.STOPPED:
        const initialTest = this.props.path === undefined;
        runStopButton = _react.createElement(
          (_Button || _load_Button()).Button,
          {
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            className: 'inline-block',
            icon: initialTest ? 'playback-play' : 'sync',
            buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
            disabled: this.isDisabled(),
            onClick: this.props.onClickRun },
          initialTest ? 'Test' : 'Re-Test'
        );
        break;
    }

    // Assign `value` only when needed so a null/undefined value will show an indeterminate
    // progress bar.
    let progressAttrs = undefined;
    // flowlint-next-line sketchy-null-number:off
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
      runMsg = _react.createElement(
        'span',
        { className: 'inline-block' },
        'Running'
      );
      // flowlint-next-line sketchy-null-number:off
    } else if (this.props.runDuration) {
      runMsg = _react.createElement(
        'span',
        { className: 'inline-block' },
        'Done (in ',
        this.props.runDuration / 1000,
        's)'
      );
    }

    let pathMsg;
    // flowlint-next-line sketchy-null-string:off
    if (this.props.path) {
      pathMsg = _react.createElement(
        'span',
        { title: this.props.path, className: 'inline-block' },
        (_nuclideUri || _load_nuclideUri()).default.basename(this.props.path)
      );
    }

    let dropdown;
    if (this.isDisabled()) {
      dropdown = _react.createElement(
        'span',
        { className: 'inline-block text-warning' },
        'No registered test runners'
      );
    } else {
      dropdown = _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        className: 'inline-block nuclide-test-runner__runner-dropdown',
        disabled: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
        options: this.props.testRunners.map((testRunner, index) => ({
          label: testRunner.label,
          value: index
        })),
        onChange: this.setSelectedTestRunnerIndex,
        value: this.state.selectedTestRunnerIndex,
        size: 'sm',
        title: 'Choose a test runner'
      });
    }

    let attachDebuggerCheckbox = null;
    if (this.props.attachDebuggerBeforeRunning != null) {
      attachDebuggerCheckbox = _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'inline-block',
        checked: this.props.attachDebuggerBeforeRunning,
        label: 'Enable Debugger',
        onChange: this.props.onDebuggerCheckboxChanged
      });
    }

    const filterMethodsProps = this.getSelectedTestRunnerSupportedOptions().get('filter');
    let filterTestMethodsButton = null;
    let filterTestMethodsTextbox = null;
    if (filterMethodsProps) {
      // flowlint-next-line sketchy-null-string:off
      const buttonLabel = filterMethodsProps.label || 'Filter';
      filterTestMethodsButton = _react.createElement((_Button || _load_Button()).Button, {
        className: 'btn',
        icon: 'nuclicon-funnel',
        size: 'EXTRA_SMALL',
        buttonType: this.state.filterMethodsShown ? (_Button || _load_Button()).ButtonTypes.PRIMARY : null,
        onClick: this.onFilterMethodButtonClick,
        tooltip: {
          title: this.state.filterMethodsShown ? buttonLabel + ' (hide)' : buttonLabel + ' (show)'
        }
      });
      if (this.state.filterMethodsShown) {
        filterTestMethodsTextbox = _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          className: 'inline-block',
          value: this.state.filterMethodsText,
          size: 'sm',
          placeholderText: filterMethodsProps.placeholderText,
          onDidChange: this.onFilterMethodTextChanged,
          width: 250,
          tooltip: { title: filterMethodsProps.tooltip }
        });
      }
    }

    const running = this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING;

    const progressBar = running ? _react.createElement('progress', Object.assign({
      className: 'inline-block',
      max: '100',
      title: 'Test progress'
    }, progressAttrs)) : null;

    const tree = this.state.treeContainer == null ? null : _reactDom.default.createPortal(_react.createElement((_TestClassTree || _load_TestClassTree()).default, {
      isRunning: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
      testSuiteModel: this.props.testSuiteModel
    }), this.state.treeContainer);

    const console = this.state.consoleContainer == null ? null : _reactDom.default.createPortal(_react.createElement((_Console || _load_Console()).default, { textBuffer: this.props.buffer }), this.state.consoleContainer);

    return _react.createElement(
      'div',
      { className: 'nuclide-test-runner-panel' },
      tree,
      console,
      _react.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        { location: 'top' },
        _react.createElement(
          (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
          null,
          dropdown,
          runStopButton,
          attachDebuggerCheckbox,
          pathMsg,
          filterTestMethodsButton,
          filterTestMethodsTextbox
        ),
        _react.createElement(
          (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
          null,
          runMsg,
          progressBar,
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              className: 'inline-block',
              disabled: this.isDisabled() || running,
              onClick: this.props.onClickClear },
            'Clear'
          )
        )
      ),
      _react.createElement('div', {
        className: 'nuclide-test-runner-console',
        ref: el => {
          this._paneContainerElement = el;
        }
      })
    );
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