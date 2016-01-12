Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getPathToWorkspaceState = getPathToWorkspaceState;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/**
 * @return The path to the JSON file on disk where the workspace state is stored.
 */

function getPathToWorkspaceState() {
  // Atom <1.2 this function exists on `atom.constructor`. Atom >=1.2 it exists on the global `atom`
  // object. Find the appropriate location, and return `null` if both fail unexpectedly.
  var getStateKey = atom.getStateKey || atom.constructor.getStateKey;
  if (typeof getStateKey !== 'function') {
    return null;
  }

  // As you can imagine, the way that we are getting this path is not documented and is therefore
  // unstable.
  // TODO(t8750960): Work with the Atom core team to get a stable API for this.
  return _path2['default'].join(atom.getConfigDirPath(), 'storage', getStateKey(atom.project.getPaths(), 'editor'));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvcmtzcGFjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7b0JBV2lCLE1BQU07Ozs7Ozs7O0FBS2hCLFNBQVMsdUJBQXVCLEdBQVk7OztBQUdqRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDO0FBQ3JFLE1BQUksT0FBTyxXQUFXLEtBQUssVUFBVSxFQUFFO0FBQ3JDLFdBQU8sSUFBSSxDQUFDO0dBQ2I7Ozs7O0FBS0QsU0FBTyxrQkFBSyxJQUFJLENBQ2QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQ3ZCLFNBQVMsRUFDVCxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FDL0MsQ0FBQztDQUNIIiwiZmlsZSI6IndvcmtzcGFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIEByZXR1cm4gVGhlIHBhdGggdG8gdGhlIEpTT04gZmlsZSBvbiBkaXNrIHdoZXJlIHRoZSB3b3Jrc3BhY2Ugc3RhdGUgaXMgc3RvcmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0aFRvV29ya3NwYWNlU3RhdGUoKTogP3N0cmluZyB7XG4gIC8vIEF0b20gPDEuMiB0aGlzIGZ1bmN0aW9uIGV4aXN0cyBvbiBgYXRvbS5jb25zdHJ1Y3RvcmAuIEF0b20gPj0xLjIgaXQgZXhpc3RzIG9uIHRoZSBnbG9iYWwgYGF0b21gXG4gIC8vIG9iamVjdC4gRmluZCB0aGUgYXBwcm9wcmlhdGUgbG9jYXRpb24sIGFuZCByZXR1cm4gYG51bGxgIGlmIGJvdGggZmFpbCB1bmV4cGVjdGVkbHkuXG4gIGNvbnN0IGdldFN0YXRlS2V5ID0gYXRvbS5nZXRTdGF0ZUtleSB8fCBhdG9tLmNvbnN0cnVjdG9yLmdldFN0YXRlS2V5O1xuICBpZiAodHlwZW9mIGdldFN0YXRlS2V5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBBcyB5b3UgY2FuIGltYWdpbmUsIHRoZSB3YXkgdGhhdCB3ZSBhcmUgZ2V0dGluZyB0aGlzIHBhdGggaXMgbm90IGRvY3VtZW50ZWQgYW5kIGlzIHRoZXJlZm9yZVxuICAvLyB1bnN0YWJsZS5cbiAgLy8gVE9ETyh0ODc1MDk2MCk6IFdvcmsgd2l0aCB0aGUgQXRvbSBjb3JlIHRlYW0gdG8gZ2V0IGEgc3RhYmxlIEFQSSBmb3IgdGhpcy5cbiAgcmV0dXJuIHBhdGguam9pbihcbiAgICBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSxcbiAgICAnc3RvcmFnZScsXG4gICAgZ2V0U3RhdGVLZXkoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCksICdlZGl0b3InKSxcbiAgKTtcbn1cbiJdfQ==