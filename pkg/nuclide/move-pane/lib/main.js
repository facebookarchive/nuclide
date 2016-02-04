var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _analytics = require('../../analytics');

function trackSplit(operation, splitOperation) {
  (0, _analytics.trackOperationTiming)('nuclide-move-pane:move-tab-to-new-pane-' + operation, function () {
    doSplit(splitOperation);
  });
}

function doSplit(splitOperation) {
  var pane = atom.workspace.getActivePane();
  if (pane) {
    // Note that this will (intentionally) create an empty pane if the active
    // pane contains exactly zero or one items.
    // The new empty pane will be kept if the global atom setting
    // 'Destroy Empty Panes' is false, otherwise it will be removed.
    var newPane = splitOperation(pane, { copyActiveItem: false });
    var item = pane.getActiveItem();
    if (item) {
      pane.moveItemToPane(item, newPane, 0);
    }
  }
}

function splitUp() {
  trackSplit('up', function (pane, params) {
    return pane.splitUp(params);
  });
}

function splitDown() {
  trackSplit('down', function (pane, params) {
    return pane.splitDown(params);
  });
}

function splitRight() {
  trackSplit('right', function (pane, params) {
    return pane.splitRight(params);
  });
}

function splitLeft() {
  trackSplit('left', function (pane, params) {
    return pane.splitLeft(params);
  });
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-up', splitUp));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-down', splitDown));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-left', splitLeft));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-right', splitRight));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

module.exports = {

  activate: function activate(state) {
    if (!activation) {
      activation = new Activation();
    }
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,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QUFFO0FBQ2YsZ0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0tBQy9CO0dBQ0Y7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmZ1bmN0aW9uIHRyYWNrU3BsaXQoXG4gICAgb3BlcmF0aW9uOiBzdHJpbmcsXG4gICAgc3BsaXRPcGVyYXRpb246IChwYW5lOiBhdG9tJFBhbmUsIHBhcmFtcz86IGF0b20kUGFuZVNwbGl0UGFyYW1zKSA9PiBhdG9tJFBhbmUpIHtcbiAgdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgJ251Y2xpZGUtbW92ZS1wYW5lOm1vdmUtdGFiLXRvLW5ldy1wYW5lLScgKyBvcGVyYXRpb24sXG4gICAgKCkgPT4geyBkb1NwbGl0KHNwbGl0T3BlcmF0aW9uKTsgfSk7XG59XG5cbmZ1bmN0aW9uIGRvU3BsaXQoXG4gICAgc3BsaXRPcGVyYXRpb246IChwYW5lOiBhdG9tJFBhbmUsIHBhcmFtcz86IGF0b20kUGFuZVNwbGl0UGFyYW1zKSA9PiBhdG9tJFBhbmUpIHtcbiAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKTtcbiAgaWYgKHBhbmUpIHtcbiAgICAvLyBOb3RlIHRoYXQgdGhpcyB3aWxsIChpbnRlbnRpb25hbGx5KSBjcmVhdGUgYW4gZW1wdHkgcGFuZSBpZiB0aGUgYWN0aXZlXG4gICAgLy8gcGFuZSBjb250YWlucyBleGFjdGx5IHplcm8gb3Igb25lIGl0ZW1zLlxuICAgIC8vIFRoZSBuZXcgZW1wdHkgcGFuZSB3aWxsIGJlIGtlcHQgaWYgdGhlIGdsb2JhbCBhdG9tIHNldHRpbmdcbiAgICAvLyAnRGVzdHJveSBFbXB0eSBQYW5lcycgaXMgZmFsc2UsIG90aGVyd2lzZSBpdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgY29uc3QgbmV3UGFuZSA9IHNwbGl0T3BlcmF0aW9uKHBhbmUsIHtjb3B5QWN0aXZlSXRlbTogZmFsc2V9KTtcbiAgICBjb25zdCBpdGVtID0gcGFuZS5nZXRBY3RpdmVJdGVtKCk7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIHBhbmUubW92ZUl0ZW1Ub1BhbmUoaXRlbSwgbmV3UGFuZSwgMCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNwbGl0VXAoKSB7XG4gIHRyYWNrU3BsaXQoJ3VwJywgKHBhbmUsIHBhcmFtcykgPT4gcGFuZS5zcGxpdFVwKHBhcmFtcykpO1xufVxuXG5mdW5jdGlvbiBzcGxpdERvd24oKSB7XG4gIHRyYWNrU3BsaXQoJ2Rvd24nLCAocGFuZSwgcGFyYW1zKSA9PiBwYW5lLnNwbGl0RG93bihwYXJhbXMpKTtcbn1cblxuZnVuY3Rpb24gc3BsaXRSaWdodCgpIHtcbiAgdHJhY2tTcGxpdCgncmlnaHQnLCAocGFuZSwgcGFyYW1zKSA9PiBwYW5lLnNwbGl0UmlnaHQocGFyYW1zKSk7XG59XG5cbmZ1bmN0aW9uIHNwbGl0TGVmdCgpIHtcbiAgdHJhY2tTcGxpdCgnbGVmdCcsIChwYW5lLCBwYXJhbXMpID0+IHBhbmUuc3BsaXRMZWZ0KHBhcmFtcykpO1xufVxuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1tb3ZlLXBhbmU6bW92ZS10YWItdG8tbmV3LXBhbmUtdXAnLCBzcGxpdFVwKVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ251Y2xpZGUtbW92ZS1wYW5lOm1vdmUtdGFiLXRvLW5ldy1wYW5lLWRvd24nLCBzcGxpdERvd24pXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1tb3ZlLXBhbmU6bW92ZS10YWItdG8tbmV3LXBhbmUtbGVmdCcsIHNwbGl0TGVmdClcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLW1vdmUtcGFuZTptb3ZlLXRhYi10by1uZXctcGFuZS1yaWdodCcsIHNwbGl0UmlnaHQpXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9taXhlZCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKCk7XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxufTtcbiJdfQ==