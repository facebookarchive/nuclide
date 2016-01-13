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

      var tags = yield service.findTags(text, { limit: LIMIT });
      if (!tags.length) {
        return null;
      }

      if (tags.length === 1) {
        return { range: range, callback: createCallback(tags[0]) };
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
      };
    })
  }]);

  return HyperclickProvider;
})();

exports.HyperclickProvider = HyperclickProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBYzJCLG9CQUFvQjs7Z0NBQ1YseUJBQXlCOzt5QkFDOUIsa0JBQWtCOztxQkFDRSxTQUFTOztBQUU3RCxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7Ozs7OztBQU1sQixTQUFTLGNBQWMsQ0FBQyxHQUFnQixFQUFFO0FBQ3hDLDJCQUFPLGFBQVk7QUFDakIsUUFBTSxVQUFVLEdBQUcsTUFBTSxnQ0FBb0IsR0FBRyxDQUFDLENBQUM7QUFDbEQsbUNBQWEsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDdkMsRUFBQztDQUNIOztBQUVELFNBQVMsa0JBQWtCLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBVTtBQUN4RCxNQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixTQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDcEQsS0FBQyxFQUFFLENBQUM7R0FDTDtBQUNELFNBQU8sQ0FBQyxDQUFDO0NBQ1Y7O0lBRVksa0JBQWtCO1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzs7ZUFBbEIsa0JBQWtCOzs2QkFFSCxXQUN4QixVQUEyQixFQUMzQixJQUFZLEVBQ1osS0FBaUIsRUFDZTtBQUNoQyxVQUFNLElBQUksR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsVUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxPQUFPLEdBQUksTUFBTSw4Q0FBdUIsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUNoRSxlQUFlLENBQUMsSUFBSSxDQUFDLEFBQWdCLENBQUM7QUFDekMsVUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0FBQzFELFVBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2hCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNyQixlQUFPLEVBQUMsS0FBSyxFQUFMLEtBQUssRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7T0FDbkQ7OztBQUdELFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFTLEVBQUUsS0FBUyxFQUFLO1lBQWxCLENBQUMsR0FBUixJQUFTLENBQVIsSUFBSTtZQUFhLENBQUMsR0FBUixLQUFTLENBQVIsSUFBSTs7QUFDekIsWUFBTSxHQUFHLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0RSxZQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7QUFDYixpQkFBTyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNCO0FBQ0QsZUFBTyxHQUFHLENBQUM7T0FDWixDQUFDLENBQUM7O0FBRUgsVUFBTSxPQUFPLEdBQUcseUJBQVEsTUFBTSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3JELGFBQU87QUFDTCxhQUFLLEVBQUwsS0FBSztBQUNMLGdCQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUN4QixjQUFNLE9BQU8sR0FBRyx5QkFBUyxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVDLGNBQUksS0FBSyxHQUFNLEdBQUcsQ0FBQyxJQUFJLFVBQUssT0FBTyxNQUFHLENBQUM7QUFDdkMsY0FBSSxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSx3QkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRTtBQUMxRCxpQkFBSyxHQUFHLHdCQUFpQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztXQUNsRDtBQUNELGlCQUFPO0FBQ0wsaUJBQUssRUFBTCxLQUFLO0FBQ0wsb0JBQVEsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDO1dBQzlCLENBQUM7U0FDSCxDQUFDO09BQ0gsQ0FBQztLQUNIOzs7U0FuRFUsa0JBQWtCIiwiZmlsZSI6Ikh5cGVyY2xpY2tQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrU3VnZ2VzdGlvbn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtDdGFnc1Jlc3VsdCwgQ3RhZ3NTZXJ2aWNlfSBmcm9tICcuLi8uLi9yZW1vdGUtY3RhZ3MtYmFzZSc7XG5cbmltcG9ydCB7Z29Ub0xvY2F0aW9ufSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2Rpcm5hbWUsIHJlbGF0aXZlfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7Q1RBR1NfS0lORF9OQU1FUywgZ2V0TGluZU51bWJlckZvclRhZ30gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IExJTUlUID0gMTAwO1xuXG4vKipcbiAqIElmIGEgbGluZSBudW1iZXIgaXMgc3BlY2lmaWVkIGJ5IHRoZSB0YWcsIGp1bXAgdG8gdGhhdCBsaW5lLlxuICogT3RoZXJ3aXNlLCB3ZSdsbCBoYXZlIHRvIGxvb2sgdXAgdGhlIHBhdHRlcm4gaW4gdGhlIGZpbGUuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrKHRhZzogQ3RhZ3NSZXN1bHQpIHtcbiAgcmV0dXJuIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBsaW5lTnVtYmVyID0gYXdhaXQgZ2V0TGluZU51bWJlckZvclRhZyh0YWcpO1xuICAgIGdvVG9Mb2NhdGlvbih0YWcuZmlsZSwgbGluZU51bWJlciwgMCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbW1vblByZWZpeExlbmd0aChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBhLmxlbmd0aCAmJiBpIDwgYi5sZW5ndGggJiYgYVtpXSA9PT0gYltpXSkge1xuICAgIGkrKztcbiAgfVxuICByZXR1cm4gaTtcbn1cblxuZXhwb3J0IGNsYXNzIEh5cGVyY2xpY2tQcm92aWRlciB7XG5cbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbkZvcldvcmQoXG4gICAgdGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICByYW5nZTogYXRvbSRSYW5nZSxcbiAgKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmljZSA9IChhd2FpdCBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdDdGFnc1NlcnZpY2UnLCBwYXRoKVxuICAgICAgLmdldEN0YWdzU2VydmljZShwYXRoKTogP0N0YWdzU2VydmljZSk7XG4gICAgaWYgKHNlcnZpY2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdGFncyA9IGF3YWl0IHNlcnZpY2UuZmluZFRhZ3ModGV4dCwge2xpbWl0OiBMSU1JVH0pO1xuICAgIGlmICghdGFncy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHtyYW5nZSwgY2FsbGJhY2s6IGNyZWF0ZUNhbGxiYWNrKHRhZ3NbMF0pfTtcbiAgICB9XG5cbiAgICAvLyBGYXZvciB0YWdzIGluIHRoZSBuZWFyZXN0IGRpcmVjdG9yeSBieSBzb3J0aW5nIGJ5IGNvbW1vbiBwcmVmaXggbGVuZ3RoLlxuICAgIHRhZ3Muc29ydCgoe2ZpbGU6IGF9LCB7ZmlsZTogYn0pID0+IHtcbiAgICAgIGNvbnN0IGxlbiA9IGNvbW1vblByZWZpeExlbmd0aChwYXRoLCBiKSAtIGNvbW1vblByZWZpeExlbmd0aChwYXRoLCBhKTtcbiAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGEubG9jYWxlQ29tcGFyZShiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZW47XG4gICAgfSk7XG5cbiAgICBjb25zdCB0YWdzRGlyID0gZGlybmFtZShhd2FpdCBzZXJ2aWNlLmdldFRhZ3NQYXRoKCkpO1xuICAgIHJldHVybiB7XG4gICAgICByYW5nZSxcbiAgICAgIGNhbGxiYWNrOiB0YWdzLm1hcCh0YWcgPT4ge1xuICAgICAgICBjb25zdCByZWxwYXRoID0gcmVsYXRpdmUodGFnc0RpciwgdGFnLmZpbGUpO1xuICAgICAgICBsZXQgdGl0bGUgPSBgJHt0YWcubmFtZX0gKCR7cmVscGF0aH0pYDtcbiAgICAgICAgaWYgKHRhZy5raW5kICE9IG51bGwgJiYgQ1RBR1NfS0lORF9OQU1FU1t0YWcua2luZF0gIT0gbnVsbCkge1xuICAgICAgICAgIHRpdGxlID0gQ1RBR1NfS0lORF9OQU1FU1t0YWcua2luZF0gKyAnICcgKyB0aXRsZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgIGNhbGxiYWNrOiBjcmVhdGVDYWxsYmFjayh0YWcpLFxuICAgICAgICB9O1xuICAgICAgfSksXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=