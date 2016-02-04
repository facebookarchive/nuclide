

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzdELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztlQUNqQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssWUFBTCxLQUFLO0lBQ0wsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Ozs7QUFXaEIsSUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDaEQsV0FBUyxFQUFFO0FBQ1QsV0FBTyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVTtBQUN6RCxTQUFLLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxVQUFVO0dBQ3REOztBQUVELGlCQUFlLEVBQUEsMkJBQVU7QUFDdkIsV0FBTztBQUNMLGVBQVMsRUFBRSxFQUFFO0FBQ2IscUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGlDQUEyQixFQUFFLElBQUk7S0FDbEMsQ0FBQztHQUNIOztBQUVELG9CQUFrQixFQUFBLDhCQUFHO0FBQ25CLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixpQ0FBMkIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQ2hGLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0dBQzNCOztBQUVELHNCQUFvQixFQUFBLGdDQUFHO0FBQ3JCLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUM7QUFDeEQsUUFBSSxRQUFRLElBQUksSUFBSSxFQUFF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b25TZWxlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IERlYnVnZ2VyQWN0aW9ucyA9IHJlcXVpcmUoJy4vRGVidWdnZXJBY3Rpb25zJyk7XG5jb25zdCBEZWJ1Z2dlclByb2Nlc3NJbmZvID0gcmVxdWlyZSgnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJyk7XG5jb25zdCBEZWJ1Z2dlclN0b3JlID0gcmVxdWlyZSgnLi9EZWJ1Z2dlclN0b3JlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHNlbGVjdGVkUHJvY2VzczogP0RlYnVnZ2VyUHJvY2Vzc0luZm87XG4gIHByb2Nlc3NlczogQXJyYXk8RGVidWdnZXJQcm9jZXNzSW5mbz47XG4gIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogP0lEaXNwb3NhYmxlO1xufTtcblxuLyoqXG4gKiBWaWV3IGZvciBzZXR0aW5nIHVwIGEgbmV3IGRlYnVnZ2luZyBzZXNzaW9uLlxuICovXG5jb25zdCBEZWJ1Z2dlclNlc3Npb25TZWxlY3RvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgYWN0aW9uczogUHJvcFR5cGVzLmluc3RhbmNlT2YoRGVidWdnZXJBY3Rpb25zKS5pc1JlcXVpcmVkLFxuICAgIHN0b3JlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihEZWJ1Z2dlclN0b3JlKS5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2Nlc3NlczogW10sXG4gICAgICBzZWxlY3RlZFByb2Nlc3M6IG51bGwsXG4gICAgICBkZWJ1Z2dlclN0b3JlQ2hhbmdlTGlzdGVuZXI6IG51bGwsXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkZWJ1Z2dlclN0b3JlQ2hhbmdlTGlzdGVuZXI6IHRoaXMucHJvcHMuc3RvcmUub25DaGFuZ2UodGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3QpLFxuICAgIH0pO1xuICAgIHRoaXMuX3VwZGF0ZVByb2Nlc3NMaXN0KCk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLnN0YXRlLmRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjtcbiAgICBpZiAobGlzdGVuZXIgIT0gbnVsbCkge1xuICAgICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICA8aDI+QXR0YWNoIHRvIFByb2Nlc3M8L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm1cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzZWxlY3QgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZVNlbGVjdFByb2Nlc3N9PlxuICAgICAgICAgICAgICA8b3B0aW9uIGRpc2FibGVkIHNlbGVjdGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2VzcyA9PT0gbnVsbH0+XG4gICAgICAgICAgICAgICAgUHJvY2VzcyBJRFxuICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAge3RoaXMuX3JlbmRlclByb2Nlc3NDaG9pY2VzKCl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi10b29sYmFyIGZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2VzcyA9PT0gbnVsbH0+XG4gICAgICAgICAgICAgIEF0dGFjaFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0blwiIG9uQ2xpY2s9e3RoaXMuX3VwZGF0ZVByb2Nlc3NMaXN0fT5cbiAgICAgICAgICAgICAgUmVmcmVzaCBMaXN0XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKTtcbiAgfSxcblxuICBfdXBkYXRlUHJvY2Vzc0xpc3QoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5zdG9yZS5nZXRQcm9jZXNzSW5mb0xpc3QoKS50aGVuKHByb2Nlc3NMaXN0ID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBwcm9jZXNzZXM6IHByb2Nlc3NMaXN0LnNvcnQoY29tcGFyZURlYnVnZ2VyUHJvY2Vzc0luZm8pfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3JlbmRlclByb2Nlc3NDaG9pY2VzKCk6ID9BcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5wcm9jZXNzZXNcbiAgICAgIC5tYXAoKGl0ZW0sIGluZGV4KSA9PlxuICAgICAgICA8b3B0aW9uXG4gICAgICAgICAgICBrZXk9e2l0ZW0udG9TdHJpbmcoKX1cbiAgICAgICAgICAgIHZhbHVlPXtpbmRleH1cbiAgICAgICAgICAgIHNlbGVjdGVkPXtpdGVtID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2Vzc30+XG4gICAgICAgICAge2l0ZW0udG9TdHJpbmcoKX1cbiAgICAgICAgPC9vcHRpb24+XG4gICAgICApO1xuICB9LFxuXG4gIF9oYW5kbGVTZWxlY3RQcm9jZXNzKGU6IGFueSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRQcm9jZXNzOiB0aGlzLnN0YXRlLnByb2Nlc3Nlc1tlLnRhcmdldC52YWx1ZV0sXG4gICAgfSk7XG4gIH0sXG5cbiAgX2hhbmRsZUNsaWNrKGU6IGFueSkge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2Vzcykge1xuICAgICAgdGhpcy5wcm9wcy5hY3Rpb25zLmF0dGFjaFRvUHJvY2Vzcyh0aGlzLnN0YXRlLnNlbGVjdGVkUHJvY2Vzcyk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFByb2Nlc3M6IG51bGx9KTtcbiAgICB9XG4gIH0sXG59KTtcblxuZnVuY3Rpb24gY29tcGFyZURlYnVnZ2VyUHJvY2Vzc0luZm8oXG4gIHZhbHVlOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLFxuICBvdGhlcjogRGVidWdnZXJQcm9jZXNzSW5mbyxcbik6IG51bWJlciB7XG4gIGNvbnN0IGNtcCA9IHZhbHVlLmdldFNlcnZpY2VOYW1lKCkubG9jYWxlQ29tcGFyZShvdGhlci5nZXRTZXJ2aWNlTmFtZSgpKTtcbiAgaWYgKGNtcCA9PT0gMCkge1xuICAgIHJldHVybiB2YWx1ZS5jb21wYXJlRGV0YWlscyhvdGhlcik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yO1xuIl19