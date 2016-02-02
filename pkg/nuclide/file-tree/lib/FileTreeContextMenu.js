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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udGV4dE1lbnUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBV2tDLE1BQU07O2lDQUNILHFCQUFxQjs7NkJBQ2hDLGlCQUFpQjs7OzsrQkFFSCxtQkFBbUI7O0lBb0JyRCxtQkFBbUI7QUFJWixXQUpQLG1CQUFtQixHQUlUOzs7MEJBSlYsbUJBQW1COztBQUtyQixRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ2hELFFBQUksQ0FBQyxNQUFNLEdBQUcsMkJBQWMsV0FBVyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQzVCO0FBQ0UsV0FBSyxFQUFFLE9BQU87QUFDZCxtQkFBYSxFQUFFLHlCQUFNO0FBQ25CLFlBQU0sSUFBSSxHQUFHLE1BQUssTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDakQsZUFBTyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztPQUMxQztBQUNELGFBQU8sRUFBRSxDQUNQO0FBQ0UsZUFBTyxFQUFFLElBQUk7QUFDYixpQkFBUyxFQUFFLDBDQUEwQztPQUN0RCxFQUNEO0FBQ0UsZUFBTyxFQUFFLE1BQU07QUFDZixpQkFBUyxFQUFFLDRDQUE0QztPQUN4RCxFQUNEO0FBQ0UsZUFBTyxFQUFFLE1BQU07QUFDZixpQkFBUyxFQUFFLDRDQUE0QztPQUN4RCxFQUNEO0FBQ0UsZUFBTyxFQUFFLE9BQU87QUFDaEIsaUJBQVMsRUFBRSw2Q0FBNkM7T0FDekQsQ0FDRjtLQUNGLENBQ0YsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQzVCO0FBQ0UsV0FBSyxFQUFFLEtBQUs7QUFDWixtQkFBYSxFQUFFLHlCQUFNO0FBQ25CLGVBQU8sTUFBSyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztPQUMvQztBQUNELGFBQU8sRUFBRSxDQUNQO0FBQ0UsYUFB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QUssTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDN0MsZUFBTyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQUEsSUFBSTtpQkFBSSxJQUFJLENBQUMsV0FBVztTQUFBLENBQUMsQ0FBQztPQUNoRTtLQUNGLENBQ0YsQ0FBQyxDQUFDO0dBQ0o7O2VBbklHLG1CQUFtQjs7V0FxSWhCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1dBRXVCLGtDQUFDLFNBQW9DLEVBQVE7OztBQUduRSxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUMsQ0FBQzs7QUFFcEQsVUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLGlCQUFXLDJDQUF3QixHQUFHLFNBQVMsQ0FBQztBQUNoRCxVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0tBQzVEOzs7Ozs7OztXQU04Qix5Q0FBQyxRQUFnQixFQUFXO0FBQ3pELFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUNqRCxhQUNFLElBQUksSUFBSSxJQUFJLElBQ1osZ0RBQTBCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFDeEMsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQzdCO0tBQ0g7OztTQTlKRyxtQkFBbUI7OztBQWlLekIsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZUNvbnRleHRNZW51LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RVZFTlRfSEFORExFUl9TRUxFQ1RPUn0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQge2lzRnVsbHlRdWFsaWZpZWRMb2NhbFBhdGh9IGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcblxudHlwZSBNZW51SXRlbVNpbmdsZSA9IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgY29tbWFuZDogc3RyaW5nO1xuICBzaG91bGREaXNwbGF5PzogKCkgPT4gYm9vbGVhbjtcbn07XG5cbnR5cGUgTWVudUl0ZW1Hcm91cCA9IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgc3VibWVudTogQXJyYXk8TWVudUl0ZW1EZWZpbml0aW9uPjtcbiAgc2hvdWxkRGlzcGxheT86ICgpID0+IGJvb2xlYW47XG59O1xuXG50eXBlIE1lbnVJdGVtU2VwYXJhdG9yID0ge1xuICB0eXBlOiBzdHJpbmc7XG59O1xuXG50eXBlIE1lbnVJdGVtRGVmaW5pdGlvbiA9IE1lbnVJdGVtU2luZ2xlIHwgTWVudUl0ZW1Hcm91cCB8IE1lbnVJdGVtU2VwYXJhdG9yO1xuXG5jbGFzcyBGaWxlVHJlZUNvbnRleHRNZW51IHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU3BsaXQnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgIW5vZGUuaXNDb250YWluZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnbGFiZWwnOiAnVXAnLFxuICAgICAgICAgICAgJ2NvbW1hbmQnOiAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS11cCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnbGFiZWwnOiAnRG93bicsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWRvd24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ2xhYmVsJzogJ0xlZnQnLFxuICAgICAgICAgICAgJ2NvbW1hbmQnOiAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICdSaWdodCcsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXJpZ2h0JyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTmV3JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5zaXplID4gMDtcbiAgICAgICAgfSxcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRmlsZScsXG4gICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6YWRkLWZpbGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdGb2xkZXInLFxuICAgICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1mb2xkZXInLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0pO1xuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdBZGQgUHJvamVjdCBGb2xkZXInLFxuICAgICAgICBjb21tYW5kOiAnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQWRkIFJlbW90ZSBQcm9qZWN0IEZvbGRlcicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLXJlbW90ZS1wcm9qZWN0czpjb25uZWN0JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnUmVtb3ZlIFByb2plY3QgRm9sZGVyJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1wcm9qZWN0LWZvbGRlci1zZWxlY3Rpb24nLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgbm9kZS5pc1Jvb3Q7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0pO1xuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdSZW5hbWUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6cmVuYW1lLXNlbGVjdGlvbicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgLy8gRm9yIG5vdywgcmVuYW1lIGRvZXMgbm90IGFwcGx5IHRvIHJvb3Qgbm9kZXMuXG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiAhbm9kZS5pc1Jvb3Q7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0R1cGxpY2F0ZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpkdXBsaWNhdGUtc2VsZWN0aW9uJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmICFub2RlLmlzQ29udGFpbmVyO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgICAgICAgIC8vIFdlIGNhbiBkZWxldGUgbXVsdGlwbGUgbm9kZXMgYXMgbG9uZyBhcyBubyByb290IG5vZGUgaXMgc2VsZWN0ZWRcbiAgICAgICAgICByZXR1cm4gbm9kZXMuc2l6ZSA+IDAgJiYgbm9kZXMuZXZlcnkobm9kZSA9PiAhbm9kZS5pc1Jvb3QpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdKTtcbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQ29weSBGdWxsIFBhdGgnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6Y29weS1mdWxsLXBhdGgnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGw7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1Nob3cgaW4gRmluZGVyJywgLy8gTWFjIE9TIFhcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnNob3ctaW4tZmlsZS1tYW5hZ2VyJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogdGhpcy5fc2hvdWxkRGlzcGxheVNob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcywgJ2RhcndpbicpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTaG93IGluIEV4cGxvcmVyJywgLy8gV2luZG93c1xuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInLFxuICAgICAgICBzaG91bGREaXNwbGF5OiB0aGlzLl9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzLCAnd2luMzInKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2hvdyBpbiBGaWxlIE1hbmFnZXInLCAvLyBMaW51eFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInLFxuICAgICAgICBzaG91bGREaXNwbGF5OiB0aGlzLl9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzLCAnbGludXgnKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2VhcmNoIGluIERpcmVjdG9yeScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzZWFyY2gtaW4tZGlyZWN0b3J5JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgICAgICAgIHJldHVybiBub2Rlcy5zaXplID4gMCAmJiBub2Rlcy5ldmVyeShub2RlID0+IG5vZGUuaXNDb250YWluZXIpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBfYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAobWVudUl0ZW1zOiBBcnJheTxNZW51SXRlbURlZmluaXRpb24+KTogdm9pZCB7XG4gICAgLy8gQXRvbSBpcyBzbWFydCBhYm91dCBvbmx5IGRpc3BsYXlpbmcgYSBzZXBhcmF0b3Igd2hlbiB0aGVyZSBhcmUgaXRlbXMgdG9cbiAgICAvLyBzZXBhcmF0ZSwgc28gdGhlcmUgd2lsbCBuZXZlciBiZSBhIGRhbmdsaW5nIHNlcGFyYXRvciBhdCB0aGUgZW5kLlxuICAgIG1lbnVJdGVtcyA9IG1lbnVJdGVtcy5jb25jYXQoW3t0eXBlOiAnc2VwYXJhdG9yJ31dKTtcbiAgICAvLyBUT0RPOiBVc2UgYSBjb21wdXRlZCBwcm9wZXJ0eSB3aGVuIHN1cHBvcnRlZCBieSBGbG93LlxuICAgIGNvbnN0IGNvbnRleHRNZW51ID0ge307XG4gICAgY29udGV4dE1lbnVbRVZFTlRfSEFORExFUl9TRUxFQ1RPUl0gPSBtZW51SXRlbXM7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoY29udGV4dE1lbnUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIEEge2Jvb2xlYW59IHdoZXRoZXIgdGhlIFwiU2hvdyBpbiBGaWxlIE1hbmFnZXJcIiBjb250ZXh0IG1lbnUgaXRlbSBzaG91bGQgYmUgZGlzcGxheWVkXG4gICAqIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb24gYW5kIHRoZSBnaXZlbiBgcGxhdGZvcm1gLlxuICAgKi9cbiAgX3Nob3VsZERpc3BsYXlTaG93SW5GaWxlTWFuYWdlcihwbGF0Zm9ybTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIHJldHVybiAoXG4gICAgICBub2RlICE9IG51bGwgJiZcbiAgICAgIGlzRnVsbHlRdWFsaWZpZWRMb2NhbFBhdGgobm9kZS5ub2RlUGF0aCkgJiZcbiAgICAgIHByb2Nlc3MucGxhdGZvcm0gPT09IHBsYXRmb3JtXG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQ29udGV4dE1lbnU7XG4iXX0=