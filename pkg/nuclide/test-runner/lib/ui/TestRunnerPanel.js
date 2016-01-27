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

var _require3 = require('react-for-atom');

var React = _require3.React;

var TestClassTree = require('./TestClassTree');

var pathUtil = require('path');

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

module.exports = TestRunnerPanel;

// Bound Functions for use as callbacks.
//# sourceMappingURL=data:application/json;base64,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QUNYLFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FDdkIsb0JBQUMsYUFBYTtBQUNaLGlCQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssZUFBZSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEFBQUM7QUFDaEYsc0JBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQUFBQztRQUMxQyxFQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQ2hFLENBQUM7S0FDSDs7O1dBRVkseUJBQUc7QUFDZCxXQUFLLENBQUMsTUFBTSxDQUNWLG9CQUFDLE9BQU8sSUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEFBQUMsR0FBRyxFQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUNqRSxDQUFDO0tBQ0g7OztTQTVORyxlQUFlO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBK043QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJUZXN0UnVubmVyUGFuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5jb25zdCBOdWNsaWRlVWlEcm9wZG93biA9IHJlcXVpcmUoJy4uLy4uLy4uL3VpL2Ryb3Bkb3duJyk7XG5jb25zdCB7UGFuZWxDb21wb25lbnR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvcGFuZWwnKTtcbmNvbnN0IHtjcmVhdGVQYW5lQ29udGFpbmVyfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2F0b20taGVscGVycycpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlID0gcmVxdWlyZSgnLi9UZXN0Q2xhc3NUcmVlJyk7XG5cbmNvbnN0IHBhdGhVdGlsID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5mdW5jdGlvbiBydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKGljb246IHN0cmluZywgY2xhc3NOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYGJ0biBidG4tc20gaWNvbiBpbmxpbmUtYmxvY2sgaWNvbi0ke2ljb259ICR7Y2xhc3NOYW1lfWA7XG59XG5cbmNsYXNzIFRlc3RSdW5uZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9wYW5lQ29udGFpbmVyOiBPYmplY3Q7XG4gIF9sZWZ0UGFuZTogYXRvbSRQYW5lO1xuICBfcmlnaHRQYW5lOiBhdG9tJFBhbmU7XG4gIF90ZXh0RWRpdG9yTW9kZWw6IFRleHRFZGl0b3I7XG4gIF90cmVlOiBUZXN0Q2xhc3NUcmVlO1xuXG4gIC8vIEJvdW5kIEZ1bmN0aW9ucyBmb3IgdXNlIGFzIGNhbGxiYWNrcy5cbiAgc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IEZ1bmN0aW9uO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgYnVmZmVyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgZXhlY3V0aW9uU3RhdGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrQ2xlYXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGlja0Nsb3NlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tSdW46IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGlja1N0b3A6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgcGF0aDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwcm9ncmVzc1ZhbHVlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHJ1bkR1cmF0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIC8vIFRPRE86IFNob3VsZCBiZSBgYXJyYXlPZihUZXN0UnVubmVyKWAsIGJ1dCB0aGF0IHdvdWxkIHJlcXVpcmUgYSByZWFsIG9iamVjdCBzaW5jZSB0aGlzIGlzXG4gICAgLy8gcnVudGltZSBjb2RlIGZvciBSZWFjdC5cbiAgICB0ZXN0UnVubmVyczogUHJvcFR5cGVzLmFycmF5T2YoT2JqZWN0KS5pc1JlcXVpcmVkLFxuICAgIHRlc3RTdWl0ZU1vZGVsOiBQcm9wVHlwZXMub2JqZWN0LFxuICB9O1xuXG4gIHN0YXRpYyBFeGVjdXRpb25TdGF0ZSA9IHtcbiAgICBSVU5OSU5HOiAwLFxuICAgIFNUT1BQRUQ6IDEsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcm9vdHM6IFtdLFxuICAgICAgLy8gSWYgdGhlcmUgYXJlIHRlc3QgcnVubmVycywgc3RhcnQgd2l0aCB0aGUgZmlyc3Qgb25lIHNlbGVjdGVkLiBPdGhlcndpc2Ugc3RvcmUgLTEgdG9cbiAgICAgIC8vIGxhdGVyIGluZGljYXRlIHRoZXJlIHdlcmUgbm8gYWN0aXZlIHRlc3QgcnVubmVycy5cbiAgICAgIHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBwcm9wcy50ZXN0UnVubmVycy5sZW5ndGggPiAwID8gMCA6IC0xLFxuICAgIH07XG5cbiAgICAvLyBCaW5kIEZ1bmN0aW9ucyBmb3IgdXNlIGFzIGNhbGxiYWNrcztcbiAgICAvLyBUT0RPOiBSZXBsYWNlIHdpdGggcHJvcGVydHkgaW5pdGlhbGl6ZXJzIHdoZW4gc3VwcG9ydGVkIGJ5IEZsb3c7XG4gICAgdGhpcy5zZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleCA9IHRoaXMuc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXguYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuX3BhbmVDb250YWluZXIgPSBjcmVhdGVQYW5lQ29udGFpbmVyKCk7XG4gICAgdGhpcy5fbGVmdFBhbmUgPSB0aGlzLl9wYW5lQ29udGFpbmVyLmdldEFjdGl2ZVBhbmUoKTtcbiAgICB0aGlzLl9yaWdodFBhbmUgPSB0aGlzLl9sZWZ0UGFuZS5zcGxpdFJpZ2h0KHtcbiAgICAgIC8vIFByZXZlbnQgQXRvbSBmcm9tIGNsb25pbmcgY2hpbGRyZW4gb24gc3BsaXR0aW5nOyB0aGlzIHBhbmVsIHdhbnRzIGFuIGVtcHR5IGNvbnRhaW5lci5cbiAgICAgIGNvcHlBY3RpdmVJdGVtOiBmYWxzZSxcbiAgICAgIC8vIE1ha2UgdGhlIHJpZ2h0IHBhbmUgMi8zIHRoZSB3aWR0aCBvZiB0aGUgcGFyZW50IHNpbmNlIGNvbnNvbGUgb3V0cHV0IGlzIGdlbmVyYWxseSB3aWRlclxuICAgICAgLy8gdGhhbiB0aGUgdGVzdCB0cmVlLlxuICAgICAgZmxleFNjYWxlOiAyLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gICAgdGhpcy5yZW5kZXJDb25zb2xlKCk7XG5cbiAgICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3BhbmVDb250YWluZXInXSkuYXBwZW5kQ2hpbGQoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcGFuZUNvbnRhaW5lcilcbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IE9iamVjdCkge1xuICAgIGNvbnN0IGN1cnJTZWxlY3RlZEluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFRlc3RSdW5uZXJJbmRleDtcbiAgICBpZiAoY3VyclNlbGVjdGVkSW5kZXggPT09IC0xICYmIG5leHRQcm9wcy50ZXN0UnVubmVycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFRlc3RSdW5uZXJJbmRleDogMH0pO1xuICAgIH0gZWxzZSBpZiAobmV4dFByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA9PT0gMCAmJiBjdXJyU2VsZWN0ZWRJbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFRlc3RSdW5uZXJJbmRleDogLTF9KTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9yaWdodFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJykpO1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUoYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2xlZnRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpKTtcbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgcnVuU3RvcEJ1dHRvbjtcbiAgICBzd2l0Y2ggKHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUpIHtcbiAgICAgIGNhc2UgVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkc6XG4gICAgICAgIHJ1blN0b3BCdXR0b24gPSAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKCdwcmltaXRpdmUtc3F1YXJlJywgJ2J0bi1lcnJvcicpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrU3RvcH0+XG4gICAgICAgICAgICBTdG9wXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuU1RPUFBFRDpcbiAgICAgICAgY29uc3QgaW5pdGlhbFRlc3QgPSB0aGlzLnByb3BzLnBhdGggPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcnVuU3RvcEJ1dHRvbiA9IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgICAgICBydW5TdG9wQnV0dG9uQ2xhc3NOYW1lKGluaXRpYWxUZXN0ID8gJ3BsYXliYWNrLXBsYXknIDogJ3N5bmMnLCAnYnRuLXByaW1hcnknKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuaXNEaXNhYmxlZCgpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrUnVufT5cbiAgICAgICAgICAgIHtpbml0aWFsVGVzdCA/ICdUZXN0JyA6ICdSZS1UZXN0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQXNzaWduIGB2YWx1ZWAgb25seSB3aGVuIG5lZWRlZCBzbyBhIG51bGwvdW5kZWZpbmVkIHZhbHVlIHdpbGwgc2hvdyBhbiBpbmRldGVybWluYXRlXG4gICAgLy8gcHJvZ3Jlc3MgYmFyLlxuICAgIGxldCBwcm9ncmVzc0F0dHJzOiA/e1trZXk6IHN0cmluZ106IG1peGVkfSA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5wcm9wcy5wcm9ncmVzc1ZhbHVlKSB7XG4gICAgICAvLyBga2V5YCBpcyBzZXQgdG8gZm9yY2UgUmVhY3QgdG8gdHJlYXQgdGhpcyBhcyBhIG5ldyBlbGVtZW50IHdoZW4gdGhlIGB2YWx1ZWAgYXR0ciBzaG91bGQgYmVcbiAgICAgIC8vIHJlbW92ZWQuIEN1cnJlbnRseSBpdCBqdXN0IHNldHMgYHZhbHVlPVwiMFwiYCwgd2hpY2ggaXMgc3R5bGVkIGRpZmZlcmVudGx5IGZyb20gbm8gYHZhbHVlYFxuICAgICAgLy8gYXR0ciBhdCBhbGwuXG4gICAgICAvLyBUT0RPOiBSZW1vdmUgdGhlIGBrZXlgIG9uY2UgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8xNDQ4IGlzIHJlc29sdmVkLlxuICAgICAgcHJvZ3Jlc3NBdHRycyA9IHtcbiAgICAgICAga2V5OiAxLFxuICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5wcm9ncmVzc1ZhbHVlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgcnVuTXNnO1xuICAgIGlmICh0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklORykge1xuICAgICAgcnVuTXNnID0gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5SdW5uaW5nPC9zcGFuPlxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucnVuRHVyYXRpb24pIHtcbiAgICAgIHJ1bk1zZyA9IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+RG9uZSAoaW4ge3RoaXMucHJvcHMucnVuRHVyYXRpb24gLyAxMDAwfXMpPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgcGF0aE1zZztcbiAgICBpZiAodGhpcy5wcm9wcy5wYXRoKSB7XG4gICAgICBwYXRoTXNnID0gPHNwYW4gdGl0bGU9e3RoaXMucHJvcHMucGF0aH0+e3BhdGhVdGlsLmJhc2VuYW1lKHRoaXMucHJvcHMucGF0aCl9PC9zcGFuPjtcbiAgICB9XG5cbiAgICBsZXQgZHJvcGRvd247XG4gICAgaWYgKHRoaXMuaXNEaXNhYmxlZCgpKSB7XG4gICAgICBkcm9wZG93biA9IDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayB0ZXh0LXdhcm5pbmdcIj5ObyByZWdpc3RlcmVkIHRlc3QgcnVubmVyczwvc3Bhbj47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyb3Bkb3duID0gKFxuICAgICAgICA8TnVjbGlkZVVpRHJvcGRvd25cbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgICBtZW51SXRlbXM9e3RoaXMucHJvcHMudGVzdFJ1bm5lcnMubWFwKHRlc3RSdW5uZXIgPT5cbiAgICAgICAgICAgICh7bGFiZWw6IHRlc3RSdW5uZXIubGFiZWwsIHZhbHVlOiB0ZXN0UnVubmVyLmxhYmVsfSlcbiAgICAgICAgICApfVxuICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXh9XG4gICAgICAgICAgcmVmPVwiZHJvcGRvd25cIlxuICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRUZXN0UnVubmVySW5kZXh9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICB0aXRsZT1cIkNob29zZSBhIHRlc3QgcnVubmVyXCJcbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lbENvbXBvbmVudCBkb2NrPVwiYm90dG9tXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1wYW5lbFwiPlxuICAgICAgICAgIDxuYXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1wYW5lbC10b29sYmFyIGJsb2NrXCI+XG4gICAgICAgICAgICB7ZHJvcGRvd259XG4gICAgICAgICAgICB7cnVuU3RvcEJ1dHRvbn1cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zdWJ0bGUgYnRuLXNtIGljb24gaWNvbi10cmFzaGNhbiBpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5pc0Rpc2FibGVkKCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrQ2xlYXJ9XG4gICAgICAgICAgICAgIHRpdGxlPVwiQ2xlYXIgT3V0cHV0XCI+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIHtwYXRoTXNnfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgICAgIHtydW5Nc2d9XG4gICAgICAgICAgICAgIDxwcm9ncmVzcyBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIiBtYXg9XCIxMDBcIiB7Li4ucHJvZ3Jlc3NBdHRyc30gLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja0Nsb3NlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tc3VidGxlIGJ0bi1zbSBpY29uIGljb24teCBpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiQ2xvc2UgUGFuZWxcIj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L25hdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdGVzdC1ydW5uZXItY29uc29sZVwiIHJlZj1cInBhbmVDb250YWluZXJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsQ29tcG9uZW50PlxuICAgICk7XG4gIH1cblxuICBpc0Rpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnRlc3RSdW5uZXJzLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4KHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFRlc3RSdW5uZXJJbmRleH0pO1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRUZXN0UnVubmVyKCk6ID9PYmplY3Qge1xuICAgIGNvbnN0IHNlbGVjdGVkVGVzdFJ1bm5lckluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFRlc3RSdW5uZXJJbmRleDtcbiAgICBpZiAoc2VsZWN0ZWRUZXN0UnVubmVySW5kZXggPj0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMudGVzdFJ1bm5lcnNbc2VsZWN0ZWRUZXN0UnVubmVySW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlclRyZWUoKSB7XG4gICAgdGhpcy5fdHJlZSA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxUZXN0Q2xhc3NUcmVlXG4gICAgICAgIGlzUnVubmluZz17dGhpcy5wcm9wcy5leGVjdXRpb25TdGF0ZSA9PT0gVGVzdFJ1bm5lclBhbmVsLkV4ZWN1dGlvblN0YXRlLlJVTk5JTkd9XG4gICAgICAgIHRlc3RTdWl0ZU1vZGVsPXt0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsfVxuICAgICAgLz4sXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fbGVmdFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJylcbiAgICApO1xuICB9XG5cbiAgcmVuZGVyQ29uc29sZSgpIHtcbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICA8Q29uc29sZSB0ZXh0QnVmZmVyPXt0aGlzLnByb3BzLmJ1ZmZlcn0gLz4sXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcmlnaHRQYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpXG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RSdW5uZXJQYW5lbDtcbiJdfQ==