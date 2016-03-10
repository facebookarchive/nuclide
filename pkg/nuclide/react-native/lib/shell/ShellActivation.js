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

    // TODO: Enable following when RN changes land
    // this._disposables = new CompositeDisposable(
    //   atom.commands.add('atom-workspace', {
    //     'nuclide-react-native:reload-app': () => this._reload(),
    //   }),
    // );
    this._shellManager = new _ShellMessageManager.ShellMessageManager();
  }

  _createClass(ShellActivation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoZWxsQWN0aXZhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O21DQVdrQyx1QkFBdUI7O0lBRTVDLGVBQWU7QUFLZixXQUxBLGVBQWUsR0FLWjswQkFMSCxlQUFlOzs7Ozs7OztBQVl4QixRQUFJLENBQUMsYUFBYSxHQUFHLDhDQUF5QixDQUFDO0dBQ2hEOztlQWJVLGVBQWU7O1dBZW5CLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFNLE9BQU8sR0FBRztBQUNkLGVBQU8sRUFBRSxDQUFDO0FBQ1YsY0FBTSxFQUFFLFFBQVE7QUFDaEIsY0FBTSxFQUFFLFFBQVE7T0FDakIsQ0FBQztBQUNGLFVBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2xDOzs7U0ExQlUsZUFBZSIsImZpbGUiOiJTaGVsbEFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1NoZWxsTWVzc2FnZU1hbmFnZXJ9IGZyb20gJy4vU2hlbGxNZXNzYWdlTWFuYWdlcic7XG5cbmV4cG9ydCBjbGFzcyBTaGVsbEFjdGl2YXRpb24ge1xuXG4gIF9kaXNwb3NhYmxlczogSURpc3Bvc2FibGU7XG4gIF9zaGVsbE1hbmFnZXI6IFNoZWxsTWVzc2FnZU1hbmFnZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gVE9ETzogRW5hYmxlIGZvbGxvd2luZyB3aGVuIFJOIGNoYW5nZXMgbGFuZFxuICAgIC8vIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgLy8gICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgLy8gICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpyZWxvYWQtYXBwJzogKCkgPT4gdGhpcy5fcmVsb2FkKCksXG4gICAgLy8gICB9KSxcbiAgICAvLyApO1xuICAgIHRoaXMuX3NoZWxsTWFuYWdlciA9IG5ldyBTaGVsbE1lc3NhZ2VNYW5hZ2VyKCk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9yZWxvYWQoKTogdm9pZCB7XG4gICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICB0YXJnZXQ6ICdicmlkZ2UnLFxuICAgICAgYWN0aW9uOiAncmVsb2FkJyxcbiAgICB9O1xuICAgIHRoaXMuX3NoZWxsTWFuYWdlci5zZW5kKG1lc3NhZ2UpO1xuICB9XG5cbn1cbiJdfQ==