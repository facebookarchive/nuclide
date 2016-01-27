

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DebuggerActions = require('./DebuggerActions');
var DebuggerProcessInfo = require('./DebuggerProcessInfo');
var DebuggerStore = require('./DebuggerStore');

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

/**
 * View for setting up a new debugging session.
 */
var DebuggerSessionSelector = React.createClass({
  displayName: 'DebuggerSessionSelector',

  propTypes: {
    actions: PropTypes.instanceOf(DebuggerActions).isRequired,
    store: PropTypes.instanceOf(DebuggerStore).isRequired
  },

  getInitialState: function getInitialState() {
    return {
      processes: [],
      selectedProcess: null,
      debuggerStoreChangeListener: null
    };
  },

  componentWillMount: function componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateProcessList.bind(this))
    });
    this._updateProcessList();
  },

  componentWillUnmount: function componentWillUnmount() {
    var listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  },

  render: function render() {
    return React.createElement(
      'section',
      { className: 'padded' },
      React.createElement(
        'h2',
        null,
        'Attach to Process'
      ),
      React.createElement(
        'div',
        { className: 'form' },
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement(
            'select',
            { className: 'form-control', onChange: this._handleSelectProcess },
            React.createElement(
              'option',
              { disabled: true, selected: this.state.selectedProcess === null },
              'Process ID'
            ),
            this._renderProcessChoices()
          )
        ),
        React.createElement(
          'div',
          { className: 'btn-toolbar form-group' },
          React.createElement(
            'button',
            {
              className: 'btn btn-primary',
              onClick: this._handleClick,
              disabled: this.state.selectedProcess === null },
            'Attach'
          ),
          React.createElement(
            'button',
            { className: 'btn', onClick: this._updateProcessList },
            'Refresh List'
          )
        )
      )
    );
  },

  _updateProcessList: function _updateProcessList() {
    var _this = this;

    this.props.store.getProcessInfoList().then(function (processList) {
      _this.setState({
        processes: processList.sort(compareDebuggerProcessInfo) });
    });
  },

  _renderProcessChoices: function _renderProcessChoices() {
    var _this2 = this;

    return this.state.processes.map(function (item, index) {
      return React.createElement(
        'option',
        {
          key: item.toString(),
          value: index,
          selected: item === _this2.state.selectedProcess },
        item.toString()
      );
    });
  },

  _handleSelectProcess: function _handleSelectProcess(e) {
    this.setState({
      selectedProcess: this.state.processes[e.target.value]
    });
  },

  _handleClick: function _handleClick(e) {
    if (this.state.selectedProcess) {
      this.props.actions.attachToProcess(this.state.selectedProcess);
      this.setState({ selectedProcess: null });
    }
  }
});

function compareDebuggerProcessInfo(value, other) {
  var cmp = value.getServiceName().localeCompare(other.getServiceName());
  if (cmp === 0) {
    return value.compareDetails(other);
  } else {
    return cmp;
  }
}

module.exports = DebuggerSessionSelector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzdELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztlQUNqQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssWUFBTCxLQUFLO0lBQ0wsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Ozs7QUFXaEIsSUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDaEQsV0FBUyxFQUFFO0FBQ1QsV0FBTyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVTtBQUN6RCxTQUFLLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxVQUFVO0dBQ3REOztBQUVELGlCQUFlLEVBQUEsMkJBQVU7QUFDdkIsV0FBTztBQUNMLGVBQVMsRUFBRSxFQUFFO0FBQ2IscUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGlDQUEyQixFQUFFLElBQUk7S0FDbEMsQ0FBQztHQUNIOztBQUVELG9CQUFrQixFQUFBLDhCQUFHO0FBQ25CLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixpQ0FBMkIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzRixDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztHQUMzQjs7QUFFRCxzQkFBb0IsRUFBQSxnQ0FBRztBQUNyQixRQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDO0FBQ3hE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QUMiLCJmaWxlIjoiRGVidWdnZXJTZXNzaW9uU2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBEZWJ1Z2dlckFjdGlvbnMgPSByZXF1aXJlKCcuL0RlYnVnZ2VyQWN0aW9ucycpO1xuY29uc3QgRGVidWdnZXJQcm9jZXNzSW5mbyA9IHJlcXVpcmUoJy4vRGVidWdnZXJQcm9jZXNzSW5mbycpO1xuY29uc3QgRGVidWdnZXJTdG9yZSA9IHJlcXVpcmUoJy4vRGVidWdnZXJTdG9yZScpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZWxlY3RlZFByb2Nlc3M6ID9EZWJ1Z2dlclByb2Nlc3NJbmZvO1xuICBwcm9jZXNzZXM6IEFycmF5PERlYnVnZ2VyUHJvY2Vzc0luZm8+O1xuICBkZWJ1Z2dlclN0b3JlQ2hhbmdlTGlzdGVuZXI6ID9hdG9tJERpc3Bvc2FibGU7XG59O1xuXG4vKipcbiAqIFZpZXcgZm9yIHNldHRpbmcgdXAgYSBuZXcgZGVidWdnaW5nIHNlc3Npb24uXG4gKi9cbmNvbnN0IERlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBhY3Rpb25zOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihEZWJ1Z2dlckFjdGlvbnMpLmlzUmVxdWlyZWQsXG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKERlYnVnZ2VyU3RvcmUpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCk6IFN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvY2Vzc2VzOiBbXSxcbiAgICAgIHNlbGVjdGVkUHJvY2VzczogbnVsbCxcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogbnVsbCxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogdGhpcy5wcm9wcy5zdG9yZS5vbkNoYW5nZSh0aGlzLl91cGRhdGVQcm9jZXNzTGlzdC5iaW5kKHRoaXMpKSxcbiAgICB9KTtcbiAgICB0aGlzLl91cGRhdGVQcm9jZXNzTGlzdCgpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5zdGF0ZS5kZWJ1Z2dlclN0b3JlQ2hhbmdlTGlzdGVuZXI7XG4gICAgaWYgKGxpc3RlbmVyICE9IG51bGwpIHtcbiAgICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgPGgyPkF0dGFjaCB0byBQcm9jZXNzPC9oMj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8c2VsZWN0IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIG9uQ2hhbmdlPXt0aGlzLl9oYW5kbGVTZWxlY3RQcm9jZXNzfT5cbiAgICAgICAgICAgICAgPG9wdGlvbiBkaXNhYmxlZCBzZWxlY3RlZD17dGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MgPT09IG51bGx9PlxuICAgICAgICAgICAgICAgIFByb2Nlc3MgSURcbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJQcm9jZXNzQ2hvaWNlcygpfVxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tdG9vbGJhciBmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja31cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MgPT09IG51bGx9PlxuICAgICAgICAgICAgICBBdHRhY2hcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiBvbkNsaWNrPXt0aGlzLl91cGRhdGVQcm9jZXNzTGlzdH0+XG4gICAgICAgICAgICAgIFJlZnJlc2ggTGlzdFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgICk7XG4gIH0sXG5cbiAgX3VwZGF0ZVByb2Nlc3NMaXN0KCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuc3RvcmUuZ2V0UHJvY2Vzc0luZm9MaXN0KCkudGhlbihwcm9jZXNzTGlzdCA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcHJvY2Vzc2VzOiBwcm9jZXNzTGlzdC5zb3J0KGNvbXBhcmVEZWJ1Z2dlclByb2Nlc3NJbmZvKX0pO1xuICAgIH0pO1xuICB9LFxuXG4gIF9yZW5kZXJQcm9jZXNzQ2hvaWNlcygpOiA/QXJyYXk8UmVhY3RFbGVtZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucHJvY2Vzc2VzXG4gICAgICAubWFwKChpdGVtLCBpbmRleCkgPT5cbiAgICAgICAgPG9wdGlvblxuICAgICAgICAgICAga2V5PXtpdGVtLnRvU3RyaW5nKCl9XG4gICAgICAgICAgICB2YWx1ZT17aW5kZXh9XG4gICAgICAgICAgICBzZWxlY3RlZD17aXRlbSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3N9PlxuICAgICAgICAgIHtpdGVtLnRvU3RyaW5nKCl9XG4gICAgICAgIDwvb3B0aW9uPlxuICAgICAgKTtcbiAgfSxcblxuICBfaGFuZGxlU2VsZWN0UHJvY2VzcyhlOiBhbnkpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkUHJvY2VzczogdGhpcy5zdGF0ZS5wcm9jZXNzZXNbZS50YXJnZXQudmFsdWVdLFxuICAgIH0pO1xuICB9LFxuXG4gIF9oYW5kbGVDbGljayhlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MpIHtcbiAgICAgIHRoaXMucHJvcHMuYWN0aW9ucy5hdHRhY2hUb1Byb2Nlc3ModGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRQcm9jZXNzOiBudWxsfSk7XG4gICAgfVxuICB9LFxufSk7XG5cbmZ1bmN0aW9uIGNvbXBhcmVEZWJ1Z2dlclByb2Nlc3NJbmZvKFxuICB2YWx1ZTogRGVidWdnZXJQcm9jZXNzSW5mbyxcbiAgb3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8sXG4pOiBudW1iZXIge1xuICBjb25zdCBjbXAgPSB2YWx1ZS5nZXRTZXJ2aWNlTmFtZSgpLmxvY2FsZUNvbXBhcmUob3RoZXIuZ2V0U2VydmljZU5hbWUoKSk7XG4gIGlmIChjbXAgPT09IDApIHtcbiAgICByZXR1cm4gdmFsdWUuY29tcGFyZURldGFpbHMob3RoZXIpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjbXA7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWJ1Z2dlclNlc3Npb25TZWxlY3RvcjtcbiJdfQ==