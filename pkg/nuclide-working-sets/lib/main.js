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

var _PathsObserver = require('./PathsObserver');

exports.WorkingSetsStore = _WorkingSetsStore.WorkingSetsStore;
Object.defineProperty(exports, 'ApplicabilitySortedDefinitions', {
  enumerable: true,
  get: function get() {
    return _WorkingSetsStore.ApplicabilitySortedDefinitions;
  }
});

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

    this._disposables.add(new _PathsObserver.PathsObserver(this.workingSetsStore));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7OztvQkFDSSxNQUFNOztnQ0FDVCxvQkFBb0I7O2lDQUNuQixxQkFBcUI7OzZCQUN6QixpQkFBaUI7O1FBUWhDLGdCQUFnQjs7Ozs2QkFDaEIsOEJBQThCOzs7OzBCQUVsQixjQUFjOzs7Ozt1QkFBL0IsVUFBVTs7OztJQUVaLFVBQVU7QUFLSCxXQUxQLFVBQVUsR0FLQTs7OzBCQUxWLFVBQVU7O0FBTVosUUFBSSxDQUFDLGdCQUFnQixHQUFHLHdDQUFzQixDQUFDO0FBQy9DLFFBQUksQ0FBQyxrQkFBa0IsR0FBRywwQ0FBdUIsQ0FBQztBQUNsRCxRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDOztBQUU5QyxRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDM0UsWUFBSyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDckQsQ0FBQyxDQUFDLENBQUM7O0FBRUosUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQzlFLFlBQUssZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDdEQsQ0FBQyxDQUFDLENBQUM7O0FBRUosUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3JDLGdCQUFnQixFQUNoQixtQ0FBbUMsRUFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FDckUsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLGlDQUFrQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0dBQ2pFOztlQXpCRyxVQUFVOztXQTJCSixzQkFBUztBQUNqQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0E3QkcsVUFBVTs7O0FBaUNoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUU1QixTQUFTLFFBQVEsR0FBRztBQUN6QixNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsV0FBTztHQUNSOztBQUVELFlBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0NBQy9COztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixXQUFPO0dBQ1I7O0FBRUQsWUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3hCLFlBQVUsR0FBRyxJQUFJLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyx1QkFBdUIsR0FBcUI7QUFDMUQsMkJBQVUsVUFBVSxFQUFFLCtEQUErRCxDQUFDLENBQUM7O0FBRXZGLFNBQU8sVUFBVSxDQUFDLGdCQUFnQixDQUFDO0NBQ3BDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuL1dvcmtpbmdTZXRzU3RvcmUnO1xuaW1wb3J0IHtXb3JraW5nU2V0c0NvbmZpZ30gZnJvbSAnLi9Xb3JraW5nU2V0c0NvbmZpZyc7XG5pbXBvcnQge1BhdGhzT2JzZXJ2ZXJ9IGZyb20gJy4vUGF0aHNPYnNlcnZlcic7XG5cbmV4cG9ydCB0eXBlIFdvcmtpbmdTZXREZWZpbml0aW9uID0ge1xuICBuYW1lOiBzdHJpbmc7XG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgdXJpczogQXJyYXk8c3RyaW5nPjtcbn07XG5cbmV4cG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfTtcbmV4cG9ydCB0eXBlIHtBcHBsaWNhYmlsaXR5U29ydGVkRGVmaW5pdGlvbnN9IGZyb20gJy4vV29ya2luZ1NldHNTdG9yZSc7XG5cbmV4cG9ydCB7V29ya2luZ1NldH0gZnJvbSAnLi9Xb3JraW5nU2V0JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIHdvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG4gIF93b3JraW5nU2V0c0NvbmZpZzogV29ya2luZ1NldHNDb25maWc7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLndvcmtpbmdTZXRzU3RvcmUgPSBuZXcgV29ya2luZ1NldHNTdG9yZSgpO1xuICAgIHRoaXMuX3dvcmtpbmdTZXRzQ29uZmlnID0gbmV3IFdvcmtpbmdTZXRzQ29uZmlnKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMud29ya2luZ1NldHNTdG9yZS5vblNhdmVEZWZpbml0aW9ucyhkZWZpbml0aW9ucyA9PiB7XG4gICAgICB0aGlzLl93b3JraW5nU2V0c0NvbmZpZy5zZXREZWZpbml0aW9ucyhkZWZpbml0aW9ucyk7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX3dvcmtpbmdTZXRzQ29uZmlnLm9ic2VydmVEZWZpbml0aW9ucyhkZWZpbml0aW9ucyA9PiB7XG4gICAgICB0aGlzLndvcmtpbmdTZXRzU3RvcmUudXBkYXRlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnMpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnd29ya2luZy1zZXRzOnRvZ2dsZS1sYXN0LXNlbGVjdGVkJyxcbiAgICAgIHRoaXMud29ya2luZ1NldHNTdG9yZS50b2dnbGVMYXN0U2VsZWN0ZWQuYmluZCh0aGlzLndvcmtpbmdTZXRzU3RvcmUpLFxuICAgICkpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG5ldyBQYXRoc09ic2VydmVyKHRoaXMud29ya2luZ1NldHNTdG9yZSkpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBhY3RpdmF0aW9uLmRlYWN0aXZhdGUoKTtcbiAgYWN0aXZhdGlvbiA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlV29ya2luZ1NldHNTdG9yZSgpOiBXb3JraW5nU2V0c1N0b3JlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24sICdXYXMgcmVxdWVzdGVkIHRvIHByb3ZpZGUgc2VydmljZSBmcm9tIGEgbm9uLWFjdGl2YXRlZCBwYWNrYWdlJyk7XG5cbiAgcmV0dXJuIGFjdGl2YXRpb24ud29ya2luZ1NldHNTdG9yZTtcbn1cbiJdfQ==