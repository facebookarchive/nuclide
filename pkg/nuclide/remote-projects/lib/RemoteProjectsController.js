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
var ReactDOM = _require.ReactDOM;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZVByb2plY3RzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7OztnQ0FDQyx5QkFBeUI7O2VBSXBELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFGM0IsS0FBSyxZQUFMLEtBQUs7SUFDTCxRQUFRLFlBQVIsUUFBUTs7Z0JBRWdDLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxELG1CQUFtQixhQUFuQixtQkFBbUI7SUFBRSxVQUFVLGFBQVYsVUFBVTs7QUFDdEMsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O2dCQUM3QixPQUFPLENBQUMsb0JBQW9CLENBQUM7O0lBQTdDLFlBQVksYUFBWixZQUFZOztBQUNuQixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM5QyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7SUFFOUMsd0NBQXdDLEdBQzdDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLGlCQUFpQixDQUQxQyx3Q0FBd0M7O0lBR3pDLHdCQUF3QjtBQU1qQixXQU5QLHdCQUF3QixHQU1kOzBCQU5WLHdCQUF3Qjs7QUFPMUIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFDaEMsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUM5RSx3Q0FBd0MsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ2xGLENBQUM7R0FD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QkFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFLLGFBQWEsQ0FBQyxDQUFDO1NBQzVDO0FBQ0QsZ0JBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFLLGFBQWEsQ0FBQyxDQUFDO0FBQ3BELGVBQUssYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixpQkFBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNuQixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEQsVUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7V0FFZSwwQkFBQyxlQUF1QixFQUFFLE9BQWdCLEVBQVE7QUFDaEUsVUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdkIsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FDbkMsb0JBQUMsYUFBYTtBQUNaLHVCQUFlLEVBQUUsZUFBZSxBQUFDO0FBQ2pDLGVBQU8sRUFBRSxPQUFPLEFBQUM7UUFDakIsRUFDRixJQUFJLENBQUMsYUFBYSxDQUNuQixDQUFDO0tBQ0g7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBbEhHLHdCQUF3Qjs7O0FBcUg5QixNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IlJlbW90ZVByb2plY3RzQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFN0YXR1c0JhclRpbGUgPSByZXF1aXJlKCcuL3VpL1N0YXR1c0JhclRpbGUnKTtcbmNvbnN0IHtpc1RleHRFZGl0b3J9ID0gcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJyk7XG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtdXJpJyk7XG5jb25zdCBDb25uZWN0aW9uU3RhdGUgPSByZXF1aXJlKCcuL0Nvbm5lY3Rpb25TdGF0ZScpO1xuXG5jb25zdCB7b25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbX0gPVxuICByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKS5hdG9tRXZlbnREZWJvdW5jZTtcblxuY2xhc3MgUmVtb3RlUHJvamVjdHNDb250cm9sbGVyIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3RhdHVzQmFyRGl2OiA/SFRNTEVsZW1lbnQ7XG4gIF9zdGF0dXNCYXJUaWxlOiA/YXRvbSRTdGF0dXNCYXJUaWxlO1xuICBfc3RhdHVzU3Vic2NyaXB0aW9uOiA/RGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zdGF0dXNCYXJUaWxlID0gbnVsbDtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0odGhpcy5fZGlzcG9zZVN1YnNjcmlwdGlvbi5iaW5kKHRoaXMpKSxcbiAgICAgIG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0odGhpcy5fdXBkYXRlQ29ubmVjdGlvblN0YXR1cy5iaW5kKHRoaXMpKVxuICAgICk7XG4gIH1cblxuICBfZGlzcG9zZVN1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb247XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMucmVtb3ZlKHN1YnNjcmlwdGlvbik7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQ29ubmVjdGlvblN0YXR1cyhwYW5lSXRlbTogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zZVN1YnNjcmlwdGlvbigpO1xuXG4gICAgaWYgKCFpc1RleHRFZGl0b3IocGFuZUl0ZW0pKSB7XG4gICAgICB0aGlzLl9yZW5kZXJTdGF0dXNCYXIoQ29ubmVjdGlvblN0YXRlLk5PTkUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gcGFuZUl0ZW07XG4gICAgY29uc3QgZmlsZVVyaSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVVyaSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAocmVtb3RlVXJpLmlzTG9jYWwoZmlsZVVyaSkpIHtcbiAgICAgIHRoaXMuX3JlbmRlclN0YXR1c0JhcihDb25uZWN0aW9uU3RhdGUuTE9DQUwsIGZpbGVVcmkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZVN0YXR1cyA9IGlzQ29ubmVjdGVkID0+IHtcbiAgICAgIHRoaXMuX3JlbmRlclN0YXR1c0JhcihcbiAgICAgICAgaXNDb25uZWN0ZWQgPyBDb25uZWN0aW9uU3RhdGUuQ09OTkVDVEVEIDogQ29ubmVjdGlvblN0YXRlLkRJU0NPTk5FQ1RFRCxcbiAgICAgICAgZmlsZVVyaSxcbiAgICAgICk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaShmaWxlVXJpKTtcbiAgICBpZiAoY29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICB1cGRhdGVTdGF0dXMoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNvY2tldCA9IGNvbm5lY3Rpb24uZ2V0U29ja2V0KCk7XG4gICAgdXBkYXRlU3RhdHVzKHNvY2tldC5pc0Nvbm5lY3RlZCgpKTtcbiAgICBzb2NrZXQub24oJ3N0YXR1cycsIHVwZGF0ZVN0YXR1cyk7XG5cbiAgICB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ3N0YXR1cycsIHVwZGF0ZVN0YXR1cyk7XG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbik7XG4gIH1cblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0dXNCYXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9zdGF0dXNCYXJEaXYuY2xhc3NOYW1lID0gJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzIGlubGluZS1ibG9jayc7XG5cbiAgICBjb25zdCB0b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQoXG4gICAgICB0aGlzLl9zdGF0dXNCYXJEaXYsXG4gICAgICB7dGl0bGU6ICdDbGljayB0byBzaG93IGRldGFpbHMgb2YgY29ubmVjdGlvbi4nfVxuICAgICk7XG4gICAgaW52YXJpYW50KHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgY29uc3QgcmlnaHRUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMuX3N0YXR1c0JhckRpdixcbiAgICAgIHByaW9yaXR5OiAtOTksXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaW52YXJpYW50KHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgICBjb25zdCBwYXJlbnROb2RlID0gdGhpcy5fc3RhdHVzQmFyRGl2LnBhcmVudE5vZGU7XG4gICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgICB9XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX3N0YXR1c0JhckRpdik7XG4gICAgICB0aGlzLl9zdGF0dXNCYXJEaXYgPSBudWxsO1xuICAgICAgcmlnaHRUaWxlLmRlc3Ryb3koKTtcbiAgICAgIHRvb2x0aXAuZGlzcG9zZSgpO1xuICAgIH0pKTtcblxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKHRleHRFZGl0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fdXBkYXRlQ29ubmVjdGlvblN0YXR1cyh0ZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyU3RhdHVzQmFyKGNvbm5lY3Rpb25TdGF0ZTogbnVtYmVyLCBmaWxlVXJpPzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9zdGF0dXNCYXJEaXYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zdGF0dXNCYXJUaWxlID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFN0YXR1c0JhclRpbGVcbiAgICAgICAgY29ubmVjdGlvblN0YXRlPXtjb25uZWN0aW9uU3RhdGV9XG4gICAgICAgIGZpbGVVcmk9e2ZpbGVVcml9XG4gICAgICAvPixcbiAgICAgIHRoaXMuX3N0YXR1c0JhckRpdixcbiAgICApO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXI7XG4iXX0=