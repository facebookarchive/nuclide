Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fuzzyNative = require('../../fuzzy-native');

var _PathSet2 = require('./PathSet');

var _PathSet3 = _interopRequireDefault(_PathSet2);

// Kinda hackish - for compatibility with PathSetUpdater

var NativePathSet = (function (_PathSet) {
  _inherits(NativePathSet, _PathSet);

  function NativePathSet(paths) {
    _classCallCheck(this, NativePathSet);

    _get(Object.getPrototypeOf(NativePathSet.prototype), 'constructor', this).call(this);
    this._matcher = new _fuzzyNative.Matcher(paths);
  }

  _createClass(NativePathSet, [{
    key: 'addPaths',
    value: function addPaths(paths) {
      this._matcher.addCandidates(paths);
    }
  }, {
    key: 'removePaths',
    value: function removePaths(paths) {
      this._matcher.removeCandidates(paths);
    }
  }, {
    key: 'match',
    value: function match(query) {
      return this._matcher.match(query, {
        maxResults: 20,
        numThreads: _os2['default'].cpus().length,
        recordMatchIndexes: true
      });
    }
  }]);

  return NativePathSet;
})(_PathSet3['default']);

exports.NativePathSet = NativePathSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdGl2ZVBhdGhTZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFhZSxJQUFJOzs7OzJCQUNHLG9CQUFvQjs7d0JBQ3RCLFdBQVc7Ozs7OztJQUdsQixhQUFhO1lBQWIsYUFBYTs7QUFHYixXQUhBLGFBQWEsQ0FHWixLQUFvQixFQUFFOzBCQUh2QixhQUFhOztBQUl0QiwrQkFKUyxhQUFhLDZDQUlkO0FBQ1IsUUFBSSxDQUFDLFFBQVEsR0FBRyx5QkFBWSxLQUFLLENBQUMsQ0FBQztHQUNwQzs7ZUFOVSxhQUFhOztXQVFoQixrQkFBQyxLQUFvQixFQUFFO0FBQzdCLFVBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BDOzs7V0FFVSxxQkFBQyxLQUFvQixFQUFFO0FBQ2hDLFVBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDdkM7OztXQUVJLGVBQUMsS0FBYSxFQUFzQjtBQUN2QyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNoQyxrQkFBVSxFQUFFLEVBQUU7QUFDZCxrQkFBVSxFQUFFLGdCQUFHLElBQUksRUFBRSxDQUFDLE1BQU07QUFDNUIsMEJBQWtCLEVBQUUsSUFBSTtPQUN6QixDQUFDLENBQUM7S0FDSjs7O1NBdEJVLGFBQWEiLCJmaWxlIjoiTmF0aXZlUGF0aFNldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtNYXRjaFJlc3VsdH0gZnJvbSAnLi4vLi4vZnV6enktbmF0aXZlJztcblxuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCB7TWF0Y2hlcn0gZnJvbSAnLi4vLi4vZnV6enktbmF0aXZlJztcbmltcG9ydCBQYXRoU2V0IGZyb20gJy4vUGF0aFNldCc7XG5cbi8vIEtpbmRhIGhhY2tpc2ggLSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFBhdGhTZXRVcGRhdGVyXG5leHBvcnQgY2xhc3MgTmF0aXZlUGF0aFNldCBleHRlbmRzIFBhdGhTZXQge1xuICBfbWF0Y2hlcjogTWF0Y2hlcjtcblxuICBjb25zdHJ1Y3RvcihwYXRoczogQXJyYXk8c3RyaW5nPikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fbWF0Y2hlciA9IG5ldyBNYXRjaGVyKHBhdGhzKTtcbiAgfVxuXG4gIGFkZFBhdGhzKHBhdGhzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgdGhpcy5fbWF0Y2hlci5hZGRDYW5kaWRhdGVzKHBhdGhzKTtcbiAgfVxuXG4gIHJlbW92ZVBhdGhzKHBhdGhzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgdGhpcy5fbWF0Y2hlci5yZW1vdmVDYW5kaWRhdGVzKHBhdGhzKTtcbiAgfVxuXG4gIG1hdGNoKHF1ZXJ5OiBzdHJpbmcpOiBBcnJheTxNYXRjaFJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXRjaGVyLm1hdGNoKHF1ZXJ5LCB7XG4gICAgICBtYXhSZXN1bHRzOiAyMCxcbiAgICAgIG51bVRocmVhZHM6IG9zLmNwdXMoKS5sZW5ndGgsXG4gICAgICByZWNvcmRNYXRjaEluZGV4ZXM6IHRydWUsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==