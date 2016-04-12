Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.farEndPriority = farEndPriority;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function isVersionOrLater(packageName, version) {
  var pkg = atom.packages.getLoadedPackage(packageName);
  if (pkg == null || pkg.metadata == null || pkg.metadata.version == null) {
    return false;
  }
  return _semver2['default'].gte(pkg.metadata.version, version);
}

function farEndPriority(priority) {
  if (isVersionOrLater('tool-bar', '0.3.0')) {
    // New versions of the toolbar use negative priority to push icons to the far end.
    return -priority;
  } else {
    // Old ones just use large positive priority.
    return 2000 - priority;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvb2xiYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O3NCQVdtQixRQUFROzs7O0FBRTNCLFNBQVMsZ0JBQWdCLENBQUMsV0FBbUIsRUFBRSxPQUFlLEVBQVc7QUFDdkUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4RCxNQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ3ZFLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxTQUFPLG9CQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNsRDs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxRQUFnQixFQUFVO0FBQ3ZELE1BQUksZ0JBQWdCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFOztBQUV6QyxXQUFPLENBQUMsUUFBUSxDQUFDO0dBQ2xCLE1BQU07O0FBRUwsV0FBTyxJQUFJLEdBQUcsUUFBUSxDQUFDO0dBQ3hCO0NBQ0YiLCJmaWxlIjoidG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuZnVuY3Rpb24gaXNWZXJzaW9uT3JMYXRlcihwYWNrYWdlTmFtZTogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgcGtnID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2thZ2VOYW1lKTtcbiAgaWYgKHBrZyA9PSBudWxsIHx8IHBrZy5tZXRhZGF0YSA9PSBudWxsIHx8IHBrZy5tZXRhZGF0YS52ZXJzaW9uID09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHNlbXZlci5ndGUocGtnLm1ldGFkYXRhLnZlcnNpb24sIHZlcnNpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFyRW5kUHJpb3JpdHkocHJpb3JpdHk6IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChpc1ZlcnNpb25PckxhdGVyKCd0b29sLWJhcicsICcwLjMuMCcpKSB7XG4gICAgLy8gTmV3IHZlcnNpb25zIG9mIHRoZSB0b29sYmFyIHVzZSBuZWdhdGl2ZSBwcmlvcml0eSB0byBwdXNoIGljb25zIHRvIHRoZSBmYXIgZW5kLlxuICAgIHJldHVybiAtcHJpb3JpdHk7XG4gIH0gZWxzZSB7XG4gICAgLy8gT2xkIG9uZXMganVzdCB1c2UgbGFyZ2UgcG9zaXRpdmUgcHJpb3JpdHkuXG4gICAgcmV0dXJuIDIwMDAgLSBwcmlvcml0eTtcbiAgfVxufVxuIl19