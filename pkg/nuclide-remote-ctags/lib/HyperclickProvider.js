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

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _utils = require('./utils');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var LIMIT = 100;
var QUALIFYING_FIELDS = ['class', 'namespace', 'struct', 'enum', 'Module'];

/**
 * If a line number is specified by the tag, jump to that line.
 * Otherwise, we'll have to look up the pattern in the file.
 */
function createCallback(tag) {
  return _asyncToGenerator(function* () {
    var lineNumber = yield (0, _utils.getLineNumberForTag)(tag);
    (0, _nuclideAtomHelpers.goToLocation)(tag.file, lineNumber, 0);
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

      var service = (0, _nuclideRemoteConnection.getServiceByNuclideUri)('CtagsService', path);
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

          var tagsDir = (0, _nuclideRemoteUri.dirname)((yield ctagsService.getTagsPath()));
          return {
            v: {
              range: range,
              callback: tags.map(function (tag) {
                var file = tag.file;
                var fields = tag.fields;
                var kind = tag.kind;

                var relpath = (0, _nuclideRemoteUri.relative)(tagsDir, file);
                var title = tag.name + ' (' + relpath + ')';
                if (fields != null) {
                  // Python uses a.b.c; most other langauges use a::b::c.
                  // There are definitely other cases, but it's not a big issue.
                  var sep = file.endsWith('.py') ? '.' : '::';
                  for (var field of QUALIFYING_FIELDS) {
                    var val = fields.get(field);
                    if (val != null) {
                      title = val + sep + title;
                      break;
                    }
                  }
                }
                if (kind != null && _utils.CTAGS_KIND_NAMES[kind] != null) {
                  title = _utils.CTAGS_KIND_NAMES[kind] + ' ' + title;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0FjMkIsNEJBQTRCOzt1Q0FDbEIsaUNBQWlDOztnQ0FDdEMsMEJBQTBCOztxQkFDTixTQUFTOztzQkFDdkMsUUFBUTs7OztBQUU5QixJQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDbEIsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzs7Ozs7O0FBTTdFLFNBQVMsY0FBYyxDQUFDLEdBQWdCLEVBQUU7QUFDeEMsMkJBQU8sYUFBWTtBQUNqQixRQUFNLFVBQVUsR0FBRyxNQUFNLGdDQUFvQixHQUFHLENBQUMsQ0FBQztBQUNsRCwwQ0FBYSxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUN2QyxFQUFDO0NBQ0g7O0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFVO0FBQ3hELE1BQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLFNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNwRCxLQUFDLEVBQUUsQ0FBQztHQUNMO0FBQ0QsU0FBTyxDQUFDLENBQUM7Q0FDVjs7SUFFWSxrQkFBa0I7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OztlQUFsQixrQkFBa0I7OzZCQUVILFdBQ3hCLFVBQTJCLEVBQzNCLElBQVksRUFDWixLQUFpQixFQUNlO0FBQ2hDLFVBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsZUFBTyxJQUFJLENBQUM7T0FD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OztTQXRFVSxrQkFBa0IiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0N0YWdzUmVzdWx0LCBDdGFnc1NlcnZpY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWN0YWdzLWJhc2UnO1xuXG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7ZGlybmFtZSwgcmVsYXRpdmV9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge0NUQUdTX0tJTkRfTkFNRVMsIGdldExpbmVOdW1iZXJGb3JUYWd9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBMSU1JVCA9IDEwMDtcbmNvbnN0IFFVQUxJRllJTkdfRklFTERTID0gWydjbGFzcycsICduYW1lc3BhY2UnLCAnc3RydWN0JywgJ2VudW0nLCAnTW9kdWxlJ107XG5cbi8qKlxuICogSWYgYSBsaW5lIG51bWJlciBpcyBzcGVjaWZpZWQgYnkgdGhlIHRhZywganVtcCB0byB0aGF0IGxpbmUuXG4gKiBPdGhlcndpc2UsIHdlJ2xsIGhhdmUgdG8gbG9vayB1cCB0aGUgcGF0dGVybiBpbiB0aGUgZmlsZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2sodGFnOiBDdGFnc1Jlc3VsdCkge1xuICByZXR1cm4gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGxpbmVOdW1iZXIgPSBhd2FpdCBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZyk7XG4gICAgZ29Ub0xvY2F0aW9uKHRhZy5maWxlLCBsaW5lTnVtYmVyLCAwKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29tbW9uUHJlZml4TGVuZ3RoKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAoaSA8IGEubGVuZ3RoICYmIGkgPCBiLmxlbmd0aCAmJiBhW2ldID09PSBiW2ldKSB7XG4gICAgaSsrO1xuICB9XG4gIHJldHVybiBpO1xufVxuXG5leHBvcnQgY2xhc3MgSHlwZXJjbGlja1Byb3ZpZGVyIHtcblxuICBhc3luYyBnZXRTdWdnZXN0aW9uRm9yV29yZChcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHJhbmdlOiBhdG9tJFJhbmdlLFxuICApOiBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIGNvbnN0IHBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnQ3RhZ3NTZXJ2aWNlJywgcGF0aCk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIGNvbnN0IGN0YWdzU2VydmljZSA9IChhd2FpdCBzZXJ2aWNlLmdldEN0YWdzU2VydmljZShwYXRoKTogP0N0YWdzU2VydmljZSk7XG5cbiAgICBpZiAoY3RhZ3NTZXJ2aWNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0YWdzID0gYXdhaXQgY3RhZ3NTZXJ2aWNlLmZpbmRUYWdzKHRleHQsIHtsaW1pdDogTElNSVR9KTtcbiAgICAgIGlmICghdGFncy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4ge3JhbmdlLCBjYWxsYmFjazogY3JlYXRlQ2FsbGJhY2sodGFnc1swXSl9O1xuICAgICAgfVxuXG4gICAgICAvLyBGYXZvciB0YWdzIGluIHRoZSBuZWFyZXN0IGRpcmVjdG9yeSBieSBzb3J0aW5nIGJ5IGNvbW1vbiBwcmVmaXggbGVuZ3RoLlxuICAgICAgdGFncy5zb3J0KCh7ZmlsZTogYX0sIHtmaWxlOiBifSkgPT4ge1xuICAgICAgICBjb25zdCBsZW4gPSBjb21tb25QcmVmaXhMZW5ndGgocGF0aCwgYikgLSBjb21tb25QcmVmaXhMZW5ndGgocGF0aCwgYSk7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gYS5sb2NhbGVDb21wYXJlKGIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZW47XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgdGFnc0RpciA9IGRpcm5hbWUoYXdhaXQgY3RhZ3NTZXJ2aWNlLmdldFRhZ3NQYXRoKCkpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2UsXG4gICAgICAgIGNhbGxiYWNrOiB0YWdzLm1hcCh0YWcgPT4ge1xuICAgICAgICAgIGNvbnN0IHtmaWxlLCBmaWVsZHMsIGtpbmR9ID0gdGFnO1xuICAgICAgICAgIGNvbnN0IHJlbHBhdGggPSByZWxhdGl2ZSh0YWdzRGlyLCBmaWxlKTtcbiAgICAgICAgICBsZXQgdGl0bGUgPSBgJHt0YWcubmFtZX0gKCR7cmVscGF0aH0pYDtcbiAgICAgICAgICBpZiAoZmllbGRzICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFB5dGhvbiB1c2VzIGEuYi5jOyBtb3N0IG90aGVyIGxhbmdhdWdlcyB1c2UgYTo6Yjo6Yy5cbiAgICAgICAgICAgIC8vIFRoZXJlIGFyZSBkZWZpbml0ZWx5IG90aGVyIGNhc2VzLCBidXQgaXQncyBub3QgYSBiaWcgaXNzdWUuXG4gICAgICAgICAgICBjb25zdCBzZXAgPSBmaWxlLmVuZHNXaXRoKCcucHknKSA/ICcuJyA6ICc6Oic7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIFFVQUxJRllJTkdfRklFTERTKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbCA9IGZpZWxkcy5nZXQoZmllbGQpO1xuICAgICAgICAgICAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHZhbCArIHNlcCArIHRpdGxlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChraW5kICE9IG51bGwgJiYgQ1RBR1NfS0lORF9OQU1FU1traW5kXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aXRsZSA9IENUQUdTX0tJTkRfTkFNRVNba2luZF0gKyAnICcgKyB0aXRsZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNyZWF0ZUNhbGxiYWNrKHRhZyksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjdGFnc1NlcnZpY2UuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=