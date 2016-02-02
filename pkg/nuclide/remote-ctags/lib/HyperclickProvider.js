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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atomHelpers = require('../../atom-helpers');

var _remoteConnection = require('../../remote-connection');

var _remoteUri = require('../../remote-uri');

var _utils = require('./utils');

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

      var service = yield (0, _remoteConnection.getServiceByNuclideUri)('CtagsService', path).getCtagsService(path);
      if (service == null) {
        return null;
      }

      try {
        var _ret = yield* (function* () {
          var tags = yield service.findTags(text, { limit: LIMIT });
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

          var tagsDir = (0, _remoteUri.dirname)((yield service.getTagsPath()));
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
        service.dispose();
      }
    })
  }]);

  return HyperclickProvider;
})();

exports.HyperclickProvider = HyperclickProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBYzJCLG9CQUFvQjs7Z0NBQ1YseUJBQXlCOzt5QkFDOUIsa0JBQWtCOztxQkFDRSxTQUFTOztBQUU3RCxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7Ozs7OztBQU1sQixTQUFTLGNBQWMsQ0FBQyxHQUFnQixFQUFFO0FBQ3hDLDJCQUFPLGFBQVk7QUFDakIsUUFBTSxVQUFVLEdBQUcsTUFBTSxnQ0FBb0IsR0FBRyxDQUFDLENBQUM7QUFDbEQsbUNBQWEsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDdkMsRUFBQztDQUNIOztBQUVELFNBQVMsa0JBQWtCLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBVTtBQUN4RCxNQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixTQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDcEQsS0FBQyxFQUFFLENBQUM7R0FDTDtBQUNELFNBQU8sQ0FBQyxDQUFDO0NBQ1Y7O0lBRVksa0JBQWtCO1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzs7ZUFBbEIsa0JBQWtCOzs2QkFFSCxXQUN4QixVQUEyQixFQUMzQixJQUFZLEVBQ1osS0FBaUIsRUFDZTtBQUNoQyxVQUFNLElBQUksR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsVUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxPQUFPLEdBQUksTUFBTSw4Q0FBdUIsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUNoRSxlQUFlLENBQUMsSUFBSSxDQUFDLEFBQWdCLENBQUM7QUFDekMsVUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBSTs7QUFDRixjQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDMUQsY0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDaEI7aUJBQU8sSUFBSTtjQUFDO1dBQ2I7O0FBRUQsY0FBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNyQjtpQkFBTyxFQUFDLEtBQUssRUFBTCxLQUFLLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQztjQUFDO1dBQ25EOzs7QUFHRCxjQUFJLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBUyxFQUFFLEtBQVMsRUFBSztnQkFBbEIsQ0FBQyxHQUFSLElBQVMsQ0FBUixJQUFJO2dCQUFhLENBQUMsR0FBUixLQUFTLENBQVIsSUFBSTs7QUFDekIsZ0JBQU0sR0FBRyxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEUsZ0JBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtBQUNiLHFCQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDM0I7QUFDRCxtQkFBTyxHQUFHLENBQUM7V0FDWixDQUFDLENBQUM7O0FBRUgsY0FBTSxPQUFPLEdBQUcseUJBQVEsTUFBTSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3JEO2VBQU87QUFDTCxtQkFBSyxFQUFMLEtBQUs7QUFDTCxzQkFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDeEIsb0JBQU0sT0FBTyxHQUFHLHlCQUFTLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsb0JBQUksS0FBSyxHQUFNLEdBQUcsQ0FBQyxJQUFJLFVBQUssT0FBTyxNQUFHLENBQUM7QUFDdkMsb0JBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksd0JBQWlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDMUQsdUJBQUssR0FBRyx3QkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7aUJBQ2xEO0FBQ0QsdUJBQU87QUFDTCx1QkFBSyxFQUFMLEtBQUs7QUFDTCwwQkFBUSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUM7aUJBQzlCLENBQUM7ZUFDSCxDQUFDO2FBQ0g7WUFBQzs7OztPQUNILFNBQVM7QUFDUixlQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDbkI7S0FDRjs7O1NBdkRVLGtCQUFrQiIsImZpbGUiOiJIeXBlcmNsaWNrUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1N1Z2dlc3Rpb259IGZyb20gJy4uLy4uL2h5cGVyY2xpY2staW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7Q3RhZ3NSZXN1bHQsIEN0YWdzU2VydmljZX0gZnJvbSAnLi4vLi4vcmVtb3RlLWN0YWdzLWJhc2UnO1xuXG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IHtkaXJuYW1lLCByZWxhdGl2ZX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge0NUQUdTX0tJTkRfTkFNRVMsIGdldExpbmVOdW1iZXJGb3JUYWd9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBMSU1JVCA9IDEwMDtcblxuLyoqXG4gKiBJZiBhIGxpbmUgbnVtYmVyIGlzIHNwZWNpZmllZCBieSB0aGUgdGFnLCBqdW1wIHRvIHRoYXQgbGluZS5cbiAqIE90aGVyd2lzZSwgd2UnbGwgaGF2ZSB0byBsb29rIHVwIHRoZSBwYXR0ZXJuIGluIHRoZSBmaWxlLlxuICovXG5mdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh0YWc6IEN0YWdzUmVzdWx0KSB7XG4gIHJldHVybiBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgbGluZU51bWJlciA9IGF3YWl0IGdldExpbmVOdW1iZXJGb3JUYWcodGFnKTtcbiAgICBnb1RvTG9jYXRpb24odGFnLmZpbGUsIGxpbmVOdW1iZXIsIDApO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjb21tb25QcmVmaXhMZW5ndGgoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgaSA9IDA7XG4gIHdoaWxlIChpIDwgYS5sZW5ndGggJiYgaSA8IGIubGVuZ3RoICYmIGFbaV0gPT09IGJbaV0pIHtcbiAgICBpKys7XG4gIH1cbiAgcmV0dXJuIGk7XG59XG5cbmV4cG9ydCBjbGFzcyBIeXBlcmNsaWNrUHJvdmlkZXIge1xuXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb25Gb3JXb3JkKFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2UsXG4gICk6IFByb21pc2U8P0h5cGVyY2xpY2tTdWdnZXN0aW9uPiB7XG4gICAgY29uc3QgcGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChwYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcnZpY2UgPSAoYXdhaXQgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnQ3RhZ3NTZXJ2aWNlJywgcGF0aClcbiAgICAgIC5nZXRDdGFnc1NlcnZpY2UocGF0aCk6ID9DdGFnc1NlcnZpY2UpO1xuICAgIGlmIChzZXJ2aWNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0YWdzID0gYXdhaXQgc2VydmljZS5maW5kVGFncyh0ZXh0LCB7bGltaXQ6IExJTUlUfSk7XG4gICAgICBpZiAoIXRhZ3MubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGFncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHtyYW5nZSwgY2FsbGJhY2s6IGNyZWF0ZUNhbGxiYWNrKHRhZ3NbMF0pfTtcbiAgICAgIH1cblxuICAgICAgLy8gRmF2b3IgdGFncyBpbiB0aGUgbmVhcmVzdCBkaXJlY3RvcnkgYnkgc29ydGluZyBieSBjb21tb24gcHJlZml4IGxlbmd0aC5cbiAgICAgIHRhZ3Muc29ydCgoe2ZpbGU6IGF9LCB7ZmlsZTogYn0pID0+IHtcbiAgICAgICAgY29uc3QgbGVuID0gY29tbW9uUHJlZml4TGVuZ3RoKHBhdGgsIGIpIC0gY29tbW9uUHJlZml4TGVuZ3RoKHBhdGgsIGEpO1xuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGEubG9jYWxlQ29tcGFyZShiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVuO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHRhZ3NEaXIgPSBkaXJuYW1lKGF3YWl0IHNlcnZpY2UuZ2V0VGFnc1BhdGgoKSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZSxcbiAgICAgICAgY2FsbGJhY2s6IHRhZ3MubWFwKHRhZyA9PiB7XG4gICAgICAgICAgY29uc3QgcmVscGF0aCA9IHJlbGF0aXZlKHRhZ3NEaXIsIHRhZy5maWxlKTtcbiAgICAgICAgICBsZXQgdGl0bGUgPSBgJHt0YWcubmFtZX0gKCR7cmVscGF0aH0pYDtcbiAgICAgICAgICBpZiAodGFnLmtpbmQgIT0gbnVsbCAmJiBDVEFHU19LSU5EX05BTUVTW3RhZy5raW5kXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aXRsZSA9IENUQUdTX0tJTkRfTkFNRVNbdGFnLmtpbmRdICsgJyAnICsgdGl0bGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjcmVhdGVDYWxsYmFjayh0YWcpLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2VydmljZS5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==