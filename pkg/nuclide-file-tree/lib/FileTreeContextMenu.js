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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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
      return node != null && _path2['default'].isAbsolute(node.nodePath) && process.platform === platform;
    }
  }]);

  return FileTreeContextMenu;
})();

module.exports = FileTreeContextMenu;
//# sourceMappingURL=data:application/json;base64,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QyxRQUFRLENBQUMsSUFDOUIsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQzdCO0tBQ0g7OztTQXRLRyxtQkFBbUI7OztBQXlLekIsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZUNvbnRleHRNZW51LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RVZFTlRfSEFORExFUl9TRUxFQ1RPUn0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxudHlwZSBNZW51SXRlbVNpbmdsZSA9IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgY29tbWFuZDogc3RyaW5nO1xuICBzaG91bGREaXNwbGF5PzogKCkgPT4gYm9vbGVhbjtcbn07XG5cbnR5cGUgTWVudUl0ZW1Hcm91cCA9IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgc3VibWVudTogQXJyYXk8TWVudUl0ZW1EZWZpbml0aW9uPjtcbiAgc2hvdWxkRGlzcGxheT86ICgpID0+IGJvb2xlYW47XG59O1xuXG50eXBlIE1lbnVJdGVtU2VwYXJhdG9yID0ge1xuICB0eXBlOiBzdHJpbmc7XG59O1xuXG50eXBlIE1lbnVJdGVtRGVmaW5pdGlvbiA9IE1lbnVJdGVtU2luZ2xlIHwgTWVudUl0ZW1Hcm91cCB8IE1lbnVJdGVtU2VwYXJhdG9yO1xuXG5jbGFzcyBGaWxlVHJlZUNvbnRleHRNZW51IHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2V0IHRvIEN1cnJlbnQgV29ya2luZyBSb290JyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnNldC1jdXJyZW50LXdvcmtpbmctcm9vdCcsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiBub2RlLmlzUm9vdCAmJiB0aGlzLl9zdG9yZS5oYXNDd2QoKSAmJiAhbm9kZS5pc0N3ZCgpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTcGxpdCcsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiAhbm9kZS5pc0NvbnRhaW5lcjtcbiAgICAgICAgfSxcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICdVcCcsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXVwJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICdEb3duJyxcbiAgICAgICAgICAgICdjb21tYW5kJzogJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktZG93bicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnbGFiZWwnOiAnTGVmdCcsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWxlZnQnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ2xhYmVsJzogJ1JpZ2h0JyxcbiAgICAgICAgICAgICdjb21tYW5kJzogJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktcmlnaHQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0pO1xuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdOZXcnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkS2V5cygpLnNpemUgPiAwO1xuICAgICAgICB9LFxuICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdGaWxlJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZmlsZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ0ZvbGRlcicsXG4gICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6YWRkLWZvbGRlcicsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0FkZCBQcm9qZWN0IEZvbGRlcicsXG4gICAgICAgIGNvbW1hbmQ6ICdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdBZGQgUmVtb3RlIFByb2plY3QgRm9sZGVyJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzOmNvbm5lY3QnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdSZW1vdmUgUHJvamVjdCBGb2xkZXInLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlLXByb2plY3QtZm9sZGVyLXNlbGVjdGlvbicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiBub2RlLmlzUm9vdDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ1JlbmFtZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpyZW5hbWUtc2VsZWN0aW9uJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICAvLyBGb3Igbm93LCByZW5hbWUgZG9lcyBub3QgYXBwbHkgdG8gcm9vdCBub2Rlcy5cbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmICFub2RlLmlzUm9vdDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnRHVwbGljYXRlJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOmR1cGxpY2F0ZS1zZWxlY3Rpb24nLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgIW5vZGUuaXNDb250YWluZXI7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgICAgLy8gV2UgY2FuIGRlbGV0ZSBtdWx0aXBsZSBub2RlcyBhcyBsb25nIGFzIG5vIHJvb3Qgbm9kZSBpcyBzZWxlY3RlZFxuICAgICAgICAgIHJldHVybiBub2Rlcy5zaXplID4gMCAmJiBub2Rlcy5ldmVyeShub2RlID0+ICFub2RlLmlzUm9vdCk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0pO1xuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdDb3B5IEZ1bGwgUGF0aCcsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpjb3B5LWZ1bGwtcGF0aCcsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2hvdyBpbiBGaW5kZXInLCAvLyBNYWMgT1MgWFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInLFxuICAgICAgICBzaG91bGREaXNwbGF5OiB0aGlzLl9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzLCAnZGFyd2luJyksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1Nob3cgaW4gRXhwbG9yZXInLCAvLyBXaW5kb3dzXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IHRoaXMuX3Nob3VsZERpc3BsYXlTaG93SW5GaWxlTWFuYWdlci5iaW5kKHRoaXMsICd3aW4zMicpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTaG93IGluIEZpbGUgTWFuYWdlcicsIC8vIExpbnV4XG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IHRoaXMuX3Nob3VsZERpc3BsYXlTaG93SW5GaWxlTWFuYWdlci5iaW5kKHRoaXMsICdsaW51eCcpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTZWFyY2ggaW4gRGlyZWN0b3J5JyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnNlYXJjaC1pbi1kaXJlY3RvcnknLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGVzLnNpemUgPiAwICYmIG5vZGVzLmV2ZXJ5KG5vZGUgPT4gbm9kZS5pc0NvbnRhaW5lcik7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChtZW51SXRlbXM6IEFycmF5PE1lbnVJdGVtRGVmaW5pdGlvbj4pOiB2b2lkIHtcbiAgICAvLyBBdG9tIGlzIHNtYXJ0IGFib3V0IG9ubHkgZGlzcGxheWluZyBhIHNlcGFyYXRvciB3aGVuIHRoZXJlIGFyZSBpdGVtcyB0b1xuICAgIC8vIHNlcGFyYXRlLCBzbyB0aGVyZSB3aWxsIG5ldmVyIGJlIGEgZGFuZ2xpbmcgc2VwYXJhdG9yIGF0IHRoZSBlbmQuXG4gICAgbWVudUl0ZW1zID0gbWVudUl0ZW1zLmNvbmNhdChbe3R5cGU6ICdzZXBhcmF0b3InfV0pO1xuICAgIC8vIFRPRE86IFVzZSBhIGNvbXB1dGVkIHByb3BlcnR5IHdoZW4gc3VwcG9ydGVkIGJ5IEZsb3cuXG4gICAgY29uc3QgY29udGV4dE1lbnUgPSB7fTtcbiAgICBjb250ZXh0TWVudVtFVkVOVF9IQU5ETEVSX1NFTEVDVE9SXSA9IG1lbnVJdGVtcztcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZChjb250ZXh0TWVudSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gQSB7Ym9vbGVhbn0gd2hldGhlciB0aGUgXCJTaG93IGluIEZpbGUgTWFuYWdlclwiIGNvbnRleHQgbWVudSBpdGVtIHNob3VsZCBiZSBkaXNwbGF5ZWRcbiAgICogZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBhbmQgdGhlIGdpdmVuIGBwbGF0Zm9ybWAuXG4gICAqL1xuICBfc2hvdWxkRGlzcGxheVNob3dJbkZpbGVNYW5hZ2VyKHBsYXRmb3JtOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgcmV0dXJuIChcbiAgICAgIG5vZGUgIT0gbnVsbCAmJlxuICAgICAgcGF0aC5pc0Fic29sdXRlKG5vZGUubm9kZVBhdGgpICYmXG4gICAgICBwcm9jZXNzLnBsYXRmb3JtID09PSBwbGF0Zm9ybVxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUNvbnRleHRNZW51O1xuIl19