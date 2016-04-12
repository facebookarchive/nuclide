

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

var _require2 = require('../../nuclide-ui/lib/PanelComponent');

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
//# sourceMappingURL=data:application/json;base64,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O0FBRUQsb0JBQWtCLEVBQUEsOEJBQUc7QUFDbkIsUUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUN0QyxRQUFJLFdBQVcsRUFBRTtBQUNmLGlCQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNsQztHQUNGOztBQUVELHNCQUFvQixFQUFBLGdDQUFHO0FBQ3JCLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDckIsVUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7QUFDRCxRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztHQUMxQjs7QUFFRCxTQUFPLEVBQUEsbUJBQVc7QUFDaEIsV0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxTQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFHO0dBQ3BGOztBQUVELG1CQUFpQixFQUFBLDZCQUFHO0FBQ2xCLFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ25DOztBQUVELHNCQUFvQixFQUFBLGdDQUFHO0FBQ3JCLFFBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDdEMsUUFBSSxXQUFXLEVBQUU7QUFDZixpQkFBVyxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQzVCO0dBQ0Y7Q0FDRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlckluc3BlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEJyZWFrcG9pbnRTdG9yZSA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludFN0b3JlJyk7XG5jb25zdCBCcmlkZ2UgPSByZXF1aXJlKCcuL0JyaWRnZScpO1xuY29uc3QgRGVidWdnZXJBY3Rpb25zID0gcmVxdWlyZSgnLi9EZWJ1Z2dlckFjdGlvbnMnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHtQYW5lbENvbXBvbmVudH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9QYW5lbENvbXBvbmVudCcpO1xuXG4vKipcbiAqIFdyYXBwZXIgZm9yIENocm9tZSBEZXZ0b29scyBmcm9udGVuZCB2aWV3LlxuICovXG5jb25zdCBEZWJ1Z2dlckluc3BlY3RvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgX3dlYnZpZXdOb2RlOiAobnVsbDogP09iamVjdCksXG5cbiAgZGlzcGxheU5hbWU6ICdEZWJ1Z2dlckluc3BlY3RvcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgYWN0aW9uczogUHJvcFR5cGVzLmluc3RhbmNlT2YoRGVidWdnZXJBY3Rpb25zKS5pc1JlcXVpcmVkLFxuICAgIGJyZWFrcG9pbnRTdG9yZTogUHJvcFR5cGVzLmluc3RhbmNlT2YoQnJlYWtwb2ludFN0b3JlKS5pc1JlcXVpcmVkLFxuICAgIHNvY2tldDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGJyaWRnZTogUHJvcFR5cGVzLmluc3RhbmNlT2YoQnJpZGdlKS5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPFBhbmVsQ29tcG9uZW50IGluaXRpYWxMZW5ndGg9ezUwMH0gZG9jaz1cInJpZ2h0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5zcGVjdG9yXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250cm9sLWJhclwiIHJlZj1cImNvbnRyb2xCYXJcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdGl0bGU9XCJEZXRhY2ggZnJvbSB0aGUgY3VycmVudCBwcm9jZXNzLlwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImljb24gaWNvbi14XCJcbiAgICAgICAgICAgICAgc3R5bGU9e3tjb2xvcjogJ3JlZCd9fVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja0Nsb3NlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdGl0bGU9XCIoRGVidWcpIE9wZW4gV2ViIEluc3BlY3RvciBmb3IgdGhlIGRlYnVnZ2VyIGZyYW1lLlwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImljb24gaWNvbi1nZWFyXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3tjb2xvcjogJ2dyZXknfX1cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2tEZXZUb29sc31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9QYW5lbENvbXBvbmVudD5cbiAgICApO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIC8vIENhc3QgZnJvbSBIVE1MRWxlbWVudCBkb3duIHRvIFdlYnZpZXdFbGVtZW50IHdpdGhvdXQgaW5zdGFuY2VvZlxuICAgIC8vIGNoZWNraW5nLCBhcyBXZWJ2aWV3RWxlbWVudCBjb25zdHJ1Y3RvciBpcyBub3QgZXhwb3NlZC5cbiAgICBjb25zdCB3ZWJ2aWV3Tm9kZSA9ICgoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnd2VidmlldycpOiBhbnkpOiBXZWJ2aWV3RWxlbWVudCk7XG4gICAgd2Vidmlld05vZGUuc3JjID0gdGhpcy5fZ2V0VXJsKCk7XG4gICAgd2Vidmlld05vZGUubm9kZWludGVncmF0aW9uID0gdHJ1ZTtcbiAgICB3ZWJ2aWV3Tm9kZS5kaXNhYmxld2Vic2VjdXJpdHkgPSB0cnVlO1xuICAgIHdlYnZpZXdOb2RlLmNsYXNzTGlzdC5hZGQoJ25hdGl2ZS1rZXktYmluZGluZ3MnKTsgLy8gcmVxdWlyZWQgdG8gcGFzcyB0aHJvdWdoIGNlcnRhaW4ga2V5IGV2ZW50c1xuICAgIHdlYnZpZXdOb2RlLmNsYXNzTGlzdC5hZGQoJ251Y2xpZGUtZGVidWdnZXItd2VidmlldycpO1xuICAgIHRoaXMuX3dlYnZpZXdOb2RlID0gd2Vidmlld05vZGU7XG4gICAgY29uc3QgY29udHJvbEJhck5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMuY29udHJvbEJhcik7XG4gICAgY29udHJvbEJhck5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod2Vidmlld05vZGUsIGNvbnRyb2xCYXJOb2RlLm5leHRTaWJsaW5nKTtcbiAgICB0aGlzLnByb3BzLmJyaWRnZS5zZXRXZWJ2aWV3RWxlbWVudCh3ZWJ2aWV3Tm9kZSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGNvbnN0IHdlYnZpZXdOb2RlID0gdGhpcy5fd2Vidmlld05vZGU7XG4gICAgaWYgKHdlYnZpZXdOb2RlKSB7XG4gICAgICB3ZWJ2aWV3Tm9kZS5zcmMgPSB0aGlzLl9nZXRVcmwoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuYnJpZGdlKSB7XG4gICAgICB0aGlzLnByb3BzLmJyaWRnZS5jbGVhbnVwKCk7XG4gICAgfVxuICAgIHRoaXMuX3dlYnZpZXdOb2RlID0gbnVsbDtcbiAgfSxcblxuICBfZ2V0VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3BhdGguam9pbihfX2Rpcm5hbWUsICcuLi9zY3JpcHRzL2luc3BlY3Rvci5odG1sJyl9PyR7dGhpcy5wcm9wcy5zb2NrZXR9YDtcbiAgfSxcblxuICBfaGFuZGxlQ2xpY2tDbG9zZSgpIHtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMua2lsbERlYnVnZ2VyKCk7XG4gIH0sXG5cbiAgX2hhbmRsZUNsaWNrRGV2VG9vbHMoKSB7XG4gICAgY29uc3Qgd2Vidmlld05vZGUgPSB0aGlzLl93ZWJ2aWV3Tm9kZTtcbiAgICBpZiAod2Vidmlld05vZGUpIHtcbiAgICAgIHdlYnZpZXdOb2RlLm9wZW5EZXZUb29scygpO1xuICAgIH1cbiAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VySW5zcGVjdG9yO1xuIl19