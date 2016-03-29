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

var _require = require('../../../nuclide-ui/lib/NuclideDropdown');

var NuclideDropdown = _require.NuclideDropdown;

var _require2 = require('../../../nuclide-ui/lib/PanelComponent');

var PanelComponent = _require2.PanelComponent;

var _require3 = require('../../../nuclide-atom-helpers');

var createPaneContainer = _require3.createPaneContainer;

var _require4 = require('react-for-atom');

var React = _require4.React;
var ReactDOM = _require4.ReactDOM;

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
    value: {
      RUNNING: 0,
      STOPPED: 1
    },
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
        dropdown = React.createElement(NuclideDropdown, {
          className: 'inline-block',
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
            'nav',
            { className: 'nuclide-test-runner-panel-toolbar block' },
            dropdown,
            runStopButton,
            React.createElement('button', {
              className: 'btn btn-subtle btn-sm icon icon-trashcan inline-block',
              disabled: this.isDisabled() || this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
              onClick: this.props.onClickClear,
              title: 'Clear Output' }),
            pathMsg,
            React.createElement(
              'div',
              { className: 'pull-right' },
              runMsg,
              React.createElement('progress', _extends({ className: 'inline-block', max: '100' }, progressAttrs)),
              React.createElement('button', {
                onClick: this.props.onClickClose,
                className: 'btn btn-subtle btn-sm icon icon-x inline-block',
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
//# sourceMappingURL=data:application/json;base64,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LEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUMxQixvQkFBQyxhQUFhO0FBQ1osaUJBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsS0FBSyxlQUFlLENBQUMsY0FBYyxDQUFDLE9BQU8sQUFBQztBQUNoRixzQkFBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxBQUFDO1FBQzFDLEVBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FDaEUsQ0FBQztLQUNIOzs7V0FFWSx5QkFBRztBQUNkLGNBQVEsQ0FBQyxNQUFNLENBQ2Isb0JBQUMsT0FBTyxJQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQUFBQyxHQUFHLEVBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQ2pFLENBQUM7S0FDSDs7O1NBL05HLGVBQWU7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFrTzdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IlRlc3RSdW5uZXJQYW5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuY29uc3QgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuY29uc3Qge051Y2xpZGVEcm9wZG93bn0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9OdWNsaWRlRHJvcGRvd24nKTtcbmNvbnN0IHtQYW5lbENvbXBvbmVudH0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9QYW5lbENvbXBvbmVudCcpO1xuY29uc3Qge2NyZWF0ZVBhbmVDb250YWluZXJ9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlID0gcmVxdWlyZSgnLi9UZXN0Q2xhc3NUcmVlJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBudW1iZXI7XG59O1xuXG5mdW5jdGlvbiBydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKGljb246IHN0cmluZywgY2xhc3NOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYGJ0biBidG4tc20gaWNvbiBpbmxpbmUtYmxvY2sgaWNvbi0ke2ljb259ICR7Y2xhc3NOYW1lfWA7XG59XG5cbmNsYXNzIFRlc3RSdW5uZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgX3BhbmVDb250YWluZXI6IE9iamVjdDtcbiAgX2xlZnRQYW5lOiBhdG9tJFBhbmU7XG4gIF9yaWdodFBhbmU6IGF0b20kUGFuZTtcbiAgX3RleHRFZGl0b3JNb2RlbDogVGV4dEVkaXRvcjtcbiAgX3RyZWU6IFRlc3RDbGFzc1RyZWU7XG5cbiAgLy8gQm91bmQgRnVuY3Rpb25zIGZvciB1c2UgYXMgY2FsbGJhY2tzLlxuICBzZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleDogRnVuY3Rpb247XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBidWZmZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBleGVjdXRpb25TdGF0ZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tDbGVhcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrQ2xvc2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGlja1J1bjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrU3RvcDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHByb2dyZXNzVmFsdWU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcnVuRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLy8gVE9ETzogU2hvdWxkIGJlIGBhcnJheU9mKFRlc3RSdW5uZXIpYCwgYnV0IHRoYXQgd291bGQgcmVxdWlyZSBhIHJlYWwgb2JqZWN0IHNpbmNlIHRoaXMgaXNcbiAgICAvLyBydW50aW1lIGNvZGUgZm9yIFJlYWN0LlxuICAgIHRlc3RSdW5uZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihPYmplY3QpLmlzUmVxdWlyZWQsXG4gICAgdGVzdFN1aXRlTW9kZWw6IFByb3BUeXBlcy5vYmplY3QsXG4gIH07XG5cbiAgc3RhdGljIEV4ZWN1dGlvblN0YXRlID0ge1xuICAgIFJVTk5JTkc6IDAsXG4gICAgU1RPUFBFRDogMSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICByb290czogW10sXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgdGVzdCBydW5uZXJzLCBzdGFydCB3aXRoIHRoZSBmaXJzdCBvbmUgc2VsZWN0ZWQuIE90aGVyd2lzZSBzdG9yZSAtMSB0b1xuICAgICAgLy8gbGF0ZXIgaW5kaWNhdGUgdGhlcmUgd2VyZSBubyBhY3RpdmUgdGVzdCBydW5uZXJzLlxuICAgICAgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IHByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDAgPyAwIDogLTEsXG4gICAgfTtcblxuICAgIC8vIEJpbmQgRnVuY3Rpb25zIGZvciB1c2UgYXMgY2FsbGJhY2tzO1xuICAgIC8vIFRPRE86IFJlcGxhY2Ugd2l0aCBwcm9wZXJ0eSBpbml0aWFsaXplcnMgd2hlbiBzdXBwb3J0ZWQgYnkgRmxvdztcbiAgICB0aGlzLnNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4ID0gdGhpcy5zZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fcGFuZUNvbnRhaW5lciA9IGNyZWF0ZVBhbmVDb250YWluZXIoKTtcbiAgICB0aGlzLl9sZWZ0UGFuZSA9IHRoaXMuX3BhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX3JpZ2h0UGFuZSA9IHRoaXMuX2xlZnRQYW5lLnNwbGl0UmlnaHQoe1xuICAgICAgLy8gUHJldmVudCBBdG9tIGZyb20gY2xvbmluZyBjaGlsZHJlbiBvbiBzcGxpdHRpbmc7IHRoaXMgcGFuZWwgd2FudHMgYW4gZW1wdHkgY29udGFpbmVyLlxuICAgICAgY29weUFjdGl2ZUl0ZW06IGZhbHNlLFxuICAgICAgLy8gTWFrZSB0aGUgcmlnaHQgcGFuZSAyLzMgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgc2luY2UgY29uc29sZSBvdXRwdXQgaXMgZ2VuZXJhbGx5IHdpZGVyXG4gICAgICAvLyB0aGFuIHRoZSB0ZXN0IHRyZWUuXG4gICAgICBmbGV4U2NhbGU6IDIsXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB0aGlzLnJlbmRlckNvbnNvbGUoKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKVxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KSB7XG4gICAgY29uc3QgY3VyclNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChjdXJyU2VsZWN0ZWRJbmRleCA9PT0gLTEgJiYgbmV4dFByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAwfSk7XG4gICAgfSBlbHNlIGlmIChuZXh0UHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwICYmIGN1cnJTZWxlY3RlZEluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAtMX0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcmlnaHRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpKTtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2xlZnRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpKTtcbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgcnVuU3RvcEJ1dHRvbjtcbiAgICBzd2l0Y2ggKHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUpIHtcbiAgICAgIGNhc2UgVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkc6XG4gICAgICAgIHJ1blN0b3BCdXR0b24gPSAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKCdwcmltaXRpdmUtc3F1YXJlJywgJ2J0bi1lcnJvcicpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrU3RvcH0+XG4gICAgICAgICAgICBTdG9wXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRDpcbiAgICAgICAgY29uc3QgaW5pdGlhbFRlc3QgPSB0aGlzLnByb3BzLnBhdGggPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcnVuU3RvcEJ1dHRvbiA9IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgICAgICBydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKGluaXRpYWxUZXN0ID8gJ3BsYXliYWNrLXBsYXknIDogJ3N5bmMnLCAnYnRuLXByaW1hcnknKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuaXNEaXNhYmxlZCgpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrUnVufT5cbiAgICAgICAgICAgIHtpbml0aWFsVGVzdCA/ICdUZXN0JyA6ICdSZS1UZXN0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQXNzaWduIGB2YWx1ZWAgb25seSB3aGVuIG5lZWRlZCBzbyBhIG51bGwvdW5kZWZpbmVkIHZhbHVlIHdpbGwgc2hvdyBhbiBpbmRldGVybWluYXRlXG4gICAgLy8gcHJvZ3Jlc3MgYmFyLlxuICAgIGxldCBwcm9ncmVzc0F0dHJzOiA/e1trZXk6IHN0cmluZ106IG1peGVkfSA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5wcm9wcy5wcm9ncmVzc1ZhbHVlKSB7XG4gICAgICAvLyBga2V5YCBpcyBzZXQgdG8gZm9yY2UgUmVhY3QgdG8gdHJlYXQgdGhpcyBhcyBhIG5ldyBlbGVtZW50IHdoZW4gdGhlIGB2YWx1ZWAgYXR0ciBzaG91bGQgYmVcbiAgICAgIC8vIHJlbW92ZWQuIEN1cnJlbnRseSBpdCBqdXN0IHNldHMgYHZhbHVlPVwiMFwiYCwgd2hpY2ggaXMgc3R5bGVkIGRpZmZlcmVudGx5IGZyb20gbm8gYHZhbHVlYFxuICAgICAgLy8gYXR0ciBhdCBhbGwuXG4gICAgICAvLyBUT0RPOiBSZW1vdmUgdGhlIGBrZXlgIG9uY2UgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8xNDQ4IGlzIHJlc29sdmVkLlxuICAgICAgcHJvZ3Jlc3NBdHRycyA9IHtcbiAgICAgICAga2V5OiAxLFxuICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5wcm9ncmVzc1ZhbHVlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgcnVuTXNnO1xuICAgIGlmICh0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklORykge1xuICAgICAgcnVuTXNnID0gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5SdW5uaW5nPC9zcGFuPlxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucnVuRHVyYXRpb24pIHtcbiAgICAgIHJ1bk1zZyA9IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+RG9uZSAoaW4ge3RoaXMucHJvcHMucnVuRHVyYXRpb24gLyAxMDAwfXMpPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgcGF0aE1zZztcbiAgICBpZiAodGhpcy5wcm9wcy5wYXRoKSB7XG4gICAgICBwYXRoTXNnID0gPHNwYW4gdGl0bGU9e3RoaXMucHJvcHMucGF0aH0+e3BhdGguYmFzZW5hbWUodGhpcy5wcm9wcy5wYXRoKX08L3NwYW4+O1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bjtcbiAgICBpZiAodGhpcy5pc0Rpc2FibGVkKCkpIHtcbiAgICAgIGRyb3Bkb3duID0gPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIHRleHQtd2FybmluZ1wiPk5vIHJlZ2lzdGVyZWQgdGVzdCBydW5uZXJzPC9zcGFuPjtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJvcGRvd24gPSAoXG4gICAgICAgIDxOdWNsaWRlRHJvcGRvd25cbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgICBtZW51SXRlbXM9e3RoaXMucHJvcHMudGVzdFJ1bm5lcnMubWFwKHRlc3RSdW5uZXIgPT5cbiAgICAgICAgICAgICh7bGFiZWw6IHRlc3RSdW5uZXIubGFiZWwsIHZhbHVlOiB0ZXN0UnVubmVyLmxhYmVsfSlcbiAgICAgICAgICApfVxuICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXh9XG4gICAgICAgICAgcmVmPVwiZHJvcGRvd25cIlxuICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRUZXN0UnVubmVySW5kZXh9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICB0aXRsZT1cIkNob29zZSBhIHRlc3QgcnVubmVyXCJcbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lbENvbXBvbmVudCBkb2NrPVwiYm90dG9tXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1wYW5lbFwiPlxuICAgICAgICAgIDxuYXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1wYW5lbC10b29sYmFyIGJsb2NrXCI+XG4gICAgICAgICAgICB7ZHJvcGRvd259XG4gICAgICAgICAgICB7cnVuU3RvcEJ1dHRvbn1cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zdWJ0bGUgYnRuLXNtIGljb24gaWNvbi10cmFzaGNhbiBpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5pc0Rpc2FibGVkKCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrQ2xlYXJ9XG4gICAgICAgICAgICAgIHRpdGxlPVwiQ2xlYXIgT3V0cHV0XCI+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIHtwYXRoTXNnfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgICAgIHtydW5Nc2d9XG4gICAgICAgICAgICAgIDxwcm9ncmVzcyBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIiBtYXg9XCIxMDBcIiB7Li4ucHJvZ3Jlc3NBdHRyc30gLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja0Nsb3NlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tc3VidGxlIGJ0bi1zbSBpY29uIGljb24teCBpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiQ2xvc2UgUGFuZWxcIj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L25hdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdGVzdC1ydW5uZXItY29uc29sZVwiIHJlZj1cInBhbmVDb250YWluZXJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsQ29tcG9uZW50PlxuICAgICk7XG4gIH1cblxuICBpc0Rpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4KHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFRlc3RSdW5uZXJJbmRleH0pO1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRUZXN0UnVubmVyKCk6ID9PYmplY3Qge1xuICAgIGNvbnN0IHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFRlc3RSdW5uZXJJbmRleDtcbiAgICBpZiAoc2VsZWN0ZWRUZXN0UnVubmVySW5kZXggPj0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMudGVzdFJ1bm5lcnNbc2VsZWN0ZWRUZXN0UnVubmVySW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlclRyZWUoKSB7XG4gICAgdGhpcy5fdHJlZSA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxUZXN0Q2xhc3NUcmVlXG4gICAgICAgIGlzUnVubmluZz17dGhpcy5wcm9wcy5leGVjdXRpb25TdGF0ZSA9PT0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkd9XG4gICAgICAgIHRlc3RTdWl0ZU1vZGVsPXt0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsfVxuICAgICAgLz4sXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fbGVmdFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJylcbiAgICApO1xuICB9XG5cbiAgcmVuZGVyQ29uc29sZSgpIHtcbiAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8Q29uc29sZSB0ZXh0QnVmZmVyPXt0aGlzLnByb3BzLmJ1ZmZlcn0gLz4sXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcmlnaHRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpXG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RSdW5uZXJQYW5lbDtcbiJdfQ==