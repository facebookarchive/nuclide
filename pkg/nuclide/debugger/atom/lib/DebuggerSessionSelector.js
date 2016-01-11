

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
var React = require('react-for-atom');

/**
 * View for setting up a new debugging session.
 */
var DebuggerSessionSelector = React.createClass({
  displayName: 'DebuggerSessionSelector',

  propTypes: {
    actions: React.PropTypes.instanceOf(DebuggerActions).isRequired,
    store: React.PropTypes.instanceOf(DebuggerStore).isRequired
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyU2Vzc2lvblNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzdELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7OztBQVd4QyxJQUFNLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUNoRCxXQUFTLEVBQUU7QUFDVCxXQUFPLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVTtBQUMvRCxTQUFLLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsVUFBVTtHQUM1RDs7QUFFRCxpQkFBZSxFQUFBLDJCQUFVO0FBQ3ZCLFdBQU87QUFDTCxlQUFTLEVBQUUsRUFBRTtBQUNiLHFCQUFlLEVBQUUsSUFBSTtBQUNyQixpQ0FBMkIsRUFBRSxJQUFJO0tBQ2xDLENBQUM7R0FDSDs7QUFFRCxvQkFBa0IsRUFBQSw4QkFBRztBQUNuQixRQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osaUNBQTJCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0YsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7R0FDM0I7O0FBRUQsc0JBQW9CLEVBQUEsZ0NBQUc7QUFDckIsUUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQztBQUN4RCxRQUFJLFFBQVEsSUFB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YnVnZ2VyU2Vzc2lvblNlbGVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRGVidWdnZXJBY3Rpb25zID0gcmVxdWlyZSgnLi9EZWJ1Z2dlckFjdGlvbnMnKTtcbmNvbnN0IERlYnVnZ2VyUHJvY2Vzc0luZm8gPSByZXF1aXJlKCcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nKTtcbmNvbnN0IERlYnVnZ2VyU3RvcmUgPSByZXF1aXJlKCcuL0RlYnVnZ2VyU3RvcmUnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0ZWRQcm9jZXNzOiA/RGVidWdnZXJQcm9jZXNzSW5mbztcbiAgcHJvY2Vzc2VzOiBBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPjtcbiAgZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyOiA/YXRvbSREaXNwb3NhYmxlO1xufTtcblxuLyoqXG4gKiBWaWV3IGZvciBzZXR0aW5nIHVwIGEgbmV3IGRlYnVnZ2luZyBzZXNzaW9uLlxuICovXG5jb25zdCBEZWJ1Z2dlclNlc3Npb25TZWxlY3RvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgYWN0aW9uczogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoRGVidWdnZXJBY3Rpb25zKS5pc1JlcXVpcmVkLFxuICAgIHN0b3JlOiBSZWFjdC5Qcm9wVHlwZXMuaW5zdGFuY2VPZihEZWJ1Z2dlclN0b3JlKS5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2Nlc3NlczogW10sXG4gICAgICBzZWxlY3RlZFByb2Nlc3M6IG51bGwsXG4gICAgICBkZWJ1Z2dlclN0b3JlQ2hhbmdlTGlzdGVuZXI6IG51bGwsXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkZWJ1Z2dlclN0b3JlQ2hhbmdlTGlzdGVuZXI6IHRoaXMucHJvcHMuc3RvcmUub25DaGFuZ2UodGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3QuYmluZCh0aGlzKSksXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3QoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuc3RhdGUuZGVidWdnZXJTdG9yZUNoYW5nZUxpc3RlbmVyO1xuICAgIGlmIChsaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgIDxoMj5BdHRhY2ggdG8gUHJvY2VzczwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPHNlbGVjdCBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBvbkNoYW5nZT17dGhpcy5faGFuZGxlU2VsZWN0UHJvY2Vzc30+XG4gICAgICAgICAgICAgIDxvcHRpb24gZGlzYWJsZWQgc2VsZWN0ZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzID09PSBudWxsfT5cbiAgICAgICAgICAgICAgICBQcm9jZXNzIElEXG4gICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyUHJvY2Vzc0Nob2ljZXMoKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLXRvb2xiYXIgZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzID09PSBudWxsfT5cbiAgICAgICAgICAgICAgQXR0YWNoXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fdXBkYXRlUHJvY2Vzc0xpc3R9PlxuICAgICAgICAgICAgICBSZWZyZXNoIExpc3RcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApO1xuICB9LFxuXG4gIF91cGRhdGVQcm9jZXNzTGlzdCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLnN0b3JlLmdldFByb2Nlc3NJbmZvTGlzdCgpLnRoZW4ocHJvY2Vzc0xpc3QgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHByb2Nlc3NlczogcHJvY2Vzc0xpc3Quc29ydChjb21wYXJlRGVidWdnZXJQcm9jZXNzSW5mbyl9KTtcbiAgICB9KTtcbiAgfSxcblxuICBfcmVuZGVyUHJvY2Vzc0Nob2ljZXMoKTogP0FycmF5PFJlYWN0RWxlbWVudD4ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnByb2Nlc3Nlc1xuICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+XG4gICAgICAgIDxvcHRpb25cbiAgICAgICAgICAgIGtleT17aXRlbS50b1N0cmluZygpfVxuICAgICAgICAgICAgdmFsdWU9e2luZGV4fVxuICAgICAgICAgICAgc2VsZWN0ZWQ9e2l0ZW0gPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzfT5cbiAgICAgICAgICB7aXRlbS50b1N0cmluZygpfVxuICAgICAgICA8L29wdGlvbj5cbiAgICAgICk7XG4gIH0sXG5cbiAgX2hhbmRsZVNlbGVjdFByb2Nlc3MoZTogYW55KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFByb2Nlc3M6IHRoaXMuc3RhdGUucHJvY2Vzc2VzW2UudGFyZ2V0LnZhbHVlXSxcbiAgICB9KTtcbiAgfSxcblxuICBfaGFuZGxlQ2xpY2soZTogYW55KSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzKSB7XG4gICAgICB0aGlzLnByb3BzLmFjdGlvbnMuYXR0YWNoVG9Qcm9jZXNzKHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9jZXNzKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkUHJvY2VzczogbnVsbH0pO1xuICAgIH1cbiAgfSxcbn0pO1xuXG5mdW5jdGlvbiBjb21wYXJlRGVidWdnZXJQcm9jZXNzSW5mbyhcbiAgdmFsdWU6IERlYnVnZ2VyUHJvY2Vzc0luZm8sXG4gIG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLFxuKTogbnVtYmVyIHtcbiAgY29uc3QgY21wID0gdmFsdWUuZ2V0U2VydmljZU5hbWUoKS5sb2NhbGVDb21wYXJlKG90aGVyLmdldFNlcnZpY2VOYW1lKCkpO1xuICBpZiAoY21wID09PSAwKSB7XG4gICAgcmV0dXJuIHZhbHVlLmNvbXBhcmVEZXRhaWxzKG90aGVyKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJTZXNzaW9uU2VsZWN0b3I7XG4iXX0=