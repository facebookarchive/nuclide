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

var _nuclideCommons = require('../../nuclide-commons');

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
        if (atom.workspace.isTextEditor(event.item)) {
          controller.onOpen(event.item);
        }
      }));
      this._disposables.add(atom.workspace.observeActivePaneItem(function (item) {
        if (atom.workspace.isTextEditor(item)) {
          controller.onActivate(item);
        }
      }));
      this._disposables.add(atom.workspace.onDidStopChangingActivePaneItem(function (item) {
        if (atom.workspace.isTextEditor(item)) {
          controller.onActiveStopChanging(item);
        }
      }));
      this._disposables.add(_nuclideAtomHelpers.projects.onDidRemoveProjectPath(function (path) {
        controller.removePath(path, atom.project.getDirectories().map(function (directory) {
          return directory.getPath();
        }));
      }));
      this._disposables.add(new _nuclideCommons.DisposableSubscription((0, _nuclideAtomHelpers.observeNavigatingEditors)().subscribe(function (editor) {
        controller.onOptInNavigation(editor);
      })));

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
//# sourceMappingURL=data:application/json;base64,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QUFDLGlCQUFpQixFQUFFO1NBQUEsQ0FBQyxDQUFDO09BQy9FLENBQUMsQ0FBQyxDQUFDO0tBQ1A7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBaEZHLFVBQVU7OztBQW1GaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFFO0FBQ3ZDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMsY0FBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQ3ZCO0NBQ0Y7O0FBRU0sU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0YiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBwcm9qZWN0cyxcbiAgZ2V0Vmlld09mRWRpdG9yLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge05hdmlnYXRpb25TdGFja0NvbnRyb2xsZXJ9IGZyb20gJy4vTmF2aWdhdGlvblN0YWNrQ29udHJvbGxlcic7XG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge0Rpc3Bvc2FibGVTdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge29ic2VydmVOYXZpZ2F0aW5nRWRpdG9yc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuXG5jb25zdCBjb250cm9sbGVyID0gbmV3IE5hdmlnYXRpb25TdGFja0NvbnRyb2xsZXIoKTtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuXG4gICAgY29uc3Qgc3Vic2NyaWJlRWRpdG9yID0gKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JTdWJzY3JpcHRpb24gPSBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihcbiAgICAgICAgKGV2ZW50OiBDaGFuZ2VDdXJzb3JQb3NpdGlvbkV2ZW50KSA9PiB7XG4gICAgICAgICAgY29udHJvbGxlci51cGRhdGVQb3NpdGlvbihlZGl0b3IsIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICBjb25zdCBzY3JvbGxTdWJzY3JpcHRpb24gPSBnZXRWaWV3T2ZFZGl0b3IoZWRpdG9yKS5vbkRpZENoYW5nZVNjcm9sbFRvcChcbiAgICAgICAgc2Nyb2xsVG9wID0+IHtcbiAgICAgICAgICBjb250cm9sbGVyLnVwZGF0ZVNjcm9sbChlZGl0b3IsIHNjcm9sbFRvcCk7XG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGN1cnNvclN1YnNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoc2Nyb2xsU3Vic2NyaXB0aW9uKTtcbiAgICAgIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgY29udHJvbGxlci5vbkRlc3Ryb3koZWRpdG9yKTtcbiAgICAgICAgdGhpcy5fZGlzcG9zYWJsZXMucmVtb3ZlKGN1cnNvclN1YnNjcmlwdGlvbik7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLnJlbW92ZShzY3JvbGxTdWJzY3JpcHRpb24pO1xuICAgICAgICB0aGlzLl9kaXNwb3NhYmxlcy5yZW1vdmUoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICB9O1xuXG4gICAgY29uc3QgYWRkRWRpdG9yID0gKGFkZEV2ZW50OiBBZGRUZXh0RWRpdG9yRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGFkZEV2ZW50LnRleHRFZGl0b3I7XG4gICAgICBzdWJzY3JpYmVFZGl0b3IoZWRpdG9yKTtcbiAgICAgIGNvbnRyb2xsZXIub25DcmVhdGUoZWRpdG9yKTtcbiAgICB9O1xuXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoKHN1YnNjcmliZUVkaXRvcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQWRkVGV4dEVkaXRvcihhZGRFZGl0b3IpKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRPcGVuKChldmVudDogT25EaWRPcGVuRXZlbnQpID0+IHtcbiAgICAgIGlmIChhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoZXZlbnQuaXRlbSkpIHtcbiAgICAgICAgY29udHJvbGxlci5vbk9wZW4oKGV2ZW50Lml0ZW06IGFueSkpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKGl0ZW0gPT4ge1xuICAgICAgaWYgKGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihpdGVtKSkge1xuICAgICAgICBjb250cm9sbGVyLm9uQWN0aXZhdGUoKGl0ZW06IGFueSkpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbShpdGVtID0+IHtcbiAgICAgIGlmIChhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoaXRlbSkpIHtcbiAgICAgICAgY29udHJvbGxlci5vbkFjdGl2ZVN0b3BDaGFuZ2luZygoaXRlbTogYW55KSk7XG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm9qZWN0cy5vbkRpZFJlbW92ZVByb2plY3RQYXRoKHBhdGggPT4ge1xuICAgICAgY29udHJvbGxlci5yZW1vdmVQYXRoKFxuICAgICAgICBwYXRoLCBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoZGlyZWN0b3J5ID0+IGRpcmVjdG9yeS5nZXRQYXRoKCkpKTtcbiAgICB9KSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24oXG4gICAgICAgIG9ic2VydmVOYXZpZ2F0aW5nRWRpdG9ycygpLnN1YnNjcmliZShlZGl0b3IgPT4ge1xuICAgICAgICAgIGNvbnRyb2xsZXIub25PcHRJbk5hdmlnYXRpb24oZWRpdG9yKTtcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICApO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLW5hdmlnYXRpb24tc3RhY2s6bmF2aWdhdGUtZm9yd2FyZHMnLCAoKSA9PiB7XG4gICAgICAgIHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgICdudWNsaWRlLW5hdmlnYXRpb24tc3RhY2s6Zm9yd2FyZHMnLCAoKSA9PiBjb250cm9sbGVyLm5hdmlnYXRlRm9yd2FyZHMoKSk7XG4gICAgICB9KSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLW5hdmlnYXRpb24tc3RhY2s6bmF2aWdhdGUtYmFja3dhcmRzJywgKCkgPT4ge1xuICAgICAgICB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgICAnbnVjbGlkZS1uYXZpZ2F0aW9uLXN0YWNrOmJhY2t3YXJkcycsICgpID0+IGNvbnRyb2xsZXIubmF2aWdhdGVCYWNrd2FyZHMoKSk7XG4gICAgICB9KSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgYWN0aXZhdGlvbi5hY3RpdmF0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBpZiAoYWN0aXZhdGlvbiAhPSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gIH1cbn1cbiJdfQ==