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

var _require6 = require('../../../nuclide-atom-helpers');

var createPaneContainer = _require6.createPaneContainer;

var _require7 = require('react-for-atom');

var React = _require7.React;
var ReactDOM = _require7.ReactDOM;

var TestClassTree = require('./TestClassTree');

var PropTypes = React.PropTypes;

function runStopButtonClassName(icon, className) {
  return 'btn btn-sm icon inline-block icon-' + icon + ' ' + className;
}

var TestRunnerPanel = (function (_React$Component) {
  _inherits(TestRunnerPanel, _React$Component);

  _createClass(TestRunnerPanel, null, [{
    key: 'propTypes',
    value: {
      buffer: PropTypes.object.isRequired,
      executionState: PropTypes.number.isRequired,
      onClickClear: PropTypes.func.isRequired,
      onClickClose: PropTypes.func.isRequired,
      onClickRun: PropTypes.func.isRequired,
      onClickStop: PropTypes.func.isRequired,
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
            'button',
            {
              className: runStopButtonClassName('primitive-square', 'btn-error'),
              onClick: this.props.onClickStop },
            'Stop'
          );
          break;
        case TestRunnerPanel.ExecutionState.STOPPED:
          var initialTest = this.props.path === undefined;
          runStopButton = React.createElement(
            'button',
            {
              className: runStopButtonClassName(initialTest ? 'playback-play' : 'sync', 'btn-primary'),
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
              React.createElement('button', {
                className: 'btn btn-sm icon icon-trashcan inline-block',
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
              React.createElement('button', {
                onClick: this.props.onClickClose,
                className: 'btn btn-sm icon icon-x inline-block',
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
//# sourceMappingURL=data:application/json;base64,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Qzs7O1dBRW9CLGlDQUFZO0FBQy9CLFVBQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQztBQUNuRSxVQUFJLHVCQUF1QixJQUFJLENBQUMsRUFBRTtBQUNoQyxlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7T0FDeEQ7S0FDRjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQzFCLG9CQUFDLGFBQWE7QUFDWixpQkFBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLGVBQWUsQ0FBQyxjQUFjLENBQUMsT0FBTyxBQUFDO0FBQ2hGLHNCQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEFBQUM7UUFDMUMsRUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUNoRSxDQUFDO0tBQ0g7OztXQUVZLHlCQUFHO0FBQ2QsY0FBUSxDQUFDLE1BQU0sQ0FDYixvQkFBQyxPQUFPLElBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxBQUFDLEdBQUcsRUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FDakUsQ0FBQztLQUNIOzs7U0FqT0csZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQW9PN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiVGVzdFJ1bm5lclBhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5jb25zdCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5jb25zdCB7RHJvcGRvd259ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvRHJvcGRvd24nKTtcbmNvbnN0IHtQYW5lbENvbXBvbmVudH0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9QYW5lbENvbXBvbmVudCcpO1xuY29uc3Qge1Rvb2xiYXJ9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhcicpO1xuY29uc3Qge1Rvb2xiYXJMZWZ0fSA9IHJlcXVpcmUoJy4uLy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJMZWZ0Jyk7XG5jb25zdCB7VG9vbGJhclJpZ2h0fSA9IHJlcXVpcmUoJy4uLy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJSaWdodCcpO1xuY29uc3Qge2NyZWF0ZVBhbmVDb250YWluZXJ9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlID0gcmVxdWlyZSgnLi9UZXN0Q2xhc3NUcmVlJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBudW1iZXI7XG59O1xuXG5mdW5jdGlvbiBydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKGljb246IHN0cmluZywgY2xhc3NOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYGJ0biBidG4tc20gaWNvbiBpbmxpbmUtYmxvY2sgaWNvbi0ke2ljb259ICR7Y2xhc3NOYW1lfWA7XG59XG5cbmNsYXNzIFRlc3RSdW5uZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgX3BhbmVDb250YWluZXI6IE9iamVjdDtcbiAgX2xlZnRQYW5lOiBhdG9tJFBhbmU7XG4gIF9yaWdodFBhbmU6IGF0b20kUGFuZTtcbiAgX3RleHRFZGl0b3JNb2RlbDogVGV4dEVkaXRvcjtcbiAgX3RyZWU6IFRlc3RDbGFzc1RyZWU7XG5cbiAgLy8gQm91bmQgRnVuY3Rpb25zIGZvciB1c2UgYXMgY2FsbGJhY2tzLlxuICBzZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleDogRnVuY3Rpb247XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBidWZmZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBleGVjdXRpb25TdGF0ZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tDbGVhcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrQ2xvc2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGlja1J1bjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrU3RvcDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHByb2dyZXNzVmFsdWU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcnVuRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLy8gVE9ETzogU2hvdWxkIGJlIGBhcnJheU9mKFRlc3RSdW5uZXIpYCwgYnV0IHRoYXQgd291bGQgcmVxdWlyZSBhIHJlYWwgb2JqZWN0IHNpbmNlIHRoaXMgaXNcbiAgICAvLyBydW50aW1lIGNvZGUgZm9yIFJlYWN0LlxuICAgIHRlc3RSdW5uZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihPYmplY3QpLmlzUmVxdWlyZWQsXG4gICAgdGVzdFN1aXRlTW9kZWw6IFByb3BUeXBlcy5vYmplY3QsXG4gIH07XG5cbiAgc3RhdGljIEV4ZWN1dGlvblN0YXRlID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgUlVOTklORzogMCxcbiAgICBTVE9QUEVEOiAxLFxuICB9KTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICByb290czogW10sXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgdGVzdCBydW5uZXJzLCBzdGFydCB3aXRoIHRoZSBmaXJzdCBvbmUgc2VsZWN0ZWQuIE90aGVyd2lzZSBzdG9yZSAtMSB0b1xuICAgICAgLy8gbGF0ZXIgaW5kaWNhdGUgdGhlcmUgd2VyZSBubyBhY3RpdmUgdGVzdCBydW5uZXJzLlxuICAgICAgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IHByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDAgPyAwIDogLTEsXG4gICAgfTtcblxuICAgIC8vIEJpbmQgRnVuY3Rpb25zIGZvciB1c2UgYXMgY2FsbGJhY2tzO1xuICAgIC8vIFRPRE86IFJlcGxhY2Ugd2l0aCBwcm9wZXJ0eSBpbml0aWFsaXplcnMgd2hlbiBzdXBwb3J0ZWQgYnkgRmxvdztcbiAgICB0aGlzLnNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4ID0gdGhpcy5zZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fcGFuZUNvbnRhaW5lciA9IGNyZWF0ZVBhbmVDb250YWluZXIoKTtcbiAgICB0aGlzLl9sZWZ0UGFuZSA9IHRoaXMuX3BhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX3JpZ2h0UGFuZSA9IHRoaXMuX2xlZnRQYW5lLnNwbGl0UmlnaHQoe1xuICAgICAgLy8gUHJldmVudCBBdG9tIGZyb20gY2xvbmluZyBjaGlsZHJlbiBvbiBzcGxpdHRpbmc7IHRoaXMgcGFuZWwgd2FudHMgYW4gZW1wdHkgY29udGFpbmVyLlxuICAgICAgY29weUFjdGl2ZUl0ZW06IGZhbHNlLFxuICAgICAgLy8gTWFrZSB0aGUgcmlnaHQgcGFuZSAyLzMgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgc2luY2UgY29uc29sZSBvdXRwdXQgaXMgZ2VuZXJhbGx5IHdpZGVyXG4gICAgICAvLyB0aGFuIHRoZSB0ZXN0IHRyZWUuXG4gICAgICBmbGV4U2NhbGU6IDIsXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB0aGlzLnJlbmRlckNvbnNvbGUoKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKVxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KSB7XG4gICAgY29uc3QgY3VyclNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChjdXJyU2VsZWN0ZWRJbmRleCA9PT0gLTEgJiYgbmV4dFByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAwfSk7XG4gICAgfSBlbHNlIGlmIChuZXh0UHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwICYmIGN1cnJTZWxlY3RlZEluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAtMX0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcmlnaHRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpKTtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2xlZnRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpKTtcbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgcnVuU3RvcEJ1dHRvbjtcbiAgICBzd2l0Y2ggKHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUpIHtcbiAgICAgIGNhc2UgVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkc6XG4gICAgICAgIHJ1blN0b3BCdXR0b24gPSAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKCdwcmltaXRpdmUtc3F1YXJlJywgJ2J0bi1lcnJvcicpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrU3RvcH0+XG4gICAgICAgICAgICBTdG9wXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRDpcbiAgICAgICAgY29uc3QgaW5pdGlhbFRlc3QgPSB0aGlzLnByb3BzLnBhdGggPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcnVuU3RvcEJ1dHRvbiA9IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgICAgICBydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKGluaXRpYWxUZXN0ID8gJ3BsYXliYWNrLXBsYXknIDogJ3N5bmMnLCAnYnRuLXByaW1hcnknKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuaXNEaXNhYmxlZCgpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrUnVufT5cbiAgICAgICAgICAgIHtpbml0aWFsVGVzdCA/ICdUZXN0JyA6ICdSZS1UZXN0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQXNzaWduIGB2YWx1ZWAgb25seSB3aGVuIG5lZWRlZCBzbyBhIG51bGwvdW5kZWZpbmVkIHZhbHVlIHdpbGwgc2hvdyBhbiBpbmRldGVybWluYXRlXG4gICAgLy8gcHJvZ3Jlc3MgYmFyLlxuICAgIGxldCBwcm9ncmVzc0F0dHJzOiA/e1trZXk6IHN0cmluZ106IG1peGVkfSA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5wcm9wcy5wcm9ncmVzc1ZhbHVlKSB7XG4gICAgICAvLyBga2V5YCBpcyBzZXQgdG8gZm9yY2UgUmVhY3QgdG8gdHJlYXQgdGhpcyBhcyBhIG5ldyBlbGVtZW50IHdoZW4gdGhlIGB2YWx1ZWAgYXR0ciBzaG91bGQgYmVcbiAgICAgIC8vIHJlbW92ZWQuIEN1cnJlbnRseSBpdCBqdXN0IHNldHMgYHZhbHVlPVwiMFwiYCwgd2hpY2ggaXMgc3R5bGVkIGRpZmZlcmVudGx5IGZyb20gbm8gYHZhbHVlYFxuICAgICAgLy8gYXR0ciBhdCBhbGwuXG4gICAgICAvLyBUT0RPOiBSZW1vdmUgdGhlIGBrZXlgIG9uY2UgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8xNDQ4IGlzIHJlc29sdmVkLlxuICAgICAgcHJvZ3Jlc3NBdHRycyA9IHtcbiAgICAgICAga2V5OiAxLFxuICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5wcm9ncmVzc1ZhbHVlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgcnVuTXNnO1xuICAgIGlmICh0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklORykge1xuICAgICAgcnVuTXNnID0gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5SdW5uaW5nPC9zcGFuPlxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucnVuRHVyYXRpb24pIHtcbiAgICAgIHJ1bk1zZyA9IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+RG9uZSAoaW4ge3RoaXMucHJvcHMucnVuRHVyYXRpb24gLyAxMDAwfXMpPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgcGF0aE1zZztcbiAgICBpZiAodGhpcy5wcm9wcy5wYXRoKSB7XG4gICAgICBwYXRoTXNnID0gPHNwYW4gdGl0bGU9e3RoaXMucHJvcHMucGF0aH0+e3BhdGguYmFzZW5hbWUodGhpcy5wcm9wcy5wYXRoKX08L3NwYW4+O1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bjtcbiAgICBpZiAodGhpcy5pc0Rpc2FibGVkKCkpIHtcbiAgICAgIGRyb3Bkb3duID0gPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIHRleHQtd2FybmluZ1wiPk5vIHJlZ2lzdGVyZWQgdGVzdCBydW5uZXJzPC9zcGFuPjtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJvcGRvd24gPSAoXG4gICAgICAgIDxEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBudWNsaWRlLXRlc3QtcnVubmVyX19ydW5uZXItZHJvcGRvd25cIlxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgICBtZW51SXRlbXM9e3RoaXMucHJvcHMudGVzdFJ1bm5lcnMubWFwKHRlc3RSdW5uZXIgPT5cbiAgICAgICAgICAgICh7bGFiZWw6IHRlc3RSdW5uZXIubGFiZWwsIHZhbHVlOiB0ZXN0UnVubmVyLmxhYmVsfSlcbiAgICAgICAgICApfVxuICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXh9XG4gICAgICAgICAgcmVmPVwiZHJvcGRvd25cIlxuICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRUZXN0UnVubmVySW5kZXh9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICB0aXRsZT1cIkNob29zZSBhIHRlc3QgcnVubmVyXCJcbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lbENvbXBvbmVudCBkb2NrPVwiYm90dG9tXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1wYW5lbFwiPlxuICAgICAgICAgIDxUb29sYmFyIGxvY2F0aW9uPVwidG9wXCI+XG4gICAgICAgICAgICA8VG9vbGJhckxlZnQ+XG4gICAgICAgICAgICAgIHtkcm9wZG93bn1cbiAgICAgICAgICAgICAge3J1blN0b3BCdXR0b259XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXNtIGljb24gaWNvbi10cmFzaGNhbiBpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLmlzRGlzYWJsZWQoKSB8fFxuICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5leGVjdXRpb25TdGF0ZSA9PT0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrQ2xlYXJ9XG4gICAgICAgICAgICAgICAgdGl0bGU9XCJDbGVhciBPdXRwdXRcIj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIHtwYXRoTXNnfVxuICAgICAgICAgICAgPC9Ub29sYmFyTGVmdD5cbiAgICAgICAgICAgIDxUb29sYmFyUmlnaHQ+XG4gICAgICAgICAgICAgIHtydW5Nc2d9XG4gICAgICAgICAgICAgIDxwcm9ncmVzcyBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIiBtYXg9XCIxMDBcIiB7Li4ucHJvZ3Jlc3NBdHRyc30gLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja0Nsb3NlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tc20gaWNvbiBpY29uLXggaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIkNsb3NlIFBhbmVsXCI+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgICAgICAgPC9Ub29sYmFyPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1jb25zb2xlXCIgcmVmPVwicGFuZUNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIGlzRGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXgoc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4fSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZFRlc3RSdW5uZXIoKTogP09iamVjdCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChzZWxlY3RlZFRlc3RSdW5uZXJJbmRleCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy50ZXN0UnVubmVyc1tzZWxlY3RlZFRlc3RSdW5uZXJJbmRleF07XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyVHJlZSgpIHtcbiAgICB0aGlzLl90cmVlID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFRlc3RDbGFzc1RyZWVcbiAgICAgICAgaXNSdW5uaW5nPXt0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgdGVzdFN1aXRlTW9kZWw9e3RoaXMucHJvcHMudGVzdFN1aXRlTW9kZWx9XG4gICAgICAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9sZWZ0UGFuZSkucXVlcnlTZWxlY3RvcignLml0ZW0tdmlld3MnKVxuICAgICk7XG4gIH1cblxuICByZW5kZXJDb25zb2xlKCkge1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxDb25zb2xlIHRleHRCdWZmZXI9e3RoaXMucHJvcHMuYnVmZmVyfSAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9yaWdodFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJylcbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdFJ1bm5lclBhbmVsO1xuIl19