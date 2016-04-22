var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DebuggerInstance = (function () {
  function DebuggerInstance(processInfo) {
    _classCallCheck(this, DebuggerInstance);

    this._processInfo = processInfo;
  }

  _createClass(DebuggerInstance, [{
    key: 'getDebuggerProcessInfo',
    value: function getDebuggerProcessInfo() {
      return this._processInfo;
    }
  }, {
    key: 'getProviderName',
    value: function getProviderName() {
      return this._processInfo.getServiceName();
    }
  }, {
    key: 'getTargetUri',
    value: function getTargetUri() {
      return this._processInfo.getTargetUri();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      throw new Error('abstract method');
    }
  }, {
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      throw new Error('abstract method');
    }
  }]);

  return DebuggerInstance;
})();

module.exports = DebuggerInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VySW5zdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBY00sZ0JBQWdCO0FBSVQsV0FKUCxnQkFBZ0IsQ0FJUixXQUFnQyxFQUFFOzBCQUoxQyxnQkFBZ0I7O0FBS2xCLFFBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0dBQ2pDOztlQU5HLGdCQUFnQjs7V0FRRSxrQ0FBd0I7QUFDNUMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFYywyQkFBVztBQUN4QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDM0M7OztXQUVXLHdCQUFlO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUN6Qzs7O1dBRU0sbUJBQVM7QUFDZCxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7OztXQUVrQiwrQkFBb0I7QUFDckMsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7U0ExQkcsZ0JBQWdCOzs7QUE4QnRCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMiLCJmaWxlIjoiRGVidWdnZXJJbnN0YW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm8gZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5jbGFzcyBEZWJ1Z2dlckluc3RhbmNlIHtcbiAgX3Byb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvO1xuICBvblNlc3Npb25FbmQ6ID8oY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKSB7XG4gICAgdGhpcy5fcHJvY2Vzc0luZm8gPSBwcm9jZXNzSW5mbztcbiAgfVxuXG4gIGdldERlYnVnZ2VyUHJvY2Vzc0luZm8oKTogRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NJbmZvO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NJbmZvLmdldFNlcnZpY2VOYW1lKCk7XG4gIH1cblxuICBnZXRUYXJnZXRVcmkoKTogTnVjbGlkZVVyaSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NJbmZvLmdldFRhcmdldFVyaSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VySW5zdGFuY2U7XG4iXX0=