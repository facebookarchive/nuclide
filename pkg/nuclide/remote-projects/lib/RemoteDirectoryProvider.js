var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../remote-connection');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZURpcmVjdG9yeVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVc0QyxPQUFPLENBQUMseUJBQXlCLENBQUM7O0lBQXZFLGdCQUFnQixZQUFoQixnQkFBZ0I7SUFBRSxlQUFlLFlBQWYsZUFBZTs7Ozs7OztBQU94QyxJQUFNLHNCQUFzQixHQUFHLFlBQVksQ0FBQzs7SUFFdEMsdUJBQXVCO1dBQXZCLHVCQUF1QjswQkFBdkIsdUJBQXVCOzs7ZUFBdkIsdUJBQXVCOztXQUNSLDZCQUFDLEdBQVcsRUFBb0I7QUFDakQsVUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRTtBQUMzQyxlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELFVBQUksVUFBVSxFQUFFO0FBQ2QsZUFBTyxVQUFVLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3hDLE1BQU07Ozs7QUFJTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztXQUVjLHlCQUFDLEdBQVcsRUFBVztBQUNwQyxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDdkQ7OztTQWxCRyx1QkFBdUI7OztBQXFCN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJSZW1vdGVEaXJlY3RvcnlQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZW1vdGVDb25uZWN0aW9uLCBSZW1vdGVEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nKTtcblxuLyoqXG4gKiBUaGUgcHJlZml4IGEgVVJJIG11c3QgaGF2ZSBmb3IgYFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyYCB0byB0cnkgdG8gcHJvZHVjZSBhXG4gKiBgUmVtb3RlRGlyZWN0b3J5YCBmb3IgaXQuIFRoaXMgc2hvdWxkIGFsc28gYmUgdGhlIHBhdGggcHJlZml4IGNoZWNrZWQgYnkgdGhlXG4gKiBoYW5kbGVyIHdlIHJlZ2lzdGVyIHdpdGggYGF0b20ucHJvamVjdC5yZWdpc3Rlck9wZW5lcigpYCB0byBvcGVuIHJlbW90ZSBmaWxlcy5cbiAqL1xuY29uc3QgUkVNT1RFX1BBVEhfVVJJX1BSRUZJWCA9ICdudWNsaWRlOi8vJztcblxuY2xhc3MgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIge1xuICBkaXJlY3RvcnlGb3JVUklTeW5jKHVyaTogc3RyaW5nKTogP1JlbW90ZURpcmVjdG9yeSB7XG4gICAgaWYgKCF1cmkuc3RhcnRzV2l0aChSRU1PVEVfUEFUSF9VUklfUFJFRklYKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaSh1cmkpO1xuICAgIGlmIChjb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gY29ubmVjdGlvbi5jcmVhdGVEaXJlY3RvcnkodXJpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmV0dXJuIG51bGwgaGVyZS4gSW4gcmVzcG9uc2UsIEF0b20gd2lsbCBjcmVhdGUgYSBnZW5lcmljIERpcmVjdG9yeSBmb3JcbiAgICAgIC8vIHRoaXMgVVJJLCBhbmQgYWRkIGl0IHRvIHRoZSBsaXN0IG9mIHJvb3QgcHJvamVjdCBwYXRocyAoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpLlxuICAgICAgLy8gSW4gcmVtb3RlLXByb2plY3RzL21haW4uanMsIHdlIHJlbW92ZSB0aGVzZSBnZW5lcmljIGRpcmVjdG9yaWVzLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgZGlyZWN0b3J5Rm9yVVJJKHVyaTogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmRpcmVjdG9yeUZvclVSSVN5bmModXJpKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVEaXJlY3RvcnlQcm92aWRlcjtcbiJdfQ==