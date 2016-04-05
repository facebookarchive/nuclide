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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = parseLogcatMetadata;

// Example: [ 01-14 17:14:44.285   640:  656 E/KernelUidCpuTimeReader ]
var METADATA_REGEX = /^\[ (\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+):\s+(\d+)\s+(V|D|I|W|E|F|S)\/(\w+)\s+\]$/;

function parseLogcatMetadata(line) {
  var match = line.match(METADATA_REGEX);

  if (match == null) {
    return null;
  }

  var _match = _slicedToArray(match, 6);

  var time = _match[1];
  var pid = _match[2];
  var tid = _match[3];
  var priority = _match[4];
  var tag = _match[5];

  return {
    time: time,
    pid: parseInt(pid, 10),
    tid: parseInt(tid, 10),
    priority: priority,
    tag: tag
  };
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTG9nY2F0TWV0YWRhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBaUJ3QixtQkFBbUI7OztBQUgzQyxJQUFNLGNBQWMsR0FDbEIsNEZBQTRGLENBQUM7O0FBRWhGLFNBQVMsbUJBQW1CLENBQUMsSUFBWSxFQUFhO0FBQ25FLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRXpDLE1BQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixXQUFPLElBQUksQ0FBQztHQUNiOzs4QkFFeUMsS0FBSzs7TUFBdEMsSUFBSTtNQUFFLEdBQUc7TUFBRSxHQUFHO01BQUUsUUFBUTtNQUFFLEdBQUc7O0FBRXRDLFNBQU87QUFDTCxRQUFJLEVBQUosSUFBSTtBQUNKLE9BQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUN0QixPQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDdEIsWUFBUSxFQUFJLFFBQVEsQUFBaUI7QUFDckMsT0FBRyxFQUFILEdBQUc7R0FDSixDQUFDO0NBQ0giLCJmaWxlIjoicGFyc2VMb2djYXRNZXRhZGF0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtNZXRhZGF0YSwgUHJpb3JpdHl9IGZyb20gJy4vdHlwZXMnO1xuXG4vLyBFeGFtcGxlOiBbIDAxLTE0IDE3OjE0OjQ0LjI4NSAgIDY0MDogIDY1NiBFL0tlcm5lbFVpZENwdVRpbWVSZWFkZXIgXVxuY29uc3QgTUVUQURBVEFfUkVHRVggPVxuICAvXlxcWyAoXFxkezJ9LVxcZHsyfSBcXGR7Mn06XFxkezJ9OlxcZHsyfVxcLlxcZHszfSlcXHMrKFxcZCspOlxccysoXFxkKylcXHMrKFZ8RHxJfFd8RXxGfFMpXFwvKFxcdyspXFxzK1xcXSQvO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUxvZ2NhdE1ldGFkYXRhKGxpbmU6IHN0cmluZyk6ID9NZXRhZGF0YSB7XG4gIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaChNRVRBREFUQV9SRUdFWCk7XG5cbiAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFssIHRpbWUsIHBpZCwgdGlkLCBwcmlvcml0eSwgdGFnXSA9IG1hdGNoO1xuXG4gIHJldHVybiB7XG4gICAgdGltZSxcbiAgICBwaWQ6IHBhcnNlSW50KHBpZCwgMTApLFxuICAgIHRpZDogcGFyc2VJbnQodGlkLCAxMCksXG4gICAgcHJpb3JpdHk6ICgocHJpb3JpdHk6IGFueSk6IFByaW9yaXR5KSxcbiAgICB0YWcsXG4gIH07XG59XG4iXX0=