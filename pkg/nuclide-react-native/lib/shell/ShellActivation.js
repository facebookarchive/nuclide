Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ShellMessageManager = require('./ShellMessageManager');

var ShellActivation = (function () {
  function ShellActivation() {
    _classCallCheck(this, ShellActivation);

    // TODO: Enable following when RN changes land. Don't forget to call dispose in `dispose()`!
    // this._disposables = new CompositeDisposable(
    //   atom.commands.add('atom-workspace', {
    //     'nuclide-react-native:reload-app': () => this._reload(),
    //   }),
    // );
    this._shellManager = new _ShellMessageManager.ShellMessageManager();
  }

  _createClass(ShellActivation, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: '_reload',
    value: function _reload() {
      var message = {
        version: 1,
        target: 'bridge',
        action: 'reload'
      };
      this._shellManager.send(message);
    }
  }]);

  return ShellActivation;
})();

exports.ShellActivation = ShellActivation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoZWxsQWN0aXZhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O21DQVdrQyx1QkFBdUI7O0lBRTVDLGVBQWU7QUFJZixXQUpBLGVBQWUsR0FJWjswQkFKSCxlQUFlOzs7Ozs7OztBQVd4QixRQUFJLENBQUMsYUFBYSxHQUFHLDhDQUF5QixDQUFDO0dBQ2hEOztlQVpVLGVBQWU7O1dBY25CLG1CQUFTLEVBQ2Y7OztXQUVNLG1CQUFTO0FBQ2QsVUFBTSxPQUFPLEdBQUc7QUFDZCxlQUFPLEVBQUUsQ0FBQztBQUNWLGNBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQU0sRUFBRSxRQUFRO09BQ2pCLENBQUM7QUFDRixVQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNsQzs7O1NBeEJVLGVBQWUiLCJmaWxlIjoiU2hlbGxBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtTaGVsbE1lc3NhZ2VNYW5hZ2VyfSBmcm9tICcuL1NoZWxsTWVzc2FnZU1hbmFnZXInO1xuXG5leHBvcnQgY2xhc3MgU2hlbGxBY3RpdmF0aW9uIHtcblxuICBfc2hlbGxNYW5hZ2VyOiBTaGVsbE1lc3NhZ2VNYW5hZ2VyO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIFRPRE86IEVuYWJsZSBmb2xsb3dpbmcgd2hlbiBSTiBjaGFuZ2VzIGxhbmQuIERvbid0IGZvcmdldCB0byBjYWxsIGRpc3Bvc2UgaW4gYGRpc3Bvc2UoKWAhXG4gICAgLy8gdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAvLyAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAvLyAgICAgJ251Y2xpZGUtcmVhY3QtbmF0aXZlOnJlbG9hZC1hcHAnOiAoKSA9PiB0aGlzLl9yZWxvYWQoKSxcbiAgICAvLyAgIH0pLFxuICAgIC8vICk7XG4gICAgdGhpcy5fc2hlbGxNYW5hZ2VyID0gbmV3IFNoZWxsTWVzc2FnZU1hbmFnZXIoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gIH1cblxuICBfcmVsb2FkKCk6IHZvaWQge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAgdGFyZ2V0OiAnYnJpZGdlJyxcbiAgICAgIGFjdGlvbjogJ3JlbG9hZCcsXG4gICAgfTtcbiAgICB0aGlzLl9zaGVsbE1hbmFnZXIuc2VuZChtZXNzYWdlKTtcbiAgfVxuXG59XG4iXX0=