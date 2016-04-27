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