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

exports.observeStream = observeStream;
exports.splitStream = splitStream;

var _rx = require('rx');

/**
 * Observe a stream like stdout or stderr.
 */

function observeStream(stream) {
  var error = _rx.Observable.fromEvent(stream, 'error').flatMap(_rx.Observable.throwError);
  return _rx.Observable.fromEvent(stream, 'data').map(function (data) {
    return data.toString();
  }).merge(error).takeUntil(_rx.Observable.fromEvent(stream, 'end').amb(error));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */

function splitStream(input) {
  return _rx.Observable.create(function (observer) {
    var current = '';

    function onEnd() {
      if (current !== '') {
        observer.onNext(current);
        current = '';
      }
    }

    return input.subscribe(function (value) {
      var lines = (current + value).split('\n');
      current = lines.pop();
      lines.forEach(function (line) {
        return observer.onNext(line + '\n');
      });
    }, function (error) {
      onEnd();observer.onError(error);
    }, function () {
      onEnd();observer.onCompleted();
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0cmVhbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBYXlCLElBQUk7Ozs7OztBQUt0QixTQUFTLGFBQWEsQ0FBQyxNQUF1QixFQUEwQjtBQUM3RSxNQUFNLEtBQUssR0FBRyxlQUFXLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQVcsVUFBVSxDQUFDLENBQUM7QUFDbkYsU0FBTyxlQUFXLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7R0FBQSxDQUFDLENBQ3RFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FDWixTQUFTLENBQUMsZUFBVyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0NBQzdEOzs7Ozs7Ozs7QUFRTSxTQUFTLFdBQVcsQ0FBQyxLQUE2QixFQUEwQjtBQUNqRixTQUFPLGVBQVcsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ25DLFFBQUksT0FBZSxHQUFHLEVBQUUsQ0FBQzs7QUFFekIsYUFBUyxLQUFLLEdBQUc7QUFDZixVQUFJLE9BQU8sS0FBSyxFQUFFLEVBQUU7QUFDbEIsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsZUFBTyxHQUFHLEVBQUUsQ0FBQztPQUNkO0tBQ0Y7O0FBRUQsV0FBTyxLQUFLLENBQUMsU0FBUyxDQUNwQixVQUFBLEtBQUssRUFBSTtBQUNQLFVBQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQSxDQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxhQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFdBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2VBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ3JELEVBQ0QsVUFBQSxLQUFLLEVBQUk7QUFBRSxXQUFLLEVBQUUsQ0FBQyxBQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FBRSxFQUM5QyxZQUFNO0FBQUUsV0FBSyxFQUFFLENBQUMsQUFBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7S0FBRSxDQUMzQyxDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGUgYXMgT2JzZXJ2YWJsZVR5cGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbi8qKlxuICogT2JzZXJ2ZSBhIHN0cmVhbSBsaWtlIHN0ZG91dCBvciBzdGRlcnIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlU3RyZWFtKHN0cmVhbTogc3RyZWFtJFJlYWRhYmxlKTogT2JzZXJ2YWJsZVR5cGU8c3RyaW5nPiB7XG4gIGNvbnN0IGVycm9yID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc3RyZWFtLCAnZXJyb3InKS5mbGF0TWFwKE9ic2VydmFibGUudGhyb3dFcnJvcik7XG4gIHJldHVybiBPYnNlcnZhYmxlLmZyb21FdmVudChzdHJlYW0sICdkYXRhJykubWFwKGRhdGEgPT4gZGF0YS50b1N0cmluZygpKS5cbiAgICBtZXJnZShlcnJvcikuXG4gICAgdGFrZVVudGlsKE9ic2VydmFibGUuZnJvbUV2ZW50KHN0cmVhbSwgJ2VuZCcpLmFtYihlcnJvcikpO1xufVxuXG4vKipcbiAqIFNwbGl0cyBhIHN0cmVhbSBvZiBzdHJpbmdzIG9uIG5ld2xpbmVzLlxuICogSW5jbHVkZXMgdGhlIG5ld2xpbmVzIGluIHRoZSByZXN1bHRpbmcgc3RyZWFtLlxuICogU2VuZHMgYW55IG5vbi1uZXdsaW5lIHRlcm1pbmF0ZWQgZGF0YSBiZWZvcmUgY2xvc2luZy5cbiAqIE5ldmVyIHNlbmRzIGFuIGVtcHR5IHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0U3RyZWFtKGlucHV0OiBPYnNlcnZhYmxlVHlwZTxzdHJpbmc+KTogT2JzZXJ2YWJsZVR5cGU8c3RyaW5nPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiB7XG4gICAgbGV0IGN1cnJlbnQ6IHN0cmluZyA9ICcnO1xuXG4gICAgZnVuY3Rpb24gb25FbmQoKSB7XG4gICAgICBpZiAoY3VycmVudCAhPT0gJycpIHtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50ID0gJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGlucHV0LnN1YnNjcmliZShcbiAgICAgIHZhbHVlID0+IHtcbiAgICAgICAgY29uc3QgbGluZXMgPSAoY3VycmVudCArIHZhbHVlKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGN1cnJlbnQgPSBsaW5lcy5wb3AoKTtcbiAgICAgICAgbGluZXMuZm9yRWFjaChsaW5lID0+IG9ic2VydmVyLm9uTmV4dChsaW5lICsgJ1xcbicpKTtcbiAgICAgIH0sXG4gICAgICBlcnJvciA9PiB7IG9uRW5kKCk7IG9ic2VydmVyLm9uRXJyb3IoZXJyb3IpOyB9LFxuICAgICAgKCkgPT4geyBvbkVuZCgpOyBvYnNlcnZlci5vbkNvbXBsZXRlZCgpOyB9LFxuICAgICk7XG4gIH0pO1xufVxuIl19