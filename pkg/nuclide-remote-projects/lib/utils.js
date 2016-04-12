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

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

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
      if (!(0, _nuclideAtomHelpers.isTextEditor)(paneItem) || !paneItem.getURI()) {
        // Ignore non-text editors and new editors with empty uris / paths.
        continue;
      }
      var _uri = sanitizeNuclideUri(paneItem.getURI());

      var _parse = (0, _nuclideRemoteUri.parse)(_uri);

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
          uri: (0, _nuclideRemoteUri.createRemoteUri)(fileHostname, connectionConfig.port, _filePath),
          filePath: _filePath
        };
      }
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWdCc0IsUUFBUTs7OztnQ0FDTywwQkFBMEI7O2tDQUtwQyw0QkFBNEI7O0FBSHZELElBQU0sdUJBQXVCLEdBQUcsV0FBVyxDQUFDO0FBQzVDLElBQU0sOEJBQThCLEdBQUcsdUJBQXVCLENBQUMsTUFBTSxDQUFDOzs7Ozs7OztBQWdCL0QsU0FBUyxrQkFBa0IsQ0FBQyxHQUFXLEVBQVU7OztBQUd0RCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0QsTUFBSSxhQUFhLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLE9BQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ3BDOztBQUVELE1BQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUN2QyxHQUFHLENBQUMsOEJBQThCLENBQUMsS0FBSyxHQUFHLGtDQUFrQzs7QUFFL0UsU0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLDhCQUE4QixDQUFDLEdBQ2xELEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLDhCQUE4QixDQUFDLENBQUM7S0FDekQ7QUFDRCxTQUFPLEdBQUcsQ0FBQztDQUNaOztBQUVNLFVBQVUsaUNBQWlDLENBQ2hELGdCQUErQyxFQUNiO0FBQ2xDLE9BQUssSUFBTSxLQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUM1QyxRQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEMsU0FBSyxJQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7QUFDaEMsVUFBSSxDQUFDLHNDQUFhLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFOztBQUVqRCxpQkFBUztPQUNWO0FBQ0QsVUFBTSxJQUFHLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7O21CQUNELDZCQUFNLElBQUcsQ0FBQzs7VUFBMUMsWUFBWSxVQUF0QixRQUFRO1VBQXNCLFNBQVEsVUFBZCxJQUFJOztBQUNuQyxVQUFJLFlBQVksS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksU0FBUSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN2RixpQ0FBVSxZQUFZLENBQUMsQ0FBQztBQUN4QixjQUFNO0FBQ0osY0FBSSxFQUFKLEtBQUk7QUFDSixnQkFBTSxFQUFFLFFBQVE7Ozs7QUFJaEIsYUFBRyxFQUFFLHVDQUFnQixZQUFZLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFNBQVEsQ0FBQztBQUNuRSxrQkFBUSxFQUFSLFNBQVE7U0FDVCxDQUFDO09BQ0g7S0FDRjtHQUNGO0NBQ0YiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUNvbm5lY3Rpb24nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge3BhcnNlLCBjcmVhdGVSZW1vdGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmNvbnN0IE5VQ0xJREVfUFJPVE9DT0xfUFJFRklYID0gJ251Y2xpZGU6Lyc7XG5jb25zdCBOVUNMSURFX1BST1RPQ09MX1BSRUZJWF9MRU5HVEggPSBOVUNMSURFX1BST1RPQ09MX1BSRUZJWC5sZW5ndGg7XG5cbmltcG9ydCB7aXNUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbmV4cG9ydCB0eXBlIE9wZW5GaWxlRWRpdG9ySW5zdGFuY2UgPSB7XG4gIHBhbmU6IGF0b20kUGFuZTtcbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIHVyaTogTnVjbGlkZVVyaTtcbiAgZmlsZVBhdGg6IHN0cmluZztcbn07XG5cbi8qKlxuICogQ2xlYW4gYSBudWNsaWRlIFVSSSBmcm9tIHRoZSBwcmVwZW5kZWQgYWJzb2x1dGUgcGF0aCBwcmVmaXhlcyBhbmQgZml4XG4gKiB0aGUgYnJva2VuIHVyaSwgaW4gdGhlIHNlbnNlIHRoYXQgaXQncyBudWNsaWRlOi9zZXJ2ZXI6ODk3L3BhdGgvdG8vZGlyIGluc3RlYWQgb2ZcbiAqIG51Y2xpZGU6Ly9zZXJ2ZXI6ODk3L3BhdGgvdG8vZGlyIGJlY2F1c2UgQXRvbSBjYWxsZWQgcGF0aC5ub3JtYWxpemUoKSBvbiB0aGUgZGlyZWN0b3J5IHVyaS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplTnVjbGlkZVVyaSh1cmk6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFJlbW92ZSB0aGUgbGVhZGluZyBhYnNvbHV0ZSBwYXRoIHByZXBlbmRlZCB0byB0aGUgZmlsZSBwYXRoc1xuICAvLyBiZXR3ZWVuIGF0b20gcmVsb2Fkcy5cbiAgY29uc3QgcHJvdG9jb2xJbmRleCA9IHVyaS5pbmRleE9mKE5VQ0xJREVfUFJPVE9DT0xfUFJFRklYKTtcbiAgaWYgKHByb3RvY29sSW5kZXggPiAwKSB7XG4gICAgdXJpID0gdXJpLnN1YnN0cmluZyhwcm90b2NvbEluZGV4KTtcbiAgfVxuICAvLyBBZGQgdGhlIG1pc3Npbmcgc2xhc2gsIGlmIHJlbW92ZWQgdGhyb3VnaCBhIHBhdGgubm9ybWFsaXplKCkgY2FsbC5cbiAgaWYgKHVyaS5zdGFydHNXaXRoKE5VQ0xJREVfUFJPVE9DT0xfUFJFRklYKSAmJlxuICAgICAgdXJpW05VQ0xJREVfUFJPVE9DT0xfUFJFRklYX0xFTkdUSF0gIT09ICcvJyAvKnByb3RvY29sIG1pc3NpbmcgbGFzdCBzbGFzaCovKSB7XG5cbiAgICB1cmkgPSB1cmkuc3Vic3RyaW5nKDAsIE5VQ0xJREVfUFJPVE9DT0xfUFJFRklYX0xFTkdUSCkgK1xuICAgICAgICAnLycgKyB1cmkuc3Vic3RyaW5nKE5VQ0xJREVfUFJPVE9DT0xfUFJFRklYX0xFTkdUSCk7XG4gIH1cbiAgcmV0dXJuIHVyaTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3QoXG4gIGNvbm5lY3Rpb25Db25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuKTogSXRlcmF0b3I8T3BlbkZpbGVFZGl0b3JJbnN0YW5jZT4ge1xuICBmb3IgKGNvbnN0IHBhbmUgb2YgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKSkge1xuICAgIGNvbnN0IHBhbmVJdGVtcyA9IHBhbmUuZ2V0SXRlbXMoKTtcbiAgICBmb3IgKGNvbnN0IHBhbmVJdGVtIG9mIHBhbmVJdGVtcykge1xuICAgICAgaWYgKCFpc1RleHRFZGl0b3IocGFuZUl0ZW0pIHx8ICFwYW5lSXRlbS5nZXRVUkkoKSkge1xuICAgICAgICAvLyBJZ25vcmUgbm9uLXRleHQgZWRpdG9ycyBhbmQgbmV3IGVkaXRvcnMgd2l0aCBlbXB0eSB1cmlzIC8gcGF0aHMuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgdXJpID0gc2FuaXRpemVOdWNsaWRlVXJpKHBhbmVJdGVtLmdldFVSSSgpKTtcbiAgICAgIGNvbnN0IHtob3N0bmFtZTogZmlsZUhvc3RuYW1lLCBwYXRoOiBmaWxlUGF0aH0gPSBwYXJzZSh1cmkpO1xuICAgICAgaWYgKGZpbGVIb3N0bmFtZSA9PT0gY29ubmVjdGlvbkNvbmZpZy5ob3N0ICYmIGZpbGVQYXRoLnN0YXJ0c1dpdGgoY29ubmVjdGlvbkNvbmZpZy5jd2QpKSB7XG4gICAgICAgIGludmFyaWFudChmaWxlSG9zdG5hbWUpO1xuICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgcGFuZSxcbiAgICAgICAgICBlZGl0b3I6IHBhbmVJdGVtLFxuICAgICAgICAgIC8vIFdoaWxlIHJlc3RvcmUgb3BlbmVkIGZpbGVzLCB0aGUgcmVtb3RlIHBvcnQgbWlnaHQgaGF2ZSBiZWVuIGNoYW5nZWQgaWYgdGhlIHNlcnZlclxuICAgICAgICAgIC8vIHJlc3RhcnRlZCBhZnRlciB1cGdyYWRlIG9yIHVzZXIga2lsbGVkIGl0LiBTbyB3ZSBuZWVkIHRvIGNyZWF0ZSBhIG5ldyB1cmkgdXNpbmdcbiAgICAgICAgICAvLyB0aGUgcmlnaHQgcG9ydC5cbiAgICAgICAgICB1cmk6IGNyZWF0ZVJlbW90ZVVyaShmaWxlSG9zdG5hbWUsIGNvbm5lY3Rpb25Db25maWcucG9ydCwgZmlsZVBhdGgpLFxuICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19