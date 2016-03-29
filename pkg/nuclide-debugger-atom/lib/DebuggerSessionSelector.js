

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztlQUNyQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7O0lBQTNDLGFBQWEsWUFBYixhQUFhOztnQkFDSixPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssYUFBTCxLQUFLO0lBQ0wsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Ozs7QUFXaEIsSUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDaEQsV0FBUyxFQUFFO0FBQ1QsV0FBTyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVTtBQUN6RCxTQUFLLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxVQUFVO0dBQ3REOztBQUVELGlCQUFlLEVBQUEsMkJBQVU7QUFDdkIsV0FBTztBQUNMLGVBQVMsRUFBRSxFQUFFO0FBQ2IscUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGlDQUEyQixFQUFFLElBQUk7S0FDbEMsQ0FBQztHQUNIOztBQUVELG9CQUFrQixFQUFBLDhCQUFHO0FBQ25CLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixpQ0FBMkIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQ2hGLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0dBQzNCOztBQUVELHNCQUFvQixFQUFBLGdDQUFHO0FBQ3JCLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUM7QUFDeEQsUUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLGNBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQjtHQUNGOztBQUVELFFBQU0sRUFBQSxrQkFBa0I7QUFDdEIsV0FDRTs7UUFBUyxTQUFTLEVBQUMsUUFBUTtNQUN6Qjs7OztPQUEwQjtNQUMxQjs7VUFBSyxTQUFTLEVBQUMsTUFBTTtRQUNuQjs7WUFBSyxTQUFTLEVBQUMsWUFBWTtVQUN6Qjs7Y0FBUSxTQUFTLEVBQUMsY0FBYyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEFBQUM7WUFDbkU7O2dCQUFRLFFBQVEsTUFBQSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsS0FBSyxJQUFJLEFBQUM7O2FBRXREO1lBQ1IsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1dBQ3RCO1NBQ0w7UUFDTjs7WUFBSyxTQUFTLEVBQUMsd0JBQXdCO1VBQ3JDOzs7QUFDSSx1QkFBUyxFQUFDLGlCQUFpQjtBQUMzQixxQkFBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7QUFDM0Isc0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsS0FBSyxJQUFJLEFBQUM7O1dBRXpDO1VBQ1Q7O2NBQVEsU0FBUyxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixBQUFDOztXQUVoRDtTQUNMO09BQ0Y7S0FDRSxDQUNWO0dBQ0g7O0FBRUQsb0JBQWtCLEVBQUEsOEJBQVM7OztBQUN6QixRQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUN4RCxZQUFLLFFBQVEsQ0FBQztBQUNaLGlCQUFTLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUM3RCxDQUFDLENBQUM7R0FDSjs7QUFFRCx1QkFBcUIsRUFBQSxpQ0FBeUI7OztBQUM1QyxXQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUN4QixHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUUsS0FBSzthQUNmOzs7QUFDSSxhQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxBQUFDO0FBQ3JCLGVBQUssRUFBRSxLQUFLLEFBQUM7QUFDYixrQkFBUSxFQUFFLElBQUksS0FBSyxPQUFLLEtBQUssQ0FBQyxlQUFlLEFBQUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsRUFBRTtPQUNUO0tBQUEsQ0FDVixDQUFDO0dBQ0w7O0FBRUQsc0JBQW9CLEVBQUEsOEJBQUMsQ0FBTSxFQUFFO0FBQzNCLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixxQkFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0tBQ3RELENBQUMsQ0FBQztHQUNKOztBQUVELGNBQVksRUFBQSxzQkFBQyxDQUFNLEVBQUU7QUFDbkIsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRTs7QUFFOUIsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDL0Q7R0FDRjtDQUNGLENBQUMsQ0FBQzs7QUFFSCxTQUFTLDBCQUEwQixDQUNqQyxLQUEwQixFQUMxQixLQUEwQixFQUNsQjtBQUNSLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDekUsTUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO0FBQ2IsV0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3BDLE1BQU07QUFDTCxXQUFPLEdBQUcsQ0FBQztHQUNaO0NBQ0Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlclNlc3Npb25TZWxlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IERlYnVnZ2VyQWN0aW9ucyA9IHJlcXVpcmUoJy4vRGVidWdnZXJBY3Rpb25zJyk7XG5jb25zdCBEZWJ1Z2dlclByb2Nlc3NJbmZvID0gcmVxdWlyZSgnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJyk7XG5jb25zdCB7RGVidWdnZXJTdG9yZX0gPSByZXF1aXJlKCcuL0RlYnVnZ2VyU3RvcmUnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0ZWRQcm9jZXNzOiA/RGVidWdnZXJQcm9jZXNzSW5mbztcbiAgcHJvY2Vzc2VzOiBBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPjtcbiAgZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyOiA/SURpc3Bvc2FibGU7XG59O1xuXG4vKipcbiAqIFZpZXcgZm9yIHNldHRpbmcgdXAgYSBuZXcgZGVidWdnaW5nIHNlc3Npb24uXG4gKi9cbmNvbnN0IERlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBhY3Rpb25zOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihEZWJ1Z2dlckFjdGlvbnMpLmlzUmVxdWlyZWQsXG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKERlYnVnZ2VyU3RvcmUpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCk6IFN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvY2Vzc2VzOiBbXSxcbiAgICAgIHNlbGVjdGVkUHJvY2VzczogbnVsbCxcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogbnVsbCxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRlYnVnZ2VyU3RvcmVDaGFuZ2VMaXN0ZW5lcjogdGhpcy5wcm9wcy5zdG9yZS5vbkNoYW5nZSh0aGlzLl91cGRhdGVQcm9jZXNzTGlzdCksXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3QoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuc3RhdGUuZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyO1xuICAgIGlmIChsaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgIDxoMj5BdHRhY2ggdG8gUHJvY2VzczwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPHNlbGVjdCBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBvbkNoYW5nZT17dGhpcy5faGFuZGxlU2VsZWN0UHJvY2Vzc30+XG4gICAgICAgICAgICAgIDxvcHRpb24gZGlzYWJsZWQgc2VsZWN0ZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzID09PSBudWxsfT5cbiAgICAgICAgICAgICAgICBQcm9jZXNzIElEXG4gICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyUHJvY2Vzc0Nob2ljZXMoKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLXRvb2xiYXIgZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzID09PSBudWxsfT5cbiAgICAgICAgICAgICAgQXR0YWNoXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3R9PlxuICAgICAgICAgICAgICBSZWZyZXNoIExpc3RcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApO1xuICB9LFxuXG4gIF91cGRhdGVQcm9jZXNzTGlzdCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLnN0b3JlLmdldFByb2Nlc3NJbmZvTGlzdCgpLnRoZW4ocHJvY2Vzc0xpc3QgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHByb2Nlc3NlczogcHJvY2Vzc0xpc3Quc29ydChjb21wYXJlRGVidWdnZXJQcm9jZXNzSW5mbyl9KTtcbiAgICB9KTtcbiAgfSxcblxuICBfcmVuZGVyUHJvY2Vzc0Nob2ljZXMoKTogP0FycmF5PFJlYWN0RWxlbWVudD4ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnByb2Nlc3Nlc1xuICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+XG4gICAgICAgIDxvcHRpb25cbiAgICAgICAgICAgIGtleT17aXRlbS50b1N0cmluZygpfVxuICAgICAgICAgICAgdmFsdWU9e2luZGV4fVxuICAgICAgICAgICAgc2VsZWN0ZWQ9e2l0ZW0gPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzfT5cbiAgICAgICAgICB7aXRlbS50b1N0cmluZygpfVxuICAgICAgICA8L29wdGlvbj5cbiAgICAgICk7XG4gIH0sXG5cbiAgX2hhbmRsZVNlbGVjdFByb2Nlc3MoZTogYW55KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFByb2Nlc3M6IHRoaXMuc3RhdGUucHJvY2Vzc2VzW2UudGFyZ2V0LnZhbHVlXSxcbiAgICB9KTtcbiAgfSxcblxuICBfaGFuZGxlQ2xpY2soZTogYW55KSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzKSB7XG4gICAgICAvLyBmaXJlIGFuZCBmb3JnZXQuXG4gICAgICB0aGlzLnByb3BzLmFjdGlvbnMuc3RhcnREZWJ1Z2dpbmcodGhpcy5zdGF0ZS5zZWxlY3RlZFByb2Nlc3MpO1xuICAgIH1cbiAgfSxcbn0pO1xuXG5mdW5jdGlvbiBjb21wYXJlRGVidWdnZXJQcm9jZXNzSW5mbyhcbiAgdmFsdWU6IERlYnVnZ2VyUHJvY2Vzc0luZm8sXG4gIG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLFxuKTogbnVtYmVyIHtcbiAgY29uc3QgY21wID0gdmFsdWUuZ2V0U2VydmljZU5hbWUoKS5sb2NhbGVDb21wYXJlKG90aGVyLmdldFNlcnZpY2VOYW1lKCkpO1xuICBpZiAoY21wID09PSAwKSB7XG4gICAgcmV0dXJuIHZhbHVlLmNvbXBhcmVEZXRhaWxzKG90aGVyKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJTZXNzaW9uU2VsZWN0b3I7XG4iXX0=