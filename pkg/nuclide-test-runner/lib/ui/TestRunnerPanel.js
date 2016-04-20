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
      this._tree = ReactDOM.render(React.createElement(TestClassTree, {
        isRunning: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
        testSuiteModel: this.props.testSuiteModel
      }), atom.views.getView(this._leftPane).querySelector('.item-views'));
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
//# sourceMappingURL=data:application/json;base64,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O1dBRVkseUJBQUc7QUFDZCxjQUFRLENBQUMsTUFBTSxDQUNiLG9CQUFDLE9BQU8sSUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEFBQUMsR0FBRyxFQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUNqRSxDQUFDO0tBQ0g7OztTQW5QRyxlQUFlO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBc1A3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJUZXN0UnVubmVyUGFuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmNvbnN0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcbmNvbnN0IHtEcm9wZG93bn0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9Ecm9wZG93bicpO1xuY29uc3Qge1BhbmVsQ29tcG9uZW50fSA9IHJlcXVpcmUoJy4uLy4uLy4uL251Y2xpZGUtdWkvbGliL1BhbmVsQ29tcG9uZW50Jyk7XG5jb25zdCB7VG9vbGJhcn0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyJyk7XG5jb25zdCB7VG9vbGJhckxlZnR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhckxlZnQnKTtcbmNvbnN0IHtUb29sYmFyUmlnaHR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhclJpZ2h0Jyk7XG5jb25zdCB7Q2hlY2tib3h9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvQ2hlY2tib3gnKTtcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uU2l6ZXMsXG4gIEJ1dHRvblR5cGVzLFxufSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuY29uc3Qge2NyZWF0ZVBhbmVDb250YWluZXJ9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlID0gcmVxdWlyZSgnLi9UZXN0Q2xhc3NUcmVlJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBudW1iZXI7XG59O1xuXG5jbGFzcyBUZXN0UnVubmVyUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogU3RhdGU7XG4gIF9wYW5lQ29udGFpbmVyOiBPYmplY3Q7XG4gIF9sZWZ0UGFuZTogYXRvbSRQYW5lO1xuICBfcmlnaHRQYW5lOiBhdG9tJFBhbmU7XG4gIF90ZXh0RWRpdG9yTW9kZWw6IFRleHRFZGl0b3I7XG4gIF90cmVlOiBUZXN0Q2xhc3NUcmVlO1xuXG4gIC8vIEJvdW5kIEZ1bmN0aW9ucyBmb3IgdXNlIGFzIGNhbGxiYWNrcy5cbiAgc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IEZ1bmN0aW9uO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgYXR0YWNoRGVidWdnZXJCZWZvcmVSdW5uaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBidWZmZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBleGVjdXRpb25TdGF0ZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tDbGVhcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrQ2xvc2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGlja1J1bjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrU3RvcDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkRlYnVnZ2VyQ2hlY2tib3hDaGFuZ2VkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHByb2dyZXNzVmFsdWU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcnVuRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLy8gVE9ETzogU2hvdWxkIGJlIGBhcnJheU9mKFRlc3RSdW5uZXIpYCwgYnV0IHRoYXQgd291bGQgcmVxdWlyZSBhIHJlYWwgb2JqZWN0IHNpbmNlIHRoaXMgaXNcbiAgICAvLyBydW50aW1lIGNvZGUgZm9yIFJlYWN0LlxuICAgIHRlc3RSdW5uZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihPYmplY3QpLmlzUmVxdWlyZWQsXG4gICAgdGVzdFN1aXRlTW9kZWw6IFByb3BUeXBlcy5vYmplY3QsXG4gIH07XG5cbiAgc3RhdGljIEV4ZWN1dGlvblN0YXRlID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgUlVOTklORzogMCxcbiAgICBTVE9QUEVEOiAxLFxuICB9KTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICByb290czogW10sXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgdGVzdCBydW5uZXJzLCBzdGFydCB3aXRoIHRoZSBmaXJzdCBvbmUgc2VsZWN0ZWQuIE90aGVyd2lzZSBzdG9yZSAtMSB0b1xuICAgICAgLy8gbGF0ZXIgaW5kaWNhdGUgdGhlcmUgd2VyZSBubyBhY3RpdmUgdGVzdCBydW5uZXJzLlxuICAgICAgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IHByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDAgPyAwIDogLTEsXG4gICAgfTtcblxuICAgIC8vIEJpbmQgRnVuY3Rpb25zIGZvciB1c2UgYXMgY2FsbGJhY2tzO1xuICAgIC8vIFRPRE86IFJlcGxhY2Ugd2l0aCBwcm9wZXJ0eSBpbml0aWFsaXplcnMgd2hlbiBzdXBwb3J0ZWQgYnkgRmxvdztcbiAgICB0aGlzLnNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4ID0gdGhpcy5zZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fcGFuZUNvbnRhaW5lciA9IGNyZWF0ZVBhbmVDb250YWluZXIoKTtcbiAgICB0aGlzLl9sZWZ0UGFuZSA9IHRoaXMuX3BhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX3JpZ2h0UGFuZSA9IHRoaXMuX2xlZnRQYW5lLnNwbGl0UmlnaHQoe1xuICAgICAgLy8gUHJldmVudCBBdG9tIGZyb20gY2xvbmluZyBjaGlsZHJlbiBvbiBzcGxpdHRpbmc7IHRoaXMgcGFuZWwgd2FudHMgYW4gZW1wdHkgY29udGFpbmVyLlxuICAgICAgY29weUFjdGl2ZUl0ZW06IGZhbHNlLFxuICAgICAgLy8gTWFrZSB0aGUgcmlnaHQgcGFuZSAyLzMgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgc2luY2UgY29uc29sZSBvdXRwdXQgaXMgZ2VuZXJhbGx5IHdpZGVyXG4gICAgICAvLyB0aGFuIHRoZSB0ZXN0IHRyZWUuXG4gICAgICBmbGV4U2NhbGU6IDIsXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB0aGlzLnJlbmRlckNvbnNvbGUoKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKVxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KSB7XG4gICAgY29uc3QgY3VyclNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChjdXJyU2VsZWN0ZWRJbmRleCA9PT0gLTEgJiYgbmV4dFByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAwfSk7XG4gICAgfSBlbHNlIGlmIChuZXh0UHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwICYmIGN1cnJTZWxlY3RlZEluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAtMX0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcmlnaHRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpKTtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2xlZnRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpKTtcbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgcnVuU3RvcEJ1dHRvbjtcbiAgICBzd2l0Y2ggKHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUpIHtcbiAgICAgIGNhc2UgVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkc6XG4gICAgICAgIHJ1blN0b3BCdXR0b24gPSAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgaWNvbj1cInByaW1pdGl2ZS1zcXVhcmVcIlxuICAgICAgICAgICAgYnV0dG9uVHlwZT17QnV0dG9uVHlwZXMuRVJST1J9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tTdG9wfT5cbiAgICAgICAgICAgIFN0b3BcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEOlxuICAgICAgICBjb25zdCBpbml0aWFsVGVzdCA9IHRoaXMucHJvcHMucGF0aCA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBydW5TdG9wQnV0dG9uID0gKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGljb249e2luaXRpYWxUZXN0ID8gJ3BsYXliYWNrLXBsYXknIDogJ3N5bmMnfVxuICAgICAgICAgICAgYnV0dG9uVHlwZT17QnV0dG9uVHlwZXMuUFJJTUFSWX1cbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLmlzRGlzYWJsZWQoKX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja1J1bn0+XG4gICAgICAgICAgICB7aW5pdGlhbFRlc3QgPyAnVGVzdCcgOiAnUmUtVGVzdCd9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIEFzc2lnbiBgdmFsdWVgIG9ubHkgd2hlbiBuZWVkZWQgc28gYSBudWxsL3VuZGVmaW5lZCB2YWx1ZSB3aWxsIHNob3cgYW4gaW5kZXRlcm1pbmF0ZVxuICAgIC8vIHByb2dyZXNzIGJhci5cbiAgICBsZXQgcHJvZ3Jlc3NBdHRyczogP3tba2V5OiBzdHJpbmddOiBtaXhlZH0gPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMucHJvcHMucHJvZ3Jlc3NWYWx1ZSkge1xuICAgICAgLy8gYGtleWAgaXMgc2V0IHRvIGZvcmNlIFJlYWN0IHRvIHRyZWF0IHRoaXMgYXMgYSBuZXcgZWxlbWVudCB3aGVuIHRoZSBgdmFsdWVgIGF0dHIgc2hvdWxkIGJlXG4gICAgICAvLyByZW1vdmVkLiBDdXJyZW50bHkgaXQganVzdCBzZXRzIGB2YWx1ZT1cIjBcImAsIHdoaWNoIGlzIHN0eWxlZCBkaWZmZXJlbnRseSBmcm9tIG5vIGB2YWx1ZWBcbiAgICAgIC8vIGF0dHIgYXQgYWxsLlxuICAgICAgLy8gVE9ETzogUmVtb3ZlIHRoZSBga2V5YCBvbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9pc3N1ZXMvMTQ0OCBpcyByZXNvbHZlZC5cbiAgICAgIHByb2dyZXNzQXR0cnMgPSB7XG4gICAgICAgIGtleTogMSxcbiAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMucHJvZ3Jlc3NWYWx1ZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgbGV0IHJ1bk1zZztcbiAgICBpZiAodGhpcy5wcm9wcy5leGVjdXRpb25TdGF0ZSA9PT0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkcpIHtcbiAgICAgIHJ1bk1zZyA9IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+UnVubmluZzwvc3Bhbj5cbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnJ1bkR1cmF0aW9uKSB7XG4gICAgICBydW5Nc2cgPSAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPkRvbmUgKGluIHt0aGlzLnByb3BzLnJ1bkR1cmF0aW9uIC8gMTAwMH1zKTwvc3Bhbj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHBhdGhNc2c7XG4gICAgaWYgKHRoaXMucHJvcHMucGF0aCkge1xuICAgICAgcGF0aE1zZyA9IDxzcGFuIHRpdGxlPXt0aGlzLnByb3BzLnBhdGh9PntwYXRoLmJhc2VuYW1lKHRoaXMucHJvcHMucGF0aCl9PC9zcGFuPjtcbiAgICB9XG5cbiAgICBsZXQgZHJvcGRvd247XG4gICAgaWYgKHRoaXMuaXNEaXNhYmxlZCgpKSB7XG4gICAgICBkcm9wZG93biA9IDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayB0ZXh0LXdhcm5pbmdcIj5ObyByZWdpc3RlcmVkIHRlc3QgcnVubmVyczwvc3Bhbj47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyb3Bkb3duID0gKFxuICAgICAgICA8RHJvcGRvd25cbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgbnVjbGlkZS10ZXN0LXJ1bm5lcl9fcnVubmVyLWRyb3Bkb3duXCJcbiAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5leGVjdXRpb25TdGF0ZSA9PT0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkd9XG4gICAgICAgICAgbWVudUl0ZW1zPXt0aGlzLnByb3BzLnRlc3RSdW5uZXJzLm1hcCh0ZXN0UnVubmVyID0+XG4gICAgICAgICAgICAoe2xhYmVsOiB0ZXN0UnVubmVyLmxhYmVsLCB2YWx1ZTogdGVzdFJ1bm5lci5sYWJlbH0pXG4gICAgICAgICAgKX1cbiAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLnNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4fVxuICAgICAgICAgIHJlZj1cImRyb3Bkb3duXCJcbiAgICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4fVxuICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgdGl0bGU9XCJDaG9vc2UgYSB0ZXN0IHJ1bm5lclwiXG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBhdHRhY2hEZWJ1Z2dlckNoZWNrYm94ID0gbnVsbDtcbiAgICBpZiAodGhpcy5wcm9wcy5hdHRhY2hEZWJ1Z2dlckJlZm9yZVJ1bm5pbmcgIT0gbnVsbCkge1xuICAgICAgYXR0YWNoRGVidWdnZXJDaGVja2JveCA9IChcbiAgICAgICAgPENoZWNrYm94XG4gICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5hdHRhY2hEZWJ1Z2dlckJlZm9yZVJ1bm5pbmd9XG4gICAgICAgICAgbGFiZWw9XCJFbmFibGUgRGVidWdnZXJcIlxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uRGVidWdnZXJDaGVja2JveENoYW5nZWR9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8UGFuZWxDb21wb25lbnQgZG9jaz1cImJvdHRvbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdGVzdC1ydW5uZXItcGFuZWxcIj5cbiAgICAgICAgICA8VG9vbGJhciBsb2NhdGlvbj1cInRvcFwiPlxuICAgICAgICAgICAgPFRvb2xiYXJMZWZ0PlxuICAgICAgICAgICAgICB7ZHJvcGRvd259XG4gICAgICAgICAgICAgIHtydW5TdG9wQnV0dG9ufVxuICAgICAgICAgICAgICB7YXR0YWNoRGVidWdnZXJDaGVja2JveH1cbiAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgIHNpemU9e0J1dHRvblNpemVzLlNNQUxMfVxuICAgICAgICAgICAgICAgIGljb249XCJ0cmFzaGNhblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidHJhc2hjYW4gaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5pc0Rpc2FibGVkKCkgfHxcbiAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja0NsZWFyfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiQ2xlYXIgT3V0cHV0XCI+XG4gICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICB7cGF0aE1zZ31cbiAgICAgICAgICAgIDwvVG9vbGJhckxlZnQ+XG4gICAgICAgICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICAgICAgICB7cnVuTXNnfVxuICAgICAgICAgICAgICA8cHJvZ3Jlc3MgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCIgbWF4PVwiMTAwXCIgey4uLnByb2dyZXNzQXR0cnN9IC8+XG4gICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tDbG9zZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgICAgIGljb249XCJ4XCJcbiAgICAgICAgICAgICAgICBzaXplPXtCdXR0b25TaXplcy5TTUFMTH1cbiAgICAgICAgICAgICAgICB0aXRsZT1cIkNsb3NlIFBhbmVsXCI+XG4gICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgICAgICAgPC9Ub29sYmFyPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1jb25zb2xlXCIgcmVmPVwicGFuZUNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIGlzRGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXgoc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4fSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZFRlc3RSdW5uZXIoKTogP09iamVjdCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChzZWxlY3RlZFRlc3RSdW5uZXJJbmRleCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy50ZXN0UnVubmVyc1tzZWxlY3RlZFRlc3RSdW5uZXJJbmRleF07XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyVHJlZSgpIHtcbiAgICB0aGlzLl90cmVlID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFRlc3RDbGFzc1RyZWVcbiAgICAgICAgaXNSdW5uaW5nPXt0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgdGVzdFN1aXRlTW9kZWw9e3RoaXMucHJvcHMudGVzdFN1aXRlTW9kZWx9XG4gICAgICAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9sZWZ0UGFuZSkucXVlcnlTZWxlY3RvcignLml0ZW0tdmlld3MnKVxuICAgICk7XG4gIH1cblxuICByZW5kZXJDb25zb2xlKCkge1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxDb25zb2xlIHRleHRCdWZmZXI9e3RoaXMucHJvcHMuYnVmZmVyfSAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9yaWdodFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJylcbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdFJ1bm5lclBhbmVsO1xuIl19