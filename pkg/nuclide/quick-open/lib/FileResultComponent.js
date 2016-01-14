var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var React = require('react-for-atom');

var _require = require('../../atom-helpers');

var fileTypeClass = _require.fileTypeClass;

var path = require('path');

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

      var filenameStart = filePath.lastIndexOf(path.sep);
      var importantIndexes = [filenameStart, filePath.length].concat(matchIndexes).sort(function (index1, index2) {
        return index1 - index2;
      });

      var folderComponents = [];
      var filenameComponents = [];

      var last = -1;
      // Split the path into it's path and directory, with matching characters pulled out and
      //  highlighted.
      // When there's no matches, the ouptut is equivalent to just calling path.dirname/basename.
      importantIndexes.forEach(function (index) {
        // If the index is after the filename start, push the new text elements
        // into `filenameComponents`, otherwise push them into `folderComponents`.
        var target = index <= filenameStart ? folderComponents : filenameComponents;

        // If there was text before the `index`, push it onto `target` unstyled.
        var previousString = filePath.slice(last + 1, index);
        if (previousString.length !== 0) {
          target.push(React.createElement(
            'span',
            { key: index + 'prev' },
            previousString
          ));
        }

        // Don't put the '/' between the folder path and the filename on either line.
        if (index !== filenameStart && index < filePath.length) {
          var character = filePath.charAt(index);
          target.push(React.createElement(
            'span',
            { key: index, className: 'quick-open-file-search-match' },
            character
          ));
        }

        last = index;
      });

      var filenameClasses = ['file', 'icon', fileTypeClass(filePath)].join(' ');
      var folderClasses = ['path', 'no-icon'].join(' ');

      // `data-name` is support for the "file-icons" package.
      // See: https://atom.io/packages/file-icons
      return React.createElement(
        'div',
        null,
        React.createElement(
          'span',
          { className: filenameClasses, 'data-name': path.basename(filePath) },
          filenameComponents
        ),
        React.createElement(
          'span',
          { className: folderClasses },
          folderComponents
        )
      );
    }
  }]);

  return FileResultComponent;
})();

module.exports = FileResultComponent;
//# sourceMappingURL=data:application/json;base64,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OztZQUFNLFNBQVMsRUFBRSxlQUFlLEFBQUMsRUFBQyxhQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEFBQUM7VUFDbEUsa0JBQWtCO1NBQ2Q7UUFDUDs7WUFBTSxTQUFTLEVBQUUsYUFBYSxBQUFDO1VBQUUsZ0JBQWdCO1NBQVE7T0FDckQsQ0FDTjtLQUNIOzs7U0E1REcsbUJBQW1COzs7QUErRHpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMiLCJmaWxlIjoiRmlsZVJlc3VsdENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZVJlc3VsdCxcbn0gZnJvbSAnLi4vLi4vcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge2ZpbGVUeXBlQ2xhc3N9ID0gcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jbGFzcyBGaWxlUmVzdWx0Q29tcG9uZW50IHtcblxuICBzdGF0aWMgZ2V0Q29tcG9uZW50Rm9ySXRlbShcbiAgICBpdGVtOiBGaWxlUmVzdWx0LFxuICAgIHNlcnZpY2VOYW1lOiBzdHJpbmcsXG4gICAgZGlyTmFtZTogc3RyaW5nXG4gICk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVHJpbSB0aGUgYGRpck5hbWVgIG9mZiB0aGUgYGZpbGVQYXRoYCBzaW5jZSB0aGF0J3Mgc2hvd24gYnkgdGhlIGdyb3VwXG4gICAgY29uc3QgZmlsZVBhdGggPSBpdGVtLnBhdGguc3RhcnRzV2l0aChkaXJOYW1lKVxuICAgICAgPyAnLicgKyBpdGVtLnBhdGguc2xpY2UoZGlyTmFtZS5sZW5ndGgpXG4gICAgICA6IGl0ZW0ucGF0aDtcbiAgICBjb25zdCBtYXRjaEluZGV4ZXMgPSBpdGVtLm1hdGNoSW5kZXhlcyAmJiBpdGVtLnBhdGguc3RhcnRzV2l0aChkaXJOYW1lKVxuICAgICAgPyBpdGVtLm1hdGNoSW5kZXhlcy5tYXAoaSA9PiBpIC0gKGRpck5hbWUubGVuZ3RoIC0gMSkpXG4gICAgICA6IFtdO1xuXG4gICAgY29uc3QgZmlsZW5hbWVTdGFydCA9IGZpbGVQYXRoLmxhc3RJbmRleE9mKHBhdGguc2VwKTtcbiAgICBjb25zdCBpbXBvcnRhbnRJbmRleGVzID0gW2ZpbGVuYW1lU3RhcnQsIGZpbGVQYXRoLmxlbmd0aF1cbiAgICAgIC5jb25jYXQobWF0Y2hJbmRleGVzKVxuICAgICAgLnNvcnQoKGluZGV4MSwgaW5kZXgyKSA9PiBpbmRleDEgLSBpbmRleDIpO1xuXG4gICAgY29uc3QgZm9sZGVyQ29tcG9uZW50cyA9IFtdO1xuICAgIGNvbnN0IGZpbGVuYW1lQ29tcG9uZW50cyA9IFtdO1xuXG4gICAgbGV0IGxhc3QgPSAtMTtcbiAgICAvLyBTcGxpdCB0aGUgcGF0aCBpbnRvIGl0J3MgcGF0aCBhbmQgZGlyZWN0b3J5LCB3aXRoIG1hdGNoaW5nIGNoYXJhY3RlcnMgcHVsbGVkIG91dCBhbmRcbiAgICAvLyAgaGlnaGxpZ2h0ZWQuXG4gICAgLy8gV2hlbiB0aGVyZSdzIG5vIG1hdGNoZXMsIHRoZSBvdXB0dXQgaXMgZXF1aXZhbGVudCB0byBqdXN0IGNhbGxpbmcgcGF0aC5kaXJuYW1lL2Jhc2VuYW1lLlxuICAgIGltcG9ydGFudEluZGV4ZXMuZm9yRWFjaCgoaW5kZXgpID0+IHtcbiAgICAgIC8vIElmIHRoZSBpbmRleCBpcyBhZnRlciB0aGUgZmlsZW5hbWUgc3RhcnQsIHB1c2ggdGhlIG5ldyB0ZXh0IGVsZW1lbnRzXG4gICAgICAvLyBpbnRvIGBmaWxlbmFtZUNvbXBvbmVudHNgLCBvdGhlcndpc2UgcHVzaCB0aGVtIGludG8gYGZvbGRlckNvbXBvbmVudHNgLlxuICAgICAgY29uc3QgdGFyZ2V0ID0gaW5kZXggPD0gZmlsZW5hbWVTdGFydCA/IGZvbGRlckNvbXBvbmVudHMgOiBmaWxlbmFtZUNvbXBvbmVudHM7XG5cbiAgICAgIC8vIElmIHRoZXJlIHdhcyB0ZXh0IGJlZm9yZSB0aGUgYGluZGV4YCwgcHVzaCBpdCBvbnRvIGB0YXJnZXRgIHVuc3R5bGVkLlxuICAgICAgY29uc3QgcHJldmlvdXNTdHJpbmcgPSBmaWxlUGF0aC5zbGljZShsYXN0ICsgMSwgaW5kZXgpO1xuICAgICAgaWYgKHByZXZpb3VzU3RyaW5nLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB0YXJnZXQucHVzaCg8c3BhbiBrZXk9e2luZGV4ICsgJ3ByZXYnfT57cHJldmlvdXNTdHJpbmd9PC9zcGFuPik7XG4gICAgICB9XG5cbiAgICAgIC8vIERvbid0IHB1dCB0aGUgJy8nIGJldHdlZW4gdGhlIGZvbGRlciBwYXRoIGFuZCB0aGUgZmlsZW5hbWUgb24gZWl0aGVyIGxpbmUuXG4gICAgICBpZiAoaW5kZXggIT09IGZpbGVuYW1lU3RhcnQgJiYgaW5kZXggPCBmaWxlUGF0aC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgY2hhcmFjdGVyID0gZmlsZVBhdGguY2hhckF0KGluZGV4KTtcbiAgICAgICAgdGFyZ2V0LnB1c2goPHNwYW4ga2V5PXtpbmRleH0gY2xhc3NOYW1lPVwicXVpY2stb3Blbi1maWxlLXNlYXJjaC1tYXRjaFwiPntjaGFyYWN0ZXJ9PC9zcGFuPik7XG4gICAgICB9XG5cbiAgICAgIGxhc3QgPSBpbmRleDtcbiAgICB9KTtcblxuICAgIGNvbnN0IGZpbGVuYW1lQ2xhc3NlcyA9IFsnZmlsZScsICdpY29uJywgZmlsZVR5cGVDbGFzcyhmaWxlUGF0aCldLmpvaW4oJyAnKTtcbiAgICBjb25zdCBmb2xkZXJDbGFzc2VzID0gWydwYXRoJywgJ25vLWljb24nXS5qb2luKCcgJyk7XG5cbiAgICAvLyBgZGF0YS1uYW1lYCBpcyBzdXBwb3J0IGZvciB0aGUgXCJmaWxlLWljb25zXCIgcGFja2FnZS5cbiAgICAvLyBTZWU6IGh0dHBzOi8vYXRvbS5pby9wYWNrYWdlcy9maWxlLWljb25zXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17ZmlsZW5hbWVDbGFzc2VzfSBkYXRhLW5hbWU9e3BhdGguYmFzZW5hbWUoZmlsZVBhdGgpfT5cbiAgICAgICAgICB7ZmlsZW5hbWVDb21wb25lbnRzfVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Zm9sZGVyQ2xhc3Nlc30+e2ZvbGRlckNvbXBvbmVudHN9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVSZXN1bHRDb21wb25lbnQ7XG4iXX0=