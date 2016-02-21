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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atomHelpers = require('../../atom-helpers');

var _remoteConnection = require('../../remote-connection');

var _remoteUri = require('../../remote-uri');

var _utils = require('./utils');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var LIMIT = 100;

/**
 * If a line number is specified by the tag, jump to that line.
 * Otherwise, we'll have to look up the pattern in the file.
 */
function createCallback(tag) {
  return _asyncToGenerator(function* () {
    var lineNumber = yield (0, _utils.getLineNumberForTag)(tag);
    (0, _atomHelpers.goToLocation)(tag.file, lineNumber, 0);
  });
}

function commonPrefixLength(a, b) {
  var i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}

var HyperclickProvider = (function () {
  function HyperclickProvider() {
    _classCallCheck(this, HyperclickProvider);
  }

  _createClass(HyperclickProvider, [{
    key: 'getSuggestionForWord',
    value: _asyncToGenerator(function* (textEditor, text, range) {
      var path = textEditor.getPath();
      if (path == null) {
        return null;
      }

      var service = (0, _remoteConnection.getServiceByNuclideUri)('CtagsService', path);
      (0, _assert2['default'])(service);
      var ctagsService = yield service.getCtagsService(path);

      if (ctagsService == null) {
        return null;
      }

      try {
        var _ret = yield* (function* () {
          var tags = yield ctagsService.findTags(text, { limit: LIMIT });
          if (!tags.length) {
            return {
              v: null
            };
          }

          if (tags.length === 1) {
            return {
              v: { range: range, callback: createCallback(tags[0]) }
            };
          }

          // Favor tags in the nearest directory by sorting by common prefix length.
          tags.sort(function (_ref, _ref2) {
            var a = _ref.file;
            var b = _ref2.file;

            var len = commonPrefixLength(path, b) - commonPrefixLength(path, a);
            if (len === 0) {
              return a.localeCompare(b);
            }
            return len;
          });

          var tagsDir = (0, _remoteUri.dirname)((yield ctagsService.getTagsPath()));
          return {
            v: {
              range: range,
              callback: tags.map(function (tag) {
                var relpath = (0, _remoteUri.relative)(tagsDir, tag.file);
                var title = tag.name + ' (' + relpath + ')';
                if (tag.kind != null && _utils.CTAGS_KIND_NAMES[tag.kind] != null) {
                  title = _utils.CTAGS_KIND_NAMES[tag.kind] + ' ' + title;
                }
                return {
                  title: title,
                  callback: createCallback(tag)
                };
              })
            }
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } finally {
        ctagsService.dispose();
      }
    })
  }]);

  return HyperclickProvider;
})();

exports.HyperclickProvider = HyperclickProvider;
//# sourceMappingURL=data:application/json;base64,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QUFHLEVBQUk7QUFDeEIsb0JBQU0sT0FBTyxHQUFHLHlCQUFTLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsb0JBQUksS0FBSyxHQUFNLEdBQUcsQ0FBQyxJQUFJLFVBQUssT0FBTyxNQUFHLENBQUM7QUFDdkMsb0JBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksd0JBQWlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDMUQsdUJBQUssR0FBRyx3QkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7aUJBQ2xEO0FBQ0QsdUJBQU87QUFDTCx1QkFBSyxFQUFMLEtBQUs7QUFDTCwwQkFBUSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUM7aUJBQzlCLENBQUM7ZUFDSCxDQUFDO2FBQ0g7WUFBQzs7OztPQUNILFNBQVM7QUFDUixvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0tBQ0Y7OztTQXpEVSxrQkFBa0IiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0N0YWdzUmVzdWx0LCBDdGFnc1NlcnZpY2V9IGZyb20gJy4uLy4uL3JlbW90ZS1jdGFncy1iYXNlJztcblxuaW1wb3J0IHtnb1RvTG9jYXRpb259IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7ZGlybmFtZSwgcmVsYXRpdmV9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtDVEFHU19LSU5EX05BTUVTLCBnZXRMaW5lTnVtYmVyRm9yVGFnfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgTElNSVQgPSAxMDA7XG5cbi8qKlxuICogSWYgYSBsaW5lIG51bWJlciBpcyBzcGVjaWZpZWQgYnkgdGhlIHRhZywganVtcCB0byB0aGF0IGxpbmUuXG4gKiBPdGhlcndpc2UsIHdlJ2xsIGhhdmUgdG8gbG9vayB1cCB0aGUgcGF0dGVybiBpbiB0aGUgZmlsZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2sodGFnOiBDdGFnc1Jlc3VsdCkge1xuICByZXR1cm4gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGxpbmVOdW1iZXIgPSBhd2FpdCBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZyk7XG4gICAgZ29Ub0xvY2F0aW9uKHRhZy5maWxlLCBsaW5lTnVtYmVyLCAwKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29tbW9uUHJlZml4TGVuZ3RoKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAoaSA8IGEubGVuZ3RoICYmIGkgPCBiLmxlbmd0aCAmJiBhW2ldID09PSBiW2ldKSB7XG4gICAgaSsrO1xuICB9XG4gIHJldHVybiBpO1xufVxuXG5leHBvcnQgY2xhc3MgSHlwZXJjbGlja1Byb3ZpZGVyIHtcblxuICBhc3luYyBnZXRTdWdnZXN0aW9uRm9yV29yZChcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHJhbmdlOiBhdG9tJFJhbmdlLFxuICApOiBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIGNvbnN0IHBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnQ3RhZ3NTZXJ2aWNlJywgcGF0aCk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIGNvbnN0IGN0YWdzU2VydmljZSA9IChhd2FpdCBzZXJ2aWNlLmdldEN0YWdzU2VydmljZShwYXRoKTogP0N0YWdzU2VydmljZSk7XG5cbiAgICBpZiAoY3RhZ3NTZXJ2aWNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0YWdzID0gYXdhaXQgY3RhZ3NTZXJ2aWNlLmZpbmRUYWdzKHRleHQsIHtsaW1pdDogTElNSVR9KTtcbiAgICAgIGlmICghdGFncy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4ge3JhbmdlLCBjYWxsYmFjazogY3JlYXRlQ2FsbGJhY2sodGFnc1swXSl9O1xuICAgICAgfVxuXG4gICAgICAvLyBGYXZvciB0YWdzIGluIHRoZSBuZWFyZXN0IGRpcmVjdG9yeSBieSBzb3J0aW5nIGJ5IGNvbW1vbiBwcmVmaXggbGVuZ3RoLlxuICAgICAgdGFncy5zb3J0KCh7ZmlsZTogYX0sIHtmaWxlOiBifSkgPT4ge1xuICAgICAgICBjb25zdCBsZW4gPSBjb21tb25QcmVmaXhMZW5ndGgocGF0aCwgYikgLSBjb21tb25QcmVmaXhMZW5ndGgocGF0aCwgYSk7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gYS5sb2NhbGVDb21wYXJlKGIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZW47XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgdGFnc0RpciA9IGRpcm5hbWUoYXdhaXQgY3RhZ3NTZXJ2aWNlLmdldFRhZ3NQYXRoKCkpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2UsXG4gICAgICAgIGNhbGxiYWNrOiB0YWdzLm1hcCh0YWcgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlbHBhdGggPSByZWxhdGl2ZSh0YWdzRGlyLCB0YWcuZmlsZSk7XG4gICAgICAgICAgbGV0IHRpdGxlID0gYCR7dGFnLm5hbWV9ICgke3JlbHBhdGh9KWA7XG4gICAgICAgICAgaWYgKHRhZy5raW5kICE9IG51bGwgJiYgQ1RBR1NfS0lORF9OQU1FU1t0YWcua2luZF0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdGl0bGUgPSBDVEFHU19LSU5EX05BTUVTW3RhZy5raW5kXSArICcgJyArIHRpdGxlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjYWxsYmFjazogY3JlYXRlQ2FsbGJhY2sodGFnKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGN0YWdzU2VydmljZS5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==