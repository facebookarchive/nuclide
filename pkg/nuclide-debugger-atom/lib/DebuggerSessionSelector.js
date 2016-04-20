var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonToolbar = require('../../nuclide-ui/lib/ButtonToolbar');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DebuggerActions = require('./DebuggerActions');
var DebuggerProcessInfo = require('./DebuggerProcessInfo');

var _require = require('./DebuggerStore');

var DebuggerStore = _require.DebuggerStore;

var _require2 = require('react-for-atom');

var React = _require2.React;
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
      debuggerStoreChangeListener: this.props.store.onChange(this._updateProcessList)
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
            {
              className: 'form-control',
              onChange: this._handleSelectProcess,
              value: this.state.selectedProcess == null ? null : this.state.processes.indexOf(this.state.selectedProcess) },
            React.createElement(
              'option',
              { disabled: true },
              'Process ID'
            ),
            this._renderProcessChoices()
          )
        ),
        React.createElement(
          _nuclideUiLibButtonToolbar.ButtonToolbar,
          { className: 'form-group' },
          React.createElement(
            _nuclideUiLibButton.Button,
            {
              buttonType: _nuclideUiLibButton.ButtonTypes.PRIMARY,
              onClick: this._handleClick,
              disabled: this.state.selectedProcess === null },
            'Attach'
          ),
          React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._updateProcessList },
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
    return this.state.processes.map(function (item, index) {
      return React.createElement(
        'option',
        { key: item.toString(), value: index },
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
      // fire and forget.
      this.props.actions.startDebugging(this.state.selectedProcess);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJrQ0FtQk8sNkJBQTZCOzt5Q0FDUixvQ0FBb0M7Ozs7Ozs7Ozs7QUFUaEUsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDckQsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQzs7ZUFDckMsT0FBTyxDQUFDLGlCQUFpQixDQUFDOztJQUEzQyxhQUFhLFlBQWIsYUFBYTs7Z0JBQ0osT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLGFBQUwsS0FBSztJQUNMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7Ozs7O0FBZ0JoQixJQUFNLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUNoRCxXQUFTLEVBQUU7QUFDVCxXQUFPLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxVQUFVO0FBQ3pELFNBQUssRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFVBQVU7R0FDdEQ7O0FBRUQsaUJBQWUsRUFBQSwyQkFBVTtBQUN2QixXQUFPO0FBQ0wsZUFBUyxFQUFFLEVBQUU7QUFDYixxQkFBZSxFQUFFLElBQUk7QUFDckIsaUNBQTJCLEVBQUUsSUFBSTtLQUNsQyxDQUFDO0dBQ0g7O0FBRUQsb0JBQWtCLEVBQUEsOEJBQUc7QUFDbkIsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGlDQUEyQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FDaEYsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7R0FDM0I7O0FBRUQsc0JBQW9CLEVBQUEsZ0NBQUc7QUFDckIsUUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FB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ZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBEZWJ1Z2dlckFjdGlvbnMgPSByZXF1aXJlKCcuL0RlYnVnZ2VyQWN0aW9ucycpO1xuY29uc3QgRGVidWdnZXJQcm9jZXNzSW5mbyA9IHJlcXVpcmUoJy4vRGVidWdnZXJQcm9jZXNzSW5mbycpO1xuY29uc3Qge0RlYnVnZ2VyU3RvcmV9ID0gcmVxdWlyZSgnLi9EZWJ1Z2dlclN0b3JlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5pbXBvcnQge1xuICBCdXR0b24sXG4gIEJ1dHRvblR5cGVzLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuaW1wb3J0IHtCdXR0b25Ub29sYmFyfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b25Ub29sYmFyJztcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0ZWRQcm9jZXNzOiA/RGVidWdnZXJQcm9jZXNzSW5mbztcbiAgcHJvY2Vzc2VzOiBBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPjtcbiAgZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyOiA/SURpc3Bvc2FibGU7XG59O1xuXG4vKipcbiAqIFZpZXcgZm9yIHNldHRpbmcgdXAgYSBuZXcgZGVidWdnaW5nIHNlc3Npb24uXG4gKi9cbmNvbnN0IERlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBhY3Rpb25zOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihEZWJ1Z2dlckFjdGlvbnMpLmlzUmVxdWlyZWQsXG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKERlYnVnZ2VyU3RvcmUpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCk6IFN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvY2Vzc2VzOiBbXSxcbiAgICAgIHNlbGVjdGVkUHJvY2VzczogbnVsbCxcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogbnVsbCxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogdGhpcy5wcm9wcy5zdG9yZS5vbkNoYW5nZSh0aGlzLl91cGRhdGVQcm9jZXNzTGlzdCksXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3QoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuc3RhdGUuZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyO1xuICAgIGlmIChsaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICA8aDI+QXR0YWNoIHRvIFByb2Nlc3M8L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm1cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZVNlbGVjdFByb2Nlc3N9XG4gICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2VzcyA9PSBudWxsXG4gICAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgICAgOiB0aGlzLnN0YXRlLnByb2Nlc3Nlcy5pbmRleE9mKHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzKVxuICAgICAgICAgICAgICB9PlxuICAgICAgICAgICAgICA8b3B0aW9uIGRpc2FibGVkPlxuICAgICAgICAgICAgICAgIFByb2Nlc3MgSURcbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJQcm9jZXNzQ2hvaWNlcygpfVxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPEJ1dHRvblRvb2xiYXIgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBidXR0b25UeXBlPXtCdXR0b25UeXBlcy5QUklNQVJZfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja31cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzID09PSBudWxsfT5cbiAgICAgICAgICAgICAgQXR0YWNoXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17dGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3R9PlxuICAgICAgICAgICAgICBSZWZyZXNoIExpc3RcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvQnV0dG9uVG9vbGJhcj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKTtcbiAgfSxcblxuICBfdXBkYXRlUHJvY2Vzc0xpc3QoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5zdG9yZS5nZXRQcm9jZXNzSW5mb0xpc3QoKS50aGVuKHByb2Nlc3NMaXN0ID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBwcm9jZXNzZXM6IHByb2Nlc3NMaXN0LnNvcnQoY29tcGFyZURlYnVnZ2VyUHJvY2Vzc0luZm8pfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3JlbmRlclByb2Nlc3NDaG9pY2VzKCk6ID9BcnJheTxSZWFjdC5FbGVtZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucHJvY2Vzc2VzXG4gICAgICAubWFwKChpdGVtLCBpbmRleCkgPT5cbiAgICAgICAgPG9wdGlvbiBrZXk9e2l0ZW0udG9TdHJpbmcoKX0gdmFsdWU9e2luZGV4fT5cbiAgICAgICAgICB7aXRlbS50b1N0cmluZygpfVxuICAgICAgICA8L29wdGlvbj5cbiAgICAgICk7XG4gIH0sXG5cbiAgX2hhbmRsZVNlbGVjdFByb2Nlc3MoZTogYW55KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFByb2Nlc3M6IHRoaXMuc3RhdGUucHJvY2Vzc2VzW2UudGFyZ2V0LnZhbHVlXSxcbiAgICB9KTtcbiAgfSxcblxuICBfaGFuZGxlQ2xpY2soZTogYW55KSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzKSB7XG4gICAgICAvLyBmaXJlIGFuZCBmb3JnZXQuXG4gICAgICB0aGlzLnByb3BzLmFjdGlvbnMuc3RhcnREZWJ1Z2dpbmcodGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MpO1xuICAgIH1cbiAgfSxcbn0pO1xuXG5mdW5jdGlvbiBjb21wYXJlRGVidWdnZXJQcm9jZXNzSW5mbyhcbiAgdmFsdWU6IERlYnVnZ2VyUHJvY2Vzc0luZm8sXG4gIG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLFxuKTogbnVtYmVyIHtcbiAgY29uc3QgY21wID0gdmFsdWUuZ2V0U2VydmljZU5hbWUoKS5sb2NhbGVDb21wYXJlKG90aGVyLmdldFNlcnZpY2VOYW1lKCkpO1xuICBpZiAoY21wID09PSAwKSB7XG4gICAgcmV0dXJuIHZhbHVlLmNvbXBhcmVEZXRhaWxzKG90aGVyKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJTZXNzaW9uU2VsZWN0b3I7XG4iXX0=