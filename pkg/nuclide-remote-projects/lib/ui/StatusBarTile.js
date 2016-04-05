

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var ConnectionState = require('../ConnectionState');

var _require = require('../notification');

var notifyLocalDiskFile = _require.notifyLocalDiskFile;
var notifyConnectedRemoteFile = _require.notifyConnectedRemoteFile;
var notifyDisconnectedRemoteFile = _require.notifyDisconnectedRemoteFile;

var _require2 = require('react-for-atom');

var React = _require2.React;
var PropTypes = React.PropTypes;

var StatusBarTile = React.createClass({
  displayName: 'StatusBarTile',

  propTypes: {
    connectionState: PropTypes.number.isRequired,
    fileUri: PropTypes.string
  },

  render: function render() {
    var iconName = null;
    switch (this.props.connectionState) {
      case ConnectionState.NONE:
        break;
      case ConnectionState.LOCAL:
        iconName = 'device-desktop';
        break;
      case ConnectionState.CONNECTED:
        iconName = 'cloud-upload';
        break;
      case ConnectionState.DISCONNECTED:
        iconName = 'alert';
        break;
    }
    // When the active pane isn't a text editor, e.g. diff view, preferences, ..etc.,
    // We don't show a connection status bar.
    if (!iconName) {
      return null;
    }
    return React.createElement('span', {
      className: 'icon icon-' + iconName + ' nuclide-remote-projects-status-icon',
      onClick: this.onStatusBarTileClicked
    });
  },

  onStatusBarTileClicked: function onStatusBarTileClicked() {
    if (!this.props.fileUri) {
      return;
    }
    switch (this.props.connectionState) {
      case ConnectionState.LOCAL:
        notifyLocalDiskFile(this.props.fileUri);
        break;
      case ConnectionState.CONNECTED:
        notifyConnectedRemoteFile(this.props.fileUri);
        break;
      case ConnectionState.DISCONNECTED:
        notifyDisconnectedRemoteFile(this.props.fileUri);
        break;
    }
  }
});

module.exports = StatusBarTile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0YXR1c0JhclRpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztlQUtsRCxPQUFPLENBQUMsaUJBQWlCLENBQUM7O0lBSDVCLG1CQUFtQixZQUFuQixtQkFBbUI7SUFDbkIseUJBQXlCLFlBQXpCLHlCQUF5QjtJQUN6Qiw0QkFBNEIsWUFBNUIsNEJBQTRCOztnQkFFZCxPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssYUFBTCxLQUFLO0lBQ0wsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7QUFFaEIsSUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQ3RDLFdBQVMsRUFBRTtBQUNULG1CQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQzVDLFdBQU8sRUFBRSxTQUFTLENBQUMsTUFBTTtHQUMxQjs7QUFFRCxRQUFNLEVBQUEsa0JBQWtCO0FBQ3RCLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQztBQUNwQixZQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZTtBQUNoQyxXQUFLLGVBQWUsQ0FBQyxJQUFJO0FBQ3ZCLGNBQU07QUFBQSxBQUNSLFdBQUssZUFBZSxDQUFDLEtBQUs7QUFDeEIsZ0JBQVEsR0FBRyxnQkFBZ0IsQ0FBQztBQUM1QixjQUFNO0FBQUEsQUFDUixXQUFLLGVBQWUsQ0FBQyxTQUFTO0FBQzVCLGdCQUFRLEdBQUcsY0FBYyxDQUFDO0FBQzFCLGNBQU07QUFBQSxBQUNSLFdBQUssZUFBZSxDQUFDLFlBQVk7QUFDL0IsZ0JBQVEsR0FBRyxPQUFPLENBQUM7QUFDbkIsY0FBTTtBQUFBLEtBQ1Q7OztBQUdELFFBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsV0FDRTtBQUNFLGVBQVMsaUJBQWUsUUFBUSx5Q0FBdUM7QUFDdkUsYUFBTyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQUFBQztNQUNyQyxDQUNGO0dBQ0g7O0FBRUQsd0JBQXNCLEVBQUEsa0NBQVM7QUFDN0IsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQ3ZCLGFBQU87S0FDUjtBQUNELFlBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlO0FBQ2hDLFdBQUssZUFBZSxDQUFDLEtBQUs7QUFDeEIsMkJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QyxjQUFNO0FBQUEsQUFDUixXQUFLLGVBQWUsQ0FBQyxTQUFTO0FBQzVCLGlDQUF5QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUMsY0FBTTtBQUFBLEFBQ1IsV0FBSyxlQUFlLENBQUMsWUFBWTtBQUMvQixvQ0FBNEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pELGNBQU07QUFBQSxLQUNUO0dBQ0Y7Q0FDRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiU3RhdHVzQmFyVGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IENvbm5lY3Rpb25TdGF0ZSA9IHJlcXVpcmUoJy4uL0Nvbm5lY3Rpb25TdGF0ZScpO1xuY29uc3Qge1xuICBub3RpZnlMb2NhbERpc2tGaWxlLFxuICBub3RpZnlDb25uZWN0ZWRSZW1vdGVGaWxlLFxuICBub3RpZnlEaXNjb25uZWN0ZWRSZW1vdGVGaWxlLFxufSA9IHJlcXVpcmUoJy4uL25vdGlmaWNhdGlvbicpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBTdGF0dXNCYXJUaWxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBjb25uZWN0aW9uU3RhdGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBmaWxlVXJpOiBQcm9wVHlwZXMuc3RyaW5nLFxuICB9LFxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBsZXQgaWNvbk5hbWUgPSBudWxsO1xuICAgIHN3aXRjaCAodGhpcy5wcm9wcy5jb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgIGNhc2UgQ29ubmVjdGlvblN0YXRlLk5PTkU6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25uZWN0aW9uU3RhdGUuTE9DQUw6XG4gICAgICAgIGljb25OYW1lID0gJ2RldmljZS1kZXNrdG9wJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbm5lY3Rpb25TdGF0ZS5DT05ORUNURUQ6XG4gICAgICAgIGljb25OYW1lID0gJ2Nsb3VkLXVwbG9hZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb25uZWN0aW9uU3RhdGUuRElTQ09OTkVDVEVEOlxuICAgICAgICBpY29uTmFtZSA9ICdhbGVydCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBXaGVuIHRoZSBhY3RpdmUgcGFuZSBpc24ndCBhIHRleHQgZWRpdG9yLCBlLmcuIGRpZmYgdmlldywgcHJlZmVyZW5jZXMsIC4uZXRjLixcbiAgICAvLyBXZSBkb24ndCBzaG93IGEgY29ubmVjdGlvbiBzdGF0dXMgYmFyLlxuICAgIGlmICghaWNvbk5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW5cbiAgICAgICAgY2xhc3NOYW1lPXtgaWNvbiBpY29uLSR7aWNvbk5hbWV9IG51Y2xpZGUtcmVtb3RlLXByb2plY3RzLXN0YXR1cy1pY29uYH1cbiAgICAgICAgb25DbGljaz17dGhpcy5vblN0YXR1c0JhclRpbGVDbGlja2VkfVxuICAgICAgLz5cbiAgICApO1xuICB9LFxuXG4gIG9uU3RhdHVzQmFyVGlsZUNsaWNrZWQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnByb3BzLmZpbGVVcmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLnByb3BzLmNvbm5lY3Rpb25TdGF0ZSkge1xuICAgICAgY2FzZSBDb25uZWN0aW9uU3RhdGUuTE9DQUw6XG4gICAgICAgIG5vdGlmeUxvY2FsRGlza0ZpbGUodGhpcy5wcm9wcy5maWxlVXJpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbm5lY3Rpb25TdGF0ZS5DT05ORUNURUQ6XG4gICAgICAgIG5vdGlmeUNvbm5lY3RlZFJlbW90ZUZpbGUodGhpcy5wcm9wcy5maWxlVXJpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbm5lY3Rpb25TdGF0ZS5ESVNDT05ORUNURUQ6XG4gICAgICAgIG5vdGlmeURpc2Nvbm5lY3RlZFJlbW90ZUZpbGUodGhpcy5wcm9wcy5maWxlVXJpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9LFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHVzQmFyVGlsZTtcbiJdfQ==