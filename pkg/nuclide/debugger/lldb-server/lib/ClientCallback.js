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

var _rx = require('rx');

var ClientCallback = (function () {
  // For server messages.

  function ClientCallback() {
    _classCallCheck(this, ClientCallback);

    this._serverMessageObservable = new _rx.Subject();
  }

  _createClass(ClientCallback, [{
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._serverMessageObservable;
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(message) {
      this._serverMessageObservable.onNext(message);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._serverMessageObservable.onCompleted();
    }
  }]);

  return ClientCallback;
})();

exports.ClientCallback = ClientCallback;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWVudENhbGxiYWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBV2tDLElBQUk7O0lBRXpCLGNBQWM7OztBQUdkLFdBSEEsY0FBYyxHQUdYOzBCQUhILGNBQWM7O0FBSXZCLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxpQkFBYSxDQUFDO0dBQy9DOztlQUxVLGNBQWM7O1dBT0Msc0NBQXVCO0FBQy9DLGFBQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDO0tBQ3RDOzs7V0FFVSxxQkFBQyxPQUFlLEVBQVE7QUFDakMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMvQzs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDN0M7OztTQWpCVSxjQUFjIiwiZmlsZSI6IkNsaWVudENhbGxiYWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeCc7XG5cbmV4cG9ydCBjbGFzcyBDbGllbnRDYWxsYmFjayB7XG4gIF9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZTogU3ViamVjdDsgIC8vIEZvciBzZXJ2ZXIgbWVzc2FnZXMuXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGUgPSBuZXcgU3ViamVjdCgpO1xuICB9XG5cbiAgZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGU7XG4gIH1cblxuICBzZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZS5vbk5leHQobWVzc2FnZSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlLm9uQ29tcGxldGVkKCk7XG4gIH1cbn1cbiJdfQ==