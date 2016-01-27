var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _remoteConnection = require('../../remote-connection');

var _require = require('react-for-atom');

var React = _require.React;

var _require2 = require('atom');

var CompositeDisposable = _require2.CompositeDisposable;
var Disposable = _require2.Disposable;

var StatusBarTile = require('./ui/StatusBarTile');

var _require3 = require('../../atom-helpers');

var isTextEditor = _require3.isTextEditor;

var remoteUri = require('../../remote-uri');
var ConnectionState = require('./ConnectionState');

var onWorkspaceDidStopChangingActivePaneItem = require('../../atom-helpers').atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

var RemoteProjectsController = (function () {
  function RemoteProjectsController() {
    _classCallCheck(this, RemoteProjectsController);

    this._statusBarTile = null;
    this._disposables = new CompositeDisposable();

    this._statusSubscription = null;
    this._disposables.add(atom.workspace.onDidChangeActivePaneItem(this._disposeSubscription.bind(this)), onWorkspaceDidStopChangingActivePaneItem(this._updateConnectionStatus.bind(this)));
  }

  _createClass(RemoteProjectsController, [{
    key: '_disposeSubscription',
    value: function _disposeSubscription() {
      var subscription = this._statusSubscription;
      if (subscription) {
        this._disposables.remove(subscription);
        subscription.dispose();
        this._statusSubscription = null;
      }
    }
  }, {
    key: '_updateConnectionStatus',
    value: function _updateConnectionStatus(paneItem) {
      var _this = this;

      this._disposeSubscription();

      if (!isTextEditor(paneItem)) {
        this._renderStatusBar(ConnectionState.NONE);
        return;
      }
      var textEditor = paneItem;
      var fileUri = textEditor.getPath();
      if (!fileUri) {
        return;
      }
      if (remoteUri.isLocal(fileUri)) {
        this._renderStatusBar(ConnectionState.LOCAL, fileUri);
        return;
      }

      var updateStatus = function updateStatus(isConnected) {
        _this._renderStatusBar(isConnected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED, fileUri);
      };

      var connection = _remoteConnection.RemoteConnection.getForUri(fileUri);
      if (connection == null) {
        updateStatus(false);
        return;
      }

      var socket = connection.getSocket();
      updateStatus(socket.isConnected());
      socket.on('status', updateStatus);

      this._statusSubscription = new Disposable(function () {
        socket.removeListener('status', updateStatus);
      });
      this._disposables.add(this._statusSubscription);
    }
  }, {
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var _this2 = this;

      this._statusBarDiv = document.createElement('div');
      this._statusBarDiv.className = 'nuclide-remote-projects inline-block';

      var tooltip = atom.tooltips.add(this._statusBarDiv, { title: 'Click to show details of connection.' });
      (0, _assert2['default'])(this._statusBarDiv);
      var rightTile = statusBar.addLeftTile({
        item: this._statusBarDiv,
        priority: -99
      });

      this._disposables.add(new Disposable(function () {
        (0, _assert2['default'])(_this2._statusBarDiv);
        var parentNode = _this2._statusBarDiv.parentNode;
        if (parentNode) {
          parentNode.removeChild(_this2._statusBarDiv);
        }
        React.unmountComponentAtNode(_this2._statusBarDiv);
        _this2._statusBarDiv = null;
        rightTile.destroy();
        tooltip.dispose();
      }));

      var textEditor = atom.workspace.getActiveTextEditor();
      if (textEditor != null) {
        this._updateConnectionStatus(textEditor);
      }
    }
  }, {
    key: '_renderStatusBar',
    value: function _renderStatusBar(connectionState, fileUri) {
      if (!this._statusBarDiv) {
        return;
      }

      this._statusBarTile = React.render(React.createElement(StatusBarTile, {
        connectionState: connectionState,
        fileUri: fileUri
      }), this._statusBarDiv);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._disposables.dispose();
    }
  }]);

  return RemoteProjectsController;
})();

module.exports = RemoteProjectsController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZVByb2plY3RzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7OztnQ0FDQyx5QkFBeUI7O2VBQ3hDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O2dCQUM4QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUFsRCxtQkFBbUIsYUFBbkIsbUJBQW1CO0lBQUUsVUFBVSxhQUFWLFVBQVU7O0FBQ3RDLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztnQkFDN0IsT0FBTyxDQUFDLG9CQUFvQixDQUFDOztJQUE3QyxZQUFZLGFBQVosWUFBWTs7QUFDbkIsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDOUMsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0lBRTlDLHdDQUF3QyxHQUM3QyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxpQkFBaUIsQ0FEMUMsd0NBQXdDOztJQUd6Qyx3QkFBd0I7QUFNakIsV0FOUCx3QkFBd0IsR0FNZDswQkFOVix3QkFBd0I7O0FBTzFCLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUU5QyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDOUUsd0NBQXdDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNsRixDQUFDO0dBQ0g7O2VBZkcsd0JBQXdCOztXQWlC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T0FBSyxhQUFhLENBQUMsQ0FBQztTQUM1QztBQUNELGFBQUssQ0FBQyxzQkFBc0IsQ0FBQyxPQUFLLGFBQWEsQ0FBQyxDQUFDO0FBQ2pELGVBQUssYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixpQkFBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNuQixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEQsVUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7V0FFZSwwQkFBQyxlQUF1QixFQUFFLE9BQWdCLEVBQVE7QUFDaEUsVUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdkIsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FDaEMsb0JBQUMsYUFBYTtBQUNaLHVCQUFlLEVBQUUsZUFBZSxBQUFDO0FBQ2pDLGVBQU8sRUFBRSxPQUFPLEFBQUM7UUFDakIsRUFDRixJQUFJLENBQUMsYUFBYSxDQUNuQixDQUFDO0tBQ0g7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBbEhHLHdCQUF3Qjs7O0FBcUg5QixNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IlJlbW90ZVByb2plY3RzQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBTdGF0dXNCYXJUaWxlID0gcmVxdWlyZSgnLi91aS9TdGF0dXNCYXJUaWxlJyk7XG5jb25zdCB7aXNUZXh0RWRpdG9yfSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3QgQ29ubmVjdGlvblN0YXRlID0gcmVxdWlyZSgnLi9Db25uZWN0aW9uU3RhdGUnKTtcblxuY29uc3Qge29uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW19ID1cbiAgcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJykuYXRvbUV2ZW50RGVib3VuY2U7XG5cbmNsYXNzIFJlbW90ZVByb2plY3RzQ29udHJvbGxlciB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N0YXR1c0JhckRpdjogP0hUTUxFbGVtZW50O1xuICBfc3RhdHVzQmFyVGlsZTogP2F0b20kU3RhdHVzQmFyVGlsZTtcbiAgX3N0YXR1c1N1YnNjcmlwdGlvbjogP0Rpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IG51bGw7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHRoaXMuX2Rpc3Bvc2VTdWJzY3JpcHRpb24uYmluZCh0aGlzKSksXG4gICAgICBvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKHRoaXMuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0dXMuYmluZCh0aGlzKSlcbiAgICApO1xuICB9XG5cbiAgX2Rpc3Bvc2VTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uO1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLnJlbW92ZShzdWJzY3JpcHRpb24pO1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZUNvbm5lY3Rpb25TdGF0dXMocGFuZUl0ZW06IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2VTdWJzY3JpcHRpb24oKTtcblxuICAgIGlmICghaXNUZXh0RWRpdG9yKHBhbmVJdGVtKSkge1xuICAgICAgdGhpcy5fcmVuZGVyU3RhdHVzQmFyKENvbm5lY3Rpb25TdGF0ZS5OT05FKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHBhbmVJdGVtO1xuICAgIGNvbnN0IGZpbGVVcmkgPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVVcmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHJlbW90ZVVyaS5pc0xvY2FsKGZpbGVVcmkpKSB7XG4gICAgICB0aGlzLl9yZW5kZXJTdGF0dXNCYXIoQ29ubmVjdGlvblN0YXRlLkxPQ0FMLCBmaWxlVXJpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVTdGF0dXMgPSBpc0Nvbm5lY3RlZCA9PiB7XG4gICAgICB0aGlzLl9yZW5kZXJTdGF0dXNCYXIoXG4gICAgICAgIGlzQ29ubmVjdGVkID8gQ29ubmVjdGlvblN0YXRlLkNPTk5FQ1RFRCA6IENvbm5lY3Rpb25TdGF0ZS5ESVNDT05ORUNURUQsXG4gICAgICAgIGZpbGVVcmksXG4gICAgICApO1xuICAgIH07XG5cbiAgICBjb25zdCBjb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvbi5nZXRGb3JVcmkoZmlsZVVyaSk7XG4gICAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgdXBkYXRlU3RhdHVzKGZhbHNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXQgPSBjb25uZWN0aW9uLmdldFNvY2tldCgpO1xuICAgIHVwZGF0ZVN0YXR1cyhzb2NrZXQuaXNDb25uZWN0ZWQoKSk7XG4gICAgc29ja2V0Lm9uKCdzdGF0dXMnLCB1cGRhdGVTdGF0dXMpO1xuXG4gICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdzdGF0dXMnLCB1cGRhdGVTdGF0dXMpO1xuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhdHVzQmFyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fc3RhdHVzQmFyRGl2LmNsYXNzTmFtZSA9ICdudWNsaWRlLXJlbW90ZS1wcm9qZWN0cyBpbmxpbmUtYmxvY2snO1xuXG4gICAgY29uc3QgdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKFxuICAgICAgdGhpcy5fc3RhdHVzQmFyRGl2LFxuICAgICAge3RpdGxlOiAnQ2xpY2sgdG8gc2hvdyBkZXRhaWxzIG9mIGNvbm5lY3Rpb24uJ31cbiAgICApO1xuICAgIGludmFyaWFudCh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgIGNvbnN0IHJpZ2h0VGlsZSA9IHN0YXR1c0Jhci5hZGRMZWZ0VGlsZSh7XG4gICAgICBpdGVtOiB0aGlzLl9zdGF0dXNCYXJEaXYsXG4gICAgICBwcmlvcml0eTogLTk5LFxuICAgIH0pO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGludmFyaWFudCh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHRoaXMuX3N0YXR1c0JhckRpdi5wYXJlbnROb2RlO1xuICAgICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgICAgfVxuICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgICAgdGhpcy5fc3RhdHVzQmFyRGl2ID0gbnVsbDtcbiAgICAgIHJpZ2h0VGlsZS5kZXN0cm95KCk7XG4gICAgICB0b29sdGlwLmRpc3Bvc2UoKTtcbiAgICB9KSk7XG5cbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICh0ZXh0RWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0dXModGV4dEVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlclN0YXR1c0Jhcihjb25uZWN0aW9uU3RhdGU6IG51bWJlciwgZmlsZVVyaT86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fc3RhdHVzQmFyRGl2KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxTdGF0dXNCYXJUaWxlXG4gICAgICAgIGNvbm5lY3Rpb25TdGF0ZT17Y29ubmVjdGlvblN0YXRlfVxuICAgICAgICBmaWxlVXJpPXtmaWxlVXJpfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9zdGF0dXNCYXJEaXYsXG4gICAgKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlUHJvamVjdHNDb250cm9sbGVyO1xuIl19