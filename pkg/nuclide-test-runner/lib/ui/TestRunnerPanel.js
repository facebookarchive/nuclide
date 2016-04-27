var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nuclideUiLibButton = require('../../../nuclide-ui/lib/Button');

var Console = require('./Console');

var _require = require('../../../nuclide-ui/lib/Dropdown');

var Dropdown = _require.Dropdown;

var _require2 = require('../../../nuclide-ui/lib/PanelComponent');

var PanelComponent = _require2.PanelComponent;

var _require3 = require('../../../nuclide-ui/lib/Toolbar');

var Toolbar = _require3.Toolbar;

var _require4 = require('../../../nuclide-ui/lib/ToolbarLeft');

var ToolbarLeft = _require4.ToolbarLeft;

var _require5 = require('../../../nuclide-ui/lib/ToolbarRight');

var ToolbarRight = _require5.ToolbarRight;

var _require6 = require('../../../nuclide-ui/lib/Checkbox');

var Checkbox = _require6.Checkbox;

var _require7 = require('../../../nuclide-atom-helpers');

var createPaneContainer = _require7.createPaneContainer;

var _require8 = require('react-for-atom');

var React = _require8.React;
var ReactDOM = _require8.ReactDOM;

var TestClassTree = require('./TestClassTree');

var PropTypes = React.PropTypes;

var TestRunnerPanel = (function (_React$Component) {
  _inherits(TestRunnerPanel, _React$Component);

  _createClass(TestRunnerPanel, null, [{
    key: 'propTypes',
    value: {
      attachDebuggerBeforeRunning: PropTypes.bool,
      buffer: PropTypes.object.isRequired,
      executionState: PropTypes.number.isRequired,
      onClickClear: PropTypes.func.isRequired,
      onClickClose: PropTypes.func.isRequired,
      onClickRun: PropTypes.func.isRequired,
      onClickStop: PropTypes.func.isRequired,
      onDebuggerCheckboxChanged: PropTypes.func,
      path: PropTypes.string,
      progressValue: PropTypes.number,
      runDuration: PropTypes.number,
      // TODO: Should be `arrayOf(TestRunner)`, but that would require a real object since this is
      // runtime code for React.
      testRunners: PropTypes.arrayOf(Object).isRequired,
      testSuiteModel: PropTypes.object
    },
    enumerable: true
  }, {
    key: 'ExecutionState',
    value: Object.freeze({
      RUNNING: 0,
      STOPPED: 1
    }),
    enumerable: true
  }]);

  function TestRunnerPanel(props) {
    _classCallCheck(this, TestRunnerPanel);

    _get(Object.getPrototypeOf(TestRunnerPanel.prototype), 'constructor', this).call(this, props);
    this.state = {
      roots: [],
      // If there are test runners, start with the first one selected. Otherwise store -1 to
      // later indicate there were no active test runners.
      selectedTestRunnerIndex: props.testRunners.length > 0 ? 0 : -1
    };

    // Bind Functions for use as callbacks;
    // TODO: Replace with property initializers when supported by Flow;
    this.setSelectedTestRunnerIndex = this.setSelectedTestRunnerIndex.bind(this);
  }

  _createClass(TestRunnerPanel, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._paneContainer = createPaneContainer();
      this._leftPane = this._paneContainer.getActivePane();
      this._rightPane = this._leftPane.splitRight({
        // Prevent Atom from cloning children on splitting; this panel wants an empty container.
        copyActiveItem: false,
        // Make the right pane 2/3 the width of the parent since console output is generally wider
        // than the test tree.
        flexScale: 2
      });

      this.renderTree();
      this.renderConsole();

      ReactDOM.findDOMNode(this.refs['paneContainer']).appendChild(atom.views.getView(this._paneContainer));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.renderTree();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var currSelectedIndex = this.state.selectedTestRunnerIndex;
      if (currSelectedIndex === -1 && nextProps.testRunners.length > 0) {
        this.setState({ selectedTestRunnerIndex: 0 });
      } else if (nextProps.testRunners.length === 0 && currSelectedIndex >= 0) {
        this.setState({ selectedTestRunnerIndex: -1 });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      ReactDOM.unmountComponentAtNode(atom.views.getView(this._rightPane).querySelector('.item-views'));
      ReactDOM.unmountComponentAtNode(atom.views.getView(this._leftPane).querySelector('.item-views'));
      this._paneContainer.destroy();
    }
  }, {
    key: 'render',
    value: function render() {
      var runStopButton = undefined;
      switch (this.props.executionState) {
        case TestRunnerPanel.ExecutionState.RUNNING:
          runStopButton = React.createElement(
            _nuclideUiLibButton.Button,
            {
              icon: 'primitive-square',
              buttonType: _nuclideUiLibButton.ButtonTypes.ERROR,
              onClick: this.props.onClickStop },
            'Stop'
          );
          break;
        case TestRunnerPanel.ExecutionState.STOPPED:
          var initialTest = this.props.path === undefined;
          runStopButton = React.createElement(
            _nuclideUiLibButton.Button,
            {
              icon: initialTest ? 'playback-play' : 'sync',
              buttonType: _nuclideUiLibButton.ButtonTypes.PRIMARY,
              disabled: this.isDisabled(),
              onClick: this.props.onClickRun },
            initialTest ? 'Test' : 'Re-Test'
          );
          break;
      }

      // Assign `value` only when needed so a null/undefined value will show an indeterminate
      // progress bar.
      var progressAttrs = undefined;
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

      var runMsg = undefined;
      if (this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING) {
        runMsg = React.createElement(
          'span',
          { className: 'inline-block' },
          'Running'
        );
      } else if (this.props.runDuration) {
        runMsg = React.createElement(
          'span',
          { className: 'inline-block' },
          'Done (in ',
          this.props.runDuration / 1000,
          's)'
        );
      }

      var pathMsg = undefined;
      if (this.props.path) {
        pathMsg = React.createElement(
          'span',
          { title: this.props.path },
          _path2['default'].basename(this.props.path)
        );
      }

      var dropdown = undefined;
      if (this.isDisabled()) {
        dropdown = React.createElement(
          'span',
          { className: 'inline-block text-warning' },
          'No registered test runners'
        );
      } else {
        dropdown = React.createElement(Dropdown, {
          className: 'inline-block nuclide-test-runner__runner-dropdown',
          disabled: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
          menuItems: this.props.testRunners.map(function (testRunner) {
            return { label: testRunner.label, value: testRunner.label };
          }),
          onSelectedChange: this.setSelectedTestRunnerIndex,
          ref: 'dropdown',
          selectedIndex: this.state.selectedTestRunnerIndex,
          size: 'sm',
          title: 'Choose a test runner'
        });
      }

      var attachDebuggerCheckbox = null;
      if (this.props.attachDebuggerBeforeRunning != null) {
        attachDebuggerCheckbox = React.createElement(Checkbox, {
          checked: this.props.attachDebuggerBeforeRunning,
          label: 'Enable Debugger',
          onChange: this.props.onDebuggerCheckboxChanged
        });
      }

      return React.createElement(
        PanelComponent,
        { dock: 'bottom' },
        React.createElement(
          'div',
          { className: 'nuclide-test-runner-panel' },
          React.createElement(
            Toolbar,
            { location: 'top' },
            React.createElement(
              ToolbarLeft,
              null,
              dropdown,
              runStopButton,
              attachDebuggerCheckbox,
              React.createElement(_nuclideUiLibButton.Button, {
                size: _nuclideUiLibButton.ButtonSizes.SMALL,
                icon: 'trashcan',
                className: 'trashcan inline-block',
                disabled: this.isDisabled() || this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
                onClick: this.props.onClickClear,
                title: 'Clear Output' }),
              pathMsg
            ),
            React.createElement(
              ToolbarRight,
              null,
              runMsg,
              React.createElement('progress', _extends({ className: 'inline-block', max: '100' }, progressAttrs)),
              React.createElement(_nuclideUiLibButton.Button, {
                onClick: this.props.onClickClose,
                className: 'inline-block',
                icon: 'x',
                size: _nuclideUiLibButton.ButtonSizes.SMALL,
                title: 'Close Panel' })
            )
          ),
          React.createElement('div', { className: 'nuclide-test-runner-console', ref: 'paneContainer' })
        )
      );
    }
  }, {
    key: 'isDisabled',
    value: function isDisabled() {
      return this.props.testRunners.length === 0;
    }
  }, {
    key: 'setSelectedTestRunnerIndex',
    value: function setSelectedTestRunnerIndex(selectedTestRunnerIndex) {
      this.setState({ selectedTestRunnerIndex: selectedTestRunnerIndex });
    }
  }, {
    key: 'getSelectedTestRunner',
    value: function getSelectedTestRunner() {
      var selectedTestRunnerIndex = this.state.selectedTestRunnerIndex;
      if (selectedTestRunnerIndex >= 0) {
        return this.props.testRunners[selectedTestRunnerIndex];
      }
    }
  }, {
    key: 'renderTree',
    value: function renderTree() {
      var component = ReactDOM.render(React.createElement(TestClassTree, {
        isRunning: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
        testSuiteModel: this.props.testSuiteModel
      }), atom.views.getView(this._leftPane).querySelector('.item-views'));
      (0, _assert2['default'])(component instanceof TestClassTree);
      this._tree = component;
    }
  }, {
    key: 'renderConsole',
    value: function renderConsole() {
      ReactDOM.render(React.createElement(Console, { textBuffer: this.props.buffer }), atom.views.getView(this._rightPane).querySelector('.item-views'));
    }
  }]);

  return TestRunnerPanel;
})(React.Component);

module.exports = TestRunnerPanel;

// Bound Functions for use as callbacks.