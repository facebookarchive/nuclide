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

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

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

      var dirName = (0, _nuclideRemoteUri.dirname)(filePath);
      var prefix = this._getPrefix(filePath);

      var service = (0, _nuclideRemoteConnection.getServiceByNuclideUri)('FileSystemService', filePath);
      (0, _assert2['default'])(service);
      var listing = yield service.readdir((0, _nuclideRemoteUri.getPath)(dirName));
      var relatedFiles = listing.filter(function (otherFilePath) {
        return otherFilePath.stats.isFile() && _this._getPrefix(otherFilePath.file) === prefix;
      }).map(function (otherFilePath) {
        return (0, _nuclideRemoteUri.join)(dirName, otherFilePath.file);
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
      var base = (0, _nuclideRemoteUri.basename)(filePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbGF0ZWRGaWxlRmluZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWFzQixRQUFROzs7O3VDQUNPLGlDQUFpQzs7Z0NBQ3ZCLDBCQUEwQjs7Ozs7Ozs7Ozs7O0lBV3BELGlCQUFpQjtXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7O2VBQWpCLGlCQUFpQjs7Ozs7Ozs7OzZCQVExQixXQUFDLFFBQW9CLEVBQXlEOzs7QUFDdEYsVUFBTSxPQUFPLEdBQUcsK0JBQVEsUUFBUSxDQUFDLENBQUM7QUFDbEMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFekMsVUFBTSxPQUFPLEdBQUcscURBQXVCLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3RFLCtCQUFVLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLFVBQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQywrQkFBUSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FDekIsTUFBTSxDQUFDLFVBQUEsYUFBYSxFQUFJO0FBQ3ZCLGVBQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxNQUFLLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssTUFBTSxDQUFDO09BQ3ZGLENBQUMsQ0FDRCxHQUFHLENBQUMsVUFBQSxhQUFhO2VBQUksNEJBQUssT0FBTyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQ3ZELElBQUksRUFBRSxDQUFDOztBQUVWLFVBQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsVUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDaEIsY0FBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsR0FBRyxRQUFRLENBQUMsQ0FBQztPQUN0RTs7QUFFRCxhQUFPO0FBQ0wsb0JBQVksRUFBRSxZQUFZO0FBQzFCLGFBQUssRUFBRSxLQUFLO09BQ2IsQ0FBQztLQUNIOzs7V0FFUyxvQkFBQyxRQUFvQixFQUFVO0FBQ3ZDLFVBQUksSUFBSSxHQUFHLGdDQUFTLFFBQVEsQ0FBQyxDQUFDOztBQUU5QixVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFVBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2QsWUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQy9COzs7QUFHRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDN0M7OztTQTNDa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiJSZWxhdGVkRmlsZUZpbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IHtiYXNlbmFtZSwgZGlybmFtZSwgZ2V0UGF0aCwgam9pbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuLyoqXG4gKiBGaW5kcyByZWxhdGVkIGZpbGVzLCB0byBiZSB1c2VkIGluIGBKdW1wVG9SZWxhdGVkRmlsZWAuXG4gKlxuICogRmlsZXMgYXJlIHJlbGF0ZWQgaWYgdGhleSBoYXZlIHRoZSBzYW1lIGZpbGVuYW1lIGJ1dCBkaWZmZXJlbnQgZXh0ZW5zaW9uLFxuICogb3IgaWYgdGhlIGZpbGVuYW1lIGlzIGFwcGVuZGVkIHdpdGggYEludGVybmFsYCBvciBgLWlubGAuIEZvciBleGFtcGxlLCB0aGVzZSBmaWxlc1xuICogd291bGQgYWxsIGJlIHJlbGF0ZWQ6IGBGb28uaGAsIGBGb28ubWAsIGBGb29JbnRlcm5hbC5oYCwgYEZvby1pbmwuaGBcbiAqXG4gKiBGb3Igbm93LCB3ZSBvbmx5IHNlYXJjaCBpbiB0aGUgZ2l2ZW4gcGF0aCdzIGRpcmVjdG9yeSBmb3IgcmVsYXRlZCBmaWxlcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVsYXRlZEZpbGVGaW5kZXIge1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWxhdGVkIGZpbGVzIGFuZCB0aGUgZ2l2ZW4gZmlsZSdzIGluZGV4IGluIHRoYXQgYXJyYXkuXG4gICAqIFRoZSBnaXZlbiBmaWxlIG11c3QgYmUgaW4gdGhlIHJlbGF0ZWQgZmlsZXMgYXJyYXkuXG4gICAqIEBwYXJhbSBmaWxlUGF0aCBUaGUgZmlsZXBhdGggZm9yIHdoaWNoIHRvIGdldCByZWxhdGVkIGZpbGVzLlxuICAgKiBAcmV0dXJuIFRoZSByZWxhdGVkIGZpbGVzIGFuZCB0aGUgZ2l2ZW4gcGF0aCdzIGluZGV4IGludG8gaXQuXG4gICAqL1xuICBhc3luYyBmaW5kKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx7cmVsYXRlZEZpbGVzOiBBcnJheTxzdHJpbmc+OyBpbmRleDogbnVtYmVyfT4ge1xuICAgIGNvbnN0IGRpck5hbWUgPSBkaXJuYW1lKGZpbGVQYXRoKTtcbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLl9nZXRQcmVmaXgoZmlsZVBhdGgpO1xuXG4gICAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0ZpbGVTeXN0ZW1TZXJ2aWNlJywgZmlsZVBhdGgpO1xuICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICBjb25zdCBsaXN0aW5nID0gYXdhaXQgc2VydmljZS5yZWFkZGlyKGdldFBhdGgoZGlyTmFtZSkpO1xuICAgIGNvbnN0IHJlbGF0ZWRGaWxlcyA9IGxpc3RpbmdcbiAgICAgIC5maWx0ZXIob3RoZXJGaWxlUGF0aCA9PiB7XG4gICAgICAgIHJldHVybiBvdGhlckZpbGVQYXRoLnN0YXRzLmlzRmlsZSgpICYmIHRoaXMuX2dldFByZWZpeChvdGhlckZpbGVQYXRoLmZpbGUpID09PSBwcmVmaXg7XG4gICAgICB9KVxuICAgICAgLm1hcChvdGhlckZpbGVQYXRoID0+IGpvaW4oZGlyTmFtZSwgb3RoZXJGaWxlUGF0aC5maWxlKSlcbiAgICAgIC5zb3J0KCk7XG5cbiAgICBjb25zdCBpbmRleCA9IHJlbGF0ZWRGaWxlcy5pbmRleE9mKGZpbGVQYXRoKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dpdmVuIHBhdGggbXVzdCBiZSBpbiBgcmVsYXRlZEZpbGVzYDogJyArIGZpbGVQYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVsYXRlZEZpbGVzOiByZWxhdGVkRmlsZXMsXG4gICAgICBpbmRleDogaW5kZXgsXG4gICAgfTtcbiAgfVxuXG4gIF9nZXRQcmVmaXgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIGxldCBiYXNlID0gYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgIC8vIFN0cmlwIG9mZiB0aGUgZXh0ZW5zaW9uLlxuICAgIGNvbnN0IHBvcyA9IGJhc2UubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAocG9zICE9PSAtMSkge1xuICAgICAgYmFzZSA9IGJhc2Uuc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgfVxuICAgIC8vIEluIE9iamVjdGl2ZS1DIHdlIG9mdGVuIGhhdmUgdGhlIFggKyBYSW50ZXJuYWwuaCBmb3IgaW1wbGVtZW50YXRpb24gbWV0aG9kcy5cbiAgICAvLyBTaW1pbGFybHksIEMrKyB1c2VycyBvZnRlbiB1c2UgWC5oICsgWC1pbmwuaC5cbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC8oSW50ZXJuYWx8LWlubCkkLywgJycpO1xuICB9XG5cbn1cbiJdfQ==