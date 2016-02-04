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

exports.sanitizeNuclideUri = sanitizeNuclideUri;
exports.getOpenFileEditorForRemoteProject = getOpenFileEditorForRemoteProject;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _remoteUri = require('../../remote-uri');

var _atomHelpers = require('../../atom-helpers');

var NUCLIDE_PROTOCOL_PREFIX = 'nuclide:/';
var NUCLIDE_PROTOCOL_PREFIX_LENGTH = NUCLIDE_PROTOCOL_PREFIX.length;

/**
 * Clean a nuclide URI from the prepended absolute path prefixes and fix
 * the broken uri, in the sense that it's nuclide:/server:897/path/to/dir instead of
 * nuclide://server:897/path/to/dir because Atom called path.normalize() on the directory uri.
 */

function sanitizeNuclideUri(uri) {
  // Remove the leading absolute path prepended to the file paths
  // between atom reloads.
  var protocolIndex = uri.indexOf(NUCLIDE_PROTOCOL_PREFIX);
  if (protocolIndex > 0) {
    uri = uri.substring(protocolIndex);
  }
  // Add the missing slash, if removed through a path.normalize() call.
  if (uri.startsWith(NUCLIDE_PROTOCOL_PREFIX) && uri[NUCLIDE_PROTOCOL_PREFIX_LENGTH] !== '/' /*protocol missing last slash*/) {

      uri = uri.substring(0, NUCLIDE_PROTOCOL_PREFIX_LENGTH) + '/' + uri.substring(NUCLIDE_PROTOCOL_PREFIX_LENGTH);
    }
  return uri;
}

function* getOpenFileEditorForRemoteProject(connectionConfig) {
  for (var _pane of atom.workspace.getPanes()) {
    var paneItems = _pane.getItems();
    for (var paneItem of paneItems) {
      if (!(0, _atomHelpers.isTextEditor)(paneItem) || !paneItem.getURI()) {
        // Ignore non-text editors and new editors with empty uris / paths.
        continue;
      }
      var _uri = sanitizeNuclideUri(paneItem.getURI());

      var _parse = (0, _remoteUri.parse)(_uri);

      var fileHostname = _parse.hostname;
      var _filePath = _parse.path;

      if (fileHostname === connectionConfig.host && _filePath.startsWith(connectionConfig.cwd)) {
        (0, _assert2['default'])(fileHostname);
        yield {
          pane: _pane,
          editor: paneItem,
          // While restore opened files, the remote port might have been changed if the server
          // restarted after upgrade or user killed it. So we need to create a new uri using
          // the right port.
          uri: (0, _remoteUri.createRemoteUri)(fileHostname, connectionConfig.port, _filePath),
          filePath: _filePath
        };
      }
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWNzQixRQUFROzs7O3lCQUNPLGtCQUFrQjs7MkJBSzVCLG9CQUFvQjs7QUFIL0MsSUFBTSx1QkFBdUIsR0FBRyxXQUFXLENBQUM7QUFDNUMsSUFBTSw4QkFBOEIsR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7O0FBZ0IvRCxTQUFTLGtCQUFrQixDQUFDLEdBQVcsRUFBVTs7O0FBR3RELE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMzRCxNQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUU7QUFDckIsT0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDcEM7O0FBRUQsTUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLElBQ3ZDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLEdBQUcsa0NBQWtDOztBQUUvRSxTQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsOEJBQThCLENBQUMsR0FDbEQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsQ0FBQztLQUN6RDtBQUNELFNBQU8sR0FBRyxDQUFDO0NBQ1o7O0FBRU0sVUFBVSxpQ0FBaUMsQ0FDaEQsZ0JBQStDLEVBQ2I7QUFDbEMsT0FBSyxJQUFNLEtBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFO0FBQzVDLFFBQU0sU0FBUyxHQUFHLEtBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNsQyxTQUFLLElBQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtBQUNoQyxVQUFJLENBQUMsK0JBQWEsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUU7O0FBRWpELGlCQUFTO09BQ1Y7QUFDRCxVQUFNLElBQUcsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs7bUJBQ0Qsc0JBQU0sSUFBRyxDQUFDOztVQUExQyxZQUFZLFVBQXRCLFFBQVE7VUFBc0IsU0FBUSxVQUFkLElBQUk7O0FBQ25DLFVBQUksWUFBWSxLQUFLLGdCQUFnQixDQUFDLElBQUksSUFBSSxTQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZGLGlDQUFVLFlBQVksQ0FBQyxDQUFDO0FBQ3hCLGNBQU07QUFDSixjQUFJLEVBQUosS0FBSTtBQUNKLGdCQUFNLEVBQUUsUUFBUTs7OztBQUloQixhQUFHLEVBQUUsZ0NBQWdCLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsU0FBUSxDQUFDO0FBQ25FLGtCQUFRLEVBQVIsU0FBUTtTQUNULENBQUM7T0FDSDtLQUNGO0dBQ0Y7Q0FDRiIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUNvbm5lY3Rpb24nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge3BhcnNlLCBjcmVhdGVSZW1vdGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5jb25zdCBOVUNMSURFX1BST1RPQ09MX1BSRUZJWCA9ICdudWNsaWRlOi8nO1xuY29uc3QgTlVDTElERV9QUk9UT0NPTF9QUkVGSVhfTEVOR1RIID0gTlVDTElERV9QUk9UT0NPTF9QUkVGSVgubGVuZ3RoO1xuXG5pbXBvcnQge2lzVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcblxuZXhwb3J0IHR5cGUgT3BlbkZpbGVFZGl0b3JJbnN0YW5jZSA9IHtcbiAgcGFuZTogYXRvbSRQYW5lO1xuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcjtcbiAgdXJpOiBOdWNsaWRlVXJpO1xuICBmaWxlUGF0aDogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBDbGVhbiBhIG51Y2xpZGUgVVJJIGZyb20gdGhlIHByZXBlbmRlZCBhYnNvbHV0ZSBwYXRoIHByZWZpeGVzIGFuZCBmaXhcbiAqIHRoZSBicm9rZW4gdXJpLCBpbiB0aGUgc2Vuc2UgdGhhdCBpdCdzIG51Y2xpZGU6L3NlcnZlcjo4OTcvcGF0aC90by9kaXIgaW5zdGVhZCBvZlxuICogbnVjbGlkZTovL3NlcnZlcjo4OTcvcGF0aC90by9kaXIgYmVjYXVzZSBBdG9tIGNhbGxlZCBwYXRoLm5vcm1hbGl6ZSgpIG9uIHRoZSBkaXJlY3RvcnkgdXJpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVOdWNsaWRlVXJpKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gUmVtb3ZlIHRoZSBsZWFkaW5nIGFic29sdXRlIHBhdGggcHJlcGVuZGVkIHRvIHRoZSBmaWxlIHBhdGhzXG4gIC8vIGJldHdlZW4gYXRvbSByZWxvYWRzLlxuICBjb25zdCBwcm90b2NvbEluZGV4ID0gdXJpLmluZGV4T2YoTlVDTElERV9QUk9UT0NPTF9QUkVGSVgpO1xuICBpZiAocHJvdG9jb2xJbmRleCA+IDApIHtcbiAgICB1cmkgPSB1cmkuc3Vic3RyaW5nKHByb3RvY29sSW5kZXgpO1xuICB9XG4gIC8vIEFkZCB0aGUgbWlzc2luZyBzbGFzaCwgaWYgcmVtb3ZlZCB0aHJvdWdoIGEgcGF0aC5ub3JtYWxpemUoKSBjYWxsLlxuICBpZiAodXJpLnN0YXJ0c1dpdGgoTlVDTElERV9QUk9UT0NPTF9QUkVGSVgpICYmXG4gICAgICB1cmlbTlVDTElERV9QUk9UT0NPTF9QUkVGSVhfTEVOR1RIXSAhPT0gJy8nIC8qcHJvdG9jb2wgbWlzc2luZyBsYXN0IHNsYXNoKi8pIHtcblxuICAgIHVyaSA9IHVyaS5zdWJzdHJpbmcoMCwgTlVDTElERV9QUk9UT0NPTF9QUkVGSVhfTEVOR1RIKSArXG4gICAgICAgICcvJyArIHVyaS5zdWJzdHJpbmcoTlVDTElERV9QUk9UT0NPTF9QUkVGSVhfTEVOR1RIKTtcbiAgfVxuICByZXR1cm4gdXJpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIGdldE9wZW5GaWxlRWRpdG9yRm9yUmVtb3RlUHJvamVjdChcbiAgY29ubmVjdGlvbkNvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG4pOiBJdGVyYXRvcjxPcGVuRmlsZUVkaXRvckluc3RhbmNlPiB7XG4gIGZvciAoY29uc3QgcGFuZSBvZiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpKSB7XG4gICAgY29uc3QgcGFuZUl0ZW1zID0gcGFuZS5nZXRJdGVtcygpO1xuICAgIGZvciAoY29uc3QgcGFuZUl0ZW0gb2YgcGFuZUl0ZW1zKSB7XG4gICAgICBpZiAoIWlzVGV4dEVkaXRvcihwYW5lSXRlbSkgfHwgIXBhbmVJdGVtLmdldFVSSSgpKSB7XG4gICAgICAgIC8vIElnbm9yZSBub24tdGV4dCBlZGl0b3JzIGFuZCBuZXcgZWRpdG9ycyB3aXRoIGVtcHR5IHVyaXMgLyBwYXRocy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCB1cmkgPSBzYW5pdGl6ZU51Y2xpZGVVcmkocGFuZUl0ZW0uZ2V0VVJJKCkpO1xuICAgICAgY29uc3Qge2hvc3RuYW1lOiBmaWxlSG9zdG5hbWUsIHBhdGg6IGZpbGVQYXRofSA9IHBhcnNlKHVyaSk7XG4gICAgICBpZiAoZmlsZUhvc3RuYW1lID09PSBjb25uZWN0aW9uQ29uZmlnLmhvc3QgJiYgZmlsZVBhdGguc3RhcnRzV2l0aChjb25uZWN0aW9uQ29uZmlnLmN3ZCkpIHtcbiAgICAgICAgaW52YXJpYW50KGZpbGVIb3N0bmFtZSk7XG4gICAgICAgIHlpZWxkIHtcbiAgICAgICAgICBwYW5lLFxuICAgICAgICAgIGVkaXRvcjogcGFuZUl0ZW0sXG4gICAgICAgICAgLy8gV2hpbGUgcmVzdG9yZSBvcGVuZWQgZmlsZXMsIHRoZSByZW1vdGUgcG9ydCBtaWdodCBoYXZlIGJlZW4gY2hhbmdlZCBpZiB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gcmVzdGFydGVkIGFmdGVyIHVwZ3JhZGUgb3IgdXNlciBraWxsZWQgaXQuIFNvIHdlIG5lZWQgdG8gY3JlYXRlIGEgbmV3IHVyaSB1c2luZ1xuICAgICAgICAgIC8vIHRoZSByaWdodCBwb3J0LlxuICAgICAgICAgIHVyaTogY3JlYXRlUmVtb3RlVXJpKGZpbGVIb3N0bmFtZSwgY29ubmVjdGlvbkNvbmZpZy5wb3J0LCBmaWxlUGF0aCksXG4gICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=