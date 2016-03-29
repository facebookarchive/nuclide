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

var _atom = require('atom');

var _FileTreeConstants = require('./FileTreeConstants');

var _FileTreeStore = require('./FileTreeStore');

var _FileTreeStore2 = _interopRequireDefault(_FileTreeStore);

var _FileTreeHelpers = require('./FileTreeHelpers');

var FileTreeContextMenu = (function () {
  function FileTreeContextMenu() {
    var _this = this;

    _classCallCheck(this, FileTreeContextMenu);

    this._subscriptions = new _atom.CompositeDisposable();
    this._store = _FileTreeStore2['default'].getInstance();
    this._addContextMenuItemGroup([{
      label: 'Set to Current Working Root',
      command: 'nuclide-file-tree:set-current-working-root',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        return node != null && node.isRoot && _this._store.hasCwd() && !node.isCwd();
      }
    }, {
      label: 'Split',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        return node != null && !node.isContainer;
      },
      submenu: [{
        'label': 'Up',
        'command': 'nuclide-file-tree:open-selected-entry-up'
      }, {
        'label': 'Down',
        'command': 'nuclide-file-tree:open-selected-entry-down'
      }, {
        'label': 'Left',
        'command': 'nuclide-file-tree:open-selected-entry-left'
      }, {
        'label': 'Right',
        'command': 'nuclide-file-tree:open-selected-entry-right'
      }]
    }]);
    this._addContextMenuItemGroup([{
      label: 'New',
      shouldDisplay: function shouldDisplay() {
        return _this._store.getSelectedKeys().size > 0;
      },
      submenu: [{
        label: 'File',
        command: 'nuclide-file-tree:add-file'
      }, {
        label: 'Folder',
        command: 'nuclide-file-tree:add-folder'
      }]
    }]);
    this._addContextMenuItemGroup([{
      label: 'Add Project Folder',
      command: 'application:add-project-folder'
    }, {
      label: 'Add Remote Project Folder',
      command: 'nuclide-remote-projects:connect'
    }, {
      label: 'Remove Project Folder',
      command: 'nuclide-file-tree:remove-project-folder-selection',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        return node != null && node.isRoot;
      }
    }]);
    this._addContextMenuItemGroup([{
      label: 'Rename',
      command: 'nuclide-file-tree:rename-selection',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        // For now, rename does not apply to root nodes.
        return node != null && !node.isRoot;
      }
    }, {
      label: 'Duplicate',
      command: 'nuclide-file-tree:duplicate-selection',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        return node != null && !node.isContainer;
      }
    }, {
      label: 'Delete',
      command: 'nuclide-file-tree:remove',
      shouldDisplay: function shouldDisplay() {
        var nodes = _this._store.getSelectedNodes();
        // We can delete multiple nodes as long as no root node is selected
        return nodes.size > 0 && nodes.every(function (node) {
          return !node.isRoot;
        });
      }
    }]);
    this._addContextMenuItemGroup([{
      label: 'Copy Full Path',
      command: 'nuclide-file-tree:copy-full-path',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        return node != null;
      }
    }, {
      label: 'Show in Finder', // Mac OS X
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'darwin')
    }, {
      label: 'Show in Explorer', // Windows
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'win32')
    }, {
      label: 'Show in File Manager', // Linux
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'linux')
    }, {
      label: 'Search in Directory',
      command: 'nuclide-file-tree:search-in-directory',
      shouldDisplay: function shouldDisplay() {
        var nodes = _this._store.getSelectedNodes();
        return nodes.size > 0 && nodes.every(function (node) {
          return node.isContainer;
        });
      }
    }]);
  }

  _createClass(FileTreeContextMenu, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }, {
    key: '_addContextMenuItemGroup',
    value: function _addContextMenuItemGroup(menuItems) {
      // Atom is smart about only displaying a separator when there are items to
      // separate, so there will never be a dangling separator at the end.
      menuItems = menuItems.concat([{ type: 'separator' }]);
      // TODO: Use a computed property when supported by Flow.
      var contextMenu = {};
      contextMenu[_FileTreeConstants.EVENT_HANDLER_SELECTOR] = menuItems;
      this._subscriptions.add(atom.contextMenu.add(contextMenu));
    }

    /**
     * @return A {boolean} whether the "Show in File Manager" context menu item should be displayed
     * for the current selection and the given `platform`.
     */
  }, {
    key: '_shouldDisplayShowInFileManager',
    value: function _shouldDisplayShowInFileManager(platform) {
      var node = this._store.getSingleSelectedNode();
      return node != null && (0, _FileTreeHelpers.isFullyQualifiedLocalPath)(node.nodePath) && process.platform === platform;
    }
  }]);

  return FileTreeContextMenu;
})();

module.exports = FileTreeContextMenu;
//# sourceMappingURL=data:application/json;base64,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QyxJQUN4QyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FDN0I7S0FDSDs7O1NBdEtHLG1CQUFtQjs7O0FBeUt6QixNQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDIiwiZmlsZSI6IkZpbGVUcmVlQ29udGV4dE1lbnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFVkVOVF9IQU5ETEVSX1NFTEVDVE9SfSBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5cbmltcG9ydCB7aXNGdWxseVF1YWxpZmllZExvY2FsUGF0aH0gZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuXG50eXBlIE1lbnVJdGVtU2luZ2xlID0ge1xuICBsYWJlbDogc3RyaW5nO1xuICBjb21tYW5kOiBzdHJpbmc7XG4gIHNob3VsZERpc3BsYXk/OiAoKSA9PiBib29sZWFuO1xufTtcblxudHlwZSBNZW51SXRlbUdyb3VwID0ge1xuICBsYWJlbDogc3RyaW5nO1xuICBzdWJtZW51OiBBcnJheTxNZW51SXRlbURlZmluaXRpb24+O1xuICBzaG91bGREaXNwbGF5PzogKCkgPT4gYm9vbGVhbjtcbn07XG5cbnR5cGUgTWVudUl0ZW1TZXBhcmF0b3IgPSB7XG4gIHR5cGU6IHN0cmluZztcbn07XG5cbnR5cGUgTWVudUl0ZW1EZWZpbml0aW9uID0gTWVudUl0ZW1TaW5nbGUgfCBNZW51SXRlbUdyb3VwIHwgTWVudUl0ZW1TZXBhcmF0b3I7XG5cbmNsYXNzIEZpbGVUcmVlQ29udGV4dE1lbnUge1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTZXQgdG8gQ3VycmVudCBXb3JraW5nIFJvb3QnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2V0LWN1cnJlbnQtd29ya2luZy1yb290JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmIG5vZGUuaXNSb290ICYmIHRoaXMuX3N0b3JlLmhhc0N3ZCgpICYmICFub2RlLmlzQ3dkKCk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1NwbGl0JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmICFub2RlLmlzQ29udGFpbmVyO1xuICAgICAgICB9LFxuICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ2xhYmVsJzogJ1VwJyxcbiAgICAgICAgICAgICdjb21tYW5kJzogJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktdXAnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ2xhYmVsJzogJ0Rvd24nLFxuICAgICAgICAgICAgJ2NvbW1hbmQnOiAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1kb3duJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICdMZWZ0JyxcbiAgICAgICAgICAgICdjb21tYW5kJzogJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktbGVmdCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnbGFiZWwnOiAnUmlnaHQnLFxuICAgICAgICAgICAgJ2NvbW1hbmQnOiAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ05ldycsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkuc2l6ZSA+IDA7XG4gICAgICAgIH0sXG4gICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ0ZpbGUnLFxuICAgICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1maWxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRm9sZGVyJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZm9sZGVyJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQWRkIFByb2plY3QgRm9sZGVyJyxcbiAgICAgICAgY29tbWFuZDogJ2FwcGxpY2F0aW9uOmFkZC1wcm9qZWN0LWZvbGRlcicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0FkZCBSZW1vdGUgUHJvamVjdCBGb2xkZXInLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1JlbW92ZSBQcm9qZWN0IEZvbGRlcicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUtcHJvamVjdC1mb2xkZXItc2VsZWN0aW9uJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmIG5vZGUuaXNSb290O1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdKTtcbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnUmVuYW1lJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnJlbmFtZS1zZWxlY3Rpb24nLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIC8vIEZvciBub3csIHJlbmFtZSBkb2VzIG5vdCBhcHBseSB0byByb290IG5vZGVzLlxuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgIW5vZGUuaXNSb290O1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdEdXBsaWNhdGUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6ZHVwbGljYXRlLXNlbGVjdGlvbicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiAhbm9kZS5pc0NvbnRhaW5lcjtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZScsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlcyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICAgICAgICAvLyBXZSBjYW4gZGVsZXRlIG11bHRpcGxlIG5vZGVzIGFzIGxvbmcgYXMgbm8gcm9vdCBub2RlIGlzIHNlbGVjdGVkXG4gICAgICAgICAgcmV0dXJuIG5vZGVzLnNpemUgPiAwICYmIG5vZGVzLmV2ZXJ5KG5vZGUgPT4gIW5vZGUuaXNSb290KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0NvcHkgRnVsbCBQYXRoJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOmNvcHktZnVsbC1wYXRoJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTaG93IGluIEZpbmRlcicsIC8vIE1hYyBPUyBYXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IHRoaXMuX3Nob3VsZERpc3BsYXlTaG93SW5GaWxlTWFuYWdlci5iaW5kKHRoaXMsICdkYXJ3aW4nKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2hvdyBpbiBFeHBsb3JlcicsIC8vIFdpbmRvd3NcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnNob3ctaW4tZmlsZS1tYW5hZ2VyJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogdGhpcy5fc2hvdWxkRGlzcGxheVNob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcywgJ3dpbjMyJyksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1Nob3cgaW4gRmlsZSBNYW5hZ2VyJywgLy8gTGludXhcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnNob3ctaW4tZmlsZS1tYW5hZ2VyJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogdGhpcy5fc2hvdWxkRGlzcGxheVNob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcywgJ2xpbnV4JyksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1NlYXJjaCBpbiBEaXJlY3RvcnknLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2VhcmNoLWluLWRpcmVjdG9yeScsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlcyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZXMuc2l6ZSA+IDAgJiYgbm9kZXMuZXZlcnkobm9kZSA9PiBub2RlLmlzQ29udGFpbmVyKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKG1lbnVJdGVtczogQXJyYXk8TWVudUl0ZW1EZWZpbml0aW9uPik6IHZvaWQge1xuICAgIC8vIEF0b20gaXMgc21hcnQgYWJvdXQgb25seSBkaXNwbGF5aW5nIGEgc2VwYXJhdG9yIHdoZW4gdGhlcmUgYXJlIGl0ZW1zIHRvXG4gICAgLy8gc2VwYXJhdGUsIHNvIHRoZXJlIHdpbGwgbmV2ZXIgYmUgYSBkYW5nbGluZyBzZXBhcmF0b3IgYXQgdGhlIGVuZC5cbiAgICBtZW51SXRlbXMgPSBtZW51SXRlbXMuY29uY2F0KFt7dHlwZTogJ3NlcGFyYXRvcid9XSk7XG4gICAgLy8gVE9ETzogVXNlIGEgY29tcHV0ZWQgcHJvcGVydHkgd2hlbiBzdXBwb3J0ZWQgYnkgRmxvdy5cbiAgICBjb25zdCBjb250ZXh0TWVudSA9IHt9O1xuICAgIGNvbnRleHRNZW51W0VWRU5UX0hBTkRMRVJfU0VMRUNUT1JdID0gbWVudUl0ZW1zO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKGNvbnRleHRNZW51KSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBBIHtib29sZWFufSB3aGV0aGVyIHRoZSBcIlNob3cgaW4gRmlsZSBNYW5hZ2VyXCIgY29udGV4dCBtZW51IGl0ZW0gc2hvdWxkIGJlIGRpc3BsYXllZFxuICAgKiBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGFuZCB0aGUgZ2l2ZW4gYHBsYXRmb3JtYC5cbiAgICovXG4gIF9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIocGxhdGZvcm06IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICByZXR1cm4gKFxuICAgICAgbm9kZSAhPSBudWxsICYmXG4gICAgICBpc0Z1bGx5UXVhbGlmaWVkTG9jYWxQYXRoKG5vZGUubm9kZVBhdGgpICYmXG4gICAgICBwcm9jZXNzLnBsYXRmb3JtID09PSBwbGF0Zm9ybVxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUNvbnRleHRNZW51O1xuIl19