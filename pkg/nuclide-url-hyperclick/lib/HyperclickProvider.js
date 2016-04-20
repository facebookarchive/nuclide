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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

// "urlregexp" uses the "g" flag. Since we only care about the first result,
// we make a copy of it w/o the "g" flag so we don't have to reset `lastIndex`
// after every use.
var urlregexp = RegExp(require('urlregexp').source);

var HyperclickProvider = (function () {
  function HyperclickProvider() {
    _classCallCheck(this, HyperclickProvider);

    this.wordRegExp = /[^\s]+/g;
    // Allow all language-specific providers to take priority.
    this.priority = 5;
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
          var validUrl = undefined;
          if (url.startsWith('http://') || url.startsWith('https://')) {
            validUrl = url;
          } else {
            // Now that we match urls like 'facebook.com', we have to prepend http:// to them for them to
            // open properly.
            validUrl = 'http://' + url;
          }
          _shell2['default'].openExternal(validUrl);
        }
      };
    })
  }]);

  return HyperclickProvider;
})();

exports.HyperclickProvider = HyperclickProvider;
// understand.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWFvQixNQUFNOztxQkFDUixPQUFPOzs7Ozs7O0FBS3pCLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7O0lBRXpDLGtCQUFrQjtBQUtsQixXQUxBLGtCQUFrQixHQUtmOzBCQUxILGtCQUFrQjs7QUFNM0IsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7O0FBRTVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxZQUFZLEdBQUcsZ0JBQWdCLENBQUM7R0FDdEM7O2VBVlUsa0JBQWtCOzs2QkFZSCxXQUN4QixVQUEyQixFQUMzQixJQUFZLEVBQ1osS0FBaUIsRUFDZTs7O0FBR2hDLFVBQU0sS0FBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekMsVUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O2tDQUVhLEtBQUs7O1VBQVosR0FBRzs7QUFDVixVQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzFCLFVBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7OztBQUcvQixVQUFNLFFBQVEsR0FBRyxnQkFDZixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxFQUM3QyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FDNUQsQ0FBQzs7QUFFRixhQUFPO0FBQ0wsYUFBSyxFQUFFLFFBQVE7QUFDZixnQkFBUSxFQUFFLG9CQUFNO0FBQ2QsY0FBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLGNBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzNELG9CQUFRLEdBQUcsR0FBRyxDQUFDO1dBQ2hCLE1BQU07OztBQUdMLG9CQUFRLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQztXQUM1QjtBQUNELDZCQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM5QjtPQUNGLENBQUM7S0FDSDs7O1NBaERVLGtCQUFrQiIsImZpbGUiOiJIeXBlcmNsaWNrUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1N1Z2dlc3Rpb259IGZyb20gJy4uLy4uL2h5cGVyY2xpY2snO1xuXG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5cbi8vIFwidXJscmVnZXhwXCIgdXNlcyB0aGUgXCJnXCIgZmxhZy4gU2luY2Ugd2Ugb25seSBjYXJlIGFib3V0IHRoZSBmaXJzdCByZXN1bHQsXG4vLyB3ZSBtYWtlIGEgY29weSBvZiBpdCB3L28gdGhlIFwiZ1wiIGZsYWcgc28gd2UgZG9uJ3QgaGF2ZSB0byByZXNldCBgbGFzdEluZGV4YFxuLy8gYWZ0ZXIgZXZlcnkgdXNlLlxuY29uc3QgdXJscmVnZXhwID0gUmVnRXhwKHJlcXVpcmUoJ3VybHJlZ2V4cCcpLnNvdXJjZSk7XG5cbmV4cG9ydCBjbGFzcyBIeXBlcmNsaWNrUHJvdmlkZXIge1xuICBwcmlvcml0eTogbnVtYmVyO1xuICBwcm92aWRlck5hbWU6IHN0cmluZztcbiAgd29yZFJlZ0V4cDogUmVnRXhwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMud29yZFJlZ0V4cCA9IC9bXlxcc10rL2c7XG4gICAgLy8gQWxsb3cgYWxsIGxhbmd1YWdlLXNwZWNpZmljIHByb3ZpZGVycyB0byB0YWtlIHByaW9yaXR5LlxuICAgIHRoaXMucHJpb3JpdHkgPSA1O1xuICAgIHRoaXMucHJvdmlkZXJOYW1lID0gJ3VybC1oeXBlcmNsaWNrJztcbiAgfVxuXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb25Gb3JXb3JkKFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2VcbiAgKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICAvLyBUaGUgbWF0Y2ggaXMgYW4gYXJyYXkgdGhhdCBhbHNvIGhhcyBhbiBpbmRleCBwcm9wZXJ0eSwgc29tZXRoaW5nIHRoYXQgRmxvdyBkb2VzIG5vdCBhcHBlYXIgdG9cbiAgICAvLyB1bmRlcnN0YW5kLlxuICAgIGNvbnN0IG1hdGNoOiBhbnkgPSB0ZXh0Lm1hdGNoKHVybHJlZ2V4cCk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IFt1cmxdID0gbWF0Y2g7XG4gICAgY29uc3QgaW5kZXggPSBtYXRjaC5pbmRleDtcbiAgICBjb25zdCBtYXRjaExlbmd0aCA9IHVybC5sZW5ndGg7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHJhbmdlIHRvIGluY2x1ZGUgb25seSB3aGF0IHdhcyBtYXRjaGVkXG4gICAgY29uc3QgdXJsUmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5zdGFydC5jb2x1bW4gKyBpbmRleF0sXG4gICAgICBbcmFuZ2UuZW5kLnJvdywgICByYW5nZS5zdGFydC5jb2x1bW4gKyBpbmRleCArIG1hdGNoTGVuZ3RoXSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJhbmdlOiB1cmxSYW5nZSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIGxldCB2YWxpZFVybDtcbiAgICAgICAgaWYgKHVybC5zdGFydHNXaXRoKCdodHRwOi8vJykgfHwgdXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykpIHtcbiAgICAgICAgICB2YWxpZFVybCA9IHVybDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBOb3cgdGhhdCB3ZSBtYXRjaCB1cmxzIGxpa2UgJ2ZhY2Vib29rLmNvbScsIHdlIGhhdmUgdG8gcHJlcGVuZCBodHRwOi8vIHRvIHRoZW0gZm9yIHRoZW0gdG9cbiAgICAgICAgICAvLyBvcGVuIHByb3Blcmx5LlxuICAgICAgICAgIHZhbGlkVXJsID0gJ2h0dHA6Ly8nICsgdXJsO1xuICAgICAgICB9XG4gICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbCh2YWxpZFVybCk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cbiJdfQ==