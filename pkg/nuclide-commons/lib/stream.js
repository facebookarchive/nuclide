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
  var error = _rx.Observable.fromEvent(stream, 'error').flatMap(_rx.Observable['throw']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0cmVhbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBYXlCLElBQUk7Ozs7OztBQUt0QixTQUFTLGFBQWEsQ0FBQyxNQUF1QixFQUEwQjtBQUM3RSxNQUFNLEtBQUssR0FBRyxlQUFXLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLHVCQUFnQixDQUFDLENBQUM7QUFDOUUsU0FBTyxlQUFXLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7R0FBQSxDQUFDLENBQ3RFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FDWixTQUFTLENBQUMsZUFBVyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0NBQzdEOzs7Ozs7Ozs7QUFRTSxTQUFTLFdBQVcsQ0FBQyxLQUE2QixFQUEwQjtBQUNqRixTQUFPLGVBQVcsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ25DLFFBQUksT0FBZSxHQUFHLEVBQUUsQ0FBQzs7QUFFekIsYUFBUyxLQUFLLEdBQUc7QUFDZixVQUFJLE9BQU8sS0FBSyxFQUFFLEVBQUU7QUFDbEIsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsZUFBTyxHQUFHLEVBQUUsQ0FBQztPQUNkO0tBQ0Y7O0FBRUQsV0FBTyxLQUFLLENBQUMsU0FBUyxDQUNwQixVQUFBLEtBQUssRUFBSTtBQUNQLFVBQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQSxDQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxhQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFdBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2VBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ3JELEVBQ0QsVUFBQSxLQUFLLEVBQUk7QUFBRSxXQUFLLEVBQUUsQ0FBQyxBQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FBRSxFQUM5QyxZQUFNO0FBQUUsV0FBSyxFQUFFLENBQUMsQUFBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7S0FBRSxDQUMzQyxDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGUgYXMgT2JzZXJ2YWJsZVR5cGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbi8qKlxuICogT2JzZXJ2ZSBhIHN0cmVhbSBsaWtlIHN0ZG91dCBvciBzdGRlcnIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlU3RyZWFtKHN0cmVhbTogc3RyZWFtJFJlYWRhYmxlKTogT2JzZXJ2YWJsZVR5cGU8c3RyaW5nPiB7XG4gIGNvbnN0IGVycm9yID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc3RyZWFtLCAnZXJyb3InKS5mbGF0TWFwKE9ic2VydmFibGUudGhyb3cpO1xuICByZXR1cm4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc3RyZWFtLCAnZGF0YScpLm1hcChkYXRhID0+IGRhdGEudG9TdHJpbmcoKSkuXG4gICAgbWVyZ2UoZXJyb3IpLlxuICAgIHRha2VVbnRpbChPYnNlcnZhYmxlLmZyb21FdmVudChzdHJlYW0sICdlbmQnKS5hbWIoZXJyb3IpKTtcbn1cblxuLyoqXG4gKiBTcGxpdHMgYSBzdHJlYW0gb2Ygc3RyaW5ncyBvbiBuZXdsaW5lcy5cbiAqIEluY2x1ZGVzIHRoZSBuZXdsaW5lcyBpbiB0aGUgcmVzdWx0aW5nIHN0cmVhbS5cbiAqIFNlbmRzIGFueSBub24tbmV3bGluZSB0ZXJtaW5hdGVkIGRhdGEgYmVmb3JlIGNsb3NpbmcuXG4gKiBOZXZlciBzZW5kcyBhbiBlbXB0eSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdFN0cmVhbShpbnB1dDogT2JzZXJ2YWJsZVR5cGU8c3RyaW5nPik6IE9ic2VydmFibGVUeXBlPHN0cmluZz4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgIGxldCBjdXJyZW50OiBzdHJpbmcgPSAnJztcblxuICAgIGZ1bmN0aW9uIG9uRW5kKCkge1xuICAgICAgaWYgKGN1cnJlbnQgIT09ICcnKSB7XG4gICAgICAgIG9ic2VydmVyLm9uTmV4dChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbnB1dC5zdWJzY3JpYmUoXG4gICAgICB2YWx1ZSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gKGN1cnJlbnQgKyB2YWx1ZSkuc3BsaXQoJ1xcbicpO1xuICAgICAgICBjdXJyZW50ID0gbGluZXMucG9wKCk7XG4gICAgICAgIGxpbmVzLmZvckVhY2gobGluZSA9PiBvYnNlcnZlci5vbk5leHQobGluZSArICdcXG4nKSk7XG4gICAgICB9LFxuICAgICAgZXJyb3IgPT4geyBvbkVuZCgpOyBvYnNlcnZlci5vbkVycm9yKGVycm9yKTsgfSxcbiAgICAgICgpID0+IHsgb25FbmQoKTsgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTsgfSxcbiAgICApO1xuICB9KTtcbn1cbiJdfQ==