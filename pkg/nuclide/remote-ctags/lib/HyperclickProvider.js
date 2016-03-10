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
var QUALIFYING_FIELDS = ['class', 'namespace', 'struct', 'enum', 'Module'];

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
                var file = tag.file;
                var fields = tag.fields;
                var kind = tag.kind;

                var relpath = (0, _remoteUri.relative)(tagsDir, file);
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
//# sourceMappingURL=data:application/json;base64,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O1NBdEVVLGtCQUFrQiIsImZpbGUiOiJIeXBlcmNsaWNrUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1N1Z2dlc3Rpb259IGZyb20gJy4uLy4uL2h5cGVyY2xpY2staW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7Q3RhZ3NSZXN1bHQsIEN0YWdzU2VydmljZX0gZnJvbSAnLi4vLi4vcmVtb3RlLWN0YWdzLWJhc2UnO1xuXG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IHtkaXJuYW1lLCByZWxhdGl2ZX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge0NUQUdTX0tJTkRfTkFNRVMsIGdldExpbmVOdW1iZXJGb3JUYWd9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBMSU1JVCA9IDEwMDtcbmNvbnN0IFFVQUxJRllJTkdfRklFTERTID0gWydjbGFzcycsICduYW1lc3BhY2UnLCAnc3RydWN0JywgJ2VudW0nLCAnTW9kdWxlJ107XG5cbi8qKlxuICogSWYgYSBsaW5lIG51bWJlciBpcyBzcGVjaWZpZWQgYnkgdGhlIHRhZywganVtcCB0byB0aGF0IGxpbmUuXG4gKiBPdGhlcndpc2UsIHdlJ2xsIGhhdmUgdG8gbG9vayB1cCB0aGUgcGF0dGVybiBpbiB0aGUgZmlsZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2sodGFnOiBDdGFnc1Jlc3VsdCkge1xuICByZXR1cm4gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGxpbmVOdW1iZXIgPSBhd2FpdCBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZyk7XG4gICAgZ29Ub0xvY2F0aW9uKHRhZy5maWxlLCBsaW5lTnVtYmVyLCAwKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29tbW9uUHJlZml4TGVuZ3RoKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAoaSA8IGEubGVuZ3RoICYmIGkgPCBiLmxlbmd0aCAmJiBhW2ldID09PSBiW2ldKSB7XG4gICAgaSsrO1xuICB9XG4gIHJldHVybiBpO1xufVxuXG5leHBvcnQgY2xhc3MgSHlwZXJjbGlja1Byb3ZpZGVyIHtcblxuICBhc3luYyBnZXRTdWdnZXN0aW9uRm9yV29yZChcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHJhbmdlOiBhdG9tJFJhbmdlLFxuICApOiBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIGNvbnN0IHBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnQ3RhZ3NTZXJ2aWNlJywgcGF0aCk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIGNvbnN0IGN0YWdzU2VydmljZSA9IChhd2FpdCBzZXJ2aWNlLmdldEN0YWdzU2VydmljZShwYXRoKTogP0N0YWdzU2VydmljZSk7XG5cbiAgICBpZiAoY3RhZ3NTZXJ2aWNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0YWdzID0gYXdhaXQgY3RhZ3NTZXJ2aWNlLmZpbmRUYWdzKHRleHQsIHtsaW1pdDogTElNSVR9KTtcbiAgICAgIGlmICghdGFncy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4ge3JhbmdlLCBjYWxsYmFjazogY3JlYXRlQ2FsbGJhY2sodGFnc1swXSl9O1xuICAgICAgfVxuXG4gICAgICAvLyBGYXZvciB0YWdzIGluIHRoZSBuZWFyZXN0IGRpcmVjdG9yeSBieSBzb3J0aW5nIGJ5IGNvbW1vbiBwcmVmaXggbGVuZ3RoLlxuICAgICAgdGFncy5zb3J0KCh7ZmlsZTogYX0sIHtmaWxlOiBifSkgPT4ge1xuICAgICAgICBjb25zdCBsZW4gPSBjb21tb25QcmVmaXhMZW5ndGgocGF0aCwgYikgLSBjb21tb25QcmVmaXhMZW5ndGgocGF0aCwgYSk7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gYS5sb2NhbGVDb21wYXJlKGIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZW47XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgdGFnc0RpciA9IGRpcm5hbWUoYXdhaXQgY3RhZ3NTZXJ2aWNlLmdldFRhZ3NQYXRoKCkpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2UsXG4gICAgICAgIGNhbGxiYWNrOiB0YWdzLm1hcCh0YWcgPT4ge1xuICAgICAgICAgIGNvbnN0IHtmaWxlLCBmaWVsZHMsIGtpbmR9ID0gdGFnO1xuICAgICAgICAgIGNvbnN0IHJlbHBhdGggPSByZWxhdGl2ZSh0YWdzRGlyLCBmaWxlKTtcbiAgICAgICAgICBsZXQgdGl0bGUgPSBgJHt0YWcubmFtZX0gKCR7cmVscGF0aH0pYDtcbiAgICAgICAgICBpZiAoZmllbGRzICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFB5dGhvbiB1c2VzIGEuYi5jOyBtb3N0IG90aGVyIGxhbmdhdWdlcyB1c2UgYTo6Yjo6Yy5cbiAgICAgICAgICAgIC8vIFRoZXJlIGFyZSBkZWZpbml0ZWx5IG90aGVyIGNhc2VzLCBidXQgaXQncyBub3QgYSBiaWcgaXNzdWUuXG4gICAgICAgICAgICBjb25zdCBzZXAgPSBmaWxlLmVuZHNXaXRoKCcucHknKSA/ICcuJyA6ICc6Oic7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIFFVQUxJRllJTkdfRklFTERTKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbCA9IGZpZWxkcy5nZXQoZmllbGQpO1xuICAgICAgICAgICAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHZhbCArIHNlcCArIHRpdGxlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChraW5kICE9IG51bGwgJiYgQ1RBR1NfS0lORF9OQU1FU1traW5kXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aXRsZSA9IENUQUdTX0tJTkRfTkFNRVNba2luZF0gKyAnICcgKyB0aXRsZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNyZWF0ZUNhbGxiYWNrKHRhZyksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjdGFnc1NlcnZpY2UuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=