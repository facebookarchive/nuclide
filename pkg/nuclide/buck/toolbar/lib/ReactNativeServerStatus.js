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

var _atom = require('atom');

var ReactNativeServerStatus = (function () {
  function ReactNativeServerStatus() {
    _classCallCheck(this, ReactNativeServerStatus);

    this._emitter = new _atom.Emitter();
    this._isRunning = false;
  }

  _createClass(ReactNativeServerStatus, [{
    key: 'subscribe',
    value: function subscribe(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'isServerRunning',
    value: function isServerRunning() {
      return this._isRunning;
    }
  }, {
    key: 'setServerRunning',
    value: function setServerRunning(isRunning) {
      if (this._isRunning !== isRunning) {
        this._isRunning = isRunning;
        this._emitter.emit('change');
      }
    }
  }]);

  return ReactNativeServerStatus;
})();

exports['default'] = ReactNativeServerStatus;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyU3RhdHVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBV3NCLE1BQU07O0lBRVAsdUJBQXVCO0FBSy9CLFdBTFEsdUJBQXVCLEdBSzVCOzBCQUxLLHVCQUF1Qjs7QUFNeEMsUUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBYSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0dBQ3pCOztlQVJrQix1QkFBdUI7O1dBVWpDLG1CQUFDLFFBQW9CLEVBQW1CO0FBQy9DLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdDOzs7V0FFYywyQkFBWTtBQUN6QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDeEI7OztXQUVlLDBCQUFDLFNBQWtCLEVBQVE7QUFDekMsVUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtBQUNqQyxZQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUM5QjtLQUNGOzs7U0F2QmtCLHVCQUF1Qjs7O3FCQUF2Qix1QkFBdUIiLCJmaWxlIjoiUmVhY3ROYXRpdmVTZXJ2ZXJTdGF0dXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cyB7XG5cbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9pc1J1bm5pbmc6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5faXNSdW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBzdWJzY3JpYmUoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG4gIH1cblxuICBpc1NlcnZlclJ1bm5pbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzUnVubmluZztcbiAgfVxuXG4gIHNldFNlcnZlclJ1bm5pbmcoaXNSdW5uaW5nOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzUnVubmluZyAhPT0gaXNSdW5uaW5nKSB7XG4gICAgICB0aGlzLl9pc1J1bm5pbmcgPSBpc1J1bm5pbmc7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICAgIH1cbiAgfVxufVxuIl19