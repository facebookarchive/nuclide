Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideWorkingSetsStore = provideWorkingSetsStore;

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

var _atom = require('atom');

var _WorkingSetsStore = require('./WorkingSetsStore');

var _WorkingSetsConfig = require('./WorkingSetsConfig');

var _EmptyPathsObserver = require('./EmptyPathsObserver');

exports.WorkingSetsStore = _WorkingSetsStore.WorkingSetsStore;

var _WorkingSet = require('./WorkingSet');

Object.defineProperty(exports, 'WorkingSet', {
  enumerable: true,
  get: function get() {
    return _WorkingSet.WorkingSet;
  }
});

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this.workingSetsStore = new _WorkingSetsStore.WorkingSetsStore();
    this._workingSetsConfig = new _WorkingSetsConfig.WorkingSetsConfig();
    this._disposables = new _atom.CompositeDisposable();

    this._disposables.add(this.workingSetsStore.onSaveDefinitions(function (definitions) {
      _this._workingSetsConfig.setDefinitions(definitions);
    }));

    this._disposables.add(this._workingSetsConfig.observeDefinitions(function (definitions) {
      _this.workingSetsStore.updateDefinitions(definitions);
    }));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:toggle-last-selected', this.workingSetsStore.toggleLastSelected.bind(this.workingSetsStore)));

    var emptyPathsObserver = new _EmptyPathsObserver.EmptyPathsObserver(this.workingSetsStore);
    this._disposables.add(emptyPathsObserver.onEmptyPaths(this.workingSetsStore.deactivateAll.bind(this.workingSetsStore)));
  }

  _createClass(Activation, [{
    key: 'deactivate',
    value: function deactivate() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate() {
  if (activation != null) {
    return;
  }

  activation = new Activation();
}

function deactivate() {
  if (activation == null) {
    return;
  }

  activation.deactivate();
  activation = null;
}

function provideWorkingSetsStore() {
  (0, _assert2['default'])(activation, 'Was requested to provide service from a non-activated package');

  return activation.workingSetsStore;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7OztvQkFDSSxNQUFNOztnQ0FDVCxvQkFBb0I7O2lDQUNuQixxQkFBcUI7O2tDQUNwQixzQkFBc0I7O1FBUTFDLGdCQUFnQjs7MEJBRUosY0FBYzs7Ozs7dUJBQS9CLFVBQVU7Ozs7SUFFWixVQUFVO0FBS0gsV0FMUCxVQUFVLEdBS0E7OzswQkFMVixVQUFVOztBQU1aLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyx3Q0FBc0IsQ0FBQztBQUMvQyxRQUFJLENBQUMsa0JBQWtCLEdBQUcsMENBQXVCLENBQUM7QUFDbEQsUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQzNFLFlBQUssa0JBQWtCLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3JELENBQUMsQ0FBQyxDQUFDOztBQUVKLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUM5RSxZQUFLLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3RELENBQUMsQ0FBQyxDQUFDOztBQUVKLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNyQyxnQkFBZ0IsRUFDaEIsbUNBQW1DLEVBQ25DLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQ3JFLENBQUMsQ0FBQzs7QUFFSCxRQUFNLGtCQUFrQixHQUFHLDJDQUF1QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN6RSxRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQ25ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUNoRSxDQUFDLENBQUM7R0FDSjs7ZUE1QkcsVUFBVTs7V0E4Qkosc0JBQVM7QUFDakIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBaENHLFVBQVU7OztBQW9DaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLEdBQUc7QUFDekIsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLFdBQU87R0FDUjs7QUFFRCxZQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztDQUMvQjs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsV0FBTztHQUNSOztBQUVELFlBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN4QixZQUFVLEdBQUcsSUFBSSxDQUFDO0NBQ25COztBQUVNLFNBQVMsdUJBQXVCLEdBQXFCO0FBQzFELDJCQUFVLFVBQVUsRUFBRSwrREFBK0QsQ0FBQyxDQUFDOztBQUV2RixTQUFPLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztDQUNwQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7V29ya2luZ1NldHNTdG9yZX0gZnJvbSAnLi9Xb3JraW5nU2V0c1N0b3JlJztcbmltcG9ydCB7V29ya2luZ1NldHNDb25maWd9IGZyb20gJy4vV29ya2luZ1NldHNDb25maWcnO1xuaW1wb3J0IHtFbXB0eVBhdGhzT2JzZXJ2ZXJ9IGZyb20gJy4vRW1wdHlQYXRoc09ic2VydmVyJztcblxuZXhwb3J0IHR5cGUgV29ya2luZ1NldERlZmluaXRpb24gPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgYWN0aXZlOiBib29sZWFuO1xuICB1cmlzOiBBcnJheTxzdHJpbmc+O1xufTtcblxuZXhwb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9O1xuXG5leHBvcnQge1dvcmtpbmdTZXR9IGZyb20gJy4vV29ya2luZ1NldCc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICB3b3JraW5nU2V0c1N0b3JlOiBXb3JraW5nU2V0c1N0b3JlO1xuICBfd29ya2luZ1NldHNDb25maWc6IFdvcmtpbmdTZXRzQ29uZmlnO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy53b3JraW5nU2V0c1N0b3JlID0gbmV3IFdvcmtpbmdTZXRzU3RvcmUoKTtcbiAgICB0aGlzLl93b3JraW5nU2V0c0NvbmZpZyA9IG5ldyBXb3JraW5nU2V0c0NvbmZpZygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLndvcmtpbmdTZXRzU3RvcmUub25TYXZlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnMgPT4ge1xuICAgICAgdGhpcy5fd29ya2luZ1NldHNDb25maWcuc2V0RGVmaW5pdGlvbnMoZGVmaW5pdGlvbnMpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl93b3JraW5nU2V0c0NvbmZpZy5vYnNlcnZlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnMgPT4ge1xuICAgICAgdGhpcy53b3JraW5nU2V0c1N0b3JlLnVwZGF0ZURlZmluaXRpb25zKGRlZmluaXRpb25zKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3dvcmtpbmctc2V0czp0b2dnbGUtbGFzdC1zZWxlY3RlZCcsXG4gICAgICB0aGlzLndvcmtpbmdTZXRzU3RvcmUudG9nZ2xlTGFzdFNlbGVjdGVkLmJpbmQodGhpcy53b3JraW5nU2V0c1N0b3JlKSxcbiAgICApKTtcblxuICAgIGNvbnN0IGVtcHR5UGF0aHNPYnNlcnZlciA9IG5ldyBFbXB0eVBhdGhzT2JzZXJ2ZXIodGhpcy53b3JraW5nU2V0c1N0b3JlKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZW1wdHlQYXRoc09ic2VydmVyLm9uRW1wdHlQYXRocyhcbiAgICAgIHRoaXMud29ya2luZ1NldHNTdG9yZS5kZWFjdGl2YXRlQWxsLmJpbmQodGhpcy53b3JraW5nU2V0c1N0b3JlKVxuICAgICkpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBhY3RpdmF0aW9uLmRlYWN0aXZhdGUoKTtcbiAgYWN0aXZhdGlvbiA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlV29ya2luZ1NldHNTdG9yZSgpOiBXb3JraW5nU2V0c1N0b3JlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24sICdXYXMgcmVxdWVzdGVkIHRvIHByb3ZpZGUgc2VydmljZSBmcm9tIGEgbm9uLWFjdGl2YXRlZCBwYWNrYWdlJyk7XG5cbiAgcmV0dXJuIGFjdGl2YXRpb24ud29ya2luZ1NldHNTdG9yZTtcbn1cbiJdfQ==