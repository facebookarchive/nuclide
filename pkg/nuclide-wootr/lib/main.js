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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var WString = (function () {
  function WString(siteId) {
    var length = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, WString);

    this._siteId = siteId;
    this._localId = 1;
    this._string = [WString.start, WString.end];
    if (length > 0) {
      this._localId = length;
      this.insert(1, {
        startId: {
          site: siteId,
          h: 1
        },
        visible: true,
        startDegree: 1,
        length: length
      }, length);
    }
  }

  _createClass(WString, [{
    key: 'insert',
    value: function insert(pos, c) {
      // Find the run that has the previous position in it.
      var leftHalfIndex = undefined;
      var offset = pos;
      for (leftHalfIndex = 0; leftHalfIndex < this._string.length; leftHalfIndex++) {
        if (this._string[leftHalfIndex].length >= offset) {
          break;
        }
        offset -= this._string[leftHalfIndex].length;
      }

      var leftHalf = this._string[leftHalfIndex];

      // There are 3 cases we handle. Assume the following run
      // [begin][id:1,1; len: 3, vis: 1;][end]
      //
      // The first case is where we can merely extend the previous run
      // insert(4, {id: 1,4; len: 1; vis: 1})
      //
      // [begin][id:1,1; len: 3, vis: 1;]*insert here*[end]
      // =>
      // [begin][id:1,1; len: *4*, vis: 1;][end]
      //
      // The next case is where we are at the end but cannont extend.
      //
      // insert(4, {id: *2,7*; len: 1; vis: 1})
      //
      // [begin][id:1,1; len: 3, vis: 1;]*insert here*[end]
      // =>
      // [begin][id:1,1; len: 3, vis: 1;][id:2,7; len: 1, vis: 1;][end]
      //
      // The last case is where we split the previous run.
      // insert(3, {id: 1,4; len: 1; vis: 1})
      //
      // [begin][id:1,1; len: 4, vis: 1;]*<= insert inside there*[end]
      // =>
      // [begin][id:1,1; len: 2, vis: 1;][id:1,4; len: 1, vis: 1;][id:1,3; len: 2, vis: 1;][end]
      if (leftHalf.startId.site === c.startId.site && leftHalf.startId.h === c.startId.h - leftHalf.length && offset === leftHalf.length && c.visible === leftHalf.visible) {
        leftHalf.length += c.length;
      } else if (offset === leftHalf.length) {
        this._string.splice(leftHalfIndex + 1, 0, c);
      } else {
        var rightHalf = {
          startId: {
            site: leftHalf.startId.site,
            h: leftHalf.startId.h + offset
          },
          visible: leftHalf.visible,
          length: leftHalf.length - offset,
          startDegree: leftHalf.startDegree + offset
        };

        leftHalf.length -= leftHalf.length - offset;
        this._string.splice(leftHalfIndex + 1, 0, c, rightHalf);
      }
    }
  }]);

  return WString;
})();

exports.WString = WString;

WString.start = {
  startId: { site: -1, h: 0 },
  visible: true,
  startDegree: 0,
  length: 1
};

WString.end = {
  startId: { site: -1, h: 1 },
  visible: true,
  startDegree: 0,
  length: 1
};
//# sourceMappingURL=data:application/json;base64,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QUNIO0tBQ0Y7OztTQWhHVSxPQUFPOzs7OztBQW1HcEIsT0FBTyxDQUFDLEtBQUssR0FBRztBQUNkLFNBQU8sRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3pCLFNBQU8sRUFBRSxJQUFJO0FBQ2IsYUFBVyxFQUFFLENBQUM7QUFDZCxRQUFNLEVBQUUsQ0FBQztDQUNWLENBQUM7O0FBRUYsT0FBTyxDQUFDLEdBQUcsR0FBRztBQUNaLFNBQU8sRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3pCLFNBQU8sRUFBRSxJQUFJO0FBQ2IsYUFBVyxFQUFFLENBQUM7QUFDZCxRQUFNLEVBQUUsQ0FBQztDQUNWLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCB0eXBlIFdJZCA9IHtcbiAgc2l0ZTogbnVtYmVyO1xuICBoOiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBXQ2hhclJ1biA9IHtcbiAgc3RhcnRJZDogV0lkO1xuICB2aXNpYmxlOiBib29sZWFuO1xuICBzdGFydERlZ3JlZTogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBjbGFzcyBXU3RyaW5nIHtcbiAgc3RhdGljIHN0YXJ0OiBXQ2hhclJ1bjtcbiAgc3RhdGljIGVuZDogV0NoYXJSdW47XG4gIF9zaXRlSWQ6IG51bWJlcjtcbiAgX2xvY2FsSWQ6IG51bWJlcjtcbiAgX3N0cmluZzogQXJyYXk8V0NoYXJSdW4+O1xuXG4gIGNvbnN0cnVjdG9yKHNpdGVJZDogbnVtYmVyLCBsZW5ndGg6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLl9zaXRlSWQgPSBzaXRlSWQ7XG4gICAgdGhpcy5fbG9jYWxJZCA9IDE7XG4gICAgdGhpcy5fc3RyaW5nID0gW1dTdHJpbmcuc3RhcnQsIFdTdHJpbmcuZW5kXTtcbiAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fbG9jYWxJZCA9IGxlbmd0aDtcbiAgICAgIHRoaXMuaW5zZXJ0KFxuICAgICAgICAxLFxuICAgICAgICB7XG4gICAgICAgICAgc3RhcnRJZDoge1xuICAgICAgICAgICAgc2l0ZTogc2l0ZUlkLFxuICAgICAgICAgICAgaDogMSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgc3RhcnREZWdyZWU6IDEsXG4gICAgICAgICAgbGVuZ3RoOiBsZW5ndGgsXG4gICAgICAgIH0sXG4gICAgICAgIGxlbmd0aCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0KHBvczogbnVtYmVyLCBjOiBXQ2hhclJ1bikge1xuICAgIC8vIEZpbmQgdGhlIHJ1biB0aGF0IGhhcyB0aGUgcHJldmlvdXMgcG9zaXRpb24gaW4gaXQuXG4gICAgbGV0IGxlZnRIYWxmSW5kZXg7XG4gICAgbGV0IG9mZnNldCA9IHBvcztcbiAgICBmb3IgKGxlZnRIYWxmSW5kZXggPSAwOyBsZWZ0SGFsZkluZGV4IDwgdGhpcy5fc3RyaW5nLmxlbmd0aDsgbGVmdEhhbGZJbmRleCsrKSB7XG4gICAgICBpZiAodGhpcy5fc3RyaW5nW2xlZnRIYWxmSW5kZXhdLmxlbmd0aCA+PSBvZmZzZXQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBvZmZzZXQgLT0gdGhpcy5fc3RyaW5nW2xlZnRIYWxmSW5kZXhdLmxlbmd0aDtcbiAgICB9XG5cbiAgICBjb25zdCBsZWZ0SGFsZiA9IHRoaXMuX3N0cmluZ1tsZWZ0SGFsZkluZGV4XTtcblxuICAgIC8vIFRoZXJlIGFyZSAzIGNhc2VzIHdlIGhhbmRsZS4gQXNzdW1lIHRoZSBmb2xsb3dpbmcgcnVuXG4gICAgLy8gW2JlZ2luXVtpZDoxLDE7IGxlbjogMywgdmlzOiAxO11bZW5kXVxuICAgIC8vXG4gICAgLy8gVGhlIGZpcnN0IGNhc2UgaXMgd2hlcmUgd2UgY2FuIG1lcmVseSBleHRlbmQgdGhlIHByZXZpb3VzIHJ1blxuICAgIC8vIGluc2VydCg0LCB7aWQ6IDEsNDsgbGVuOiAxOyB2aXM6IDF9KVxuICAgIC8vXG4gICAgLy8gW2JlZ2luXVtpZDoxLDE7IGxlbjogMywgdmlzOiAxO10qaW5zZXJ0IGhlcmUqW2VuZF1cbiAgICAvLyA9PlxuICAgIC8vIFtiZWdpbl1baWQ6MSwxOyBsZW46ICo0KiwgdmlzOiAxO11bZW5kXVxuICAgIC8vXG4gICAgLy8gVGhlIG5leHQgY2FzZSBpcyB3aGVyZSB3ZSBhcmUgYXQgdGhlIGVuZCBidXQgY2Fubm9udCBleHRlbmQuXG4gICAgLy9cbiAgICAvLyBpbnNlcnQoNCwge2lkOiAqMiw3KjsgbGVuOiAxOyB2aXM6IDF9KVxuICAgIC8vXG4gICAgLy8gW2JlZ2luXVtpZDoxLDE7IGxlbjogMywgdmlzOiAxO10qaW5zZXJ0IGhlcmUqW2VuZF1cbiAgICAvLyA9PlxuICAgIC8vIFtiZWdpbl1baWQ6MSwxOyBsZW46IDMsIHZpczogMTtdW2lkOjIsNzsgbGVuOiAxLCB2aXM6IDE7XVtlbmRdXG4gICAgLy9cbiAgICAvLyBUaGUgbGFzdCBjYXNlIGlzIHdoZXJlIHdlIHNwbGl0IHRoZSBwcmV2aW91cyBydW4uXG4gICAgLy8gaW5zZXJ0KDMsIHtpZDogMSw0OyBsZW46IDE7IHZpczogMX0pXG4gICAgLy9cbiAgICAvLyBbYmVnaW5dW2lkOjEsMTsgbGVuOiA0LCB2aXM6IDE7XSo8PSBpbnNlcnQgaW5zaWRlIHRoZXJlKltlbmRdXG4gICAgLy8gPT5cbiAgICAvLyBbYmVnaW5dW2lkOjEsMTsgbGVuOiAyLCB2aXM6IDE7XVtpZDoxLDQ7IGxlbjogMSwgdmlzOiAxO11baWQ6MSwzOyBsZW46IDIsIHZpczogMTtdW2VuZF1cbiAgICBpZiAobGVmdEhhbGYuc3RhcnRJZC5zaXRlID09PSBjLnN0YXJ0SWQuc2l0ZVxuICAgICAgJiYgbGVmdEhhbGYuc3RhcnRJZC5oICA9PT0gYy5zdGFydElkLmggLSBsZWZ0SGFsZi5sZW5ndGhcbiAgICAgICYmIG9mZnNldCA9PT0gbGVmdEhhbGYubGVuZ3RoXG4gICAgICAmJiBjLnZpc2libGUgPT09IGxlZnRIYWxmLnZpc2libGUpIHtcbiAgICAgIGxlZnRIYWxmLmxlbmd0aCArPSBjLmxlbmd0aDtcbiAgICB9IGVsc2UgaWYgKG9mZnNldCA9PT0gbGVmdEhhbGYubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9zdHJpbmcuc3BsaWNlKFxuICAgICAgICBsZWZ0SGFsZkluZGV4ICsgMSxcbiAgICAgICAgMCxcbiAgICAgICAgYyxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJpZ2h0SGFsZiA9IHtcbiAgICAgICAgc3RhcnRJZDoge1xuICAgICAgICAgIHNpdGU6IGxlZnRIYWxmLnN0YXJ0SWQuc2l0ZSxcbiAgICAgICAgICBoOiBsZWZ0SGFsZi5zdGFydElkLmggKyBvZmZzZXQsXG4gICAgICAgIH0sXG4gICAgICAgIHZpc2libGU6IGxlZnRIYWxmLnZpc2libGUsXG4gICAgICAgIGxlbmd0aDogbGVmdEhhbGYubGVuZ3RoIC0gb2Zmc2V0LFxuICAgICAgICBzdGFydERlZ3JlZTogbGVmdEhhbGYuc3RhcnREZWdyZWUgKyBvZmZzZXQsXG4gICAgICB9O1xuXG4gICAgICBsZWZ0SGFsZi5sZW5ndGggLT0gbGVmdEhhbGYubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgdGhpcy5fc3RyaW5nLnNwbGljZShcbiAgICAgICAgbGVmdEhhbGZJbmRleCArIDEsXG4gICAgICAgIDAsXG4gICAgICAgIGMsXG4gICAgICAgIHJpZ2h0SGFsZixcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbldTdHJpbmcuc3RhcnQgPSB7XG4gIHN0YXJ0SWQ6IHtzaXRlOiAtMSwgaDogMH0sXG4gIHZpc2libGU6IHRydWUsXG4gIHN0YXJ0RGVncmVlOiAwLFxuICBsZW5ndGg6IDEsXG59O1xuXG5XU3RyaW5nLmVuZCA9IHtcbiAgc3RhcnRJZDoge3NpdGU6IC0xLCBoOiAxfSxcbiAgdmlzaWJsZTogdHJ1ZSxcbiAgc3RhcnREZWdyZWU6IDAsXG4gIGxlbmd0aDogMSxcbn07XG4iXX0=