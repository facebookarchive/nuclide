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

var _require = require('../../nuclide-client');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9Db21wbGV0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O2VBQ0gsT0FBTyxDQUFDLHNCQUFzQixDQUFDOztJQUF6RCxzQkFBc0IsWUFBdEIsc0JBQXNCOztBQUU3QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsQUFBTSw0QkFBMEIsb0JBQUEsV0FDOUIsT0FLQyxFQUN1RDtRQUVqRCxNQUFNLEdBQVksT0FBTyxDQUF6QixNQUFNO1FBQUUsTUFBTSxHQUFJLE9BQU8sQ0FBakIsTUFBTTs7O0FBR3JCLFFBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDOUIsYUFBTyxFQUFFLENBQUM7S0FDWDs7QUFFRCxRQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsUUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xFLGFBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN2QixRQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O2tEQUNWLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLE9BQU8sRUFBRTs7OztRQUF2RCxJQUFJO1FBQUUsR0FBRzs7Ozs7QUFLaEIsUUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckUsUUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN6QixnQkFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2RTtBQUNELFFBQUksaUJBQWlCLEdBQUcsTUFBTSxDQUFDO0FBQy9CLFFBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3JDLHVCQUFpQixHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNwRDs7QUFFRCxVQUFNLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVDLFFBQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RSxRQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFdBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDaEMsYUFBTztBQUNMLFlBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLGtCQUFVLEVBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLEFBQUM7QUFDdkQseUJBQWlCLEVBQUUsaUJBQWlCO09BQ3JDLENBQUM7S0FDSCxDQUFDLENBQUM7R0FDSixDQUFBO0NBQ0YsQ0FBQyIsImZpbGUiOiJBdXRvQ29tcGxldGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbmNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY2xpZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3luYyBnZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucyhcbiAgICByZXF1ZXN0OiB7XG4gICAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcjtcbiAgICAgIGJ1ZmZlclBvc2l0aW9uOiBhdG9tJFBvaW50O1xuICAgICAgc2NvcGVEZXNjcmlwdG9yOiBhbnk7XG4gICAgICBwcmVmaXg6IHN0cmluZztcbiAgICB9XG4gICk6IFByb21pc2U8P0FycmF5PHtzbmlwcGV0OiBzdHJpbmc7IHJpZ2h0TGFiZWw6IHN0cmluZ30+PiB7XG5cbiAgICBjb25zdCB7ZWRpdG9yLCBwcmVmaXh9ID0gcmVxdWVzdDtcblxuICAgIC8vIE9DYW1sLlBlcnZhc2l2ZXMgaGFzIGEgbG90IG9mIHN0dWZmIHRoYXQgZ2V0cyBzaG93biBvbiBldmVyeSBrZXlzdHJva2Ugd2l0aG91dCB0aGlzLlxuICAgIGlmIChwcmVmaXgudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IG9jYW1sbWVybGluID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTWVybGluU2VydmljZScsIHBhdGgpO1xuICAgIGludmFyaWFudChvY2FtbG1lcmxpbik7XG4gICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgY29uc3QgW2xpbmUsIGNvbF0gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS50b0FycmF5KCk7XG5cbiAgICAvLyBUaGUgZGVmYXVsdCBwcmVmaXggYXQgc29tZXRoaW5nIGxpa2UgYFByaW50Zi5bY3Vyc29yXWAgaXMganVzdCB0aGUgZG90LiBDb21wdXRlXG4gICAgLy8gYGxpbmVQcmVmaXhgIHNvIHRoYXQgb2NhbWxtZXJsaW4gZ2V0cyBtb3JlIGNvbnRleHQuIENvbXB1dGUgYHJlcGxhY2VtZW50UHJlZml4YFxuICAgIC8vIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBleGlzdGluZyBkb3QgZG9lc24ndCBnZXQgY2xvYmJlcmVkIHdoZW4gYXV0b2NvbXBsZXRpbmcuXG4gICAgbGV0IGxpbmVQcmVmaXggPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cobGluZSkuc3Vic3RyaW5nKDAsIGNvbCk7XG4gICAgaWYgKGxpbmVQcmVmaXgubGVuZ3RoID4gMCkge1xuICAgICAgbGluZVByZWZpeCA9IGxpbmVQcmVmaXguc3BsaXQoLyhbIFxcdFxcW1xcXSgpe308PiwrKlxcLy1dKS8pLnNsaWNlKC0xKVswXTtcbiAgICB9XG4gICAgbGV0IHJlcGxhY2VtZW50UHJlZml4ID0gcHJlZml4O1xuICAgIGlmIChyZXBsYWNlbWVudFByZWZpeC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgIHJlcGxhY2VtZW50UHJlZml4ID0gcmVwbGFjZW1lbnRQcmVmaXguc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIGF3YWl0IG9jYW1sbWVybGluLnB1c2hOZXdCdWZmZXIocGF0aCwgdGV4dCk7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgb2NhbWxtZXJsaW4uY29tcGxldGUocGF0aCwgbGluZSwgY29sLCBsaW5lUHJlZml4KTtcbiAgICBpZiAoIW91dHB1dCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQuZW50cmllcy5tYXAoaXRlbSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXh0OiBpdGVtLm5hbWUsXG4gICAgICAgIHJpZ2h0TGFiZWw6IChpdGVtLmRlc2MgPT09ICcnID8gJyhtb2R1bGUpJyA6IGl0ZW0uZGVzYyksXG4gICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiByZXBsYWNlbWVudFByZWZpeCxcbiAgICAgIH07XG4gICAgfSk7XG4gIH0sXG59O1xuIl19