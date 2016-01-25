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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

      var listing = yield (0, _remoteConnection.getServiceByNuclideUri)('FileSystemService', filePath).readdir((0, _remoteUri.getPath)(dirName));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbGF0ZWRGaWxlRmluZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FhcUMseUJBQXlCOzt5QkFDZixrQkFBa0I7Ozs7Ozs7Ozs7OztJQVc1QyxpQkFBaUI7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7Ozs7Ozs7Ozs2QkFRMUIsV0FBQyxRQUFvQixFQUF5RDs7O0FBQ3RGLFVBQU0sT0FBTyxHQUFHLHdCQUFRLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXpDLFVBQU0sT0FBTyxHQUFHLE1BQU0sOENBQXVCLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUN4RSxPQUFPLENBQUMsd0JBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUM3QixVQUFNLFlBQVksR0FBRyxPQUFPLENBQ3pCLE1BQU0sQ0FBQyxVQUFDLGFBQWEsRUFBSztBQUN6QixlQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksTUFBSyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLE1BQU0sQ0FBQztPQUN2RixDQUFDLENBQ0QsR0FBRyxDQUFDLFVBQUMsYUFBYTtlQUFLLHFCQUFLLE9BQU8sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUN6RCxJQUFJLEVBQUUsQ0FBQzs7QUFFVixVQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLFVBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLGNBQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLEdBQUcsUUFBUSxDQUFDLENBQUM7T0FDdEU7O0FBRUQsYUFBTztBQUNMLG9CQUFZLEVBQUUsWUFBWTtBQUMxQixhQUFLLEVBQUUsS0FBSztPQUNiLENBQUM7S0FDSDs7O1dBRVMsb0JBQUMsUUFBb0IsRUFBVTtBQUN2QyxVQUFJLElBQUksR0FBRyx5QkFBUyxRQUFRLENBQUMsQ0FBQzs7QUFFOUIsVUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxVQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNkLFlBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztPQUMvQjs7O0FBR0QsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzdDOzs7U0ExQ2tCLGlCQUFpQjs7O3FCQUFqQixpQkFBaUIiLCJmaWxlIjoiUmVsYXRlZEZpbGVGaW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IHtiYXNlbmFtZSwgZGlybmFtZSwgZ2V0UGF0aCwgam9pbn0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbi8qKlxuICogRmluZHMgcmVsYXRlZCBmaWxlcywgdG8gYmUgdXNlZCBpbiBgSnVtcFRvUmVsYXRlZEZpbGVgLlxuICpcbiAqIEZpbGVzIGFyZSByZWxhdGVkIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBmaWxlbmFtZSBidXQgZGlmZmVyZW50IGV4dGVuc2lvbixcbiAqIG9yIGlmIHRoZSBmaWxlbmFtZSBpcyBhcHBlbmRlZCB3aXRoIGBJbnRlcm5hbGAgb3IgYC1pbmxgLiBGb3IgZXhhbXBsZSwgdGhlc2UgZmlsZXNcbiAqIHdvdWxkIGFsbCBiZSByZWxhdGVkOiBgRm9vLmhgLCBgRm9vLm1gLCBgRm9vSW50ZXJuYWwuaGAsIGBGb28taW5sLmhgXG4gKlxuICogRm9yIG5vdywgd2Ugb25seSBzZWFyY2ggaW4gdGhlIGdpdmVuIHBhdGgncyBkaXJlY3RvcnkgZm9yIHJlbGF0ZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbGF0ZWRGaWxlRmluZGVyIHtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVsYXRlZCBmaWxlcyBhbmQgdGhlIGdpdmVuIGZpbGUncyBpbmRleCBpbiB0aGF0IGFycmF5LlxuICAgKiBUaGUgZ2l2ZW4gZmlsZSBtdXN0IGJlIGluIHRoZSByZWxhdGVkIGZpbGVzIGFycmF5LlxuICAgKiBAcGFyYW0gZmlsZVBhdGggVGhlIGZpbGVwYXRoIGZvciB3aGljaCB0byBnZXQgcmVsYXRlZCBmaWxlcy5cbiAgICogQHJldHVybiBUaGUgcmVsYXRlZCBmaWxlcyBhbmQgdGhlIGdpdmVuIHBhdGgncyBpbmRleCBpbnRvIGl0LlxuICAgKi9cbiAgYXN5bmMgZmluZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8e3JlbGF0ZWRGaWxlczogQXJyYXk8c3RyaW5nPjsgaW5kZXg6IG51bWJlcn0+IHtcbiAgICBjb25zdCBkaXJOYW1lID0gZGlybmFtZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcHJlZml4ID0gdGhpcy5fZ2V0UHJlZml4KGZpbGVQYXRoKTtcblxuICAgIGNvbnN0IGxpc3RpbmcgPSBhd2FpdCBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdGaWxlU3lzdGVtU2VydmljZScsIGZpbGVQYXRoKVxuICAgICAgLnJlYWRkaXIoZ2V0UGF0aChkaXJOYW1lKSk7XG4gICAgY29uc3QgcmVsYXRlZEZpbGVzID0gbGlzdGluZ1xuICAgICAgLmZpbHRlcigob3RoZXJGaWxlUGF0aCkgPT4ge1xuICAgICAgICByZXR1cm4gb3RoZXJGaWxlUGF0aC5zdGF0cy5pc0ZpbGUoKSAmJiB0aGlzLl9nZXRQcmVmaXgob3RoZXJGaWxlUGF0aC5maWxlKSA9PT0gcHJlZml4O1xuICAgICAgfSlcbiAgICAgIC5tYXAoKG90aGVyRmlsZVBhdGgpID0+IGpvaW4oZGlyTmFtZSwgb3RoZXJGaWxlUGF0aC5maWxlKSlcbiAgICAgIC5zb3J0KCk7XG5cbiAgICBjb25zdCBpbmRleCA9IHJlbGF0ZWRGaWxlcy5pbmRleE9mKGZpbGVQYXRoKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dpdmVuIHBhdGggbXVzdCBiZSBpbiBgcmVsYXRlZEZpbGVzYDogJyArIGZpbGVQYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVsYXRlZEZpbGVzOiByZWxhdGVkRmlsZXMsXG4gICAgICBpbmRleDogaW5kZXgsXG4gICAgfTtcbiAgfVxuXG4gIF9nZXRQcmVmaXgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIGxldCBiYXNlID0gYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgIC8vIFN0cmlwIG9mZiB0aGUgZXh0ZW5zaW9uLlxuICAgIGNvbnN0IHBvcyA9IGJhc2UubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAocG9zICE9PSAtMSkge1xuICAgICAgYmFzZSA9IGJhc2Uuc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgfVxuICAgIC8vIEluIE9iamVjdGl2ZS1DIHdlIG9mdGVuIGhhdmUgdGhlIFggKyBYSW50ZXJuYWwuaCBmb3IgaW1wbGVtZW50YXRpb24gbWV0aG9kcy5cbiAgICAvLyBTaW1pbGFybHksIEMrKyB1c2VycyBvZnRlbiB1c2UgWC5oICsgWC1pbmwuaC5cbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC8oSW50ZXJuYWx8LWlubCkkLywgJycpO1xuICB9XG5cbn1cbiJdfQ==