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

var React = require('react-for-atom');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var StatusBarTile = require('./ui/StatusBarTile');

var _require2 = require('../../atom-helpers');

var isTextEditor = _require2.isTextEditor;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZVByb2plY3RzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7OztnQ0FDQyx5QkFBeUI7O0FBQ3hELElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztlQUNFLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxELG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxVQUFVLFlBQVYsVUFBVTs7QUFDdEMsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O2dCQUM3QixPQUFPLENBQUMsb0JBQW9CLENBQUM7O0lBQTdDLFlBQVksYUFBWixZQUFZOztBQUNuQixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM5QyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7SUFFOUMsd0NBQXdDLEdBQzdDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLGlCQUFpQixDQUQxQyx3Q0FBd0M7O0lBR3pDLHdCQUF3QjtBQU1qQixXQU5QLHdCQUF3QixHQU1kOzBCQU5WLHdCQUF3Qjs7QUFPMUIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFDaEMsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUM5RSx3Q0FBd0MsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ2xGLENBQUM7R0FDSDs7ZUFmRyx3QkFBd0I7O1dBaUJSLGdD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LGFBQWEsQ0FBQyxDQUFDO1NBQzVDO0FBQ0QsYUFBSyxDQUFDLHNCQUFzQixDQUFDLE9BQUssYUFBYSxDQUFDLENBQUM7QUFDakQsZUFBSyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLGlCQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEIsZUFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ25CLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUN4RCxVQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzFDO0tBQ0Y7OztXQUVlLDBCQUFDLGVBQXVCLEVBQUUsT0FBZ0IsRUFBUTtBQUNoRSxVQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN2QixlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUNoQyxvQkFBQyxhQUFhO0FBQ1osdUJBQWUsRUFBRSxlQUFlLEFBQUM7QUFDakMsZUFBTyxFQUFFLE9BQU8sQUFBQztRQUNqQixFQUNGLElBQUksQ0FBQyxhQUFhLENBQ25CLENBQUM7S0FDSDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0FsSEcsd0JBQXdCOzs7QUFxSDlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsd0JBQXdCLENBQUMiLCJmaWxlIjoiUmVtb3RlUHJvamVjdHNDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBTdGF0dXNCYXJUaWxlID0gcmVxdWlyZSgnLi91aS9TdGF0dXNCYXJUaWxlJyk7XG5jb25zdCB7aXNUZXh0RWRpdG9yfSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3QgQ29ubmVjdGlvblN0YXRlID0gcmVxdWlyZSgnLi9Db25uZWN0aW9uU3RhdGUnKTtcblxuY29uc3Qge29uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW19ID1cbiAgcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJykuYXRvbUV2ZW50RGVib3VuY2U7XG5cbmNsYXNzIFJlbW90ZVByb2plY3RzQ29udHJvbGxlciB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N0YXR1c0JhckRpdjogP0hUTUxFbGVtZW50O1xuICBfc3RhdHVzQmFyVGlsZTogP2F0b20kU3RhdHVzQmFyVGlsZTtcbiAgX3N0YXR1c1N1YnNjcmlwdGlvbjogP0Rpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IG51bGw7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHRoaXMuX2Rpc3Bvc2VTdWJzY3JpcHRpb24uYmluZCh0aGlzKSksXG4gICAgICBvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKHRoaXMuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0dXMuYmluZCh0aGlzKSlcbiAgICApO1xuICB9XG5cbiAgX2Rpc3Bvc2VTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uO1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLnJlbW92ZShzdWJzY3JpcHRpb24pO1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZUNvbm5lY3Rpb25TdGF0dXMocGFuZUl0ZW06IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2VTdWJzY3JpcHRpb24oKTtcblxuICAgIGlmICghaXNUZXh0RWRpdG9yKHBhbmVJdGVtKSkge1xuICAgICAgdGhpcy5fcmVuZGVyU3RhdHVzQmFyKENvbm5lY3Rpb25TdGF0ZS5OT05FKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHBhbmVJdGVtO1xuICAgIGNvbnN0IGZpbGVVcmkgPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVVcmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHJlbW90ZVVyaS5pc0xvY2FsKGZpbGVVcmkpKSB7XG4gICAgICB0aGlzLl9yZW5kZXJTdGF0dXNCYXIoQ29ubmVjdGlvblN0YXRlLkxPQ0FMLCBmaWxlVXJpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVTdGF0dXMgPSBpc0Nvbm5lY3RlZCA9PiB7XG4gICAgICB0aGlzLl9yZW5kZXJTdGF0dXNCYXIoXG4gICAgICAgIGlzQ29ubmVjdGVkID8gQ29ubmVjdGlvblN0YXRlLkNPTk5FQ1RFRCA6IENvbm5lY3Rpb25TdGF0ZS5ESVNDT05ORUNURUQsXG4gICAgICAgIGZpbGVVcmksXG4gICAgICApO1xuICAgIH07XG5cbiAgICBjb25zdCBjb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvbi5nZXRGb3JVcmkoZmlsZVVyaSk7XG4gICAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgdXBkYXRlU3RhdHVzKGZhbHNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXQgPSBjb25uZWN0aW9uLmdldFNvY2tldCgpO1xuICAgIHVwZGF0ZVN0YXR1cyhzb2NrZXQuaXNDb25uZWN0ZWQoKSk7XG4gICAgc29ja2V0Lm9uKCdzdGF0dXMnLCB1cGRhdGVTdGF0dXMpO1xuXG4gICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdzdGF0dXMnLCB1cGRhdGVTdGF0dXMpO1xuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhdHVzQmFyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fc3RhdHVzQmFyRGl2LmNsYXNzTmFtZSA9ICdudWNsaWRlLXJlbW90ZS1wcm9qZWN0cyBpbmxpbmUtYmxvY2snO1xuXG4gICAgY29uc3QgdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKFxuICAgICAgdGhpcy5fc3RhdHVzQmFyRGl2LFxuICAgICAge3RpdGxlOiAnQ2xpY2sgdG8gc2hvdyBkZXRhaWxzIG9mIGNvbm5lY3Rpb24uJ31cbiAgICApO1xuICAgIGludmFyaWFudCh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgIGNvbnN0IHJpZ2h0VGlsZSA9IHN0YXR1c0Jhci5hZGRMZWZ0VGlsZSh7XG4gICAgICBpdGVtOiB0aGlzLl9zdGF0dXNCYXJEaXYsXG4gICAgICBwcmlvcml0eTogLTk5LFxuICAgIH0pO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGludmFyaWFudCh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHRoaXMuX3N0YXR1c0JhckRpdi5wYXJlbnROb2RlO1xuICAgICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgICAgfVxuICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9zdGF0dXNCYXJEaXYpO1xuICAgICAgdGhpcy5fc3RhdHVzQmFyRGl2ID0gbnVsbDtcbiAgICAgIHJpZ2h0VGlsZS5kZXN0cm95KCk7XG4gICAgICB0b29sdGlwLmRpc3Bvc2UoKTtcbiAgICB9KSk7XG5cbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICh0ZXh0RWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0dXModGV4dEVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlclN0YXR1c0Jhcihjb25uZWN0aW9uU3RhdGU6IG51bWJlciwgZmlsZVVyaT86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fc3RhdHVzQmFyRGl2KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxTdGF0dXNCYXJUaWxlXG4gICAgICAgIGNvbm5lY3Rpb25TdGF0ZT17Y29ubmVjdGlvblN0YXRlfVxuICAgICAgICBmaWxlVXJpPXtmaWxlVXJpfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9zdGF0dXNCYXJEaXYsXG4gICAgKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlUHJvamVjdHNDb250cm9sbGVyO1xuIl19