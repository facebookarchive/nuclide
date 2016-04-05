var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../nuclide-remote-connection');

var RemoteConnection = _require.RemoteConnection;
var RemoteDirectory = _require.RemoteDirectory;

/**
 * The prefix a URI must have for `RemoteDirectoryProvider` to try to produce a
 * `RemoteDirectory` for it. This should also be the path prefix checked by the
 * handler we register with `atom.project.registerOpener()` to open remote files.
 */
var REMOTE_PATH_URI_PREFIX = 'nuclide://';

var RemoteDirectoryProvider = (function () {
  function RemoteDirectoryProvider() {
    _classCallCheck(this, RemoteDirectoryProvider);
  }

  _createClass(RemoteDirectoryProvider, [{
    key: 'directoryForURISync',
    value: function directoryForURISync(uri) {
      if (!uri.startsWith(REMOTE_PATH_URI_PREFIX)) {
        return null;
      }
      var connection = RemoteConnection.getForUri(uri);
      if (connection) {
        return connection.createDirectory(uri);
      } else {
        // Return null here. In response, Atom will create a generic Directory for
        // this URI, and add it to the list of root project paths (atom.project.getPaths()).
        // In remote-projects/main.js, we remove these generic directories.
        return null;
      }
    }
  }, {
    key: 'directoryForURI',
    value: function directoryForURI(uri) {
      return Promise.resolve(this.directoryForURISync(uri));
    }
  }]);

  return RemoteDirectoryProvider;
})();

module.exports = RemoteDirectoryProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZURpcmVjdG9yeVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVc0QyxPQUFPLENBQUMsaUNBQWlDLENBQUM7O0lBQS9FLGdCQUFnQixZQUFoQixnQkFBZ0I7SUFBRSxlQUFlLFlBQWYsZUFBZTs7Ozs7OztBQU94QyxJQUFNLHNCQUFzQixHQUFHLFlBQVksQ0FBQzs7SUFFdEMsdUJBQXVCO1dBQXZCLHVCQUF1QjswQkFBdkIsdUJBQXVCOzs7ZUFBdkIsdUJBQXVCOztXQUNSLDZCQUFDLEdBQVcsRUFBb0I7QUFDakQsVUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRTtBQUMzQyxlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELFVBQUksVUFBVSxFQUFFO0FBQ2QsZUFBTyxVQUFVLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3hDLE1BQU07Ozs7QUFJTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztXQUVjLHlCQUFDLEdBQVcsRUFBVztBQUNwQyxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDdkQ7OztTQWxCRyx1QkFBdUI7OztBQXFCN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJSZW1vdGVEaXJlY3RvcnlQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZW1vdGVDb25uZWN0aW9uLCBSZW1vdGVEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbicpO1xuXG4vKipcbiAqIFRoZSBwcmVmaXggYSBVUkkgbXVzdCBoYXZlIGZvciBgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXJgIHRvIHRyeSB0byBwcm9kdWNlIGFcbiAqIGBSZW1vdGVEaXJlY3RvcnlgIGZvciBpdC4gVGhpcyBzaG91bGQgYWxzbyBiZSB0aGUgcGF0aCBwcmVmaXggY2hlY2tlZCBieSB0aGVcbiAqIGhhbmRsZXIgd2UgcmVnaXN0ZXIgd2l0aCBgYXRvbS5wcm9qZWN0LnJlZ2lzdGVyT3BlbmVyKClgIHRvIG9wZW4gcmVtb3RlIGZpbGVzLlxuICovXG5jb25zdCBSRU1PVEVfUEFUSF9VUklfUFJFRklYID0gJ251Y2xpZGU6Ly8nO1xuXG5jbGFzcyBSZW1vdGVEaXJlY3RvcnlQcm92aWRlciB7XG4gIGRpcmVjdG9yeUZvclVSSVN5bmModXJpOiBzdHJpbmcpOiA/UmVtb3RlRGlyZWN0b3J5IHtcbiAgICBpZiAoIXVyaS5zdGFydHNXaXRoKFJFTU9URV9QQVRIX1VSSV9QUkVGSVgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0Rm9yVXJpKHVyaSk7XG4gICAgaWYgKGNvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uLmNyZWF0ZURpcmVjdG9yeSh1cmkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZXR1cm4gbnVsbCBoZXJlLiBJbiByZXNwb25zZSwgQXRvbSB3aWxsIGNyZWF0ZSBhIGdlbmVyaWMgRGlyZWN0b3J5IGZvclxuICAgICAgLy8gdGhpcyBVUkksIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3Qgb2Ygcm9vdCBwcm9qZWN0IHBhdGhzIChhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSkuXG4gICAgICAvLyBJbiByZW1vdGUtcHJvamVjdHMvbWFpbi5qcywgd2UgcmVtb3ZlIHRoZXNlIGdlbmVyaWMgZGlyZWN0b3JpZXMuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBkaXJlY3RvcnlGb3JVUkkodXJpOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuZGlyZWN0b3J5Rm9yVVJJU3luYyh1cmkpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyO1xuIl19