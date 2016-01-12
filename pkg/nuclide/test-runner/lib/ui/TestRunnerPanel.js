var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Console = require('./Console');
var NuclideUiDropdown = require('../../../ui/dropdown');

var _require = require('../../../ui/panel');

var PanelComponent = _require.PanelComponent;

var _require2 = require('../../../atom-helpers');

var createPaneContainer = _require2.createPaneContainer;

var React = require('react-for-atom');
var TestClassTree = require('./TestClassTree');

var pathUtil = require('path');

var PropTypes = React.PropTypes;

function runStopButtonClassName(icon, className) {
  return 'btn btn-sm icon inline-block icon-' + icon + ' ' + className;
}

var TestRunnerPanel = (function (_React$Component) {
  _inherits(TestRunnerPanel, _React$Component);

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

      React.findDOMNode(this.refs['paneContainer']).appendChild(atom.views.getView(this._paneContainer));
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
      React.unmountComponentAtNode(atom.views.getView(this._rightPane).querySelector('.item-views'));
      React.unmountComponentAtNode(atom.views.getView(this._leftPane).querySelector('.item-views'));
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
          pathUtil.basename(this.props.path)
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
        dropdown = React.createElement(NuclideUiDropdown, {
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
      this._tree = React.render(React.createElement(TestClassTree, {
        isRunning: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
        testSuiteModel: this.props.testSuiteModel
      }), atom.views.getView(this._leftPane).querySelector('.item-views'));
    }
  }, {
    key: 'renderConsole',
    value: function renderConsole() {
      React.render(React.createElement(Console, { textBuffer: this.props.buffer }), atom.views.getView(this._rightPane).querySelector('.item-views'));
    }
  }]);

  return TestRunnerPanel;
})(React.Component);

TestRunnerPanel.propTypes = {
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
};

TestRunnerPanel.ExecutionState = {
  RUNNING: 0,
  STOPPED: 1
};

module.exports = TestRunnerPanel;

// Bound Functions for use as callbacks.
//# sourceMappingURL=data:application/json;base64,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QUMsU0FBUyxHQUFHO0FBQzFCLFFBQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDbkMsZ0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDM0MsY0FBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUN2QyxjQUFZLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3ZDLFlBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDckMsYUFBVyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUN0QyxNQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDdEIsZUFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQy9CLGFBQVcsRUFBRSxTQUFTLENBQUMsTUFBTTs7O0FBRzdCLGFBQVcsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVU7QUFDakQsZ0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTTtDQUNqQyxDQUFDOztBQUVGLGVBQWUsQ0FBQyxjQUFjLEdBQUc7QUFDL0IsU0FBTyxFQUFFLENBQUM7QUFDVixTQUFPLEVBQUUsQ0FBQztDQUNYLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiVGVzdFJ1bm5lclBhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuY29uc3QgTnVjbGlkZVVpRHJvcGRvd24gPSByZXF1aXJlKCcuLi8uLi8uLi91aS9kcm9wZG93bicpO1xuY29uc3Qge1BhbmVsQ29tcG9uZW50fSA9IHJlcXVpcmUoJy4uLy4uLy4uL3VpL3BhbmVsJyk7XG5jb25zdCB7Y3JlYXRlUGFuZUNvbnRhaW5lcn0gPSByZXF1aXJlKCcuLi8uLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IFRlc3RDbGFzc1RyZWUgPSByZXF1aXJlKCcuL1Rlc3RDbGFzc1RyZWUnKTtcblxuY29uc3QgcGF0aFV0aWwgPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmZ1bmN0aW9uIHJ1blN0b3BCdXR0b25DbGFzc05hbWUoaWNvbjogc3RyaW5nLCBjbGFzc05hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgYnRuIGJ0bi1zbSBpY29uIGlubGluZS1ibG9jayBpY29uLSR7aWNvbn0gJHtjbGFzc05hbWV9YDtcbn1cblxuY2xhc3MgVGVzdFJ1bm5lclBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBfcGFuZUNvbnRhaW5lcjogT2JqZWN0O1xuICBfbGVmdFBhbmU6IGF0b20kUGFuZTtcbiAgX3JpZ2h0UGFuZTogYXRvbSRQYW5lO1xuICBfdGV4dEVkaXRvck1vZGVsOiBUZXh0RWRpdG9yO1xuICBfdHJlZTogVGVzdENsYXNzVHJlZTtcblxuICAvLyBCb3VuZCBGdW5jdGlvbnMgZm9yIHVzZSBhcyBjYWxsYmFja3MuXG4gIHNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICByb290czogW10sXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgdGVzdCBydW5uZXJzLCBzdGFydCB3aXRoIHRoZSBmaXJzdCBvbmUgc2VsZWN0ZWQuIE90aGVyd2lzZSBzdG9yZSAtMSB0b1xuICAgICAgLy8gbGF0ZXIgaW5kaWNhdGUgdGhlcmUgd2VyZSBubyBhY3RpdmUgdGVzdCBydW5uZXJzLlxuICAgICAgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IHByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDAgPyAwIDogLTEsXG4gICAgfTtcblxuICAgIC8vIEJpbmQgRnVuY3Rpb25zIGZvciB1c2UgYXMgY2FsbGJhY2tzO1xuICAgIC8vIFRPRE86IFJlcGxhY2Ugd2l0aCBwcm9wZXJ0eSBpbml0aWFsaXplcnMgd2hlbiBzdXBwb3J0ZWQgYnkgRmxvdztcbiAgICB0aGlzLnNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4ID0gdGhpcy5zZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fcGFuZUNvbnRhaW5lciA9IGNyZWF0ZVBhbmVDb250YWluZXIoKTtcbiAgICB0aGlzLl9sZWZ0UGFuZSA9IHRoaXMuX3BhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX3JpZ2h0UGFuZSA9IHRoaXMuX2xlZnRQYW5lLnNwbGl0UmlnaHQoe1xuICAgICAgLy8gUHJldmVudCBBdG9tIGZyb20gY2xvbmluZyBjaGlsZHJlbiBvbiBzcGxpdHRpbmc7IHRoaXMgcGFuZWwgd2FudHMgYW4gZW1wdHkgY29udGFpbmVyLlxuICAgICAgY29weUFjdGl2ZUl0ZW06IGZhbHNlLFxuICAgICAgLy8gTWFrZSB0aGUgcmlnaHQgcGFuZSAyLzMgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgc2luY2UgY29uc29sZSBvdXRwdXQgaXMgZ2VuZXJhbGx5IHdpZGVyXG4gICAgICAvLyB0aGFuIHRoZSB0ZXN0IHRyZWUuXG4gICAgICBmbGV4U2NhbGU6IDIsXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB0aGlzLnJlbmRlckNvbnNvbGUoKTtcblxuICAgIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKVxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KSB7XG4gICAgY29uc3QgY3VyclNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChjdXJyU2VsZWN0ZWRJbmRleCA9PT0gLTEgJiYgbmV4dFByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAwfSk7XG4gICAgfSBlbHNlIGlmIChuZXh0UHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwICYmIGN1cnJTZWxlY3RlZEluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiAtMX0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUoYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX3JpZ2h0UGFuZSkucXVlcnlTZWxlY3RvcignLml0ZW0tdmlld3MnKSk7XG4gICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fbGVmdFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJykpO1xuICAgIHRoaXMuX3BhbmVDb250YWluZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBydW5TdG9wQnV0dG9uO1xuICAgIHN3aXRjaCAodGhpcy5wcm9wcy5leGVjdXRpb25TdGF0ZSkge1xuICAgICAgY2FzZSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklORzpcbiAgICAgICAgcnVuU3RvcEJ1dHRvbiA9IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e3J1blN0b3BCdXR0b25DbGFzc05hbWUoJ3ByaW1pdGl2ZS1zcXVhcmUnLCAnYnRuLWVycm9yJyl9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tTdG9wfT5cbiAgICAgICAgICAgIFN0b3BcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEOlxuICAgICAgICBjb25zdCBpbml0aWFsVGVzdCA9IHRoaXMucHJvcHMucGF0aCA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBydW5TdG9wQnV0dG9uID0gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT17XG4gICAgICAgICAgICAgIHJ1blN0b3BCdXR0b25DbGFzc05hbWUoaW5pdGlhbFRlc3QgPyAncGxheWJhY2stcGxheScgOiAnc3luYycsICdidG4tcHJpbWFyeScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5pc0Rpc2FibGVkKCl9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tSdW59PlxuICAgICAgICAgICAge2luaXRpYWxUZXN0ID8gJ1Rlc3QnIDogJ1JlLVRlc3QnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBBc3NpZ24gYHZhbHVlYCBvbmx5IHdoZW4gbmVlZGVkIHNvIGEgbnVsbC91bmRlZmluZWQgdmFsdWUgd2lsbCBzaG93IGFuIGluZGV0ZXJtaW5hdGVcbiAgICAvLyBwcm9ncmVzcyBiYXIuXG4gICAgbGV0IHByb2dyZXNzQXR0cnM6ID97W2tleTogc3RyaW5nXTogbWl4ZWR9ID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLnByb3BzLnByb2dyZXNzVmFsdWUpIHtcbiAgICAgIC8vIGBrZXlgIGlzIHNldCB0byBmb3JjZSBSZWFjdCB0byB0cmVhdCB0aGlzIGFzIGEgbmV3IGVsZW1lbnQgd2hlbiB0aGUgYHZhbHVlYCBhdHRyIHNob3VsZCBiZVxuICAgICAgLy8gcmVtb3ZlZC4gQ3VycmVudGx5IGl0IGp1c3Qgc2V0cyBgdmFsdWU9XCIwXCJgLCB3aGljaCBpcyBzdHlsZWQgZGlmZmVyZW50bHkgZnJvbSBubyBgdmFsdWVgXG4gICAgICAvLyBhdHRyIGF0IGFsbC5cbiAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGUgYGtleWAgb25jZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvaXNzdWVzLzE0NDggaXMgcmVzb2x2ZWQuXG4gICAgICBwcm9ncmVzc0F0dHJzID0ge1xuICAgICAgICBrZXk6IDEsXG4gICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnByb2dyZXNzVmFsdWUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGxldCBydW5Nc2c7XG4gICAgaWYgKHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HKSB7XG4gICAgICBydW5Nc2cgPSAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlJ1bm5pbmc8L3NwYW4+XG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5ydW5EdXJhdGlvbikge1xuICAgICAgcnVuTXNnID0gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5Eb25lIChpbiB7dGhpcy5wcm9wcy5ydW5EdXJhdGlvbiAvIDEwMDB9cyk8L3NwYW4+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBwYXRoTXNnO1xuICAgIGlmICh0aGlzLnByb3BzLnBhdGgpIHtcbiAgICAgIHBhdGhNc2cgPSA8c3BhbiB0aXRsZT17dGhpcy5wcm9wcy5wYXRofT57cGF0aFV0aWwuYmFzZW5hbWUodGhpcy5wcm9wcy5wYXRoKX08L3NwYW4+O1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bjtcbiAgICBpZiAodGhpcy5pc0Rpc2FibGVkKCkpIHtcbiAgICAgIGRyb3Bkb3duID0gPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIHRleHQtd2FybmluZ1wiPk5vIHJlZ2lzdGVyZWQgdGVzdCBydW5uZXJzPC9zcGFuPjtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJvcGRvd24gPSAoXG4gICAgICAgIDxOdWNsaWRlVWlEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HfVxuICAgICAgICAgIG1lbnVJdGVtcz17dGhpcy5wcm9wcy50ZXN0UnVubmVycy5tYXAodGVzdFJ1bm5lciA9PlxuICAgICAgICAgICAgKHtsYWJlbDogdGVzdFJ1bm5lci5sYWJlbCwgdmFsdWU6IHRlc3RSdW5uZXIubGFiZWx9KVxuICAgICAgICAgICl9XG4gICAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5zZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleH1cbiAgICAgICAgICByZWY9XCJkcm9wZG93blwiXG4gICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5zZWxlY3RlZFRlc3RSdW5uZXJJbmRleH1cbiAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIHRpdGxlPVwiQ2hvb3NlIGEgdGVzdCBydW5uZXJcIlxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFBhbmVsQ29tcG9uZW50IGRvY2s9XCJib3R0b21cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRlc3QtcnVubmVyLXBhbmVsXCI+XG4gICAgICAgICAgPG5hdiBjbGFzc05hbWU9XCJudWNsaWRlLXRlc3QtcnVubmVyLXBhbmVsLXRvb2xiYXIgYmxvY2tcIj5cbiAgICAgICAgICAgIHtkcm9wZG93bn1cbiAgICAgICAgICAgIHtydW5TdG9wQnV0dG9ufVxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXN1YnRsZSBidG4tc20gaWNvbiBpY29uLXRyYXNoY2FuIGlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLmlzRGlzYWJsZWQoKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tDbGVhcn1cbiAgICAgICAgICAgICAgdGl0bGU9XCJDbGVhciBPdXRwdXRcIj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAge3BhdGhNc2d9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAge3J1bk1zZ31cbiAgICAgICAgICAgICAgPHByb2dyZXNzIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiIG1heD1cIjEwMFwiIHsuLi5wcm9ncmVzc0F0dHJzfSAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrQ2xvc2V9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zdWJ0bGUgYnRuLXNtIGljb24gaWNvbi14IGlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJDbG9zZSBQYW5lbFwiPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbmF2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1jb25zb2xlXCIgcmVmPVwicGFuZUNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIGlzRGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXgoc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4fSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZFRlc3RSdW5uZXIoKTogP09iamVjdCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChzZWxlY3RlZFRlc3RSdW5uZXJJbmRleCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy50ZXN0UnVubmVyc1tzZWxlY3RlZFRlc3RSdW5uZXJJbmRleF07XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyVHJlZSgpIHtcbiAgICB0aGlzLl90cmVlID0gUmVhY3QucmVuZGVyKFxuICAgICAgPFRlc3RDbGFzc1RyZWVcbiAgICAgICAgaXNSdW5uaW5nPXt0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgdGVzdFN1aXRlTW9kZWw9e3RoaXMucHJvcHMudGVzdFN1aXRlTW9kZWx9XG4gICAgICAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9sZWZ0UGFuZSkucXVlcnlTZWxlY3RvcignLml0ZW0tdmlld3MnKVxuICAgICk7XG4gIH1cblxuICByZW5kZXJDb25zb2xlKCkge1xuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIDxDb25zb2xlIHRleHRCdWZmZXI9e3RoaXMucHJvcHMuYnVmZmVyfSAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9yaWdodFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJylcbiAgICApO1xuICB9XG5cbn1cblxuVGVzdFJ1bm5lclBhbmVsLnByb3BUeXBlcyA9IHtcbiAgYnVmZmVyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIGV4ZWN1dGlvblN0YXRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIG9uQ2xpY2tDbGVhcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25DbGlja0Nsb3NlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBvbkNsaWNrUnVuOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBvbkNsaWNrU3RvcDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgcGF0aDogUHJvcFR5cGVzLnN0cmluZyxcbiAgcHJvZ3Jlc3NWYWx1ZTogUHJvcFR5cGVzLm51bWJlcixcbiAgcnVuRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIFRPRE86IFNob3VsZCBiZSBgYXJyYXlPZihUZXN0UnVubmVyKWAsIGJ1dCB0aGF0IHdvdWxkIHJlcXVpcmUgYSByZWFsIG9iamVjdCBzaW5jZSB0aGlzIGlzXG4gIC8vIHJ1bnRpbWUgY29kZSBmb3IgUmVhY3QuXG4gIHRlc3RSdW5uZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihPYmplY3QpLmlzUmVxdWlyZWQsXG4gIHRlc3RTdWl0ZU1vZGVsOiBQcm9wVHlwZXMub2JqZWN0LFxufTtcblxuVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlID0ge1xuICBSVU5OSU5HOiAwLFxuICBTVE9QUEVEOiAxLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0UnVubmVyUGFuZWw7XG4iXX0=