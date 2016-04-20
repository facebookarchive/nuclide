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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0FjMkIsNEJBQTRCOzt1Q0FDbEIsaUNBQWlDOztnQ0FDdEMsMEJBQTBCOztxQkFDTixTQUFTOztzQkFDdkMsUUFBUTs7OztBQUU5QixJQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDbEIsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzs7Ozs7O0FBTTdFLFNBQVMsY0FBYyxDQUFDLEdBQWdCLEVBQUU7QUFDeEMsMkJBQU8sYUFBWTtBQUNqQixRQUFNLFVBQVUsR0FBRyxNQUFNLGdDQUFvQixHQUFHLENBQUMsQ0FBQztBQUNsRCwwQ0FBYSxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUN2QyxFQUFDO0NBQ0g7O0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFVO0FBQ3hELE1BQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLFNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNwRCxLQUFDLEVBQUUsQ0FBQztHQUNMO0FBQ0QsU0FBTyxDQUFDLENBQUM7Q0FDVjs7SUFFWSxrQkFBa0I7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OztlQUFsQixrQkFBa0I7OzZCQUVILFdBQ3hCLFVBQTJCLEVBQzNCLElBQVksRUFDWixLQUFpQixFQUNlO0FBQ2hDLFVBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsZUFBTyxJQUFJLENBQUM7T0FD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OztTQXRFVSxrQkFBa0IiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrJztcbmltcG9ydCB0eXBlIHtDdGFnc1Jlc3VsdCwgQ3RhZ3NTZXJ2aWNlfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jdGFncy1iYXNlJztcblxuaW1wb3J0IHtnb1RvTG9jYXRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2Rpcm5hbWUsIHJlbGF0aXZlfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtDVEFHU19LSU5EX05BTUVTLCBnZXRMaW5lTnVtYmVyRm9yVGFnfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgTElNSVQgPSAxMDA7XG5jb25zdCBRVUFMSUZZSU5HX0ZJRUxEUyA9IFsnY2xhc3MnLCAnbmFtZXNwYWNlJywgJ3N0cnVjdCcsICdlbnVtJywgJ01vZHVsZSddO1xuXG4vKipcbiAqIElmIGEgbGluZSBudW1iZXIgaXMgc3BlY2lmaWVkIGJ5IHRoZSB0YWcsIGp1bXAgdG8gdGhhdCBsaW5lLlxuICogT3RoZXJ3aXNlLCB3ZSdsbCBoYXZlIHRvIGxvb2sgdXAgdGhlIHBhdHRlcm4gaW4gdGhlIGZpbGUuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrKHRhZzogQ3RhZ3NSZXN1bHQpIHtcbiAgcmV0dXJuIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBsaW5lTnVtYmVyID0gYXdhaXQgZ2V0TGluZU51bWJlckZvclRhZyh0YWcpO1xuICAgIGdvVG9Mb2NhdGlvbih0YWcuZmlsZSwgbGluZU51bWJlciwgMCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbW1vblByZWZpeExlbmd0aChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBhLmxlbmd0aCAmJiBpIDwgYi5sZW5ndGggJiYgYVtpXSA9PT0gYltpXSkge1xuICAgIGkrKztcbiAgfVxuICByZXR1cm4gaTtcbn1cblxuZXhwb3J0IGNsYXNzIEh5cGVyY2xpY2tQcm92aWRlciB7XG5cbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbkZvcldvcmQoXG4gICAgdGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICByYW5nZTogYXRvbSRSYW5nZSxcbiAgKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0N0YWdzU2VydmljZScsIHBhdGgpO1xuICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICBjb25zdCBjdGFnc1NlcnZpY2UgPSAoYXdhaXQgc2VydmljZS5nZXRDdGFnc1NlcnZpY2UocGF0aCk6ID9DdGFnc1NlcnZpY2UpO1xuXG4gICAgaWYgKGN0YWdzU2VydmljZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdGFncyA9IGF3YWl0IGN0YWdzU2VydmljZS5maW5kVGFncyh0ZXh0LCB7bGltaXQ6IExJTUlUfSk7XG4gICAgICBpZiAoIXRhZ3MubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGFncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHtyYW5nZSwgY2FsbGJhY2s6IGNyZWF0ZUNhbGxiYWNrKHRhZ3NbMF0pfTtcbiAgICAgIH1cblxuICAgICAgLy8gRmF2b3IgdGFncyBpbiB0aGUgbmVhcmVzdCBkaXJlY3RvcnkgYnkgc29ydGluZyBieSBjb21tb24gcHJlZml4IGxlbmd0aC5cbiAgICAgIHRhZ3Muc29ydCgoe2ZpbGU6IGF9LCB7ZmlsZTogYn0pID0+IHtcbiAgICAgICAgY29uc3QgbGVuID0gY29tbW9uUHJlZml4TGVuZ3RoKHBhdGgsIGIpIC0gY29tbW9uUHJlZml4TGVuZ3RoKHBhdGgsIGEpO1xuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGEubG9jYWxlQ29tcGFyZShiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVuO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHRhZ3NEaXIgPSBkaXJuYW1lKGF3YWl0IGN0YWdzU2VydmljZS5nZXRUYWdzUGF0aCgpKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlLFxuICAgICAgICBjYWxsYmFjazogdGFncy5tYXAodGFnID0+IHtcbiAgICAgICAgICBjb25zdCB7ZmlsZSwgZmllbGRzLCBraW5kfSA9IHRhZztcbiAgICAgICAgICBjb25zdCByZWxwYXRoID0gcmVsYXRpdmUodGFnc0RpciwgZmlsZSk7XG4gICAgICAgICAgbGV0IHRpdGxlID0gYCR7dGFnLm5hbWV9ICgke3JlbHBhdGh9KWA7XG4gICAgICAgICAgaWYgKGZpZWxkcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAvLyBQeXRob24gdXNlcyBhLmIuYzsgbW9zdCBvdGhlciBsYW5nYXVnZXMgdXNlIGE6OmI6OmMuXG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgZGVmaW5pdGVseSBvdGhlciBjYXNlcywgYnV0IGl0J3Mgbm90IGEgYmlnIGlzc3VlLlxuICAgICAgICAgICAgY29uc3Qgc2VwID0gZmlsZS5lbmRzV2l0aCgnLnB5JykgPyAnLicgOiAnOjonO1xuICAgICAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBRVUFMSUZZSU5HX0ZJRUxEUykge1xuICAgICAgICAgICAgICBjb25zdCB2YWwgPSBmaWVsZHMuZ2V0KGZpZWxkKTtcbiAgICAgICAgICAgICAgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSB2YWwgKyBzZXAgKyB0aXRsZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoa2luZCAhPSBudWxsICYmIENUQUdTX0tJTkRfTkFNRVNba2luZF0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdGl0bGUgPSBDVEFHU19LSU5EX05BTUVTW2tpbmRdICsgJyAnICsgdGl0bGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjcmVhdGVDYWxsYmFjayh0YWcpLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY3RhZ3NTZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxufVxuIl19