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

exports.getFileSystemContents = getFileSystemContents;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _client = require('../../client');

/**
 * Reads the file contents and returns empty string if the file doesn't exist
 * which means it was removed in the HEAD dirty repository status.
 *
 * If another error is encontered, it's thrown to be handled up the stack.
 */

function getFileSystemContents(filePath) {
  var fileSystemService = (0, _client.getFileSystemServiceByNuclideUri)(filePath);
  (0, _assert2['default'])(fileSystemService);
  var localFilePath = require('../../remote-uri').getPath(filePath);
  return fileSystemService.readFile(localFilePath).then(function (contents) {
    return contents.toString('utf8');
  }, function (error) {
    if (error.code === 'ENOENT') {
      // The file is deleted in the current dirty status.
      return '';
    }
    throw error;
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7c0JBQ2lCLGNBQWM7Ozs7Ozs7OztBQVF0RCxTQUFTLHFCQUFxQixDQUFDLFFBQW9CLEVBQW1CO0FBQzNFLE1BQU0saUJBQWlCLEdBQUcsOENBQWlDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JFLDJCQUFVLGlCQUFpQixDQUFDLENBQUM7QUFDN0IsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFLFNBQU8saUJBQWlCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUM3QyxJQUFJLENBQ0gsVUFBQSxRQUFRO1dBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7R0FBQSxFQUNyQyxVQUFBLEtBQUssRUFBSTtBQUNQLFFBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7O0FBRTNCLGFBQU8sRUFBRSxDQUFDO0tBQ1g7QUFDRCxVQUFNLEtBQUssQ0FBQztHQUNiLENBQ0YsQ0FBQztDQUNMIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9jbGllbnQnO1xuXG4vKipcbiAqIFJlYWRzIHRoZSBmaWxlIGNvbnRlbnRzIGFuZCByZXR1cm5zIGVtcHR5IHN0cmluZyBpZiB0aGUgZmlsZSBkb2Vzbid0IGV4aXN0XG4gKiB3aGljaCBtZWFucyBpdCB3YXMgcmVtb3ZlZCBpbiB0aGUgSEVBRCBkaXJ0eSByZXBvc2l0b3J5IHN0YXR1cy5cbiAqXG4gKiBJZiBhbm90aGVyIGVycm9yIGlzIGVuY29udGVyZWQsIGl0J3MgdGhyb3duIHRvIGJlIGhhbmRsZWQgdXAgdGhlIHN0YWNrLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgZmlsZVN5c3RlbVNlcnZpY2UgPSBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaShmaWxlUGF0aCk7XG4gIGludmFyaWFudChmaWxlU3lzdGVtU2VydmljZSk7XG4gIGNvbnN0IGxvY2FsRmlsZVBhdGggPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtdXJpJykuZ2V0UGF0aChmaWxlUGF0aCk7XG4gIHJldHVybiBmaWxlU3lzdGVtU2VydmljZS5yZWFkRmlsZShsb2NhbEZpbGVQYXRoKVxuICAgIC50aGVuKFxuICAgICAgY29udGVudHMgPT4gY29udGVudHMudG9TdHJpbmcoJ3V0ZjgnKSxcbiAgICAgIGVycm9yID0+IHtcbiAgICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgLy8gVGhlIGZpbGUgaXMgZGVsZXRlZCBpbiB0aGUgY3VycmVudCBkaXJ0eSBzdGF0dXMuXG4gICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgICk7XG59XG4iXX0=