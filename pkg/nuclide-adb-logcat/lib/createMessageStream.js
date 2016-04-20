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

exports['default'] = createMessageStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideCommons = require('../../nuclide-commons');

var _createMessage = require('./createMessage');

var _createMessage2 = _interopRequireDefault(_createMessage);

var _parseLogcatMetadata = require('./parseLogcatMetadata');

var _parseLogcatMetadata2 = _interopRequireDefault(_parseLogcatMetadata);

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

function createMessageStream(line$) {

  // Separate the lines into groups, beginning with metadata lines.
  return _reactivexRxjs2['default'].Observable.create(function (observer) {
    var buffer = [];
    var prevMetadata = null;
    var prevLineIsBlank = function prevLineIsBlank() {
      return buffer[buffer.length - 1] === '';
    };

    var flush = function flush() {
      if (buffer.length === 0) {
        return;
      }

      // Remove the empty line, which is a message separator.
      if (prevLineIsBlank()) {
        buffer.pop();
      }

      observer.next({
        metadata: prevMetadata,
        message: buffer.join('\n')
      });
      buffer = [];
      prevMetadata = null;
    };

    var sharedLine$ = line$.share();

    return new _nuclideCommons.CompositeSubscription(
    // Buffer incoming lines.
    sharedLine$.subscribe(
    // onNext
    function (line) {
      var metadata = undefined;
      var hasPreviousLines = buffer.length > 0;

      if (!hasPreviousLines || prevLineIsBlank()) {
        metadata = (0, _parseLogcatMetadata2['default'])(line);
      }

      if (metadata) {
        // We've reached a new message so the other one must be done.
        flush();
        prevMetadata = metadata;
      } else {
        buffer.push(line);
      }
    },

    // onError
    function (error) {
      flush();
      observer.error(error);
    },

    // onCompleted
    function () {
      flush();
      observer.complete();
    }),

    // We know *for certain* that we have a complete entry once we see the metadata for the next
    // one. But what if the next one takes a long time to happen? After a certain point, we need
    // to just assume we have the complete entry and move on.
    sharedLine$.debounceTime(200).subscribe(flush));
  }).map(_createMessage2['default']).share();
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQWtCd0IsbUJBQW1COzs7OzhCQUxQLHVCQUF1Qjs7NkJBQ2pDLGlCQUFpQjs7OzttQ0FDWCx1QkFBdUI7Ozs7NkJBQ3hDLGlCQUFpQjs7OztBQUVqQixTQUFTLG1CQUFtQixDQUN6QyxLQUE0QixFQUNKOzs7QUFHeEIsU0FBTywyQkFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ3RDLFFBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDeEIsUUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZTthQUFTLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7S0FBQSxDQUFDOztBQUUvRCxRQUFNLEtBQUssR0FBRyxTQUFSLEtBQUssR0FBUztBQUNsQixVQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3ZCLGVBQU87T0FDUjs7O0FBR0QsVUFBSSxlQUFlLEVBQUUsRUFBRTtBQUNyQixjQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7T0FDZDs7QUFFRCxjQUFRLENBQUMsSUFBSSxDQUFDO0FBQ1osZ0JBQVEsRUFBRSxZQUFZO0FBQ3RCLGVBQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztPQUMzQixDQUFDLENBQUM7QUFDSCxZQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ1osa0JBQVksR0FBRyxJQUFJLENBQUM7S0FDckIsQ0FBQzs7QUFFRixRQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWxDLFdBQU87O0FBRUwsZUFBVyxDQUFDLFNBQVM7O0FBRW5CLGNBQUEsSUFBSSxFQUFJO0FBQ04sVUFBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLFVBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRTNDLFVBQUksQ0FBQyxnQkFBZ0IsSUFBSSxlQUFlLEVBQUUsRUFBRTtBQUMxQyxnQkFBUSxHQUFHLHNDQUFvQixJQUFJLENBQUMsQ0FBQztPQUN0Qzs7QUFFRCxVQUFJLFFBQVEsRUFBRTs7QUFFWixhQUFLLEVBQUUsQ0FBQztBQUNSLG9CQUFZLEdBQUcsUUFBUSxDQUFDO09BQ3pCLE1BQU07QUFDTCxjQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ25CO0tBQ0Y7OztBQUdELGNBQUEsS0FBSyxFQUFJO0FBQ1AsV0FBSyxFQUFFLENBQUM7QUFDUixjQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3ZCOzs7QUFHRCxnQkFBTTtBQUNKLFdBQUssRUFBRSxDQUFDO0FBQ1IsY0FBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3JCLENBQ0Y7Ozs7O0FBS0QsZUFBVyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQy9DLENBQUM7R0FFSCxDQUFDLENBQ0QsR0FBRyw0QkFBZSxDQUNsQixLQUFLLEVBQUUsQ0FBQztDQUNWIiwiZmlsZSI6ImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVzc2FnZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb25zb2xlL2xpYi90eXBlcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlU3Vic2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IGNyZWF0ZU1lc3NhZ2UgZnJvbSAnLi9jcmVhdGVNZXNzYWdlJztcbmltcG9ydCBwYXJzZUxvZ2NhdE1ldGFkYXRhIGZyb20gJy4vcGFyc2VMb2djYXRNZXRhZGF0YSc7XG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVN0cmVhbShcbiAgbGluZSQ6IFJ4Lk9ic2VydmFibGU8c3RyaW5nPixcbik6IFJ4Lk9ic2VydmFibGU8TWVzc2FnZT4ge1xuXG4gIC8vIFNlcGFyYXRlIHRoZSBsaW5lcyBpbnRvIGdyb3VwcywgYmVnaW5uaW5nIHdpdGggbWV0YWRhdGEgbGluZXMuXG4gIHJldHVybiBSeC5PYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiB7XG4gICAgbGV0IGJ1ZmZlciA9IFtdO1xuICAgIGxldCBwcmV2TWV0YWRhdGEgPSBudWxsO1xuICAgIGNvbnN0IHByZXZMaW5lSXNCbGFuayA9ICgpID0+IGJ1ZmZlcltidWZmZXIubGVuZ3RoIC0gMV0gPT09ICcnO1xuXG4gICAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgZW1wdHkgbGluZSwgd2hpY2ggaXMgYSBtZXNzYWdlIHNlcGFyYXRvci5cbiAgICAgIGlmIChwcmV2TGluZUlzQmxhbmsoKSkge1xuICAgICAgICBidWZmZXIucG9wKCk7XG4gICAgICB9XG5cbiAgICAgIG9ic2VydmVyLm5leHQoe1xuICAgICAgICBtZXRhZGF0YTogcHJldk1ldGFkYXRhLFxuICAgICAgICBtZXNzYWdlOiBidWZmZXIuam9pbignXFxuJyksXG4gICAgICB9KTtcbiAgICAgIGJ1ZmZlciA9IFtdO1xuICAgICAgcHJldk1ldGFkYXRhID0gbnVsbDtcbiAgICB9O1xuXG4gICAgY29uc3Qgc2hhcmVkTGluZSQgPSBsaW5lJC5zaGFyZSgpO1xuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVTdWJzY3JpcHRpb24oXG4gICAgICAvLyBCdWZmZXIgaW5jb21pbmcgbGluZXMuXG4gICAgICBzaGFyZWRMaW5lJC5zdWJzY3JpYmUoXG4gICAgICAgIC8vIG9uTmV4dFxuICAgICAgICBsaW5lID0+IHtcbiAgICAgICAgICBsZXQgbWV0YWRhdGE7XG4gICAgICAgICAgY29uc3QgaGFzUHJldmlvdXNMaW5lcyA9IGJ1ZmZlci5sZW5ndGggPiAwO1xuXG4gICAgICAgICAgaWYgKCFoYXNQcmV2aW91c0xpbmVzIHx8IHByZXZMaW5lSXNCbGFuaygpKSB7XG4gICAgICAgICAgICBtZXRhZGF0YSA9IHBhcnNlTG9nY2F0TWV0YWRhdGEobGluZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1ldGFkYXRhKSB7XG4gICAgICAgICAgICAvLyBXZSd2ZSByZWFjaGVkIGEgbmV3IG1lc3NhZ2Ugc28gdGhlIG90aGVyIG9uZSBtdXN0IGJlIGRvbmUuXG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgICAgcHJldk1ldGFkYXRhID0gbWV0YWRhdGE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZmZlci5wdXNoKGxpbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBvbkVycm9yXG4gICAgICAgIGVycm9yID0+IHtcbiAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBvbkNvbXBsZXRlZFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LFxuICAgICAgKSxcblxuICAgICAgLy8gV2Uga25vdyAqZm9yIGNlcnRhaW4qIHRoYXQgd2UgaGF2ZSBhIGNvbXBsZXRlIGVudHJ5IG9uY2Ugd2Ugc2VlIHRoZSBtZXRhZGF0YSBmb3IgdGhlIG5leHRcbiAgICAgIC8vIG9uZS4gQnV0IHdoYXQgaWYgdGhlIG5leHQgb25lIHRha2VzIGEgbG9uZyB0aW1lIHRvIGhhcHBlbj8gQWZ0ZXIgYSBjZXJ0YWluIHBvaW50LCB3ZSBuZWVkXG4gICAgICAvLyB0byBqdXN0IGFzc3VtZSB3ZSBoYXZlIHRoZSBjb21wbGV0ZSBlbnRyeSBhbmQgbW92ZSBvbi5cbiAgICAgIHNoYXJlZExpbmUkLmRlYm91bmNlVGltZSgyMDApLnN1YnNjcmliZShmbHVzaCksXG4gICAgKTtcblxuICB9KVxuICAubWFwKGNyZWF0ZU1lc3NhZ2UpXG4gIC5zaGFyZSgpO1xufVxuIl19