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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _remoteConnection = require('../../remote-connection');

var _remoteUri = require('../../remote-uri');

/**
 * Finds related files, to be used in `JumpToRelatedFile`.
 *
 * Files are related if they have the same filename but different extension,
 * or if the filename is appended with `Internal` or `-inl`. For example, these files
 * would all be related: `Foo.h`, `Foo.m`, `FooInternal.h`, `Foo-inl.h`
 *
 * For now, we only search in the given path's directory for related files.
 */

var RelatedFileFinder = (function () {
  function RelatedFileFinder() {
    _classCallCheck(this, RelatedFileFinder);
  }

  _createClass(RelatedFileFinder, [{
    key: 'find',

    /**
     * Returns the related files and the given file's index in that array.
     * The given file must be in the related files array.
     * @param filePath The filepath for which to get related files.
     * @return The related files and the given path's index into it.
     */
    value: _asyncToGenerator(function* (filePath) {
      var _this = this;

      var dirName = (0, _remoteUri.dirname)(filePath);
      var prefix = this._getPrefix(filePath);

      var service = (0, _remoteConnection.getServiceByNuclideUri)('FileSystemService', filePath);
      (0, _assert2['default'])(service);
      var listing = yield service.readdir((0, _remoteUri.getPath)(dirName));
      var relatedFiles = listing.filter(function (otherFilePath) {
        return otherFilePath.stats.isFile() && _this._getPrefix(otherFilePath.file) === prefix;
      }).map(function (otherFilePath) {
        return (0, _remoteUri.join)(dirName, otherFilePath.file);
      }).sort();

      var index = relatedFiles.indexOf(filePath);
      if (index === -1) {
        throw new Error('Given path must be in `relatedFiles`: ' + filePath);
      }

      return {
        relatedFiles: relatedFiles,
        index: index
      };
    })
  }, {
    key: '_getPrefix',
    value: function _getPrefix(filePath) {
      var base = (0, _remoteUri.basename)(filePath);
      // Strip off the extension.
      var pos = base.lastIndexOf('.');
      if (pos !== -1) {
        base = base.substring(0, pos);
      }
      // In Objective-C we often have the X + XInternal.h for implementation methods.
      // Similarly, C++ users often use X.h + X-inl.h.
      return base.replace(/(Internal|-inl)$/, '');
    }
  }]);

  return RelatedFileFinder;
})();

exports['default'] = RelatedFileFinder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbGF0ZWRGaWxlRmluZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWFzQixRQUFROzs7O2dDQUNPLHlCQUF5Qjs7eUJBQ2Ysa0JBQWtCOzs7Ozs7Ozs7Ozs7SUFXNUMsaUJBQWlCO1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzs7ZUFBakIsaUJBQWlCOzs7Ozs7Ozs7NkJBUTFCLFdBQUMsUUFBb0IsRUFBeUQ7OztBQUN0RixVQUFNLE9BQU8sR0FBRyx3QkFBUSxRQUFRLENBQUMsQ0FBQztBQUNsQyxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUV6QyxVQUFNLE9BQU8sR0FBRyw4Q0FBdUIsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEUsK0JBQVUsT0FBTyxDQUFDLENBQUM7QUFDbkIsVUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLHdCQUFRLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDeEQsVUFBTSxZQUFZLEdBQUcsT0FBTyxDQUN6QixNQUFNLENBQUMsVUFBQSxhQUFhLEVBQUk7QUFDdkIsZUFBTyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLE1BQUssVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxNQUFNLENBQUM7T0FDdkYsQ0FBQyxDQUNELEdBQUcsQ0FBQyxVQUFBLGFBQWE7ZUFBSSxxQkFBSyxPQUFPLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQztPQUFBLENBQUMsQ0FDdkQsSUFBSSxFQUFFLENBQUM7O0FBRVYsVUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QyxVQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNoQixjQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxHQUFHLFFBQVEsQ0FBQyxDQUFDO09BQ3RFOztBQUVELGFBQU87QUFDTCxvQkFBWSxFQUFFLFlBQVk7QUFDMUIsYUFBSyxFQUFFLEtBQUs7T0FDYixDQUFDO0tBQ0g7OztXQUVTLG9CQUFDLFFBQW9CLEVBQVU7QUFDdkMsVUFBSSxJQUFJLEdBQUcseUJBQVMsUUFBUSxDQUFDLENBQUM7O0FBRTlCLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsVUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDZCxZQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDL0I7OztBQUdELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUM3Qzs7O1NBM0NrQixpQkFBaUI7OztxQkFBakIsaUJBQWlCIiwiZmlsZSI6IlJlbGF0ZWRGaWxlRmluZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7YmFzZW5hbWUsIGRpcm5hbWUsIGdldFBhdGgsIGpvaW59IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG4vKipcbiAqIEZpbmRzIHJlbGF0ZWQgZmlsZXMsIHRvIGJlIHVzZWQgaW4gYEp1bXBUb1JlbGF0ZWRGaWxlYC5cbiAqXG4gKiBGaWxlcyBhcmUgcmVsYXRlZCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgZmlsZW5hbWUgYnV0IGRpZmZlcmVudCBleHRlbnNpb24sXG4gKiBvciBpZiB0aGUgZmlsZW5hbWUgaXMgYXBwZW5kZWQgd2l0aCBgSW50ZXJuYWxgIG9yIGAtaW5sYC4gRm9yIGV4YW1wbGUsIHRoZXNlIGZpbGVzXG4gKiB3b3VsZCBhbGwgYmUgcmVsYXRlZDogYEZvby5oYCwgYEZvby5tYCwgYEZvb0ludGVybmFsLmhgLCBgRm9vLWlubC5oYFxuICpcbiAqIEZvciBub3csIHdlIG9ubHkgc2VhcmNoIGluIHRoZSBnaXZlbiBwYXRoJ3MgZGlyZWN0b3J5IGZvciByZWxhdGVkIGZpbGVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWxhdGVkRmlsZUZpbmRlciB7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlbGF0ZWQgZmlsZXMgYW5kIHRoZSBnaXZlbiBmaWxlJ3MgaW5kZXggaW4gdGhhdCBhcnJheS5cbiAgICogVGhlIGdpdmVuIGZpbGUgbXVzdCBiZSBpbiB0aGUgcmVsYXRlZCBmaWxlcyBhcnJheS5cbiAgICogQHBhcmFtIGZpbGVQYXRoIFRoZSBmaWxlcGF0aCBmb3Igd2hpY2ggdG8gZ2V0IHJlbGF0ZWQgZmlsZXMuXG4gICAqIEByZXR1cm4gVGhlIHJlbGF0ZWQgZmlsZXMgYW5kIHRoZSBnaXZlbiBwYXRoJ3MgaW5kZXggaW50byBpdC5cbiAgICovXG4gIGFzeW5jIGZpbmQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHtyZWxhdGVkRmlsZXM6IEFycmF5PHN0cmluZz47IGluZGV4OiBudW1iZXJ9PiB7XG4gICAgY29uc3QgZGlyTmFtZSA9IGRpcm5hbWUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuX2dldFByZWZpeChmaWxlUGF0aCk7XG5cbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmlsZVN5c3RlbVNlcnZpY2UnLCBmaWxlUGF0aCk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIGNvbnN0IGxpc3RpbmcgPSBhd2FpdCBzZXJ2aWNlLnJlYWRkaXIoZ2V0UGF0aChkaXJOYW1lKSk7XG4gICAgY29uc3QgcmVsYXRlZEZpbGVzID0gbGlzdGluZ1xuICAgICAgLmZpbHRlcihvdGhlckZpbGVQYXRoID0+IHtcbiAgICAgICAgcmV0dXJuIG90aGVyRmlsZVBhdGguc3RhdHMuaXNGaWxlKCkgJiYgdGhpcy5fZ2V0UHJlZml4KG90aGVyRmlsZVBhdGguZmlsZSkgPT09IHByZWZpeDtcbiAgICAgIH0pXG4gICAgICAubWFwKG90aGVyRmlsZVBhdGggPT4gam9pbihkaXJOYW1lLCBvdGhlckZpbGVQYXRoLmZpbGUpKVxuICAgICAgLnNvcnQoKTtcblxuICAgIGNvbnN0IGluZGV4ID0gcmVsYXRlZEZpbGVzLmluZGV4T2YoZmlsZVBhdGgpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignR2l2ZW4gcGF0aCBtdXN0IGJlIGluIGByZWxhdGVkRmlsZXNgOiAnICsgZmlsZVBhdGgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByZWxhdGVkRmlsZXM6IHJlbGF0ZWRGaWxlcyxcbiAgICAgIGluZGV4OiBpbmRleCxcbiAgICB9O1xuICB9XG5cbiAgX2dldFByZWZpeChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHN0cmluZyB7XG4gICAgbGV0IGJhc2UgPSBiYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgLy8gU3RyaXAgb2ZmIHRoZSBleHRlbnNpb24uXG4gICAgY29uc3QgcG9zID0gYmFzZS5sYXN0SW5kZXhPZignLicpO1xuICAgIGlmIChwb3MgIT09IC0xKSB7XG4gICAgICBiYXNlID0gYmFzZS5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICB9XG4gICAgLy8gSW4gT2JqZWN0aXZlLUMgd2Ugb2Z0ZW4gaGF2ZSB0aGUgWCArIFhJbnRlcm5hbC5oIGZvciBpbXBsZW1lbnRhdGlvbiBtZXRob2RzLlxuICAgIC8vIFNpbWlsYXJseSwgQysrIHVzZXJzIG9mdGVuIHVzZSBYLmggKyBYLWlubC5oLlxuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLyhJbnRlcm5hbHwtaW5sKSQvLCAnJyk7XG4gIH1cblxufVxuIl19