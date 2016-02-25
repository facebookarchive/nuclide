var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DebuggerProcessInfo = (function () {
  function DebuggerProcessInfo(serviceName, targetUri) {
    _classCallCheck(this, DebuggerProcessInfo);

    this._serviceName = serviceName;
    this._targetUri = targetUri;
  }

  _createClass(DebuggerProcessInfo, [{
    key: 'toString',
    value: function toString() {
      return this._serviceName + ' : ' + this.displayString();
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      throw new Error('abstract method');
    }
  }, {
    key: 'getServiceName',
    value: function getServiceName() {
      return this._serviceName;
    }
  }, {
    key: 'getTargetUri',
    value: function getTargetUri() {
      return this._targetUri;
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      throw new Error('abstract method');
    }
  }, {
    key: 'debug',
    value: _asyncToGenerator(function* () {
      throw new Error('abstract method');
    })

    // For debugLLDB().
  }]);

  return DebuggerProcessInfo;
})();

module.exports = DebuggerProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJvY2Vzc0luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7SUFjTSxtQkFBbUI7QUFJWixXQUpQLG1CQUFtQixDQUlYLFdBQW1CLEVBQUUsU0FBcUIsRUFBRTswQkFKcEQsbUJBQW1COztBQUtyQixRQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztBQUNoQyxRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztHQUM3Qjs7ZUFQRyxtQkFBbUI7O1dBU2Ysb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDekQ7OztXQUVZLHlCQUFXO0FBQ3RCLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRWEsMEJBQVc7QUFDdkIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFVyx3QkFBZTtBQUN6QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDeEI7OztXQUVhLHdCQUFDLEtBQTBCLEVBQVU7QUFDakQsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7NkJBRVUsYUFBOEI7QUFDdkMsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7OztTQS9CRyxtQkFBbUI7OztBQXNDekIsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlclByb2Nlc3NJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJJbnN0YW5jZSBmcm9tICcuL0RlYnVnZ2VySW5zdGFuY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuXG5jbGFzcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcbiAgX3NlcnZpY2VOYW1lOiBzdHJpbmc7XG4gIF90YXJnZXRVcmk6IE51Y2xpZGVVcmk7XG5cbiAgY29uc3RydWN0b3Ioc2VydmljZU5hbWU6IHN0cmluZywgdGFyZ2V0VXJpOiBOdWNsaWRlVXJpKSB7XG4gICAgdGhpcy5fc2VydmljZU5hbWUgPSBzZXJ2aWNlTmFtZTtcbiAgICB0aGlzLl90YXJnZXRVcmkgPSB0YXJnZXRVcmk7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlTmFtZSArICcgOiAnICsgdGhpcy5kaXNwbGF5U3RyaW5nKCk7XG4gIH1cblxuICBkaXNwbGF5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG4gIGdldFNlcnZpY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2VOYW1lO1xuICB9XG5cbiAgZ2V0VGFyZ2V0VXJpKCk6IE51Y2xpZGVVcmkge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXRVcmk7XG4gIH1cblxuICBjb21wYXJlRGV0YWlscyhvdGhlcjogRGVidWdnZXJQcm9jZXNzSW5mbyk6IG51bWJlciB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG4gIGFzeW5jIGRlYnVnKCk6IFByb21pc2U8RGVidWdnZXJJbnN0YW5jZT4ge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICAvLyBGb3IgZGVidWdMTERCKCkuXG4gIHBpZDogbnVtYmVyO1xuICBiYXNlcGF0aDogP3N0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWJ1Z2dlclByb2Nlc3NJbmZvO1xuIl19