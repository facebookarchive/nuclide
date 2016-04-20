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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJvY2Vzc0luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7SUFjTSxtQkFBbUI7QUFJWixXQUpQLG1CQUFtQixDQUlYLFdBQW1CLEVBQUUsU0FBcUIsRUFBRTswQkFKcEQsbUJBQW1COztBQUtyQixRQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztBQUNoQyxRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztHQUM3Qjs7ZUFQRyxtQkFBbUI7O1dBU2Ysb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDekQ7OztXQUVZLHlCQUFXO0FBQ3RCLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRWEsMEJBQVc7QUFDdkIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFVyx3QkFBZTtBQUN6QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDeEI7OztXQUVhLHdCQUFDLEtBQTBCLEVBQVU7QUFDakQsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7NkJBRVUsYUFBOEI7QUFDdkMsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7OztTQS9CRyxtQkFBbUI7OztBQXNDekIsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlclByb2Nlc3NJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJJbnN0YW5jZSBmcm9tICcuL0RlYnVnZ2VySW5zdGFuY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmNsYXNzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBfc2VydmljZU5hbWU6IHN0cmluZztcbiAgX3RhcmdldFVyaTogTnVjbGlkZVVyaTtcblxuICBjb25zdHJ1Y3RvcihzZXJ2aWNlTmFtZTogc3RyaW5nLCB0YXJnZXRVcmk6IE51Y2xpZGVVcmkpIHtcbiAgICB0aGlzLl9zZXJ2aWNlTmFtZSA9IHNlcnZpY2VOYW1lO1xuICAgIHRoaXMuX3RhcmdldFVyaSA9IHRhcmdldFVyaTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2VOYW1lICsgJyA6ICcgKyB0aGlzLmRpc3BsYXlTdHJpbmcoKTtcbiAgfVxuXG4gIGRpc3BsYXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgZ2V0U2VydmljZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZU5hbWU7XG4gIH1cblxuICBnZXRUYXJnZXRVcmkoKTogTnVjbGlkZVVyaSB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldFVyaTtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgYXN5bmMgZGVidWcoKTogUHJvbWlzZTxEZWJ1Z2dlckluc3RhbmNlPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG4gIC8vIEZvciBkZWJ1Z0xMREIoKS5cbiAgcGlkOiBudW1iZXI7XG4gIGJhc2VwYXRoOiA/c3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyUHJvY2Vzc0luZm87XG4iXX0=