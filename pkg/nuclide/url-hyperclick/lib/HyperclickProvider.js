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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

// "urlregexp" uses the "g" flag. Since we only care about the first result,
// we make a copy of it w/o the "g" flag so we don't have to reset `lastIndex`
// after every use.
var urlregexp = RegExp(require('urlregexp').source);

var HyperclickProvider = (function () {
  function HyperclickProvider() {
    _classCallCheck(this, HyperclickProvider);

    this.wordRegExp = /[^\s]+/g;
    this.priority = 100;
    this.providerName = 'url-hyperclick';
  }

  _createClass(HyperclickProvider, [{
    key: 'getSuggestionForWord',
    value: _asyncToGenerator(function* (textEditor, text, range) {
      // The match is an array that also has an index property, something that Flow does not appear to

      var match = text.match(urlregexp);
      if (match == null) {
        return null;
      }

      var _match = _slicedToArray(match, 1);

      var url = _match[0];

      var index = match.index;
      var matchLength = url.length;

      // Update the range to include only what was matched
      var urlRange = new _atom.Range([range.start.row, range.start.column + index], [range.end.row, range.start.column + index + matchLength]);

      return {
        range: urlRange,
        callback: function callback() {
          var _require = require('shell');

          var openExternal = _require.openExternal;

          var validUrl = undefined;
          if (url.startsWith('http://') || url.startsWith('https://')) {
            validUrl = url;
          } else {
            // Now that we match urls like 'facebook.com', we have to prepend http:// to them for them to
            // open properly.
            validUrl = 'http://' + url;
          }
          openExternal(validUrl);
        }
      };
    })
  }]);

  return HyperclickProvider;
})();

exports.HyperclickProvider = HyperclickProvider;
// understand.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFhb0IsTUFBTTs7Ozs7QUFLMUIsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFekMsa0JBQWtCO0FBS2xCLFdBTEEsa0JBQWtCLEdBS2Y7MEJBTEgsa0JBQWtCOztBQU0zQixRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUNwQixRQUFJLENBQUMsWUFBWSxHQUFHLGdCQUFnQixDQUFDO0dBQ3RDOztlQVRVLGtCQUFrQjs7NkJBV0gsV0FDeEIsVUFBMkIsRUFDM0IsSUFBWSxFQUNaLEtBQWlCLEVBQ2U7OztBQUdoQyxVQUFNLEtBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pDLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixlQUFPLElBQUksQ0FBQztPQUNiOztrQ0FFYSxLQUFLOztVQUFaLEdBQUc7O0FBQ1YsVUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUMxQixVQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDOzs7QUFHL0IsVUFBTSxRQUFRLEdBQUcsZ0JBQ2YsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsRUFDN0MsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQzVELENBQUM7O0FBRUYsYUFBTztBQUNMLGFBQUssRUFBRSxRQUFRO0FBQ2YsZ0JBQVEsRUFBRSxvQkFBTTt5QkFDUyxPQUFPLENBQUMsT0FBTyxDQUFDOztjQUFoQyxZQUFZLFlBQVosWUFBWTs7QUFDbkIsY0FBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLGNBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzNELG9CQUFRLEdBQUcsR0FBRyxDQUFDO1dBQ2hCLE1BQU07OztBQUdMLG9CQUFRLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQztXQUM1QjtBQUNELHNCQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEI7T0FDRixDQUFDO0tBQ0g7OztTQWhEVSxrQkFBa0IiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcblxuLy8gXCJ1cmxyZWdleHBcIiB1c2VzIHRoZSBcImdcIiBmbGFnLiBTaW5jZSB3ZSBvbmx5IGNhcmUgYWJvdXQgdGhlIGZpcnN0IHJlc3VsdCxcbi8vIHdlIG1ha2UgYSBjb3B5IG9mIGl0IHcvbyB0aGUgXCJnXCIgZmxhZyBzbyB3ZSBkb24ndCBoYXZlIHRvIHJlc2V0IGBsYXN0SW5kZXhgXG4vLyBhZnRlciBldmVyeSB1c2UuXG5jb25zdCB1cmxyZWdleHAgPSBSZWdFeHAocmVxdWlyZSgndXJscmVnZXhwJykuc291cmNlKTtcblxuZXhwb3J0IGNsYXNzIEh5cGVyY2xpY2tQcm92aWRlciB7XG4gIHByaW9yaXR5OiBudW1iZXI7XG4gIHByb3ZpZGVyTmFtZTogc3RyaW5nO1xuICB3b3JkUmVnRXhwOiBSZWdFeHA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy53b3JkUmVnRXhwID0gL1teXFxzXSsvZztcbiAgICB0aGlzLnByaW9yaXR5ID0gMTAwO1xuICAgIHRoaXMucHJvdmlkZXJOYW1lID0gJ3VybC1oeXBlcmNsaWNrJztcbiAgfVxuXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb25Gb3JXb3JkKFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2VcbiAgKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICAvLyBUaGUgbWF0Y2ggaXMgYW4gYXJyYXkgdGhhdCBhbHNvIGhhcyBhbiBpbmRleCBwcm9wZXJ0eSwgc29tZXRoaW5nIHRoYXQgRmxvdyBkb2VzIG5vdCBhcHBlYXIgdG9cbiAgICAvLyB1bmRlcnN0YW5kLlxuICAgIGNvbnN0IG1hdGNoOiBhbnkgPSB0ZXh0Lm1hdGNoKHVybHJlZ2V4cCk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IFt1cmxdID0gbWF0Y2g7XG4gICAgY29uc3QgaW5kZXggPSBtYXRjaC5pbmRleDtcbiAgICBjb25zdCBtYXRjaExlbmd0aCA9IHVybC5sZW5ndGg7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHJhbmdlIHRvIGluY2x1ZGUgb25seSB3aGF0IHdhcyBtYXRjaGVkXG4gICAgY29uc3QgdXJsUmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5zdGFydC5jb2x1bW4gKyBpbmRleF0sXG4gICAgICBbcmFuZ2UuZW5kLnJvdywgICByYW5nZS5zdGFydC5jb2x1bW4gKyBpbmRleCArIG1hdGNoTGVuZ3RoXSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJhbmdlOiB1cmxSYW5nZSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtvcGVuRXh0ZXJuYWx9ID0gcmVxdWlyZSgnc2hlbGwnKTtcbiAgICAgICAgbGV0IHZhbGlkVXJsO1xuICAgICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJ2h0dHA6Ly8nKSB8fCB1cmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkge1xuICAgICAgICAgIHZhbGlkVXJsID0gdXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vdyB0aGF0IHdlIG1hdGNoIHVybHMgbGlrZSAnZmFjZWJvb2suY29tJywgd2UgaGF2ZSB0byBwcmVwZW5kIGh0dHA6Ly8gdG8gdGhlbSBmb3IgdGhlbSB0b1xuICAgICAgICAgIC8vIG9wZW4gcHJvcGVybHkuXG4gICAgICAgICAgdmFsaWRVcmwgPSAnaHR0cDovLycgKyB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgb3BlbkV4dGVybmFsKHZhbGlkVXJsKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxufVxuIl19