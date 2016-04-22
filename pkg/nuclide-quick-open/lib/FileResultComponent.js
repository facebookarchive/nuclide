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

var _require2 = require('../../nuclide-atom-helpers');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVSZXN1bHRDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2VBZWdCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O2dCQUNZLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQzs7SUFBdEQsYUFBYSxhQUFiLGFBQWE7O0FBQ3BCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFJN0IsU0FBUyxpQkFBaUIsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFrQjtBQUNyRSxTQUFPLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksR0FBRzs7SUFBVSxLQUFLO0lBQUcsR0FBRztHQUFRLENBQUM7Q0FDaEU7O0FBRUQsU0FBUywwQkFBMEIsQ0FBQyxHQUFXLEVBQUUsR0FBUSxFQUFrQjtBQUN6RSxTQUFPLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxFQUFDLEdBQUcsRUFBSCxHQUFHLEVBQUMsQ0FBQyxDQUFDO0NBQ3RDOztBQUVELFNBQVMsd0JBQXdCLENBQUMsR0FBVyxFQUFFLEdBQVEsRUFBa0I7QUFDdkUsU0FBTyxpQkFBaUIsQ0FDdEIsR0FBRyxFQUNIO0FBQ0UsT0FBRyxFQUFILEdBQUc7QUFDSCxhQUFTLEVBQUUsOEJBQThCO0dBQzFDLENBQ0YsQ0FBQztDQUNIOztJQUVLLG1CQUFtQjtXQUFuQixtQkFBbUI7MEJBQW5CLG1CQUFtQjs7O2VBQW5CLG1CQUFtQjs7V0FFRyw2QkFDeEIsSUFBZ0IsRUFDaEIsV0FBbUIsRUFDbkIsT0FBZSxFQUNBOztBQUVmLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDekIsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7QUFDM0MsVUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ2hDLGdCQUFRLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELG9CQUFZLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7aUJBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBLEFBQUM7U0FBQSxDQUFDLENBQUM7T0FDaEU7O0FBRUQsVUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFVBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNkLFVBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQzs7O0FBRzFCLGtCQUFZLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM3QixZQUFJLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNqQyxjQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLDBCQUFjLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0UsaUJBQUssR0FBRyxDQUFDLENBQUM7QUFDVix5QkFBYSxHQUFHLElBQUksQ0FBQztXQUN0QjtTQUNGLE1BQU07QUFDTCxjQUFJLGFBQWEsRUFBRTtBQUNqQiwwQkFBYyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRSx5QkFBYSxHQUFHLEtBQUssQ0FBQztXQUN2QixNQUFNO0FBQ0wsZ0JBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNULDRCQUFjLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxhQUFXLENBQUMsQ0FBRyxDQUFDLENBQUM7YUFDekY7QUFDRCwwQkFBYyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUM1RTtBQUNELGVBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2Y7T0FDRixDQUFDLENBQUM7QUFDSCxvQkFBYyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzs7QUFFaEcsVUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0FBRzVFLGFBQ0U7O1VBQUssU0FBUyxFQUFFLGVBQWUsQUFBQyxFQUFDLGFBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQUFBQztRQUNqRSxjQUFjO09BQ1gsQ0FDTjtLQUNIOzs7U0FsREcsbUJBQW1COzs7QUFxRHpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMiLCJmaWxlIjoiRmlsZVJlc3VsdENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZVJlc3VsdCxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtmaWxlVHlwZUNsYXNzfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG50eXBlIEtleSA9IG51bWJlciB8IHN0cmluZztcblxuZnVuY3Rpb24gcmVuZGVyU3Vic2VxdWVuY2Uoc2VxOiBzdHJpbmcsIHByb3BzOiBPYmplY3QpOiA/UmVhY3QuRWxlbWVudCB7XG4gIHJldHVybiBzZXEubGVuZ3RoID09PSAwID8gbnVsbCA6IDxzcGFuIHsuLi5wcm9wc30+e3NlcX08L3NwYW4+O1xufVxuXG5mdW5jdGlvbiByZW5kZXJVbm1hdGNoZWRTdWJzZXF1ZW5jZShzZXE6IHN0cmluZywga2V5OiBLZXkpOiA/UmVhY3QuRWxlbWVudCB7XG4gIHJldHVybiByZW5kZXJTdWJzZXF1ZW5jZShzZXEsIHtrZXl9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWF0Y2hlZFN1YnNlcXVlbmNlKHNlcTogc3RyaW5nLCBrZXk6IEtleSk6ID9SZWFjdC5FbGVtZW50IHtcbiAgcmV0dXJuIHJlbmRlclN1YnNlcXVlbmNlKFxuICAgIHNlcSxcbiAgICB7XG4gICAgICBrZXksXG4gICAgICBjbGFzc05hbWU6ICdxdWljay1vcGVuLWZpbGUtc2VhcmNoLW1hdGNoJyxcbiAgICB9XG4gICk7XG59XG5cbmNsYXNzIEZpbGVSZXN1bHRDb21wb25lbnQge1xuXG4gIHN0YXRpYyBnZXRDb21wb25lbnRGb3JJdGVtKFxuICAgIGl0ZW06IEZpbGVSZXN1bHQsXG4gICAgc2VydmljZU5hbWU6IHN0cmluZyxcbiAgICBkaXJOYW1lOiBzdHJpbmdcbiAgKTogUmVhY3QuRWxlbWVudCB7XG4gICAgLy8gVHJpbSB0aGUgYGRpck5hbWVgIG9mZiB0aGUgYGZpbGVQYXRoYCBzaW5jZSB0aGF0J3Mgc2hvd24gYnkgdGhlIGdyb3VwXG4gICAgbGV0IGZpbGVQYXRoID0gaXRlbS5wYXRoO1xuICAgIGxldCBtYXRjaEluZGV4ZXMgPSBpdGVtLm1hdGNoSW5kZXhlcyB8fCBbXTtcbiAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aChkaXJOYW1lKSkge1xuICAgICAgZmlsZVBhdGggPSAnLicgKyBmaWxlUGF0aC5zbGljZShkaXJOYW1lLmxlbmd0aCk7XG4gICAgICBtYXRjaEluZGV4ZXMgPSBtYXRjaEluZGV4ZXMubWFwKGkgPT4gaSAtIChkaXJOYW1lLmxlbmd0aCAtIDEpKTtcbiAgICB9XG5cbiAgICBsZXQgc3RyZWFrT25nb2luZyA9IGZhbHNlO1xuICAgIGxldCBzdGFydCA9IDA7XG4gICAgY29uc3QgcGF0aENvbXBvbmVudHMgPSBbXTtcbiAgICAvLyBTcGxpdCB0aGUgcGF0aCBpbnRvIGhpZ2hsaWdodGVkIGFuZCBub24taGlnaGxpZ2h0ZWQgc3Vic2VxdWVuY2VzIGZvciBvcHRpbWFsIHJlbmRlcmluZyBwZXJmLlxuICAgIC8vIERvIHRoaXMgaW4gTyhuKSB3aGVyZSBuIGlzIHRoZSBudW1iZXIgb2YgbWF0Y2hJbmRleGVzIChpZS4gbGVzcyB0aGFuIHRoZSBsZW5ndGggb2YgdGhlIHBhdGgpLlxuICAgIG1hdGNoSW5kZXhlcy5mb3JFYWNoKChpLCBuKSA9PiB7XG4gICAgICBpZiAobWF0Y2hJbmRleGVzW24gKyAxXSA9PT0gaSArIDEpIHtcbiAgICAgICAgaWYgKCFzdHJlYWtPbmdvaW5nKSB7XG4gICAgICAgICAgcGF0aENvbXBvbmVudHMucHVzaChyZW5kZXJVbm1hdGNoZWRTdWJzZXF1ZW5jZShmaWxlUGF0aC5zbGljZShzdGFydCwgaSksIGkpKTtcbiAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgc3RyZWFrT25nb2luZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzdHJlYWtPbmdvaW5nKSB7XG4gICAgICAgICAgcGF0aENvbXBvbmVudHMucHVzaChyZW5kZXJNYXRjaGVkU3Vic2VxdWVuY2UoZmlsZVBhdGguc2xpY2Uoc3RhcnQsIGkgKyAxKSwgaSkpO1xuICAgICAgICAgIHN0cmVha09uZ29pbmcgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIHBhdGhDb21wb25lbnRzLnB1c2gocmVuZGVyVW5tYXRjaGVkU3Vic2VxdWVuY2UoZmlsZVBhdGguc2xpY2Uoc3RhcnQsIGkpLCBgYmVmb3JlJHtpfWApKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGF0aENvbXBvbmVudHMucHVzaChyZW5kZXJNYXRjaGVkU3Vic2VxdWVuY2UoZmlsZVBhdGguc2xpY2UoaSwgaSArIDEpLCBpKSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBwYXRoQ29tcG9uZW50cy5wdXNoKHJlbmRlclVubWF0Y2hlZFN1YnNlcXVlbmNlKGZpbGVQYXRoLnNsaWNlKHN0YXJ0LCBmaWxlUGF0aC5sZW5ndGgpLCAnbGFzdCcpKTtcblxuICAgIGNvbnN0IGZpbGVuYW1lQ2xhc3NlcyA9IFsnZmlsZScsICdpY29uJywgZmlsZVR5cGVDbGFzcyhmaWxlUGF0aCldLmpvaW4oJyAnKTtcbiAgICAvLyBgZGF0YS1uYW1lYCBpcyBzdXBwb3J0IGZvciB0aGUgXCJmaWxlLWljb25zXCIgcGFja2FnZS5cbiAgICAvLyBTZWU6IGh0dHBzOi8vYXRvbS5pby9wYWNrYWdlcy9maWxlLWljb25zXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtmaWxlbmFtZUNsYXNzZXN9IGRhdGEtbmFtZT17cGF0aC5iYXNlbmFtZShmaWxlUGF0aCl9PlxuICAgICAgICB7cGF0aENvbXBvbmVudHN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVJlc3VsdENvbXBvbmVudDtcbiJdfQ==