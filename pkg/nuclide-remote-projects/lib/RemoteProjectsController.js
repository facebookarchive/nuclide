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

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _require = require('react-for-atom');

var React = _require.React;
var ReactDOM = _require.ReactDOM;

var _require2 = require('atom');

var CompositeDisposable = _require2.CompositeDisposable;
var Disposable = _require2.Disposable;

var StatusBarTile = require('./ui/StatusBarTile');
var remoteUri = require('../../nuclide-remote-uri');
var ConnectionState = require('./ConnectionState');

var onWorkspaceDidStopChangingActivePaneItem = require('../../nuclide-atom-helpers').atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

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

      if (!atom.workspace.isTextEditor(paneItem)) {
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

      var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(fileUri);
      if (connection == null) {
        updateStatus(false);
        return;
      }

      var socket = connection.getConnection().getSocket();
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
        ReactDOM.unmountComponentAtNode(_this2._statusBarDiv);
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

      this._statusBarTile = ReactDOM.render(React.createElement(StatusBarTile, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZVByb2plY3RzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7Ozt1Q0FDQyxpQ0FBaUM7O2VBSTVELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFGM0IsS0FBSyxZQUFMLEtBQUs7SUFDTCxRQUFRLFlBQVIsUUFBUTs7Z0JBRWdDLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxELG1CQUFtQixhQUFuQixtQkFBbUI7SUFBRSxVQUFVLGFBQVYsVUFBVTs7QUFDdEMsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDcEQsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDdEQsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0lBRTlDLHdDQUF3QyxHQUM3QyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxpQkFBaUIsQ0FEbEQsd0NBQXdDOztJQUd6Qyx3QkFBd0I7QUFNakIsV0FOUCx3QkFBd0IsR0FNZDswQkFOVix3QkFBd0I7O0FBTzFCLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUU5QyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDOUUsd0NBQXdDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNsRixDQUFDO0dBQ0g7O2VBZkcsd0JBQXdCOztXQWlCUixnQ0FBUztBQUMzQixVQUFNLFlBQVksR0FBRyxJQUFJ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QyxPQUFLLGFBQWEsQ0FBQyxDQUFDO1NBQzVDO0FBQ0QsZ0JBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFLLGFBQWEsQ0FBQyxDQUFDO0FBQ3BELGVBQUssYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixpQkFBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNuQixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEQsVUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7V0FFZSwwQkFBQyxlQUF1QixFQUFFLE9BQWdCLEVBQVE7QUFDaEUsVUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdkIsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FDbkMsb0JBQUMsYUFBYTtBQUNaLHVCQUFlLEVBQUUsZUFBZSxBQUFDO0FBQ2pDLGVBQU8sRUFBRSxPQUFPLEFBQUM7UUFDakIsRUFDRixJQUFJLENBQUMsYUFBYSxDQUNuQixDQUFDO0tBQ0g7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBbEhHLHdCQUF3Qjs7O0FBcUg5QixNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IlJlbW90ZVByb2plY3RzQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5jb25zdCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgU3RhdHVzQmFyVGlsZSA9IHJlcXVpcmUoJy4vdWkvU3RhdHVzQmFyVGlsZScpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG5jb25zdCBDb25uZWN0aW9uU3RhdGUgPSByZXF1aXJlKCcuL0Nvbm5lY3Rpb25TdGF0ZScpO1xuXG5jb25zdCB7b25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbX0gPVxuICByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpLmF0b21FdmVudERlYm91bmNlO1xuXG5jbGFzcyBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXIge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zdGF0dXNCYXJEaXY6ID9IVE1MRWxlbWVudDtcbiAgX3N0YXR1c0JhclRpbGU6ID9hdG9tJFN0YXR1c0JhclRpbGU7XG4gIF9zdGF0dXNTdWJzY3JpcHRpb246ID9EaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N0YXR1c0JhclRpbGUgPSBudWxsO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSh0aGlzLl9kaXNwb3NlU3Vic2NyaXB0aW9uLmJpbmQodGhpcykpLFxuICAgICAgb25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSh0aGlzLl91cGRhdGVDb25uZWN0aW9uU3RhdHVzLmJpbmQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4gIF9kaXNwb3NlU3Vic2NyaXB0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbjtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5yZW1vdmUoc3Vic2NyaXB0aW9uKTtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVDb25uZWN0aW9uU3RhdHVzKHBhbmVJdGVtOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NlU3Vic2NyaXB0aW9uKCk7XG5cbiAgICBpZiAoIWF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihwYW5lSXRlbSkpIHtcbiAgICAgIHRoaXMuX3JlbmRlclN0YXR1c0JhcihDb25uZWN0aW9uU3RhdGUuTk9ORSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBwYW5lSXRlbTtcbiAgICBjb25zdCBmaWxlVXJpID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlVXJpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChyZW1vdGVVcmkuaXNMb2NhbChmaWxlVXJpKSkge1xuICAgICAgdGhpcy5fcmVuZGVyU3RhdHVzQmFyKENvbm5lY3Rpb25TdGF0ZS5MT0NBTCwgZmlsZVVyaSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlU3RhdHVzID0gaXNDb25uZWN0ZWQgPT4ge1xuICAgICAgdGhpcy5fcmVuZGVyU3RhdHVzQmFyKFxuICAgICAgICBpc0Nvbm5lY3RlZCA/IENvbm5lY3Rpb25TdGF0ZS5DT05ORUNURUQgOiBDb25uZWN0aW9uU3RhdGUuRElTQ09OTkVDVEVELFxuICAgICAgICBmaWxlVXJpLFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0Rm9yVXJpKGZpbGVVcmkpO1xuICAgIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHVwZGF0ZVN0YXR1cyhmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc29ja2V0ID0gY29ubmVjdGlvbi5nZXRDb25uZWN0aW9uKCkuZ2V0U29ja2V0KCk7XG4gICAgdXBkYXRlU3RhdHVzKHNvY2tldC5pc0Nvbm5lY3RlZCgpKTtcbiAgICBzb2NrZXQub24oJ3N0YXR1cycsIHVwZGF0ZVN0YXR1cyk7XG5cbiAgICB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ3N0YXR1cycsIHVwZGF0ZVN0YXR1cyk7XG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbik7XG4gIH1cblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0dXNCYXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9zdGF0dXNCYXJEaXYuY2xhc3NOYW1lID0gJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzIGlubGluZS1ibG9jayc7XG5cbiAgICBjb25zdCB0b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQoXG4gICAgICB0aGlzLl9zdGF0dXNCYXJEaXYsXG4gICAgICB7dGl0bGU6ICdDbGljayB0byBzaG93IGRldGFpbHMgb2YgY29ubmVjdGlvbi4nfVxuICAgICk7XG4gICAgaW52YXJpYW50KHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgY29uc3QgcmlnaHRUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMuX3N0YXR1c0JhckRpdixcbiAgICAgIHByaW9yaXR5OiAtOTksXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaW52YXJpYW50KHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgICBjb25zdCBwYXJlbnROb2RlID0gdGhpcy5fc3RhdHVzQmFyRGl2LnBhcmVudE5vZGU7XG4gICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgICB9XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgICB0aGlzLl9zdGF0dXNCYXJEaXYgPSBudWxsO1xuICAgICAgcmlnaHRUaWxlLmRlc3Ryb3koKTtcbiAgICAgIHRvb2x0aXAuZGlzcG9zZSgpO1xuICAgIH0pKTtcblxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKHRleHRFZGl0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fdXBkYXRlQ29ubmVjdGlvblN0YXR1cyh0ZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyU3RhdHVzQmFyKGNvbm5lY3Rpb25TdGF0ZTogbnVtYmVyLCBmaWxlVXJpPzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9zdGF0dXNCYXJEaXYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zdGF0dXNCYXJUaWxlID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFN0YXR1c0JhclRpbGVcbiAgICAgICAgY29ubmVjdGlvblN0YXRlPXtjb25uZWN0aW9uU3RhdGV9XG4gICAgICAgIGZpbGVVcmk9e2ZpbGVVcml9XG4gICAgICAvPixcbiAgICAgIHRoaXMuX3N0YXR1c0JhckRpdixcbiAgICApO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXI7XG4iXX0=