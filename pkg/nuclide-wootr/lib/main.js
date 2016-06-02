Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// Represents a concrete change to a string.  That is, the result of applying
// the WOp to the local string.

function idLess(idLeft, idRight) {
  return idLeft.site < idRight.site || idLeft.site === idRight.site && idLeft.h < idRight.h;
}

var WString = (function () {
  function WString(siteId) {
    var length = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, WString);

    this._siteId = siteId;
    this._localId = 1;
    this._string = [WString.start, WString.end];
    this._ops = [];
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
  }, {
    key: 'canMergeRight',
    value: function canMergeRight(i) {
      (0, (_assert2 || _assert()).default)(i < this._string.length - 1);
      return this._string[i].startId.site === this._string[i + 1].startId.site && this._string[i].startId.h === this._string[i + 1].startId.h - this._string[i].length && this._string[i].visible === this._string[i + 1].visible;
    }
  }, {
    key: 'mergeRuns',
    value: function mergeRuns() {
      var newString = [];
      newString.push(this._string[0]);
      for (var i = 0; i < this._string.length - 1; i++) {
        if (this.canMergeRight(i)) {
          newString[newString.length - 1].length += this._string[i + 1].length;
        } else {
          newString.push(this._string[i + 1]);
        }
      }
      this._string = newString;
    }
  }, {
    key: 'integrateDelete',
    value: function integrateDelete(pos) {
      var _string;

      var originalIndex = undefined;
      var offset = pos;

      // Find the index of the WString run containing this position
      for (originalIndex = 0; originalIndex < this._string.length; originalIndex++) {
        if (this._string[originalIndex].length > offset && this._string[originalIndex].visible) {
          break;
        }
        if (this._string[originalIndex].visible) {
          offset -= this._string[originalIndex].length;
        }
      }

      var runs = [];

      var original = this._string[originalIndex];

      if (offset > 0) {
        runs.push({
          startId: {
            site: original.startId.site,
            h: original.startId.h
          },
          visible: original.visible,
          length: offset,
          startDegree: original.startDegree
        });
      }

      runs.push({
        startId: {
          site: original.startId.site,
          h: original.startId.h + offset
        },
        visible: false,
        length: 1,
        startDegree: original.startDegree + offset
      });

      if (offset < original.length - 1) {
        runs.push({
          startId: {
            site: original.startId.site,
            h: original.startId.h + offset + 1
          },
          visible: original.visible,
          length: original.length - (offset + 1),
          startDegree: original.startDegree + offset + 1
        });
      }

      (_string = this._string).splice.apply(_string, [originalIndex, 1].concat(runs));

      this.mergeRuns();
    }
  }, {
    key: 'pos',
    value: function pos(c) {
      var visibleOnly = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var currentOffset = 0;

      for (var i = 0; i < this._string.length; i++) {
        var currentRun = this._string[i];
        if (currentRun.startId.site === c.id.site && currentRun.startId.h <= c.id.h && currentRun.startId.h + currentRun.length > c.id.h && (!visibleOnly || this._string[i].visible)) {
          return currentOffset + (c.id.h - currentRun.startId.h);
        }
        if (!visibleOnly || this._string[i].visible) {
          currentOffset += currentRun.length;
        }
      }
      return -1;
    }
  }, {
    key: 'charFromRun',
    value: function charFromRun(run, offset) {
      return {
        id: {
          site: run.startId.site,
          h: run.startId.h + offset
        },
        degree: run.startDegree + offset,
        visible: run.visible
      };
    }
  }, {
    key: 'ith',
    value: function ith(pos) {
      var visibleOnly = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var i = undefined;
      var offset = pos;

      for (i = 0; i < this._string.length; i++) {
        if (this._string[i].length > offset && (!visibleOnly || this._string[i].visible)) {
          break;
        }
        if (!visibleOnly || this._string[i].visible) {
          offset -= this._string[i].length;
        }
      }

      return this.charFromRun(this._string[i], offset);
    }

    /**
     * Returns the subset (left, right) of the string sequence (exlusive on both sides)
     */
  }, {
    key: 'subseq',
    value: function subseq(left, right) {
      var sub = [];
      if (left == null || right == null) {
        throw new Error('asdf');
      }
      var start = this.pos(left, false);
      var end = this.pos(right, false);

      for (var i = start + 1; i < end; i++) {
        sub.push(this.ith(i, false));
      }

      return sub;
    }
  }, {
    key: 'genInsert',
    value: function genInsert(pos, text) {
      var prevChar = this.ith(pos);
      var nextChar = this.ith(pos + 1);

      if (prevChar == null || nextChar == null) {
        throw new Error('Position ' + pos + ' invalid within wstring');
      }

      var c = {
        startId: {
          site: this._siteId,
          h: this._localId
        },
        visible: true,
        startDegree: Math.max(prevChar.degree, nextChar.degree) + 1,
        length: text.length
      };
      this._localId += text.length;

      this.integrateIns(c, prevChar, nextChar);

      return { type: 'INS', char: _extends({}, c), prev: prevChar, next: nextChar, text: text };
    }

    // Main wooto algorithm. see: "Wooki: a P2P Wiki-based Collaborative Writing Tool"
    // returns the visible position of the string that this text is inserted into
  }, {
    key: 'integrateIns',
    value: function integrateIns(c, cp, cn) {
      // Consider the sequence of characters between cp, and cn
      var sub = this.subseq(cp, cn);
      // If this is an empty sequence just insert the character
      if (sub.length === 0) {
        var _pos = this.pos(cn);
        this.insert(_pos, c);
        return this.pos(this.charFromRun(c, 0), true);
      }

      // Else, only consider the characters with minimum degree.  Other characters
      // positions in the sequence are determing by the order relations.
      var minDegree = Math.min.apply(Math, _toConsumableArray(sub.map(function (c2) {
        return c2.degree;
      })));
      var idOrderedSubset = [cp].concat(_toConsumableArray(sub.filter(function (c2) {
        return c2.degree === minDegree;
      })), [cn]);

      // Find the position of the new character in this sequence of characters
      // ordered by the ids
      var i = idOrderedSubset.findIndex(function (elm) {
        return !idLess(elm.id, c.startId);
      });
      if (i === -1) {
        i = idOrderedSubset.length - 1;
      }
      return this.integrateIns(c, idOrderedSubset[i - 1], idOrderedSubset[i]);
    }
  }, {
    key: 'charToRun',
    value: function charToRun(char, visible) {
      return {
        startId: {
          site: char.id.site,
          h: char.id.h
        },
        startDegree: char.degree,
        visible: visible,
        length: 1
      };
    }
  }, {
    key: 'canExtendRun',
    value: function canExtendRun(run, char) {
      return run.startId.site === char.id.site && run.startId.h + run.length === char.id.h && run.startDegree + run.length === char.degree;
    }
  }, {
    key: 'charsToRuns',
    value: function charsToRuns(chars) {
      if (chars.length === 0) {
        return [];
      }

      var runs = [];
      var curRun = this.charToRun(chars[0], false);

      for (var i = 1; i < chars.length; i++) {
        if (this.canExtendRun(curRun, chars[i])) {
          curRun.length += 1;
        } else {
          runs.push(curRun);
          curRun = this.charToRun(chars[i], false);
        }
      }

      runs.push(curRun);

      return runs;
    }
  }, {
    key: 'genDelete',
    value: function genDelete(pos) {
      var count = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      var chars = [];
      for (var i = 0; i < count; i++) {
        chars.push(this.ith(pos + 1));
        this.integrateDelete(pos + 1);
      }

      return { type: 'DEL', runs: this.charsToRuns(chars) };
    }
  }, {
    key: 'visibleRanges',
    value: function visibleRanges(runs) {
      var pos = -1;
      var count = 1;
      var ranges = [];
      for (var i = 0; i < runs.length; i++) {
        for (var j = 0; j < runs[i].length; j++) {
          var wchar = this.charFromRun(runs[i], j);
          var newPos = this.pos(wchar, /* visibleOnly */true);
          // Skip invisible characters
          if (newPos === -1) {
            continue;
          }
          if (pos + count === newPos) {
            count += 1;
          } else {
            if (pos > 0) {
              ranges.push({ pos: pos, count: count });
            }
            count = 1;
            pos = newPos;
          }
        }
      }
      if (pos > 0) {
        ranges.push({ pos: pos, count: count });
      }

      return ranges;
    }
  }, {
    key: 'applyOps',
    value: function applyOps() {
      var _this = this;

      var changes = [];
      var lastCount = this._ops.length + 1;

      while (lastCount > this._ops.length) {
        lastCount = this._ops.length;
        this._ops = this._ops.filter(function (op) {
          if (_this.canApplyOp(op)) {
            changes.push(_this.execute(op));
            return false;
          }
          return true;
        });
      }

      return changes;
    }
  }, {
    key: 'receive',
    value: function receive(op) {
      if (op.type === 'INS') {
        (0, (_assert2 || _assert()).default)(op.char != null);
        if (this.contains(this.charFromRun(op.char, 0))) {
          return [];
        }
      }

      this._ops.push(op);

      return this.applyOps();
    }
  }, {
    key: 'canApplyOp',
    value: function canApplyOp(op) {
      if (op.type === 'INS') {
        var _prev = op.prev;
        var _next = op.next;

        (0, (_assert2 || _assert()).default)(_prev != null && _next != null);
        return this.contains(_prev) && this.contains(_next);
      } else {
        // DEL
        (0, (_assert2 || _assert()).default)(op.runs != null);
        for (var i = 0; i < op.runs.length; i++) {
          for (var j = 0; j < op.runs[i].length; j++) {
            if (!this.contains(this.charFromRun(op.runs[i], j))) {
              return false;
            }
          }
        }
        return true;
      }
    }
  }, {
    key: 'contains',
    value: function contains(c) {
      if (this.pos(c, false) !== -1) {
        return true;
      }
      return false;
    }
  }, {
    key: 'execute',
    value: function execute(op) {
      var next = op.next;
      var prev = op.prev;

      if (op.type === 'INS') {
        if (next == null || prev == null || op.char == null || op.text == null) {
          throw new Error('INS type operation invalid.');
        }

        var _pos2 = this.integrateIns(op.char, prev, next);
        (0, (_assert2 || _assert()).default)(op.text);
        return { addition: { pos: _pos2, text: op.text } };
      } else {
        //DEL
        if (op.runs == null) {
          throw new Error('DEL operation invalid');
        }

        var ranges = this.visibleRanges(op.runs);

        for (var i = 0; i < ranges.length; i++) {
          for (var j = 0; j < ranges[i].count; j++) {
            this.integrateDelete(ranges[i].pos);
          }
        }
        return { removals: ranges };
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