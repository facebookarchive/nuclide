var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _client = require('../../client');

var _atomHelpers = require('../../atom-helpers');

var _constantsJs = require('./constants.js');

var JS_GRAMMARS_SET = new Set(_constantsJs.JS_GRAMMARS);

var FlowHyperclickProvider = (function () {
  function FlowHyperclickProvider() {
    _classCallCheck(this, FlowHyperclickProvider);
  }

  _createClass(FlowHyperclickProvider, [{
    key: 'getSuggestionForWord',
    value: _asyncToGenerator(function* (textEditor, text, range) {
      if (!JS_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
        return null;
      }

      var file = textEditor.getPath();
      var position = range.start;

      var flowService = (0, _client.getServiceByNuclideUri)('FlowService', file);
      (0, _assert2['default'])(flowService);
      var location = yield flowService.flowFindDefinition(file, textEditor.getText(), position.row + 1, position.column + 1);
      if (location) {
        return {
          range: range,
          callback: function callback() {
            (0, _atomHelpers.goToLocation)(location.file, location.line, location.column);
          }
        };
      } else {
        return null;
      }
    })
  }]);

  return FlowHyperclickProvider;
})();

module.exports = FlowHyperclickProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dIeXBlcmNsaWNrUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7OztzQkFFTyxjQUFjOzsyQkFDeEIsb0JBQW9COzsyQkFFckIsZ0JBQWdCOztBQUMxQyxJQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsMEJBQWEsQ0FBQzs7SUFFdkMsc0JBQXNCO1dBQXRCLHNCQUFzQjswQkFBdEIsc0JBQXNCOzs7ZUFBdEIsc0JBQXNCOzs2QkFDQSxXQUFDLFVBQXNCLEVBQUUsSUFBWSxFQUFFLEtBQWlCLEVBQy9DO0FBQ2pDLFVBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUMzRCxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztVQUNwQixRQUFRLEdBQUksS0FBSyxDQUF4QixLQUFLOztBQUNaLFVBQU0sV0FBVyxHQUFHLG9DQUF1QixhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEUsK0JBQVUsV0FBVyxDQUFDLENBQUM7QUFDdkIsVUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQzdCLGtCQUFrQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMzRixVQUFJLFFBQVEsRUFBRTtBQUNaLGVBQU87QUFDTCxlQUFLLEVBQUwsS0FBSztBQUNMLGtCQUFRLEVBQUEsb0JBQUc7QUFDVCwyQ0FBYSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQzdEO1NBQ0YsQ0FBQztPQUNILE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQXZCRyxzQkFBc0I7OztBQTBCNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyIsImZpbGUiOiJGbG93SHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vY2xpZW50JztcbmltcG9ydCB7Z29Ub0xvY2F0aW9ufSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5pbXBvcnQge0pTX0dSQU1NQVJTfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5jb25zdCBKU19HUkFNTUFSU19TRVQgPSBuZXcgU2V0KEpTX0dSQU1NQVJTKTtcblxuY2xhc3MgRmxvd0h5cGVyY2xpY2tQcm92aWRlciB7XG4gIGFzeW5jIGdldFN1Z2dlc3Rpb25Gb3JXb3JkKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIHRleHQ6IHN0cmluZywgcmFuZ2U6IGF0b20kUmFuZ2UpOlxuICAgICAgUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICBpZiAoIUpTX0dSQU1NQVJTX1NFVC5oYXModGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHtzdGFydDogcG9zaXRpb259ID0gcmFuZ2U7XG4gICAgY29uc3QgZmxvd1NlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdGbG93U2VydmljZScsIGZpbGUpO1xuICAgIGludmFyaWFudChmbG93U2VydmljZSk7XG4gICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBmbG93U2VydmljZVxuICAgICAgICAuZmxvd0ZpbmREZWZpbml0aW9uKGZpbGUsIHRleHRFZGl0b3IuZ2V0VGV4dCgpLCBwb3NpdGlvbi5yb3cgKyAxLCBwb3NpdGlvbi5jb2x1bW4gKyAxKTtcbiAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlLFxuICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICBnb1RvTG9jYXRpb24obG9jYXRpb24uZmlsZSwgbG9jYXRpb24ubGluZSwgbG9jYXRpb24uY29sdW1uKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb3dIeXBlcmNsaWNrUHJvdmlkZXI7XG4iXX0=