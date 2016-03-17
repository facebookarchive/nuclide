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

var _createMessage = require('./createMessage');

var _createMessage2 = _interopRequireDefault(_createMessage);

var _parseLogcatMetadata = require('./parseLogcatMetadata');

var _parseLogcatMetadata2 = _interopRequireDefault(_parseLogcatMetadata);

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function createMessageStream(line$) {

  // Separate the lines into groups, beginning with metadata lines.
  return _rx2['default'].Observable.create(function (observer) {
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

      observer.onNext({
        metadata: prevMetadata,
        message: buffer.join('\n')
      });
      buffer = [];
      prevMetadata = null;
    };

    var sharedLine$ = line$.share();

    return new _atom.CompositeDisposable(

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
      observer.onError(error);
    },

    // onCompleted
    function () {
      flush();
      observer.onCompleted();
    }),

    // We know *for certain* that we have a complete entry once we see the metadata for the next
    // one. But what if the next one takes a long time to happen? After a certain point, we need
    // to just assume we have the complete entry and move on.
    sharedLine$.debounce(200).subscribe(flush));
  }).map(_createMessage2['default']).share();
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQWtCd0IsbUJBQW1COzs7OzZCQUxqQixpQkFBaUI7Ozs7bUNBQ1gsdUJBQXVCOzs7O29CQUNyQixNQUFNOztrQkFDekIsSUFBSTs7OztBQUVKLFNBQVMsbUJBQW1CLENBQ3pDLEtBQTRCLEVBQ0o7OztBQUd4QixTQUFPLGdCQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDdEMsUUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlO2FBQVMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTtLQUFBLENBQUM7O0FBRS9ELFFBQU0sS0FBSyxHQUFHLFNBQVIsS0FBSyxHQUFTO0FBQ2xCLFVBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdkIsZUFBTztPQUNSOzs7QUFHRCxVQUFJLGVBQWUsRUFBRSxFQUFFO0FBQ3JCLGNBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztPQUNkOztBQUVELGNBQVEsQ0FBQyxNQUFNLENBQUM7QUFDZCxnQkFBUSxFQUFFLFlBQVk7QUFDdEIsZUFBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQzNCLENBQUMsQ0FBQztBQUNILFlBQU0sR0FBRyxFQUFFLENBQUM7QUFDWixrQkFBWSxHQUFHLElBQUksQ0FBQztLQUNyQixDQUFDOztBQUVGLFFBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFbEMsV0FBTzs7O0FBR0wsZUFBVyxDQUFDLFNBQVM7O0FBRW5CLGNBQUEsSUFBSSxFQUFJO0FBQ04sVUFBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLFVBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRTNDLFVBQUksQ0FBQyxnQkFBZ0IsSUFBSSxlQUFlLEVBQUUsRUFBRTtBQUMxQyxnQkFBUSxHQUFHLHNDQUFvQixJQUFJLENBQUMsQ0FBQztPQUN0Qzs7QUFFRCxVQUFJLFFBQVEsRUFBRTs7QUFFWixhQUFLLEVBQUUsQ0FBQztBQUNSLG9CQUFZLEdBQUcsUUFBUSxDQUFDO09BQ3pCLE1BQU07QUFDTCxjQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ25CO0tBQ0Y7OztBQUdELGNBQUEsS0FBSyxFQUFJO0FBQ1AsV0FBSyxFQUFFLENBQUM7QUFDUixjQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pCOzs7QUFHRCxnQkFBTTtBQUNKLFdBQUssRUFBRSxDQUFDO0FBQ1IsY0FBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3hCLENBQ0Y7Ozs7O0FBS0QsZUFBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBRTNDLENBQUM7R0FFSCxDQUFDLENBQ0QsR0FBRyw0QkFBZSxDQUNsQixLQUFLLEVBQUUsQ0FBQztDQUNWIiwiZmlsZSI6ImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVzc2FnZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vdXRwdXQvbGliL3R5cGVzJztcblxuaW1wb3J0IGNyZWF0ZU1lc3NhZ2UgZnJvbSAnLi9jcmVhdGVNZXNzYWdlJztcbmltcG9ydCBwYXJzZUxvZ2NhdE1ldGFkYXRhIGZyb20gJy4vcGFyc2VMb2djYXRNZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVN0cmVhbShcbiAgbGluZSQ6IFJ4Lk9ic2VydmFibGU8c3RyaW5nPixcbik6IFJ4Lk9ic2VydmFibGU8TWVzc2FnZT4ge1xuXG4gIC8vIFNlcGFyYXRlIHRoZSBsaW5lcyBpbnRvIGdyb3VwcywgYmVnaW5uaW5nIHdpdGggbWV0YWRhdGEgbGluZXMuXG4gIHJldHVybiBSeC5PYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiB7XG4gICAgbGV0IGJ1ZmZlciA9IFtdO1xuICAgIGxldCBwcmV2TWV0YWRhdGEgPSBudWxsO1xuICAgIGNvbnN0IHByZXZMaW5lSXNCbGFuayA9ICgpID0+IGJ1ZmZlcltidWZmZXIubGVuZ3RoIC0gMV0gPT09ICcnO1xuXG4gICAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgZW1wdHkgbGluZSwgd2hpY2ggaXMgYSBtZXNzYWdlIHNlcGFyYXRvci5cbiAgICAgIGlmIChwcmV2TGluZUlzQmxhbmsoKSkge1xuICAgICAgICBidWZmZXIucG9wKCk7XG4gICAgICB9XG5cbiAgICAgIG9ic2VydmVyLm9uTmV4dCh7XG4gICAgICAgIG1ldGFkYXRhOiBwcmV2TWV0YWRhdGEsXG4gICAgICAgIG1lc3NhZ2U6IGJ1ZmZlci5qb2luKCdcXG4nKSxcbiAgICAgIH0pO1xuICAgICAgYnVmZmVyID0gW107XG4gICAgICBwcmV2TWV0YWRhdGEgPSBudWxsO1xuICAgIH07XG5cbiAgICBjb25zdCBzaGFyZWRMaW5lJCA9IGxpbmUkLnNoYXJlKCk7XG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG5cbiAgICAgIC8vIEJ1ZmZlciBpbmNvbWluZyBsaW5lcy5cbiAgICAgIHNoYXJlZExpbmUkLnN1YnNjcmliZShcbiAgICAgICAgLy8gb25OZXh0XG4gICAgICAgIGxpbmUgPT4ge1xuICAgICAgICAgIGxldCBtZXRhZGF0YTtcbiAgICAgICAgICBjb25zdCBoYXNQcmV2aW91c0xpbmVzID0gYnVmZmVyLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgICBpZiAoIWhhc1ByZXZpb3VzTGluZXMgfHwgcHJldkxpbmVJc0JsYW5rKCkpIHtcbiAgICAgICAgICAgIG1ldGFkYXRhID0gcGFyc2VMb2djYXRNZXRhZGF0YShsaW5lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWV0YWRhdGEpIHtcbiAgICAgICAgICAgIC8vIFdlJ3ZlIHJlYWNoZWQgYSBuZXcgbWVzc2FnZSBzbyB0aGUgb3RoZXIgb25lIG11c3QgYmUgZG9uZS5cbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgICAgICBwcmV2TWV0YWRhdGEgPSBtZXRhZGF0YTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnVmZmVyLnB1c2gobGluZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIG9uRXJyb3JcbiAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgICAgb2JzZXJ2ZXIub25FcnJvcihlcnJvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gb25Db21wbGV0ZWRcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgICAgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgICAgfSxcbiAgICAgICksXG5cbiAgICAgIC8vIFdlIGtub3cgKmZvciBjZXJ0YWluKiB0aGF0IHdlIGhhdmUgYSBjb21wbGV0ZSBlbnRyeSBvbmNlIHdlIHNlZSB0aGUgbWV0YWRhdGEgZm9yIHRoZSBuZXh0XG4gICAgICAvLyBvbmUuIEJ1dCB3aGF0IGlmIHRoZSBuZXh0IG9uZSB0YWtlcyBhIGxvbmcgdGltZSB0byBoYXBwZW4/IEFmdGVyIGEgY2VydGFpbiBwb2ludCwgd2UgbmVlZFxuICAgICAgLy8gdG8ganVzdCBhc3N1bWUgd2UgaGF2ZSB0aGUgY29tcGxldGUgZW50cnkgYW5kIG1vdmUgb24uXG4gICAgICBzaGFyZWRMaW5lJC5kZWJvdW5jZSgyMDApLnN1YnNjcmliZShmbHVzaCksXG5cbiAgICApO1xuXG4gIH0pXG4gIC5tYXAoY3JlYXRlTWVzc2FnZSlcbiAgLnNoYXJlKCk7XG59XG4iXX0=