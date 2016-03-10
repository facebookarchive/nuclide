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
      var filePath = item.path;
      var matchIndexes = item.matchIndexes || [];
      if (filePath.startsWith(dirName)) {
        filePath = '.' + filePath.slice(dirName.length);
        matchIndexes = matchIndexes.map(function (i) {
          return i - (dirName.length - 1);
        });
      }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVSZXN1bHRDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2VBZWdCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O2dCQUNZLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7SUFBOUMsYUFBYSxhQUFiLGFBQWE7O0FBQ3BCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFJN0IsU0FBUyxpQkFBaUIsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFpQjtBQUNwRSxTQUFPLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksR0FBRzs7SUFBVSxLQUFLO0lBQUcsR0FBRztHQUFRLENBQUM7Q0FDaEU7O0FBRUQsU0FBUywwQkFBMEIsQ0FBQyxHQUFXLEVBQUUsR0FBUSxFQUFpQjtBQUN4RSxTQUFPLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxFQUFDLEdBQUcsRUFBSCxHQUFHLEVBQUMsQ0FBQyxDQUFDO0NBQ3RDOztBQUVELFNBQVMsd0JBQXdCLENBQUMsR0FBVyxFQUFFLEdBQVEsRUFBaUI7QUFDdEUsU0FBTyxpQkFBaUIsQ0FDdEIsR0FBRyxFQUNIO0FBQ0UsT0FBRyxFQUFILEdBQUc7QUFDSCxhQUFTLEVBQUUsOEJBQThCO0dBQzFDLENBQ0YsQ0FBQztDQUNIOztJQUVLLG1CQUFtQjtXQUFuQixtQkFBbUI7MEJBQW5CLG1CQUFtQjs7O2VBQW5CLG1CQUFtQjs7V0FFRyw2QkFDeEIsSUFBZ0IsRUFDaEIsV0FBbUIsRUFDbkIsT0FBZSxFQUNEOztBQUVkLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDekIsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7QUFDM0MsVUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ2hDLGdCQUFRLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELG9CQUFZLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7aUJBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBLEFBQUM7U0FBQSxDQUFDLENBQUM7T0FDaEU7O0FBRUQsVUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFVBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNkLFVBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQzs7O0FBRzFCLGtCQUFZLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM3QixZQUFJLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNqQyxjQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLDBCQUFjLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0UsaUJBQUssR0FBRyxDQUFDLENBQUM7QUFDVix5QkFBYSxHQUFHLElBQUksQ0FBQztXQUN0QjtTQUNGLE1BQU07QUFDTCxjQUFJLGFBQWEsRUFBRTtBQUNqQiwwQkFBYyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRSx5QkFBYSxHQUFHLEtBQUssQ0FBQztXQUN2QixNQUFNO0FBQ0wsZ0JBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNULDRCQUFjLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxhQUFXLENBQUMsQ0FBRyxDQUFDLENBQUM7YUFDekY7QUFDRCwwQkFBYyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUM1RTtBQUNELGVBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2Y7T0FDRixDQUFDLENBQUM7QUFDSCxvQkFBYyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzs7QUFFaEcsVUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0FBRzVFLGFBQ0U7O1VBQUssU0FBUyxFQUFFLGVBQWUsQUFBQyxFQUFDLGFBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQUFBQztRQUNqRSxjQUFjO09BQ1gsQ0FDTjtLQUNIOzs7U0FsREcsbUJBQW1COzs7QUFxRHpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMiLCJmaWxlIjoiRmlsZVJlc3VsdENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZVJlc3VsdCxcbn0gZnJvbSAnLi4vLi4vcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7ZmlsZVR5cGVDbGFzc30gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbnR5cGUgS2V5ID0gbnVtYmVyIHwgc3RyaW5nO1xuXG5mdW5jdGlvbiByZW5kZXJTdWJzZXF1ZW5jZShzZXE6IHN0cmluZywgcHJvcHM6IE9iamVjdCk6ID9SZWFjdEVsZW1lbnQge1xuICByZXR1cm4gc2VxLmxlbmd0aCA9PT0gMCA/IG51bGwgOiA8c3BhbiB7Li4ucHJvcHN9PntzZXF9PC9zcGFuPjtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVW5tYXRjaGVkU3Vic2VxdWVuY2Uoc2VxOiBzdHJpbmcsIGtleTogS2V5KTogP1JlYWN0RWxlbWVudCB7XG4gIHJldHVybiByZW5kZXJTdWJzZXF1ZW5jZShzZXEsIHtrZXl9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWF0Y2hlZFN1YnNlcXVlbmNlKHNlcTogc3RyaW5nLCBrZXk6IEtleSk6ID9SZWFjdEVsZW1lbnQge1xuICByZXR1cm4gcmVuZGVyU3Vic2VxdWVuY2UoXG4gICAgc2VxLFxuICAgIHtcbiAgICAgIGtleSxcbiAgICAgIGNsYXNzTmFtZTogJ3F1aWNrLW9wZW4tZmlsZS1zZWFyY2gtbWF0Y2gnLFxuICAgIH1cbiAgKTtcbn1cblxuY2xhc3MgRmlsZVJlc3VsdENvbXBvbmVudCB7XG5cbiAgc3RhdGljIGdldENvbXBvbmVudEZvckl0ZW0oXG4gICAgaXRlbTogRmlsZVJlc3VsdCxcbiAgICBzZXJ2aWNlTmFtZTogc3RyaW5nLFxuICAgIGRpck5hbWU6IHN0cmluZ1xuICApOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFRyaW0gdGhlIGBkaXJOYW1lYCBvZmYgdGhlIGBmaWxlUGF0aGAgc2luY2UgdGhhdCdzIHNob3duIGJ5IHRoZSBncm91cFxuICAgIGxldCBmaWxlUGF0aCA9IGl0ZW0ucGF0aDtcbiAgICBsZXQgbWF0Y2hJbmRleGVzID0gaXRlbS5tYXRjaEluZGV4ZXMgfHwgW107XG4gICAgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgoZGlyTmFtZSkpIHtcbiAgICAgIGZpbGVQYXRoID0gJy4nICsgZmlsZVBhdGguc2xpY2UoZGlyTmFtZS5sZW5ndGgpO1xuICAgICAgbWF0Y2hJbmRleGVzID0gbWF0Y2hJbmRleGVzLm1hcChpID0+IGkgLSAoZGlyTmFtZS5sZW5ndGggLSAxKSk7XG4gICAgfVxuXG4gICAgbGV0IHN0cmVha09uZ29pbmcgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnQgPSAwO1xuICAgIGNvbnN0IHBhdGhDb21wb25lbnRzID0gW107XG4gICAgLy8gU3BsaXQgdGhlIHBhdGggaW50byBoaWdobGlnaHRlZCBhbmQgbm9uLWhpZ2hsaWdodGVkIHN1YnNlcXVlbmNlcyBmb3Igb3B0aW1hbCByZW5kZXJpbmcgcGVyZi5cbiAgICAvLyBEbyB0aGlzIGluIE8obikgd2hlcmUgbiBpcyB0aGUgbnVtYmVyIG9mIG1hdGNoSW5kZXhlcyAoaWUuIGxlc3MgdGhhbiB0aGUgbGVuZ3RoIG9mIHRoZSBwYXRoKS5cbiAgICBtYXRjaEluZGV4ZXMuZm9yRWFjaCgoaSwgbikgPT4ge1xuICAgICAgaWYgKG1hdGNoSW5kZXhlc1tuICsgMV0gPT09IGkgKyAxKSB7XG4gICAgICAgIGlmICghc3RyZWFrT25nb2luZykge1xuICAgICAgICAgIHBhdGhDb21wb25lbnRzLnB1c2gocmVuZGVyVW5tYXRjaGVkU3Vic2VxdWVuY2UoZmlsZVBhdGguc2xpY2Uoc3RhcnQsIGkpLCBpKSk7XG4gICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgIHN0cmVha09uZ29pbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3RyZWFrT25nb2luZykge1xuICAgICAgICAgIHBhdGhDb21wb25lbnRzLnB1c2gocmVuZGVyTWF0Y2hlZFN1YnNlcXVlbmNlKGZpbGVQYXRoLnNsaWNlKHN0YXJ0LCBpICsgMSksIGkpKTtcbiAgICAgICAgICBzdHJlYWtPbmdvaW5nID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBwYXRoQ29tcG9uZW50cy5wdXNoKHJlbmRlclVubWF0Y2hlZFN1YnNlcXVlbmNlKGZpbGVQYXRoLnNsaWNlKHN0YXJ0LCBpKSwgYGJlZm9yZSR7aX1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhdGhDb21wb25lbnRzLnB1c2gocmVuZGVyTWF0Y2hlZFN1YnNlcXVlbmNlKGZpbGVQYXRoLnNsaWNlKGksIGkgKyAxKSwgaSkpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGF0aENvbXBvbmVudHMucHVzaChyZW5kZXJVbm1hdGNoZWRTdWJzZXF1ZW5jZShmaWxlUGF0aC5zbGljZShzdGFydCwgZmlsZVBhdGgubGVuZ3RoKSwgJ2xhc3QnKSk7XG5cbiAgICBjb25zdCBmaWxlbmFtZUNsYXNzZXMgPSBbJ2ZpbGUnLCAnaWNvbicsIGZpbGVUeXBlQ2xhc3MoZmlsZVBhdGgpXS5qb2luKCcgJyk7XG4gICAgLy8gYGRhdGEtbmFtZWAgaXMgc3VwcG9ydCBmb3IgdGhlIFwiZmlsZS1pY29uc1wiIHBhY2thZ2UuXG4gICAgLy8gU2VlOiBodHRwczovL2F0b20uaW8vcGFja2FnZXMvZmlsZS1pY29uc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17ZmlsZW5hbWVDbGFzc2VzfSBkYXRhLW5hbWU9e3BhdGguYmFzZW5hbWUoZmlsZVBhdGgpfT5cbiAgICAgICAge3BhdGhDb21wb25lbnRzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVSZXN1bHRDb21wb25lbnQ7XG4iXX0=