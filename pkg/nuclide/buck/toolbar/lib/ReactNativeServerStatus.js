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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyU3RhdHVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBV3NCLE1BQU07O0lBRVAsdUJBQXVCO0FBSy9CLFdBTFEsdUJBQXVCLEdBSzVCOzBCQUxLLHVCQUF1Qjs7QUFNeEMsUUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBYSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0dBQ3pCOztlQVJrQix1QkFBdUI7O1dBVWpDLG1CQUFDLFFBQW9CLEVBQWU7QUFDM0MsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDN0M7OztXQUVjLDJCQUFZO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztLQUN4Qjs7O1dBRWUsMEJBQUMsU0FBa0IsRUFBUTtBQUN6QyxVQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzlCO0tBQ0Y7OztTQXZCa0IsdUJBQXVCOzs7cUJBQXZCLHVCQUF1QiIsImZpbGUiOiJSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWN0TmF0aXZlU2VydmVyU3RhdHVzIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2lzUnVubmluZzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9pc1J1bm5pbmcgPSBmYWxzZTtcbiAgfVxuXG4gIHN1YnNjcmliZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignY2hhbmdlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgaXNTZXJ2ZXJSdW5uaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc1J1bm5pbmc7XG4gIH1cblxuICBzZXRTZXJ2ZXJSdW5uaW5nKGlzUnVubmluZzogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc1J1bm5pbmcgIT09IGlzUnVubmluZykge1xuICAgICAgdGhpcy5faXNSdW5uaW5nID0gaXNSdW5uaW5nO1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==