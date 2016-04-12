

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztlQUNyQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7O0lBQTNDLGFBQWEsWUFBYixhQUFhOztnQkFDSixPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssYUFBTCxLQUFLO0lBQ0wsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Ozs7QUFXaEIsSUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDaEQsV0FBUyxFQUFFO0FBQ1QsV0FBTyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVTtBQUN6RCxTQUFLLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxVQUFVO0dBQ3REOztBQUVELGlCQUFlLEVBQUEsMkJBQVU7QUFDdkIsV0FBTztBQUNMLGVBQVMsRUFBRSxFQUFFO0FBQ2IscUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGlDQUEyQixFQUFFLElBQUk7S0FDbEMsQ0FBQztHQUNIOztBQUVELG9CQUFrQixFQUFBLDhCQUFHO0FBQ25CLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixpQ0FBMkIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQ2hGLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0dBQzNCOztBQUVELHNCQUFvQixFQUFBLGdDQUFHO0FBQ3JCLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUM7QUFDeEQsUUFBSSxRQUFRLElBQUksSUFBSSxF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ZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IERlYnVnZ2VyQWN0aW9ucyA9IHJlcXVpcmUoJy4vRGVidWdnZXJBY3Rpb25zJyk7XG5jb25zdCBEZWJ1Z2dlclByb2Nlc3NJbmZvID0gcmVxdWlyZSgnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJyk7XG5jb25zdCB7RGVidWdnZXJTdG9yZX0gPSByZXF1aXJlKCcuL0RlYnVnZ2VyU3RvcmUnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0ZWRQcm9jZXNzOiA/RGVidWdnZXJQcm9jZXNzSW5mbztcbiAgcHJvY2Vzc2VzOiBBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPjtcbiAgZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyOiA/SURpc3Bvc2FibGU7XG59O1xuXG4vKipcbiAqIFZpZXcgZm9yIHNldHRpbmcgdXAgYSBuZXcgZGVidWdnaW5nIHNlc3Npb24uXG4gKi9cbmNvbnN0IERlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBhY3Rpb25zOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihEZWJ1Z2dlckFjdGlvbnMpLmlzUmVxdWlyZWQsXG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKERlYnVnZ2VyU3RvcmUpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCk6IFN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvY2Vzc2VzOiBbXSxcbiAgICAgIHNlbGVjdGVkUHJvY2VzczogbnVsbCxcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogbnVsbCxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogdGhpcy5wcm9wcy5zdG9yZS5vbkNoYW5nZSh0aGlzLl91cGRhdGVQcm9jZXNzTGlzdCksXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3QoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuc3RhdGUuZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyO1xuICAgIGlmIChsaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgIDxoMj5BdHRhY2ggdG8gUHJvY2VzczwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5faGFuZGxlU2VsZWN0UHJvY2Vzc31cbiAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzID09IG51bGxcbiAgICAgICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgICAgICA6IHRoaXMuc3RhdGUucHJvY2Vzc2VzLmluZGV4T2YodGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MpXG4gICAgICAgICAgICAgIH0+XG4gICAgICAgICAgICAgIDxvcHRpb24gZGlzYWJsZWQ+XG4gICAgICAgICAgICAgICAgUHJvY2VzcyBJRFxuICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAge3RoaXMuX3JlbmRlclByb2Nlc3NDaG9pY2VzKCl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi10b29sYmFyIGZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2VzcyA9PT0gbnVsbH0+XG4gICAgICAgICAgICAgIEF0dGFjaFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0blwiIG9uQ2xpY2s9e3RoaXMuX3VwZGF0ZVByb2Nlc3NMaXN0fT5cbiAgICAgICAgICAgICAgUmVmcmVzaCBMaXN0XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKTtcbiAgfSxcblxuICBfdXBkYXRlUHJvY2Vzc0xpc3QoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5zdG9yZS5nZXRQcm9jZXNzSW5mb0xpc3QoKS50aGVuKHByb2Nlc3NMaXN0ID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBwcm9jZXNzZXM6IHByb2Nlc3NMaXN0LnNvcnQoY29tcGFyZURlYnVnZ2VyUHJvY2Vzc0luZm8pfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3JlbmRlclByb2Nlc3NDaG9pY2VzKCk6ID9BcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5wcm9jZXNzZXNcbiAgICAgIC5tYXAoKGl0ZW0sIGluZGV4KSA9PlxuICAgICAgICA8b3B0aW9uIGtleT17aXRlbS50b1N0cmluZygpfSB2YWx1ZT17aW5kZXh9PlxuICAgICAgICAgIHtpdGVtLnRvU3RyaW5nKCl9XG4gICAgICAgIDwvb3B0aW9uPlxuICAgICAgKTtcbiAgfSxcblxuICBfaGFuZGxlU2VsZWN0UHJvY2VzcyhlOiBhbnkpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkUHJvY2VzczogdGhpcy5zdGF0ZS5wcm9jZXNzZXNbZS50YXJnZXQudmFsdWVdLFxuICAgIH0pO1xuICB9LFxuXG4gIF9oYW5kbGVDbGljayhlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MpIHtcbiAgICAgIC8vIGZpcmUgYW5kIGZvcmdldC5cbiAgICAgIHRoaXMucHJvcHMuYWN0aW9ucy5zdGFydERlYnVnZ2luZyh0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2Vzcyk7XG4gICAgfVxuICB9LFxufSk7XG5cbmZ1bmN0aW9uIGNvbXBhcmVEZWJ1Z2dlclByb2Nlc3NJbmZvKFxuICB2YWx1ZTogRGVidWdnZXJQcm9jZXNzSW5mbyxcbiAgb3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8sXG4pOiBudW1iZXIge1xuICBjb25zdCBjbXAgPSB2YWx1ZS5nZXRTZXJ2aWNlTmFtZSgpLmxvY2FsZUNvbXBhcmUob3RoZXIuZ2V0U2VydmljZU5hbWUoKSk7XG4gIGlmIChjbXAgPT09IDApIHtcbiAgICByZXR1cm4gdmFsdWUuY29tcGFyZURldGFpbHMob3RoZXIpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjbXA7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWJ1Z2dlclNlc3Npb25TZWxlY3RvcjtcbiJdfQ==