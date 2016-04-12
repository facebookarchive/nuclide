Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _NavigationStackController = require('./NavigationStackController');

var _nuclideAnalytics = require('../../nuclide-analytics');

var controller = new _NavigationStackController.NavigationStackController();

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      var subscribeEditor = function subscribeEditor(editor) {
        var cursorSubscription = editor.onDidChangeCursorPosition(function (event) {
          controller.updatePosition(editor, event.newBufferPosition);
        });
        var scrollSubscription = (0, _nuclideAtomHelpers.getViewOfEditor)(editor).onDidChangeScrollTop(function (scrollTop) {
          controller.updateScroll(editor, scrollTop);
        });
        _this._disposables.add(cursorSubscription);
        _this._disposables.add(scrollSubscription);
        var destroySubscription = editor.onDidDestroy(function () {
          controller.onDestroy(editor);
          _this._disposables.remove(cursorSubscription);
          _this._disposables.remove(scrollSubscription);
          _this._disposables.remove(destroySubscription);
        });
        _this._disposables.add(destroySubscription);
      };

      var addEditor = function addEditor(addEvent) {
        var editor = addEvent.textEditor;
        subscribeEditor(editor);
        controller.onCreate(editor);
      };

      atom.workspace.getTextEditors().forEach(subscribeEditor);
      this._disposables.add(atom.workspace.onDidAddTextEditor(addEditor));
      this._disposables.add(atom.workspace.onDidOpen(function (event) {
        if ((0, _nuclideAtomHelpers.isTextEditor)(event.item)) {
          controller.onOpen(event.item);
        }
      }));
      this._disposables.add(atom.workspace.observeActivePaneItem(function (item) {
        if ((0, _nuclideAtomHelpers.isTextEditor)(item)) {
          controller.onActivate(item);
        }
      }));
      this._disposables.add(atom.workspace.onDidStopChangingActivePaneItem(function (item) {
        if ((0, _nuclideAtomHelpers.isTextEditor)(item)) {
          controller.onActiveStopChanging(item);
        }
      }));
      this._disposables.add(_nuclideAtomHelpers.projects.onDidRemoveProjectPath(function (path) {
        controller.removePath(path, atom.project.getDirectories().map(function (directory) {
          return directory.getPath();
        }));
      }));
      this._disposables.add((0, _nuclideAtomHelpers.observeNavigatingEditors)().subscribe(function (editor) {
        controller.onOptInNavigation(editor);
      }));

      this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-forwards', function () {
        (0, _nuclideAnalytics.trackOperationTiming)('nuclide-navigation-stack:forwards', function () {
          return controller.navigateForwards();
        });
      }));
      this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-backwards', function () {
        (0, _nuclideAnalytics.trackOperationTiming)('nuclide-navigation-stack:backwards', function () {
          return controller.navigateBackwards();
        });
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsQ0FBQztLQUM3Qjs7O1NBNUVHLFVBQVU7OztBQStFaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFFO0FBQ3ZDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMsY0FBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQ3ZCO0NBQ0Y7O0FBRU0sU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0YiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBpc1RleHRFZGl0b3IsXG4gIHByb2plY3RzLFxuICBnZXRWaWV3T2ZFZGl0b3IsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7TmF2aWdhdGlvblN0YWNrQ29udHJvbGxlcn0gZnJvbSAnLi9OYXZpZ2F0aW9uU3RhY2tDb250cm9sbGVyJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7b2JzZXJ2ZU5hdmlnYXRpbmdFZGl0b3JzfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbmNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgTmF2aWdhdGlvblN0YWNrQ29udHJvbGxlcigpO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG5cbiAgICBjb25zdCBzdWJzY3JpYmVFZGl0b3IgPSAoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpID0+IHtcbiAgICAgIGNvbnN0IGN1cnNvclN1YnNjcmlwdGlvbiA9IGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKFxuICAgICAgICAoZXZlbnQ6IENoYW5nZUN1cnNvclBvc2l0aW9uRXZlbnQpID0+IHtcbiAgICAgICAgICBjb250cm9sbGVyLnVwZGF0ZVBvc2l0aW9uKGVkaXRvciwgZXZlbnQubmV3QnVmZmVyUG9zaXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgIGNvbnN0IHNjcm9sbFN1YnNjcmlwdGlvbiA9IGdldFZpZXdPZkVkaXRvcihlZGl0b3IpLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKFxuICAgICAgICBzY3JvbGxUb3AgPT4ge1xuICAgICAgICAgIGNvbnRyb2xsZXIudXBkYXRlU2Nyb2xsKGVkaXRvciwgc2Nyb2xsVG9wKTtcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoY3Vyc29yU3Vic2NyaXB0aW9uKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChzY3JvbGxTdWJzY3JpcHRpb24pO1xuICAgICAgY29uc3QgZGVzdHJveVN1YnNjcmlwdGlvbiA9IGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICBjb250cm9sbGVyLm9uRGVzdHJveShlZGl0b3IpO1xuICAgICAgICB0aGlzLl9kaXNwb3NhYmxlcy5yZW1vdmUoY3Vyc29yU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdGhpcy5fZGlzcG9zYWJsZXMucmVtb3ZlKHNjcm9sbFN1YnNjcmlwdGlvbik7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLnJlbW92ZShkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgIH07XG5cbiAgICBjb25zdCBhZGRFZGl0b3IgPSAoYWRkRXZlbnQ6IEFkZFRleHRFZGl0b3JFdmVudCkgPT4ge1xuICAgICAgY29uc3QgZWRpdG9yID0gYWRkRXZlbnQudGV4dEVkaXRvcjtcbiAgICAgIHN1YnNjcmliZUVkaXRvcihlZGl0b3IpO1xuICAgICAgY29udHJvbGxlci5vbkNyZWF0ZShlZGl0b3IpO1xuICAgIH07XG5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZvckVhY2goc3Vic2NyaWJlRWRpdG9yKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRUZXh0RWRpdG9yKGFkZEVkaXRvcikpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZE9wZW4oKGV2ZW50OiBPbkRpZE9wZW5FdmVudCkgPT4ge1xuICAgICAgaWYgKGlzVGV4dEVkaXRvcihldmVudC5pdGVtKSkge1xuICAgICAgICBjb250cm9sbGVyLm9uT3BlbigoZXZlbnQuaXRlbTogYW55KSk7XG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oaXRlbSA9PiB7XG4gICAgICBpZiAoaXNUZXh0RWRpdG9yKGl0ZW0pKSB7XG4gICAgICAgIGNvbnRyb2xsZXIub25BY3RpdmF0ZSgoaXRlbTogYW55KSk7XG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKGl0ZW0gPT4ge1xuICAgICAgaWYgKGlzVGV4dEVkaXRvcihpdGVtKSkge1xuICAgICAgICBjb250cm9sbGVyLm9uQWN0aXZlU3RvcENoYW5naW5nKChpdGVtOiBhbnkpKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHByb2plY3RzLm9uRGlkUmVtb3ZlUHJvamVjdFBhdGgocGF0aCA9PiB7XG4gICAgICBjb250cm9sbGVyLnJlbW92ZVBhdGgoXG4gICAgICAgIHBhdGgsIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLm1hcChkaXJlY3RvcnkgPT4gZGlyZWN0b3J5LmdldFBhdGgoKSkpO1xuICAgIH0pKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQob2JzZXJ2ZU5hdmlnYXRpbmdFZGl0b3JzKCkuc3Vic2NyaWJlKGVkaXRvciA9PiB7XG4gICAgICBjb250cm9sbGVyLm9uT3B0SW5OYXZpZ2F0aW9uKGVkaXRvcik7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLW5hdmlnYXRpb24tc3RhY2s6bmF2aWdhdGUtZm9yd2FyZHMnLCAoKSA9PiB7XG4gICAgICAgIHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgICdudWNsaWRlLW5hdmlnYXRpb24tc3RhY2s6Zm9yd2FyZHMnLCAoKSA9PiBjb250cm9sbGVyLm5hdmlnYXRlRm9yd2FyZHMoKSk7XG4gICAgICB9KSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLW5hdmlnYXRpb24tc3RhY2s6bmF2aWdhdGUtYmFja3dhcmRzJywgKCkgPT4ge1xuICAgICAgICB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgICAnbnVjbGlkZS1uYXZpZ2F0aW9uLXN0YWNrOmJhY2t3YXJkcycsICgpID0+IGNvbnRyb2xsZXIubmF2aWdhdGVCYWNrd2FyZHMoKSk7XG4gICAgICB9KSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgYWN0aXZhdGlvbi5hY3RpdmF0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBpZiAoYWN0aXZhdGlvbiAhPSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gIH1cbn1cbiJdfQ==