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

var _nuclideAnalytics = require('../../nuclide-analytics');

function trackSplit(operation, splitOperation) {
  (0, _nuclideAnalytics.trackOperationTiming)('nuclide-move-pane:move-tab-to-new-pane-' + operation, function () {
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
//# sourceMappingURL=data:application/json;base64,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QUFFO0FBQ2YsZ0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0tBQy9CO0dBQ0Y7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuZnVuY3Rpb24gdHJhY2tTcGxpdChcbiAgICBvcGVyYXRpb246IHN0cmluZyxcbiAgICBzcGxpdE9wZXJhdGlvbjogKHBhbmU6IGF0b20kUGFuZSwgcGFyYW1zPzogYXRvbSRQYW5lU3BsaXRQYXJhbXMpID0+IGF0b20kUGFuZSkge1xuICB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAnbnVjbGlkZS1tb3ZlLXBhbmU6bW92ZS10YWItdG8tbmV3LXBhbmUtJyArIG9wZXJhdGlvbixcbiAgICAoKSA9PiB7IGRvU3BsaXQoc3BsaXRPcGVyYXRpb24pOyB9KTtcbn1cblxuZnVuY3Rpb24gZG9TcGxpdChcbiAgICBzcGxpdE9wZXJhdGlvbjogKHBhbmU6IGF0b20kUGFuZSwgcGFyYW1zPzogYXRvbSRQYW5lU3BsaXRQYXJhbXMpID0+IGF0b20kUGFuZSkge1xuICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpO1xuICBpZiAocGFuZSkge1xuICAgIC8vIE5vdGUgdGhhdCB0aGlzIHdpbGwgKGludGVudGlvbmFsbHkpIGNyZWF0ZSBhbiBlbXB0eSBwYW5lIGlmIHRoZSBhY3RpdmVcbiAgICAvLyBwYW5lIGNvbnRhaW5zIGV4YWN0bHkgemVybyBvciBvbmUgaXRlbXMuXG4gICAgLy8gVGhlIG5ldyBlbXB0eSBwYW5lIHdpbGwgYmUga2VwdCBpZiB0aGUgZ2xvYmFsIGF0b20gc2V0dGluZ1xuICAgIC8vICdEZXN0cm95IEVtcHR5IFBhbmVzJyBpcyBmYWxzZSwgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICBjb25zdCBuZXdQYW5lID0gc3BsaXRPcGVyYXRpb24ocGFuZSwge2NvcHlBY3RpdmVJdGVtOiBmYWxzZX0pO1xuICAgIGNvbnN0IGl0ZW0gPSBwYW5lLmdldEFjdGl2ZUl0ZW0oKTtcbiAgICBpZiAoaXRlbSkge1xuICAgICAgcGFuZS5tb3ZlSXRlbVRvUGFuZShpdGVtLCBuZXdQYW5lLCAwKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaXRVcCgpIHtcbiAgdHJhY2tTcGxpdCgndXAnLCAocGFuZSwgcGFyYW1zKSA9PiBwYW5lLnNwbGl0VXAocGFyYW1zKSk7XG59XG5cbmZ1bmN0aW9uIHNwbGl0RG93bigpIHtcbiAgdHJhY2tTcGxpdCgnZG93bicsIChwYW5lLCBwYXJhbXMpID0+IHBhbmUuc3BsaXREb3duKHBhcmFtcykpO1xufVxuXG5mdW5jdGlvbiBzcGxpdFJpZ2h0KCkge1xuICB0cmFja1NwbGl0KCdyaWdodCcsIChwYW5lLCBwYXJhbXMpID0+IHBhbmUuc3BsaXRSaWdodChwYXJhbXMpKTtcbn1cblxuZnVuY3Rpb24gc3BsaXRMZWZ0KCkge1xuICB0cmFja1NwbGl0KCdsZWZ0JywgKHBhbmUsIHBhcmFtcykgPT4gcGFuZS5zcGxpdExlZnQocGFyYW1zKSk7XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLW1vdmUtcGFuZTptb3ZlLXRhYi10by1uZXctcGFuZS11cCcsIHNwbGl0VXApXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1tb3ZlLXBhbmU6bW92ZS10YWItdG8tbmV3LXBhbmUtZG93bicsIHNwbGl0RG93bilcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLW1vdmUtcGFuZTptb3ZlLXRhYi10by1uZXctcGFuZS1sZWZ0Jywgc3BsaXRMZWZ0KVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ251Y2xpZGUtbW92ZS1wYW5lOm1vdmUtdGFiLXRvLW5ldy1wYW5lLXJpZ2h0Jywgc3BsaXRSaWdodClcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP21peGVkKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuIl19