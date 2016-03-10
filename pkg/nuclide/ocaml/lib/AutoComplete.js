var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');

var _require = require('../../client');

var getServiceByNuclideUri = _require.getServiceByNuclideUri;

module.exports = {
  getAutocompleteSuggestions: _asyncToGenerator(function* (request) {
    var editor = request.editor;
    var prefix = request.prefix;

    // OCaml.Pervasives has a lot of stuff that gets shown on every keystroke without this.
    if (prefix.trim().length === 0) {
      return [];
    }

    var path = editor.getPath();
    var ocamlmerlin = getServiceByNuclideUri('MerlinService', path);
    invariant(ocamlmerlin);
    var text = editor.getText();

    var _editor$getCursorBufferPosition$toArray = editor.getCursorBufferPosition().toArray();

    var _editor$getCursorBufferPosition$toArray2 = _slicedToArray(_editor$getCursorBufferPosition$toArray, 2);

    var line = _editor$getCursorBufferPosition$toArray2[0];
    var col = _editor$getCursorBufferPosition$toArray2[1];

    // The default prefix at something like `Printf.[cursor]` is just the dot. Compute
    // `linePrefix` so that ocamlmerlin gets more context. Compute `replacementPrefix`
    // to make sure that the existing dot doesn't get clobbered when autocompleting.
    var linePrefix = editor.lineTextForBufferRow(line).substring(0, col);
    if (linePrefix.length > 0) {
      linePrefix = linePrefix.split(/([ \t\[\](){}<>,+*\/-])/).slice(-1)[0];
    }
    var replacementPrefix = prefix;
    if (replacementPrefix.startsWith('.')) {
      replacementPrefix = replacementPrefix.substring(1);
    }

    yield ocamlmerlin.pushNewBuffer(path, text);
    var output = yield ocamlmerlin.complete(path, line, col, linePrefix);
    if (!output) {
      return null;
    }
    return output.entries.map(function (item) {
      return {
        text: item.name,
        rightLabel: item.desc === '' ? '(module)' : item.desc,
        replacementPrefix: replacementPrefix
      };
    });
  })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9Db21wbGV0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O2VBQ0gsT0FBTyxDQUFDLGNBQWMsQ0FBQzs7SUFBakQsc0JBQXNCLFlBQXRCLHNCQUFzQjs7QUFFN0IsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLEFBQU0sNEJBQTBCLG9CQUFBLFdBQzlCLE9BS0MsRUFDdUQ7UUFFakQsTUFBTSxHQUFZLE9BQU8sQ0FBekIsTUFBTTtRQUFFLE1BQU0sR0FBSSxPQUFPLENBQWpCLE1BQU07OztBQUdyQixRQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzlCLGFBQU8sRUFBRSxDQUFDO0tBQ1g7O0FBRUQsUUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFFBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRSxhQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkIsUUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDOztrREFDVixNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxPQUFPLEVBQUU7Ozs7UUFBdkQsSUFBSTtRQUFFLEdBQUc7Ozs7O0FBS2hCLFFBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JFLFFBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekIsZ0JBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkU7QUFDRCxRQUFJLGlCQUFpQixHQUFHLE1BQU0sQ0FBQztBQUMvQixRQUFJLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNyQyx1QkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEQ7O0FBRUQsVUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QyxRQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkUsUUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLGFBQU8sSUFBSSxDQUFDO0tBQ2I7QUFDRCxXQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ2hDLGFBQU87QUFDTCxZQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDZixrQkFBVSxFQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxBQUFDO0FBQ3ZELHlCQUFpQixFQUFFLGlCQUFpQjtPQUNyQyxDQUFDO0tBQ0gsQ0FBQyxDQUFDO0dBQ0osQ0FBQTtDQUNGLENBQUMiLCJmaWxlIjoiQXV0b0NvbXBsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5jb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9jbGllbnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jIGdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zKFxuICAgIHJlcXVlc3Q6IHtcbiAgICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yO1xuICAgICAgYnVmZmVyUG9zaXRpb246IGF0b20kUG9pbnQ7XG4gICAgICBzY29wZURlc2NyaXB0b3I6IGFueTtcbiAgICAgIHByZWZpeDogc3RyaW5nO1xuICAgIH1cbiAgKTogUHJvbWlzZTw/QXJyYXk8e3NuaXBwZXQ6IHN0cmluZzsgcmlnaHRMYWJlbDogc3RyaW5nfT4+IHtcblxuICAgIGNvbnN0IHtlZGl0b3IsIHByZWZpeH0gPSByZXF1ZXN0O1xuXG4gICAgLy8gT0NhbWwuUGVydmFzaXZlcyBoYXMgYSBsb3Qgb2Ygc3R1ZmYgdGhhdCBnZXRzIHNob3duIG9uIGV2ZXJ5IGtleXN0cm9rZSB3aXRob3V0IHRoaXMuXG4gICAgaWYgKHByZWZpeC50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgY29uc3Qgb2NhbWxtZXJsaW4gPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdNZXJsaW5TZXJ2aWNlJywgcGF0aCk7XG4gICAgaW52YXJpYW50KG9jYW1sbWVybGluKTtcbiAgICBjb25zdCB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKTtcbiAgICBjb25zdCBbbGluZSwgY29sXSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnRvQXJyYXkoKTtcblxuICAgIC8vIFRoZSBkZWZhdWx0IHByZWZpeCBhdCBzb21ldGhpbmcgbGlrZSBgUHJpbnRmLltjdXJzb3JdYCBpcyBqdXN0IHRoZSBkb3QuIENvbXB1dGVcbiAgICAvLyBgbGluZVByZWZpeGAgc28gdGhhdCBvY2FtbG1lcmxpbiBnZXRzIG1vcmUgY29udGV4dC4gQ29tcHV0ZSBgcmVwbGFjZW1lbnRQcmVmaXhgXG4gICAgLy8gdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGV4aXN0aW5nIGRvdCBkb2Vzbid0IGdldCBjbG9iYmVyZWQgd2hlbiBhdXRvY29tcGxldGluZy5cbiAgICBsZXQgbGluZVByZWZpeCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhsaW5lKS5zdWJzdHJpbmcoMCwgY29sKTtcbiAgICBpZiAobGluZVByZWZpeC5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lUHJlZml4ID0gbGluZVByZWZpeC5zcGxpdCgvKFsgXFx0XFxbXFxdKCl7fTw+LCsqXFwvLV0pLykuc2xpY2UoLTEpWzBdO1xuICAgIH1cbiAgICBsZXQgcmVwbGFjZW1lbnRQcmVmaXggPSBwcmVmaXg7XG4gICAgaWYgKHJlcGxhY2VtZW50UHJlZml4LnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgcmVwbGFjZW1lbnRQcmVmaXggPSByZXBsYWNlbWVudFByZWZpeC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgYXdhaXQgb2NhbWxtZXJsaW4ucHVzaE5ld0J1ZmZlcihwYXRoLCB0ZXh0KTtcbiAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCBvY2FtbG1lcmxpbi5jb21wbGV0ZShwYXRoLCBsaW5lLCBjb2wsIGxpbmVQcmVmaXgpO1xuICAgIGlmICghb3V0cHV0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dC5lbnRyaWVzLm1hcChpdGVtID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHQ6IGl0ZW0ubmFtZSxcbiAgICAgICAgcmlnaHRMYWJlbDogKGl0ZW0uZGVzYyA9PT0gJycgPyAnKG1vZHVsZSknIDogaXRlbS5kZXNjKSxcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHJlcGxhY2VtZW50UHJlZml4LFxuICAgICAgfTtcbiAgICB9KTtcbiAgfSxcbn07XG4iXX0=