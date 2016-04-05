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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VySW5zdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBY00sZ0JBQWdCO0FBSVQsV0FKUCxnQkFBZ0IsQ0FJUixXQUFnQyxFQUFFOzBCQUoxQyxnQkFBZ0I7O0FBS2xCLFFBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0dBQ2pDOztlQU5HLGdCQUFnQjs7V0FRRSxrQ0FBd0I7QUFDNUMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFVyx3QkFBZTtBQUN6QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDekM7OztXQUVNLG1CQUFTO0FBQ2QsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7V0FFa0IsK0JBQW9CO0FBQ3JDLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1NBdEJHLGdCQUFnQjs7O0FBMEJ0QixNQUFNLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6IkRlYnVnZ2VySW5zdGFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvIGZyb20gJy4vRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuY2xhc3MgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9wcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbztcbiAgb25TZXNzaW9uRW5kOiA/KGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbykge1xuICAgIHRoaXMuX3Byb2Nlc3NJbmZvID0gcHJvY2Vzc0luZm87XG4gIH1cblxuICBnZXREZWJ1Z2dlclByb2Nlc3NJbmZvKCk6IERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICAgIHJldHVybiB0aGlzLl9wcm9jZXNzSW5mbztcbiAgfVxuXG4gIGdldFRhcmdldFVyaSgpOiBOdWNsaWRlVXJpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc0luZm8uZ2V0VGFyZ2V0VXJpKCk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICBnZXRXZWJzb2NrZXRBZGRyZXNzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJJbnN0YW5jZTtcbiJdfQ==