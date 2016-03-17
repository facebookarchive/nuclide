

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BreakpointStore = require('./BreakpointStore');
var Bridge = require('./Bridge');
var DebuggerActions = require('./DebuggerActions');

var _require = require('react-for-atom');

var React = _require.React;
var ReactDOM = _require.ReactDOM;
var PropTypes = React.PropTypes;

var path = require('path');

var _require2 = require('../../nuclide-ui-panel');

var PanelComponent = _require2.PanelComponent;

/**
 * Wrapper for Chrome Devtools frontend view.
 */
var DebuggerInspector = React.createClass({
  _webviewNode: null,

  displayName: 'DebuggerInspector',

  propTypes: {
    actions: PropTypes.instanceOf(DebuggerActions).isRequired,
    breakpointStore: PropTypes.instanceOf(BreakpointStore).isRequired,
    socket: PropTypes.string.isRequired,
    bridge: PropTypes.instanceOf(Bridge).isRequired
  },

  render: function render() {
    return React.createElement(
      PanelComponent,
      { initialLength: 500, dock: 'right' },
      React.createElement(
        'div',
        { className: 'inspector' },
        React.createElement(
          'div',
          { className: 'control-bar', ref: 'controlBar' },
          React.createElement('button', {
            title: 'Detach from the current process.',
            className: 'icon icon-x',
            style: { color: 'red' },
            onClick: this._handleClickClose
          }),
          React.createElement('button', {
            title: '(Debug) Open Web Inspector for the debugger frame.',
            className: 'icon icon-gear',
            style: { color: 'grey' },
            onClick: this._handleClickDevTools
          })
        )
      )
    );
  },

  componentDidMount: function componentDidMount() {
    // Cast from HTMLElement down to WebviewElement without instanceof
    // checking, as WebviewElement constructor is not exposed.
    var webviewNode = document.createElement('webview');
    webviewNode.src = this._getUrl();
    webviewNode.nodeintegration = true;
    webviewNode.disablewebsecurity = true;
    webviewNode.classList.add('native-key-bindings'); // required to pass through certain key events
    webviewNode.classList.add('nuclide-debugger-webview');
    this._webviewNode = webviewNode;
    var controlBarNode = ReactDOM.findDOMNode(this.refs.controlBar);
    controlBarNode.parentNode.insertBefore(webviewNode, controlBarNode.nextSibling);
    this.props.bridge.setWebviewElement(webviewNode);
  },

  componentDidUpdate: function componentDidUpdate() {
    var webviewNode = this._webviewNode;
    if (webviewNode) {
      webviewNode.src = this._getUrl();
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.props.bridge) {
      this.props.bridge.cleanup();
    }
    this._webviewNode = null;
  },

  _getUrl: function _getUrl() {
    return path.join(__dirname, '../scripts/inspector.html') + '?' + this.props.socket;
  },

  _handleClickClose: function _handleClickClose() {
    this.props.actions.killDebugger();
  },

  _handleClickDevTools: function _handleClickDevTools() {
    var webviewNode = this._webviewNode;
    if (webviewNode) {
      webviewNode.openDevTools();
    }
  }
});

module.exports = DebuggerInspector;
//# sourceMappingURL=data:application/json;base64,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O0FBRUQsb0JBQWtCLEVBQUEsOEJBQUc7QUFDbkIsUUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUN0QyxRQUFJLFdBQVcsRUFBRTtBQUNmLGlCQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNsQztHQUNGOztBQUVELHNCQUFvQixFQUFBLGdDQUFHO0FBQ3JCLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDckIsVUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7QUFDRCxRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztHQUMxQjs7QUFFRCxTQUFPLEVBQUEsbUJBQVc7QUFDaEIsV0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxTQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFHO0dBQ3BGOztBQUVELG1CQUFpQixFQUFBLDZCQUFHO0FBQ2xCLFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ25DOztBQUVELHNCQUFvQixFQUFBLGdDQUFHO0FBQ3JCLFFBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDdEMsUUFBSSxXQUFXLEVBQUU7QUFDZixpQkFBVyxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQzVCO0dBQ0Y7Q0FDRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlckluc3BlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEJyZWFrcG9pbnRTdG9yZSA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludFN0b3JlJyk7XG5jb25zdCBCcmlkZ2UgPSByZXF1aXJlKCcuL0JyaWRnZScpO1xuY29uc3QgRGVidWdnZXJBY3Rpb25zID0gcmVxdWlyZSgnLi9EZWJ1Z2dlckFjdGlvbnMnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHtQYW5lbENvbXBvbmVudH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpLXBhbmVsJyk7XG5cbi8qKlxuICogV3JhcHBlciBmb3IgQ2hyb21lIERldnRvb2xzIGZyb250ZW5kIHZpZXcuXG4gKi9cbmNvbnN0IERlYnVnZ2VySW5zcGVjdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBfd2Vidmlld05vZGU6IChudWxsOiA/T2JqZWN0KSxcblxuICBkaXNwbGF5TmFtZTogJ0RlYnVnZ2VySW5zcGVjdG9yJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBhY3Rpb25zOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihEZWJ1Z2dlckFjdGlvbnMpLmlzUmVxdWlyZWQsXG4gICAgYnJlYWtwb2ludFN0b3JlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihCcmVha3BvaW50U3RvcmUpLmlzUmVxdWlyZWQsXG4gICAgc29ja2V0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgYnJpZGdlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihCcmlkZ2UpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8UGFuZWxDb21wb25lbnQgaW5pdGlhbExlbmd0aD17NTAwfSBkb2NrPVwicmlnaHRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbnNwZWN0b3JcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRyb2wtYmFyXCIgcmVmPVwiY29udHJvbEJhclwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0aXRsZT1cIkRldGFjaCBmcm9tIHRoZSBjdXJyZW50IHByb2Nlc3MuXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaWNvbiBpY29uLXhcIlxuICAgICAgICAgICAgICBzdHlsZT17e2NvbG9yOiAncmVkJ319XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrQ2xvc2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0aXRsZT1cIihEZWJ1ZykgT3BlbiBXZWIgSW5zcGVjdG9yIGZvciB0aGUgZGVidWdnZXIgZnJhbWUuXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdlYXJcIlxuICAgICAgICAgICAgICBzdHlsZT17e2NvbG9yOiAnZ3JleSd9fVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja0RldlRvb2xzfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsQ29tcG9uZW50PlxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gQ2FzdCBmcm9tIEhUTUxFbGVtZW50IGRvd24gdG8gV2Vidmlld0VsZW1lbnQgd2l0aG91dCBpbnN0YW5jZW9mXG4gICAgLy8gY2hlY2tpbmcsIGFzIFdlYnZpZXdFbGVtZW50IGNvbnN0cnVjdG9yIGlzIG5vdCBleHBvc2VkLlxuICAgIGNvbnN0IHdlYnZpZXdOb2RlID0gKChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd3ZWJ2aWV3Jyk6IGFueSk6IFdlYnZpZXdFbGVtZW50KTtcbiAgICB3ZWJ2aWV3Tm9kZS5zcmMgPSB0aGlzLl9nZXRVcmwoKTtcbiAgICB3ZWJ2aWV3Tm9kZS5ub2RlaW50ZWdyYXRpb24gPSB0cnVlO1xuICAgIHdlYnZpZXdOb2RlLmRpc2FibGV3ZWJzZWN1cml0eSA9IHRydWU7XG4gICAgd2Vidmlld05vZGUuY2xhc3NMaXN0LmFkZCgnbmF0aXZlLWtleS1iaW5kaW5ncycpOyAvLyByZXF1aXJlZCB0byBwYXNzIHRocm91Z2ggY2VydGFpbiBrZXkgZXZlbnRzXG4gICAgd2Vidmlld05vZGUuY2xhc3NMaXN0LmFkZCgnbnVjbGlkZS1kZWJ1Z2dlci13ZWJ2aWV3Jyk7XG4gICAgdGhpcy5fd2Vidmlld05vZGUgPSB3ZWJ2aWV3Tm9kZTtcbiAgICBjb25zdCBjb250cm9sQmFyTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5jb250cm9sQmFyKTtcbiAgICBjb250cm9sQmFyTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3ZWJ2aWV3Tm9kZSwgY29udHJvbEJhck5vZGUubmV4dFNpYmxpbmcpO1xuICAgIHRoaXMucHJvcHMuYnJpZGdlLnNldFdlYnZpZXdFbGVtZW50KHdlYnZpZXdOb2RlKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgY29uc3Qgd2Vidmlld05vZGUgPSB0aGlzLl93ZWJ2aWV3Tm9kZTtcbiAgICBpZiAod2Vidmlld05vZGUpIHtcbiAgICAgIHdlYnZpZXdOb2RlLnNyYyA9IHRoaXMuX2dldFVybCgpO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5icmlkZ2UpIHtcbiAgICAgIHRoaXMucHJvcHMuYnJpZGdlLmNsZWFudXAoKTtcbiAgICB9XG4gICAgdGhpcy5fd2Vidmlld05vZGUgPSBudWxsO1xuICB9LFxuXG4gIF9nZXRVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7cGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3NjcmlwdHMvaW5zcGVjdG9yLmh0bWwnKX0/JHt0aGlzLnByb3BzLnNvY2tldH1gO1xuICB9LFxuXG4gIF9oYW5kbGVDbGlja0Nsb3NlKCkge1xuICAgIHRoaXMucHJvcHMuYWN0aW9ucy5raWxsRGVidWdnZXIoKTtcbiAgfSxcblxuICBfaGFuZGxlQ2xpY2tEZXZUb29scygpIHtcbiAgICBjb25zdCB3ZWJ2aWV3Tm9kZSA9IHRoaXMuX3dlYnZpZXdOb2RlO1xuICAgIGlmICh3ZWJ2aWV3Tm9kZSkge1xuICAgICAgd2Vidmlld05vZGUub3BlbkRldlRvb2xzKCk7XG4gICAgfVxuICB9LFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJJbnNwZWN0b3I7XG4iXX0=