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

    return new _atom.CompositeDisposable(

    // Buffer incoming lines.
    line$.subscribe(
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
    line$.debounce(200).subscribe(flush));
  }).map(_createMessage2['default']).share();
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQWtCd0IsbUJBQW1COzs7OzZCQUxqQixpQkFBaUI7Ozs7bUNBQ1gsdUJBQXVCOzs7O29CQUNyQixNQUFNOztrQkFDekIsSUFBSTs7OztBQUVKLFNBQVMsbUJBQW1CLENBQ3pDLEtBQTRCLEVBQ0o7OztBQUd4QixTQUFPLGdCQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDdEMsUUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlO2FBQVMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTtLQUFBLENBQUM7O0FBRS9ELFFBQU0sS0FBSyxHQUFHLFNBQVIsS0FBSyxHQUFTO0FBQ2xCLFVBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdkIsZUFBTztPQUNSOzs7QUFHRCxVQUFJLGVBQWUsRUFBRSxFQUFFO0FBQ3JCLGNBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztPQUNkOztBQUVELGNBQVEsQ0FBQyxNQUFNLENBQUM7QUFDZCxnQkFBUSxFQUFFLFlBQVk7QUFDdEIsZUFBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQzNCLENBQUMsQ0FBQztBQUNILFlBQU0sR0FBRyxFQUFFLENBQUM7QUFDWixrQkFBWSxHQUFHLElBQUksQ0FBQztLQUNyQixDQUFDOztBQUVGLFdBQU87OztBQUdMLFNBQUssQ0FBQyxTQUFTOztBQUViLGNBQUEsSUFBSSxFQUFJO0FBQ04sVUFBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLFVBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRTNDLFVBQUksQ0FBQyxnQkFBZ0IsSUFBSSxlQUFlLEVBQUUsRUFBRTtBQUMxQyxnQkFBUSxHQUFHLHNDQUFvQixJQUFJLENBQUMsQ0FBQztPQUN0Qzs7QUFFRCxVQUFJLFFBQVEsRUFBRTs7QUFFWixhQUFLLEVBQUUsQ0FBQztBQUNSLG9CQUFZLEdBQUcsUUFBUSxDQUFDO09BQ3pCLE1BQU07QUFDTCxjQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ25CO0tBQ0Y7OztBQUdELGNBQUEsS0FBSyxFQUFJO0FBQ1AsV0FBSyxFQUFFLENBQUM7QUFDUixjQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pCOzs7QUFHRCxnQkFBTTtBQUNKLFdBQUssRUFBRSxDQUFDO0FBQ1IsY0FBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3hCLENBQ0Y7Ozs7O0FBS0QsU0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBRXJDLENBQUM7R0FFSCxDQUFDLENBQ0QsR0FBRyw0QkFBZSxDQUNsQixLQUFLLEVBQUUsQ0FBQztDQUNWIiwiZmlsZSI6ImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVzc2FnZX0gZnJvbSAnLi4vLi4vb3V0cHV0L2xpYi90eXBlcyc7XG5cbmltcG9ydCBjcmVhdGVNZXNzYWdlIGZyb20gJy4vY3JlYXRlTWVzc2FnZSc7XG5pbXBvcnQgcGFyc2VMb2djYXRNZXRhZGF0YSBmcm9tICcuL3BhcnNlTG9nY2F0TWV0YWRhdGEnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VTdHJlYW0oXG4gIGxpbmUkOiBSeC5PYnNlcnZhYmxlPHN0cmluZz4sXG4pOiBSeC5PYnNlcnZhYmxlPE1lc3NhZ2U+IHtcblxuICAvLyBTZXBhcmF0ZSB0aGUgbGluZXMgaW50byBncm91cHMsIGJlZ2lubmluZyB3aXRoIG1ldGFkYXRhIGxpbmVzLlxuICByZXR1cm4gUnguT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgIGxldCBidWZmZXIgPSBbXTtcbiAgICBsZXQgcHJldk1ldGFkYXRhID0gbnVsbDtcbiAgICBjb25zdCBwcmV2TGluZUlzQmxhbmsgPSAoKSA9PiBidWZmZXJbYnVmZmVyLmxlbmd0aCAtIDFdID09PSAnJztcblxuICAgIGNvbnN0IGZsdXNoID0gKCkgPT4ge1xuICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgdGhlIGVtcHR5IGxpbmUsIHdoaWNoIGlzIGEgbWVzc2FnZSBzZXBhcmF0b3IuXG4gICAgICBpZiAocHJldkxpbmVJc0JsYW5rKCkpIHtcbiAgICAgICAgYnVmZmVyLnBvcCgpO1xuICAgICAgfVxuXG4gICAgICBvYnNlcnZlci5vbk5leHQoe1xuICAgICAgICBtZXRhZGF0YTogcHJldk1ldGFkYXRhLFxuICAgICAgICBtZXNzYWdlOiBidWZmZXIuam9pbignXFxuJyksXG4gICAgICB9KTtcbiAgICAgIGJ1ZmZlciA9IFtdO1xuICAgICAgcHJldk1ldGFkYXRhID0gbnVsbDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuXG4gICAgICAvLyBCdWZmZXIgaW5jb21pbmcgbGluZXMuXG4gICAgICBsaW5lJC5zdWJzY3JpYmUoXG4gICAgICAgIC8vIG9uTmV4dFxuICAgICAgICBsaW5lID0+IHtcbiAgICAgICAgICBsZXQgbWV0YWRhdGE7XG4gICAgICAgICAgY29uc3QgaGFzUHJldmlvdXNMaW5lcyA9IGJ1ZmZlci5sZW5ndGggPiAwO1xuXG4gICAgICAgICAgaWYgKCFoYXNQcmV2aW91c0xpbmVzIHx8IHByZXZMaW5lSXNCbGFuaygpKSB7XG4gICAgICAgICAgICBtZXRhZGF0YSA9IHBhcnNlTG9nY2F0TWV0YWRhdGEobGluZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1ldGFkYXRhKSB7XG4gICAgICAgICAgICAvLyBXZSd2ZSByZWFjaGVkIGEgbmV3IG1lc3NhZ2Ugc28gdGhlIG90aGVyIG9uZSBtdXN0IGJlIGRvbmUuXG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgICAgcHJldk1ldGFkYXRhID0gbWV0YWRhdGE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZmZlci5wdXNoKGxpbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBvbkVycm9yXG4gICAgICAgIGVycm9yID0+IHtcbiAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgIG9ic2VydmVyLm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIG9uQ29tcGxldGVkXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgIG9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgICAgIH0sXG4gICAgICApLFxuXG4gICAgICAvLyBXZSBrbm93ICpmb3IgY2VydGFpbiogdGhhdCB3ZSBoYXZlIGEgY29tcGxldGUgZW50cnkgb25jZSB3ZSBzZWUgdGhlIG1ldGFkYXRhIGZvciB0aGUgbmV4dFxuICAgICAgLy8gb25lLiBCdXQgd2hhdCBpZiB0aGUgbmV4dCBvbmUgdGFrZXMgYSBsb25nIHRpbWUgdG8gaGFwcGVuPyBBZnRlciBhIGNlcnRhaW4gcG9pbnQsIHdlIG5lZWRcbiAgICAgIC8vIHRvIGp1c3QgYXNzdW1lIHdlIGhhdmUgdGhlIGNvbXBsZXRlIGVudHJ5IGFuZCBtb3ZlIG9uLlxuICAgICAgbGluZSQuZGVib3VuY2UoMjAwKS5zdWJzY3JpYmUoZmx1c2gpLFxuXG4gICAgKTtcblxuICB9KVxuICAubWFwKGNyZWF0ZU1lc3NhZ2UpXG4gIC5zaGFyZSgpO1xufVxuIl19