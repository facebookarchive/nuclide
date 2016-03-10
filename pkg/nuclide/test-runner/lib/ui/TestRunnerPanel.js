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
var ReactDOM = _require3.ReactDOM;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RSdW5uZXJQYW5lbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckMsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7ZUFDakMsT0FBTyxDQUFDLG1CQUFtQixDQUFDOztJQUE5QyxjQUFjLFlBQWQsY0FBYzs7Z0JBQ1MsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQUF2RCxtQkFBbUIsYUFBbkIsbUJBQW1COztnQkFJdEIsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUYzQixLQUFLLGFBQUwsS0FBSztJQUNMLFFBQVEsYUFBUixRQUFROztBQUVWLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFMUIsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7QUFNaEIsU0FBUyxzQkFBc0IsQ0FBQyxJQUFZLEVBQUUsU0FBaUIsRUFBVTtBQUN2RSxnREFBNEMsSUFBSSxTQUFJLFNBQVMsQ0FBRztDQUNqRTs7SUFFSyxlQUFlO1lBQWYsZUFBZTs7ZUFBZixlQUFlOztXQVdBO0FBQ2pCLFlBQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDbkMsb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDM0Msa0JBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDdkMsa0JBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDdkMsZ0JBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDckMsaUJBQVcsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDdEMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3RCLG1CQUFhLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDL0IsaUJBQVcsRUFBRSxTQUFTLENBQUMsTUFBTTs7O0FBRzdCLGlCQUFXLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVO0FBQ2pELG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07S0FDakM7Ozs7V0FFdUI7QUFDdEIsYUFBTyxFQUFFLENBQUM7QUFDVixhQUFPLEVBQUUsQ0FBQztLQUNYOzs7O0FBRVUsV0FoQ1AsZUFBZSxDQWdDUCxLQUFhLEVBQUU7MEJBaEN2QixlQUFlOztBQWlDakIsK0JBakNFLGVBQWUsNkNBaUNYLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxXQUFLLEVBQUUsRUFBRTs7O0FBR1QsNkJBQXVCLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDL0QsQ0FBQzs7OztBQUlGLFFBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzlFOztlQTVDRyxlQUFlOztXQThDRiw2QkFBRztBQUNsQixVQUFJLENBQUMsY0FBYyxHQUFHLG1CQUFtQixFQUFFLENBQUM7QUFDNUMsVUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JELFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7O0FBRTFDLHNCQUFjLEVBQUUsS0FBSzs7O0FBR3JCLGlCQUFTLEVBQUUsQ0FBQztPQUNiLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDbEIsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUVyQixjQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FDeEMsQ0FBQztLQUNIOzs7V0FFaUIsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ25COzs7V0FFd0IsbUNBQUMsU0FBaUIsRUFBRTtBQUMzQyxVQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUM7QUFDN0QsVUFBSSxpQkFBaUIsS0FBSyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDaEUsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7T0FDN0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLEVBQUU7QUFDdkUsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztPQUM5QztLQUNGOzs7V0FFbUIsZ0NBQUc7QUFDckIsY0FBUSxDQUFDLHNCQUFzQixDQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDcEUsY0FBUSxDQUFDLHNCQUFzQixDQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDbkUsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLGNBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjO0FBQy9CLGFBQUssZUFBZSxDQUFDLGNBQWMsQ0FBQyxPQUFPO0FBQ3pDLHVCQUFhLEdBQ1g7OztBQUNFLHVCQUFTLEVBQUUsc0JBQXNCLENBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLEFBQUM7QUFDbkUscUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQUFBQzs7V0FFekIsQUFDVixDQUFDO0FBQ0YsZ0JBQU07QUFBQSxBQUNSLGFBQUssZUFBZSxDQUFDLGNBQWMsQ0FBQyxPQUFPO0FBQ3pDLGNBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztBQUNsRCx1QkFBYSxHQUNYOzs7QUFDRSx1QkFBUyxFQUNQLHNCQUFzQixDQUFDLFdBQVcsR0FBRyxlQUFlLEdBQUcsTUFBTSxFQUFFLGFBQWEsQ0FBQyxBQUM5RTtBQUNELHNCQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxBQUFDO0FBQzVCLHFCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEFBQUM7WUFDOUIsV0FBVyxHQUFHLE1BQU0sR0FBRyxTQUFTO1dBQzFCLEFBQ1YsQ0FBQztBQUNGLGdCQUFNO0FBQUEsT0FDVDs7OztBQUlELFVBQUksYUFBc0MsR0FBRyxTQUFTLENBQUM7QUFDdkQsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRTs7Ozs7QUFLNUIscUJBQWEsR0FBRztBQUNkLGFBQUcsRUFBRSxDQUFDO0FBQ04sZUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtTQUNoQyxDQUFDO09BQ0g7O0FBRUQsVUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssZUFBZSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUU7QUFDeEUsY0FBTSxHQUNKOztZQUFNLFNBQVMsRUFBQyxjQUFjOztTQUFlLEFBQzlDLENBQUM7T0FDSCxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7QUFDakMsY0FBTSxHQUNKOztZQUFNLFNBQVMsRUFBQyxjQUFjOztVQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUk7O1NBQVUsQUFDakYsQ0FBQztPQUNIOztBQUVELFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ25CLGVBQU8sR0FBRzs7WUFBTSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUM7VUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1NBQVEsQ0FBQztPQUNyRjs7QUFFRCxVQUFJLFFBQVEsWUFBQSxDQUFDO0FBQ2IsVUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDckIsZ0JBQVEsR0FBRzs7WUFBTSxTQUFTLEVBQUMsMkJBQTJCOztTQUFrQyxDQUFDO09BQzFGLE1BQU07QUFDTCxnQkFBUSxHQUNOLG9CQUFDLGlCQUFpQjtBQUNoQixtQkFBUyxFQUFDLGNBQWM7QUFDeEIsa0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsS0FBSyxlQUFlLENBQUMsY0FBYyxDQUFDLE9BQU8sQUFBQztBQUMvRSxtQkFBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVU7bUJBQzdDLEVBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUM7V0FBQyxDQUNyRCxBQUFDO0FBQ0YsMEJBQWdCLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixBQUFDO0FBQ2xELGFBQUcsRUFBQyxVQUFVO0FBQ2QsdUJBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixBQUFDO0FBQ2xELGNBQUksRUFBQyxJQUFJO0FBQ1QsZUFBSyxFQUFDLHNCQUFzQjtVQUM1QixBQUNILENBQUM7T0FDSDs7QUFFRCxhQUNFO0FBQUMsc0JBQWM7VUFBQyxJQUFJLEVBQUMsUUFBUTtRQUMzQjs7WUFBSyxTQUFTLEVBQUMsMkJBQTJCO1VBQ3hDOztjQUFLLFNBQVMsRUFBQyx5Q0FBeUM7WUFDckQsUUFBUTtZQUNSLGFBQWE7WUFDZDtBQUNFLHVCQUFTLEVBQUMsdURBQXVEO0FBQ2pFLHNCQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsS0FBSyxlQUFlLENBQUMsY0FBYyxDQUFDLE9BQU8sQUFBQztBQUN2RSxxQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxBQUFDO0FBQ2pDLG1CQUFLLEVBQUMsY0FBYyxHQUNiO1lBQ1IsT0FBTztZQUNSOztnQkFBSyxTQUFTLEVBQUMsWUFBWTtjQUN4QixNQUFNO2NBQ1AsMkNBQVUsU0FBUyxFQUFDLGNBQWMsRUFBQyxHQUFHLEVBQUMsS0FBSyxJQUFLLGFBQWEsRUFBSTtjQUNsRTtBQUNFLHVCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEFBQUM7QUFDakMseUJBQVMsRUFBQyxnREFBZ0Q7QUFDMUQscUJBQUssRUFBQyxhQUFhLEdBQ1o7YUFDTDtXQUNGO1VBQ04sNkJBQUssU0FBUyxFQUFDLDZCQUE2QixFQUFDLEdBQUcsRUFBQyxlQUFlLEdBQU87U0FDbkU7T0FDUyxDQUNqQjtLQUNIOzs7V0FFUyxzQkFBWTtBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7S0FDNUM7OztXQUV5QixvQ0FBQyx1QkFBK0IsRUFBUTtBQUNoRSxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsdUJBQXVCLEVBQXZCLHVCQUF1QixFQUFDLENBQUMsQ0FBQztLQUMxQzs7O1dBRW9CLGlDQUFZO0FBQy9CLFVBQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQztBQUNuRSxVQUFJLHVCQUF1QixJQUFJLENBQUMsRUFBRTtBQUNoQyxlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7T0FDeEQ7S0FDRjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQzFCLG9CQUFDLGFBQWE7QUFDWixpQkFBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLGVBQWUsQ0FBQyxjQUFjLENBQUMsT0FBTyxBQUFDO0FBQ2hGLHNCQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEFBQUM7UUFDMUMsRUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUNoRSxDQUFDO0tBQ0g7OztXQUVZLHlCQUFHO0FBQ2QsY0FBUSxDQUFDLE1BQU0sQ0FDYixvQkFBQyxPQUFPLElBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxBQUFDLEdBQUcsRUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FDakUsQ0FBQztLQUNIOzs7U0EvTkcsZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQWtPN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiVGVzdFJ1bm5lclBhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuY29uc3QgTnVjbGlkZVVpRHJvcGRvd24gPSByZXF1aXJlKCcuLi8uLi8uLi91aS9kcm9wZG93bicpO1xuY29uc3Qge1BhbmVsQ29tcG9uZW50fSA9IHJlcXVpcmUoJy4uLy4uLy4uL3VpL3BhbmVsJyk7XG5jb25zdCB7Y3JlYXRlUGFuZUNvbnRhaW5lcn0gPSByZXF1aXJlKCcuLi8uLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlID0gcmVxdWlyZSgnLi9UZXN0Q2xhc3NUcmVlJyk7XG5jb25zdCBwYXRoVXRpbCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IG51bWJlcjtcbn07XG5cbmZ1bmN0aW9uIHJ1blN0b3BCdXR0b25DbGFzc05hbWUoaWNvbjogc3RyaW5nLCBjbGFzc05hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgYnRuIGJ0bi1zbSBpY29uIGlubGluZS1ibG9jayBpY29uLSR7aWNvbn0gJHtjbGFzc05hbWV9YDtcbn1cblxuY2xhc3MgVGVzdFJ1bm5lclBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IFN0YXRlO1xuICBfcGFuZUNvbnRhaW5lcjogT2JqZWN0O1xuICBfbGVmdFBhbmU6IGF0b20kUGFuZTtcbiAgX3JpZ2h0UGFuZTogYXRvbSRQYW5lO1xuICBfdGV4dEVkaXRvck1vZGVsOiBUZXh0RWRpdG9yO1xuICBfdHJlZTogVGVzdENsYXNzVHJlZTtcblxuICAvLyBCb3VuZCBGdW5jdGlvbnMgZm9yIHVzZSBhcyBjYWxsYmFja3MuXG4gIHNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4OiBGdW5jdGlvbjtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGJ1ZmZlcjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGV4ZWN1dGlvblN0YXRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgb25DbGlja0NsZWFyOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tDbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrUnVuOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tTdG9wOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcHJvZ3Jlc3NWYWx1ZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBydW5EdXJhdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgICAvLyBUT0RPOiBTaG91bGQgYmUgYGFycmF5T2YoVGVzdFJ1bm5lcilgLCBidXQgdGhhdCB3b3VsZCByZXF1aXJlIGEgcmVhbCBvYmplY3Qgc2luY2UgdGhpcyBpc1xuICAgIC8vIHJ1bnRpbWUgY29kZSBmb3IgUmVhY3QuXG4gICAgdGVzdFJ1bm5lcnM6IFByb3BUeXBlcy5hcnJheU9mKE9iamVjdCkuaXNSZXF1aXJlZCxcbiAgICB0ZXN0U3VpdGVNb2RlbDogUHJvcFR5cGVzLm9iamVjdCxcbiAgfTtcblxuICBzdGF0aWMgRXhlY3V0aW9uU3RhdGUgPSB7XG4gICAgUlVOTklORzogMCxcbiAgICBTVE9QUEVEOiAxLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHJvb3RzOiBbXSxcbiAgICAgIC8vIElmIHRoZXJlIGFyZSB0ZXN0IHJ1bm5lcnMsIHN0YXJ0IHdpdGggdGhlIGZpcnN0IG9uZSBzZWxlY3RlZC4gT3RoZXJ3aXNlIHN0b3JlIC0xIHRvXG4gICAgICAvLyBsYXRlciBpbmRpY2F0ZSB0aGVyZSB3ZXJlIG5vIGFjdGl2ZSB0ZXN0IHJ1bm5lcnMuXG4gICAgICBzZWxlY3RlZFRlc3RSdW5uZXJJbmRleDogcHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID4gMCA/IDAgOiAtMSxcbiAgICB9O1xuXG4gICAgLy8gQmluZCBGdW5jdGlvbnMgZm9yIHVzZSBhcyBjYWxsYmFja3M7XG4gICAgLy8gVE9ETzogUmVwbGFjZSB3aXRoIHByb3BlcnR5IGluaXRpYWxpemVycyB3aGVuIHN1cHBvcnRlZCBieSBGbG93O1xuICAgIHRoaXMuc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXggPSB0aGlzLnNldFNlbGVjdGVkVGVzdFJ1bm5lckluZGV4LmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyID0gY3JlYXRlUGFuZUNvbnRhaW5lcigpO1xuICAgIHRoaXMuX2xlZnRQYW5lID0gdGhpcy5fcGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKCk7XG4gICAgdGhpcy5fcmlnaHRQYW5lID0gdGhpcy5fbGVmdFBhbmUuc3BsaXRSaWdodCh7XG4gICAgICAvLyBQcmV2ZW50IEF0b20gZnJvbSBjbG9uaW5nIGNoaWxkcmVuIG9uIHNwbGl0dGluZzsgdGhpcyBwYW5lbCB3YW50cyBhbiBlbXB0eSBjb250YWluZXIuXG4gICAgICBjb3B5QWN0aXZlSXRlbTogZmFsc2UsXG4gICAgICAvLyBNYWtlIHRoZSByaWdodCBwYW5lIDIvMyB0aGUgd2lkdGggb2YgdGhlIHBhcmVudCBzaW5jZSBjb25zb2xlIG91dHB1dCBpcyBnZW5lcmFsbHkgd2lkZXJcbiAgICAgIC8vIHRoYW4gdGhlIHRlc3QgdHJlZS5cbiAgICAgIGZsZXhTY2FsZTogMixcbiAgICB9KTtcblxuICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICAgIHRoaXMucmVuZGVyQ29uc29sZSgpO1xuXG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydwYW5lQ29udGFpbmVyJ10pLmFwcGVuZENoaWxkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX3BhbmVDb250YWluZXIpXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBPYmplY3QpIHtcbiAgICBjb25zdCBjdXJyU2VsZWN0ZWRJbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg7XG4gICAgaWYgKGN1cnJTZWxlY3RlZEluZGV4ID09PSAtMSAmJiBuZXh0UHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IDB9KTtcbiAgICB9IGVsc2UgaWYgKG5leHRQcm9wcy50ZXN0UnVubmVycy5sZW5ndGggPT09IDAgJiYgY3VyclNlbGVjdGVkSW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IC0xfSk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9yaWdodFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJykpO1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fbGVmdFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJykpO1xuICAgIHRoaXMuX3BhbmVDb250YWluZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBydW5TdG9wQnV0dG9uO1xuICAgIHN3aXRjaCAodGhpcy5wcm9wcy5leGVjdXRpb25TdGF0ZSkge1xuICAgICAgY2FzZSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklORzpcbiAgICAgICAgcnVuU3RvcEJ1dHRvbiA9IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e3J1blN0b3BCdXR0b25DbGFzc05hbWUoJ3ByaW1pdGl2ZS1zcXVhcmUnLCAnYnRuLWVycm9yJyl9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tTdG9wfT5cbiAgICAgICAgICAgIFN0b3BcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5TVE9QUEVEOlxuICAgICAgICBjb25zdCBpbml0aWFsVGVzdCA9IHRoaXMucHJvcHMucGF0aCA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBydW5TdG9wQnV0dG9uID0gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT17XG4gICAgICAgICAgICAgIHJ1blN0b3BCdXR0b25DbGFzc05hbWUoaW5pdGlhbFRlc3QgPyAncGxheWJhY2stcGxheScgOiAnc3luYycsICdidG4tcHJpbWFyeScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5pc0Rpc2FibGVkKCl9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tSdW59PlxuICAgICAgICAgICAge2luaXRpYWxUZXN0ID8gJ1Rlc3QnIDogJ1JlLVRlc3QnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBBc3NpZ24gYHZhbHVlYCBvbmx5IHdoZW4gbmVlZGVkIHNvIGEgbnVsbC91bmRlZmluZWQgdmFsdWUgd2lsbCBzaG93IGFuIGluZGV0ZXJtaW5hdGVcbiAgICAvLyBwcm9ncmVzcyBiYXIuXG4gICAgbGV0IHByb2dyZXNzQXR0cnM6ID97W2tleTogc3RyaW5nXTogbWl4ZWR9ID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLnByb3BzLnByb2dyZXNzVmFsdWUpIHtcbiAgICAgIC8vIGBrZXlgIGlzIHNldCB0byBmb3JjZSBSZWFjdCB0byB0cmVhdCB0aGlzIGFzIGEgbmV3IGVsZW1lbnQgd2hlbiB0aGUgYHZhbHVlYCBhdHRyIHNob3VsZCBiZVxuICAgICAgLy8gcmVtb3ZlZC4gQ3VycmVudGx5IGl0IGp1c3Qgc2V0cyBgdmFsdWU9XCIwXCJgLCB3aGljaCBpcyBzdHlsZWQgZGlmZmVyZW50bHkgZnJvbSBubyBgdmFsdWVgXG4gICAgICAvLyBhdHRyIGF0IGFsbC5cbiAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGUgYGtleWAgb25jZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvaXNzdWVzLzE0NDggaXMgcmVzb2x2ZWQuXG4gICAgICBwcm9ncmVzc0F0dHJzID0ge1xuICAgICAgICBrZXk6IDEsXG4gICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnByb2dyZXNzVmFsdWUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGxldCBydW5Nc2c7XG4gICAgaWYgKHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HKSB7XG4gICAgICBydW5Nc2cgPSAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlJ1bm5pbmc8L3NwYW4+XG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5ydW5EdXJhdGlvbikge1xuICAgICAgcnVuTXNnID0gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5Eb25lIChpbiB7dGhpcy5wcm9wcy5ydW5EdXJhdGlvbiAvIDEwMDB9cyk8L3NwYW4+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBwYXRoTXNnO1xuICAgIGlmICh0aGlzLnByb3BzLnBhdGgpIHtcbiAgICAgIHBhdGhNc2cgPSA8c3BhbiB0aXRsZT17dGhpcy5wcm9wcy5wYXRofT57cGF0aFV0aWwuYmFzZW5hbWUodGhpcy5wcm9wcy5wYXRoKX08L3NwYW4+O1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bjtcbiAgICBpZiAodGhpcy5pc0Rpc2FibGVkKCkpIHtcbiAgICAgIGRyb3Bkb3duID0gPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIHRleHQtd2FybmluZ1wiPk5vIHJlZ2lzdGVyZWQgdGVzdCBydW5uZXJzPC9zcGFuPjtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJvcGRvd24gPSAoXG4gICAgICAgIDxOdWNsaWRlVWlEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HfVxuICAgICAgICAgIG1lbnVJdGVtcz17dGhpcy5wcm9wcy50ZXN0UnVubmVycy5tYXAodGVzdFJ1bm5lciA9PlxuICAgICAgICAgICAgKHtsYWJlbDogdGVzdFJ1bm5lci5sYWJlbCwgdmFsdWU6IHRlc3RSdW5uZXIubGFiZWx9KVxuICAgICAgICAgICl9XG4gICAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5zZXRTZWxlY3RlZFRlc3RSdW5uZXJJbmRleH1cbiAgICAgICAgICByZWY9XCJkcm9wZG93blwiXG4gICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5zZWxlY3RlZFRlc3RSdW5uZXJJbmRleH1cbiAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIHRpdGxlPVwiQ2hvb3NlIGEgdGVzdCBydW5uZXJcIlxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFBhbmVsQ29tcG9uZW50IGRvY2s9XCJib3R0b21cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRlc3QtcnVubmVyLXBhbmVsXCI+XG4gICAgICAgICAgPG5hdiBjbGFzc05hbWU9XCJudWNsaWRlLXRlc3QtcnVubmVyLXBhbmVsLXRvb2xiYXIgYmxvY2tcIj5cbiAgICAgICAgICAgIHtkcm9wZG93bn1cbiAgICAgICAgICAgIHtydW5TdG9wQnV0dG9ufVxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXN1YnRsZSBidG4tc20gaWNvbiBpY29uLXRyYXNoY2FuIGlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLmlzRGlzYWJsZWQoKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZXhlY3V0aW9uU3RhdGUgPT09IFRlc3RSdW5uZXJQYW5lbC5FeGVjdXRpb25TdGF0ZS5SVU5OSU5HfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tDbGVhcn1cbiAgICAgICAgICAgICAgdGl0bGU9XCJDbGVhciBPdXRwdXRcIj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAge3BhdGhNc2d9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAge3J1bk1zZ31cbiAgICAgICAgICAgICAgPHByb2dyZXNzIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiIG1heD1cIjEwMFwiIHsuLi5wcm9ncmVzc0F0dHJzfSAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrQ2xvc2V9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zdWJ0bGUgYnRuLXNtIGljb24gaWNvbi14IGlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJDbG9zZSBQYW5lbFwiPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbmF2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10ZXN0LXJ1bm5lci1jb25zb2xlXCIgcmVmPVwicGFuZUNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIGlzRGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGVzdFJ1bm5lcnMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRUZXN0UnVubmVySW5kZXgoc2VsZWN0ZWRUZXN0UnVubmVySW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGVzdFJ1bm5lckluZGV4fSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZFRlc3RSdW5uZXIoKTogP09iamVjdCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRUZXN0UnVubmVySW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGVzdFJ1bm5lckluZGV4O1xuICAgIGlmIChzZWxlY3RlZFRlc3RSdW5uZXJJbmRleCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy50ZXN0UnVubmVyc1tzZWxlY3RlZFRlc3RSdW5uZXJJbmRleF07XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyVHJlZSgpIHtcbiAgICB0aGlzLl90cmVlID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFRlc3RDbGFzc1RyZWVcbiAgICAgICAgaXNSdW5uaW5nPXt0aGlzLnByb3BzLmV4ZWN1dGlvblN0YXRlID09PSBUZXN0UnVubmVyUGFuZWwuRXhlY3V0aW9uU3RhdGUuUlVOTklOR31cbiAgICAgICAgdGVzdFN1aXRlTW9kZWw9e3RoaXMucHJvcHMudGVzdFN1aXRlTW9kZWx9XG4gICAgICAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9sZWZ0UGFuZSkucXVlcnlTZWxlY3RvcignLml0ZW0tdmlld3MnKVxuICAgICk7XG4gIH1cblxuICByZW5kZXJDb25zb2xlKCkge1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxDb25zb2xlIHRleHRCdWZmZXI9e3RoaXMucHJvcHMuYnVmZmVyfSAvPixcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9yaWdodFBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJylcbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdFJ1bm5lclBhbmVsO1xuIl19