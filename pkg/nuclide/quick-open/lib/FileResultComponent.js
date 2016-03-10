var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('react-for-atom');

var React = _require.React;

var _require2 = require('../../atom-helpers');

var fileTypeClass = _require2.fileTypeClass;

var path = require('path');

function renderSubsequence(seq, props) {
  return seq.length === 0 ? null : React.createElement(
    'span',
    props,
    seq
  );
}

function renderUnmatchedSubsequence(seq, key) {
  return renderSubsequence(seq, { key: key });
}

function renderMatchedSubsequence(seq, key) {
  return renderSubsequence(seq, {
    key: key,
    className: 'quick-open-file-search-match'
  });
}

var FileResultComponent = (function () {
  function FileResultComponent() {
    _classCallCheck(this, FileResultComponent);
  }

  _createClass(FileResultComponent, null, [{
    key: 'getComponentForItem',
    value: function getComponentForItem(item, serviceName, dirName) {
      // Trim the `dirName` off the `filePath` since that's shown by the group
      var filePath = item.path.startsWith(dirName) ? '.' + item.path.slice(dirName.length) : item.path;
      var matchIndexes = item.matchIndexes && item.path.startsWith(dirName) ? item.matchIndexes.map(function (i) {
        return i - (dirName.length - 1);
      }) : [];

      var streakOngoing = false;
      var start = 0;
      var pathComponents = [];
      // Split the path into highlighted and non-highlighted subsequences for optimal rendering perf.
      // Do this in O(n) where n is the number of matchIndexes (ie. less than the length of the path).
      matchIndexes.forEach(function (i, n) {
        if (matchIndexes[n + 1] === i + 1) {
          if (!streakOngoing) {
            pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, i), i));
            start = i;
            streakOngoing = true;
          }
        } else {
          if (streakOngoing) {
            pathComponents.push(renderMatchedSubsequence(filePath.slice(start, i + 1), i));
            streakOngoing = false;
          } else {
            if (i > 0) {
              pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, i), 'before' + i));
            }
            pathComponents.push(renderMatchedSubsequence(filePath.slice(i, i + 1), i));
          }
          start = i + 1;
        }
      });
      pathComponents.push(renderUnmatchedSubsequence(filePath.slice(start, filePath.length), 'last'));

      var filenameClasses = ['file', 'icon', fileTypeClass(filePath)].join(' ');
      // `data-name` is support for the "file-icons" package.
      // See: https://atom.io/packages/file-icons
      return React.createElement(
        'div',
        { className: filenameClasses, 'data-name': path.basename(filePath) },
        pathComponents
      );
    }
  }]);

  return FileResultComponent;
})();

module.exports = FileResultComponent;
//# sourceMappingURL=data:application/json;base64,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QUN6RjtBQUNELDBCQUFjLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVFO0FBQ0QsZUFBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDZjtPQUNGLENBQUMsQ0FBQztBQUNILG9CQUFjLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDOztBQUVoRyxVQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7QUFHNUUsYUFDRTs7VUFBSyxTQUFTLEVBQUUsZUFBZSxBQUFDLEVBQUMsYUFBVyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxBQUFDO1FBQ2pFLGNBQWM7T0FDWCxDQUNOO0tBQ0g7OztTQWxERyxtQkFBbUI7OztBQXFEekIsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJGaWxlUmVzdWx0Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBGaWxlUmVzdWx0LFxufSBmcm9tICcuLi8uLi9xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtmaWxlVHlwZUNsYXNzfSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxudHlwZSBLZXkgPSBudW1iZXIgfCBzdHJpbmc7XG5cbmZ1bmN0aW9uIHJlbmRlclN1YnNlcXVlbmNlKHNlcTogc3RyaW5nLCBwcm9wczogT2JqZWN0KTogP1JlYWN0RWxlbWVudCB7XG4gIHJldHVybiBzZXEubGVuZ3RoID09PSAwID8gbnVsbCA6IDxzcGFuIHsuLi5wcm9wc30+e3NlcX08L3NwYW4+O1xufVxuXG5mdW5jdGlvbiByZW5kZXJVbm1hdGNoZWRTdWJzZXF1ZW5jZShzZXE6IHN0cmluZywga2V5OiBLZXkpOiA/UmVhY3RFbGVtZW50IHtcbiAgcmV0dXJuIHJlbmRlclN1YnNlcXVlbmNlKHNlcSwge2tleX0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJNYXRjaGVkU3Vic2VxdWVuY2Uoc2VxOiBzdHJpbmcsIGtleTogS2V5KTogP1JlYWN0RWxlbWVudCB7XG4gIHJldHVybiByZW5kZXJTdWJzZXF1ZW5jZShcbiAgICBzZXEsXG4gICAge1xuICAgICAga2V5LFxuICAgICAgY2xhc3NOYW1lOiAncXVpY2stb3Blbi1maWxlLXNlYXJjaC1tYXRjaCcsXG4gICAgfVxuICApO1xufVxuXG5jbGFzcyBGaWxlUmVzdWx0Q29tcG9uZW50IHtcblxuICBzdGF0aWMgZ2V0Q29tcG9uZW50Rm9ySXRlbShcbiAgICBpdGVtOiBGaWxlUmVzdWx0LFxuICAgIHNlcnZpY2VOYW1lOiBzdHJpbmcsXG4gICAgZGlyTmFtZTogc3RyaW5nXG4gICk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVHJpbSB0aGUgYGRpck5hbWVgIG9mZiB0aGUgYGZpbGVQYXRoYCBzaW5jZSB0aGF0J3Mgc2hvd24gYnkgdGhlIGdyb3VwXG4gICAgY29uc3QgZmlsZVBhdGggPSBpdGVtLnBhdGguc3RhcnRzV2l0aChkaXJOYW1lKVxuICAgICAgPyAnLicgKyBpdGVtLnBhdGguc2xpY2UoZGlyTmFtZS5sZW5ndGgpXG4gICAgICA6IGl0ZW0ucGF0aDtcbiAgICBjb25zdCBtYXRjaEluZGV4ZXMgPSBpdGVtLm1hdGNoSW5kZXhlcyAmJiBpdGVtLnBhdGguc3RhcnRzV2l0aChkaXJOYW1lKVxuICAgICAgPyBpdGVtLm1hdGNoSW5kZXhlcy5tYXAoaSA9PiBpIC0gKGRpck5hbWUubGVuZ3RoIC0gMSkpXG4gICAgICA6IFtdO1xuXG4gICAgbGV0IHN0cmVha09uZ29pbmcgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnQgPSAwO1xuICAgIGNvbnN0IHBhdGhDb21wb25lbnRzID0gW107XG4gICAgLy8gU3BsaXQgdGhlIHBhdGggaW50byBoaWdobGlnaHRlZCBhbmQgbm9uLWhpZ2hsaWdodGVkIHN1YnNlcXVlbmNlcyBmb3Igb3B0aW1hbCByZW5kZXJpbmcgcGVyZi5cbiAgICAvLyBEbyB0aGlzIGluIE8obikgd2hlcmUgbiBpcyB0aGUgbnVtYmVyIG9mIG1hdGNoSW5kZXhlcyAoaWUuIGxlc3MgdGhhbiB0aGUgbGVuZ3RoIG9mIHRoZSBwYXRoKS5cbiAgICBtYXRjaEluZGV4ZXMuZm9yRWFjaCgoaSwgbikgPT4ge1xuICAgICAgaWYgKG1hdGNoSW5kZXhlc1tuICsgMV0gPT09IGkgKyAxKSB7XG4gICAgICAgIGlmICghc3RyZWFrT25nb2luZykge1xuICAgICAgICAgIHBhdGhDb21wb25lbnRzLnB1c2gocmVuZGVyVW5tYXRjaGVkU3Vic2VxdWVuY2UoZmlsZVBhdGguc2xpY2Uoc3RhcnQsIGkpLCBpKSk7XG4gICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgIHN0cmVha09uZ29pbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3RyZWFrT25nb2luZykge1xuICAgICAgICAgIHBhdGhDb21wb25lbnRzLnB1c2gocmVuZGVyTWF0Y2hlZFN1YnNlcXVlbmNlKGZpbGVQYXRoLnNsaWNlKHN0YXJ0LCBpICsgMSksIGkpKTtcbiAgICAgICAgICBzdHJlYWtPbmdvaW5nID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBwYXRoQ29tcG9uZW50cy5wdXNoKHJlbmRlclVubWF0Y2hlZFN1YnNlcXVlbmNlKGZpbGVQYXRoLnNsaWNlKHN0YXJ0LCBpKSwgYGJlZm9yZSR7aX1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhdGhDb21wb25lbnRzLnB1c2gocmVuZGVyTWF0Y2hlZFN1YnNlcXVlbmNlKGZpbGVQYXRoLnNsaWNlKGksIGkgKyAxKSwgaSkpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGF0aENvbXBvbmVudHMucHVzaChyZW5kZXJVbm1hdGNoZWRTdWJzZXF1ZW5jZShmaWxlUGF0aC5zbGljZShzdGFydCwgZmlsZVBhdGgubGVuZ3RoKSwgJ2xhc3QnKSk7XG5cbiAgICBjb25zdCBmaWxlbmFtZUNsYXNzZXMgPSBbJ2ZpbGUnLCAnaWNvbicsIGZpbGVUeXBlQ2xhc3MoZmlsZVBhdGgpXS5qb2luKCcgJyk7XG4gICAgLy8gYGRhdGEtbmFtZWAgaXMgc3VwcG9ydCBmb3IgdGhlIFwiZmlsZS1pY29uc1wiIHBhY2thZ2UuXG4gICAgLy8gU2VlOiBodHRwczovL2F0b20uaW8vcGFja2FnZXMvZmlsZS1pY29uc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17ZmlsZW5hbWVDbGFzc2VzfSBkYXRhLW5hbWU9e3BhdGguYmFzZW5hbWUoZmlsZVBhdGgpfT5cbiAgICAgICAge3BhdGhDb21wb25lbnRzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVSZXN1bHRDb21wb25lbnQ7XG4iXX0=