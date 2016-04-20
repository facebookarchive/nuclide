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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.observeStream = observeStream;
exports.splitStream = splitStream;
exports.bufferUntil = bufferUntil;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactivexRxjs = require('@reactivex/rxjs');

/**
 * Observe a stream like stdout or stderr.
 */

function observeStream(stream) {
  var error = _reactivexRxjs.Observable.fromEvent(stream, 'error').flatMap(_reactivexRxjs.Observable['throw']);
  return _reactivexRxjs.Observable.fromEvent(stream, 'data').map(function (data) {
    return data.toString();
  }).merge(error).takeUntil(_reactivexRxjs.Observable.fromEvent(stream, 'end').race(error));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */

function splitStream(input) {
  return _reactivexRxjs.Observable.create(function (observer) {
    var current = '';

    function onEnd() {
      if (current !== '') {
        observer.next(current);
        current = '';
      }
    }

    return input.subscribe(function (value) {
      var lines = (current + value).split('\n');
      current = lines.pop();
      lines.forEach(function (line) {
        return observer.next(line + '\n');
      });
    }, function (error) {
      onEnd();observer.error(error);
    }, function () {
      onEnd();observer.complete();
    });
  });
}

var DisposableSubscription = (function () {
  function DisposableSubscription(subscription) {
    _classCallCheck(this, DisposableSubscription);

    this._subscription = subscription;
  }

  _createClass(DisposableSubscription, [{
    key: 'dispose',
    value: function dispose() {
      this._subscription.unsubscribe();
    }
  }]);

  return DisposableSubscription;
})();

exports.DisposableSubscription = DisposableSubscription;

var CompositeSubscription = (function () {
  function CompositeSubscription() {
    var _this = this;

    _classCallCheck(this, CompositeSubscription);

    this._subscription = new _reactivexRxjs.Subscription();

    for (var _len = arguments.length, subscriptions = Array(_len), _key = 0; _key < _len; _key++) {
      subscriptions[_key] = arguments[_key];
    }

    subscriptions.forEach(function (sub) {
      _this._subscription.add(sub);
    });
  }

  // TODO: We used to use `stream.buffer(stream.filter(...))` for this but it doesn't work in RxJS 5.
  //  See https://github.com/ReactiveX/rxjs/issues/1610

  _createClass(CompositeSubscription, [{
    key: 'unsubscribe',
    value: function unsubscribe() {
      this._subscription.unsubscribe();
    }
  }]);

  return CompositeSubscription;
})();

exports.CompositeSubscription = CompositeSubscription;

function bufferUntil(stream, condition) {
  return _reactivexRxjs.Observable.create(function (observer) {
    var buffer = null;
    var flush = function flush() {
      if (buffer != null) {
        observer.next(buffer);
        buffer = null;
      }
    };
    return stream.subscribe(function (x) {
      if (buffer == null) {
        buffer = [];
      }
      buffer.push(x);
      if (condition(x)) {
        flush();
      }
    }, function (err) {
      flush();
      observer.error(err);
    }, function () {
      flush();
      observer.complete();
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0cmVhbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFhdUMsaUJBQWlCOzs7Ozs7QUFLakQsU0FBUyxhQUFhLENBQUMsTUFBdUIsRUFBMEI7QUFDN0UsTUFBTSxLQUFLLEdBQUcsMEJBQVcsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsa0NBQWdCLENBQUMsQ0FBQztBQUM5RSxTQUFPLDBCQUFXLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7R0FBQSxDQUFDLENBQ3RFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FDWixTQUFTLENBQUMsMEJBQVcsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUM5RDs7Ozs7Ozs7O0FBUU0sU0FBUyxXQUFXLENBQUMsS0FBNkIsRUFBMEI7QUFDakYsU0FBTywwQkFBVyxNQUFNLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDbkMsUUFBSSxPQUFlLEdBQUcsRUFBRSxDQUFDOztBQUV6QixhQUFTLEtBQUssR0FBRztBQUNmLFVBQUksT0FBTyxLQUFLLEVBQUUsRUFBRTtBQUNsQixnQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixlQUFPLEdBQUcsRUFBRSxDQUFDO09BQ2Q7S0FDRjs7QUFFRCxXQUFPLEtBQUssQ0FBQyxTQUFTLENBQ3BCLFVBQUEsS0FBSyxFQUFJO0FBQ1AsVUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBLENBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVDLGFBQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEIsV0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7ZUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDbkQsRUFDRCxVQUFBLEtBQUssRUFBSTtBQUFFLFdBQUssRUFBRSxDQUFDLEFBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUFFLEVBQzVDLFlBQU07QUFBRSxXQUFLLEVBQUUsQ0FBQyxBQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUFFLENBQ3hDLENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSjs7SUFFWSxzQkFBc0I7QUFHdEIsV0FIQSxzQkFBc0IsQ0FHckIsWUFBOEIsRUFBRTswQkFIakMsc0JBQXNCOztBQUkvQixRQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztHQUNuQzs7ZUFMVSxzQkFBc0I7O1dBTzFCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNsQzs7O1NBVFUsc0JBQXNCOzs7OztJQWN0QixxQkFBcUI7QUFHckIsV0FIQSxxQkFBcUIsR0FHb0I7OzswQkFIekMscUJBQXFCOztBQUk5QixRQUFJLENBQUMsYUFBYSxHQUFHLGlDQUFrQixDQUFDOztzQ0FEM0IsYUFBYTtBQUFiLG1CQUFhOzs7QUFFMUIsaUJBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDM0IsWUFBSyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzdCLENBQUMsQ0FBQztHQUNKOzs7OztlQVJVLHFCQUFxQjs7V0FVckIsdUJBQVM7QUFDbEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNsQzs7O1NBWlUscUJBQXFCOzs7OztBQWlCM0IsU0FBUyxXQUFXLENBQ3pCLE1BQXFCLEVBQ3JCLFNBQStCLEVBQ1Q7QUFDdEIsU0FBTywwQkFBVyxNQUFNLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDbkMsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQU0sS0FBSyxHQUFHLFNBQVIsS0FBSyxHQUFTO0FBQ2xCLFVBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixnQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0QixjQUFNLEdBQUcsSUFBSSxDQUFDO09BQ2Y7S0FDRixDQUFDO0FBQ0YsV0FBTyxNQUFNLENBQ1YsU0FBUyxDQUNSLFVBQUEsQ0FBQyxFQUFJO0FBQ0gsVUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLGNBQU0sR0FBRyxFQUFFLENBQUM7T0FDYjtBQUNELFlBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDZixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNoQixhQUFLLEVBQUUsQ0FBQztPQUNUO0tBQ0YsRUFDRCxVQUFBLEdBQUcsRUFBSTtBQUNMLFdBQUssRUFBRSxDQUFDO0FBQ1IsY0FBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNyQixFQUNELFlBQU07QUFDSixXQUFLLEVBQUUsQ0FBQztBQUNSLGNBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNyQixDQUNGLENBQUM7R0FDTCxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJzdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZSBhcyBPYnNlcnZhYmxlVHlwZX0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJzY3JpcHRpb259IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbi8qKlxuICogT2JzZXJ2ZSBhIHN0cmVhbSBsaWtlIHN0ZG91dCBvciBzdGRlcnIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlU3RyZWFtKHN0cmVhbTogc3RyZWFtJFJlYWRhYmxlKTogT2JzZXJ2YWJsZVR5cGU8c3RyaW5nPiB7XG4gIGNvbnN0IGVycm9yID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc3RyZWFtLCAnZXJyb3InKS5mbGF0TWFwKE9ic2VydmFibGUudGhyb3cpO1xuICByZXR1cm4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc3RyZWFtLCAnZGF0YScpLm1hcChkYXRhID0+IGRhdGEudG9TdHJpbmcoKSkuXG4gICAgbWVyZ2UoZXJyb3IpLlxuICAgIHRha2VVbnRpbChPYnNlcnZhYmxlLmZyb21FdmVudChzdHJlYW0sICdlbmQnKS5yYWNlKGVycm9yKSk7XG59XG5cbi8qKlxuICogU3BsaXRzIGEgc3RyZWFtIG9mIHN0cmluZ3Mgb24gbmV3bGluZXMuXG4gKiBJbmNsdWRlcyB0aGUgbmV3bGluZXMgaW4gdGhlIHJlc3VsdGluZyBzdHJlYW0uXG4gKiBTZW5kcyBhbnkgbm9uLW5ld2xpbmUgdGVybWluYXRlZCBkYXRhIGJlZm9yZSBjbG9zaW5nLlxuICogTmV2ZXIgc2VuZHMgYW4gZW1wdHkgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRTdHJlYW0oaW5wdXQ6IE9ic2VydmFibGVUeXBlPHN0cmluZz4pOiBPYnNlcnZhYmxlVHlwZTxzdHJpbmc+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKG9ic2VydmVyID0+IHtcbiAgICBsZXQgY3VycmVudDogc3RyaW5nID0gJyc7XG5cbiAgICBmdW5jdGlvbiBvbkVuZCgpIHtcbiAgICAgIGlmIChjdXJyZW50ICE9PSAnJykge1xuICAgICAgICBvYnNlcnZlci5uZXh0KGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50ID0gJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGlucHV0LnN1YnNjcmliZShcbiAgICAgIHZhbHVlID0+IHtcbiAgICAgICAgY29uc3QgbGluZXMgPSAoY3VycmVudCArIHZhbHVlKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGN1cnJlbnQgPSBsaW5lcy5wb3AoKTtcbiAgICAgICAgbGluZXMuZm9yRWFjaChsaW5lID0+IG9ic2VydmVyLm5leHQobGluZSArICdcXG4nKSk7XG4gICAgICB9LFxuICAgICAgZXJyb3IgPT4geyBvbkVuZCgpOyBvYnNlcnZlci5lcnJvcihlcnJvcik7IH0sXG4gICAgICAoKSA9PiB7IG9uRW5kKCk7IG9ic2VydmVyLmNvbXBsZXRlKCk7IH0sXG4gICAgKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEaXNwb3NhYmxlU3Vic2NyaXB0aW9uIHtcbiAgX3N1YnNjcmlwdGlvbjogcngkSVN1YnNjcmlwdGlvbjtcblxuICBjb25zdHJ1Y3RvcihzdWJzY3JpcHRpb246IHJ4JElTdWJzY3JpcHRpb24pIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb247XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG59XG5cbnR5cGUgVGVhcmRvd25Mb2dpYyA9ICgoKSA9PiB2b2lkKSB8IHJ4JElTdWJzY3JpcHRpb247XG5cbmV4cG9ydCBjbGFzcyBDb21wb3NpdGVTdWJzY3JpcHRpb24ge1xuICBfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IoLi4uc3Vic2NyaXB0aW9uczogQXJyYXk8VGVhcmRvd25Mb2dpYz4pIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5mb3JFYWNoKHN1YiA9PiB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKHN1Yik7XG4gICAgfSk7XG4gIH1cblxuICB1bnN1YnNjcmliZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxufVxuXG4vLyBUT0RPOiBXZSB1c2VkIHRvIHVzZSBgc3RyZWFtLmJ1ZmZlcihzdHJlYW0uZmlsdGVyKC4uLikpYCBmb3IgdGhpcyBidXQgaXQgZG9lc24ndCB3b3JrIGluIFJ4SlMgNS5cbi8vICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL1JlYWN0aXZlWC9yeGpzL2lzc3Vlcy8xNjEwXG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyVW50aWw8VD4oXG4gIHN0cmVhbTogT2JzZXJ2YWJsZTxUPixcbiAgY29uZGl0aW9uOiAoaXRlbTogVCkgPT4gYm9vbGVhbixcbik6IE9ic2VydmFibGU8QXJyYXk8VD4+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKG9ic2VydmVyID0+IHtcbiAgICBsZXQgYnVmZmVyID0gbnVsbDtcbiAgICBjb25zdCBmbHVzaCA9ICgpID0+IHtcbiAgICAgIGlmIChidWZmZXIgIT0gbnVsbCkge1xuICAgICAgICBvYnNlcnZlci5uZXh0KGJ1ZmZlcik7XG4gICAgICAgIGJ1ZmZlciA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gc3RyZWFtXG4gICAgICAuc3Vic2NyaWJlKFxuICAgICAgICB4ID0+IHtcbiAgICAgICAgICBpZiAoYnVmZmVyID09IG51bGwpIHtcbiAgICAgICAgICAgIGJ1ZmZlciA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBidWZmZXIucHVzaCh4KTtcbiAgICAgICAgICBpZiAoY29uZGl0aW9uKHgpKSB7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0sXG4gICAgICApO1xuICB9KTtcbn1cbiJdfQ==