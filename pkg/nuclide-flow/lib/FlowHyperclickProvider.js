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

var _FlowServiceFactory = require('./FlowServiceFactory');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _constants = require('./constants');

var JS_GRAMMARS_SET = new Set(_constants.JS_GRAMMARS);

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

      var filePath = textEditor.getPath();
      if (filePath == null) {
        return null;
      }
      var position = range.start;

      var flowService = (0, _FlowServiceFactory.getFlowServiceByNuclideUri)(filePath);
      (0, _assert2['default'])(flowService);
      var location = yield flowService.flowFindDefinition(filePath, textEditor.getText(), position.row + 1, position.column + 1);
      if (location) {
        return {
          range: range,
          callback: function callback() {
            (0, _nuclideAtomHelpers.goToLocation)(location.file, location.point.line, location.point.column);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dIeXBlcmNsaWNrUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7OztrQ0FFVyxzQkFBc0I7O2tDQUNwQyw0QkFBNEI7O3lCQUU3QixhQUFhOztBQUN2QyxJQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsd0JBQWEsQ0FBQzs7SUFFdkMsc0JBQXNCO1dBQXRCLHNCQUFzQjswQkFBdEIsc0JBQXNCOzs7ZUFBdEIsc0JBQXNCOzs2QkFDQSxXQUFDLFVBQXNCLEVBQUUsSUFBWSxFQUFFLEtBQWlCLEVBQy9DO0FBQ2pDLFVBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUMzRCxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjtVQUNhLFFBQVEsR0FBSSxLQUFLLENBQXhCLEtBQUs7O0FBQ1osVUFBTSxXQUFXLEdBQUcsb0RBQTJCLFFBQVEsQ0FBQyxDQUFDO0FBQ3pELCtCQUFVLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZCLFVBQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUM3QixrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0YsVUFBSSxRQUFRLEVBQUU7QUFDWixlQUFPO0FBQ0wsZUFBSyxFQUFMLEtBQUs7QUFDTCxrQkFBUSxFQUFBLG9CQUFHO0FBQ1Qsa0RBQWEsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQ3pFO1NBQ0YsQ0FBQztPQUNILE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQTFCRyxzQkFBc0I7OztBQTZCNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyIsImZpbGUiOiJGbG93SHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7Z2V0Rmxvd1NlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4vRmxvd1NlcnZpY2VGYWN0b3J5JztcbmltcG9ydCB7Z29Ub0xvY2F0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbmltcG9ydCB7SlNfR1JBTU1BUlN9IGZyb20gJy4vY29uc3RhbnRzJztcbmNvbnN0IEpTX0dSQU1NQVJTX1NFVCA9IG5ldyBTZXQoSlNfR1JBTU1BUlMpO1xuXG5jbGFzcyBGbG93SHlwZXJjbGlja1Byb3ZpZGVyIHtcbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbkZvcldvcmQodGV4dEVkaXRvcjogVGV4dEVkaXRvciwgdGV4dDogc3RyaW5nLCByYW5nZTogYXRvbSRSYW5nZSk6XG4gICAgICBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIGlmICghSlNfR1JBTU1BUlNfU0VULmhhcyh0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChmaWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge3N0YXJ0OiBwb3NpdGlvbn0gPSByYW5nZTtcbiAgICBjb25zdCBmbG93U2VydmljZSA9IGdldEZsb3dTZXJ2aWNlQnlOdWNsaWRlVXJpKGZpbGVQYXRoKTtcbiAgICBpbnZhcmlhbnQoZmxvd1NlcnZpY2UpO1xuICAgIGNvbnN0IGxvY2F0aW9uID0gYXdhaXQgZmxvd1NlcnZpY2VcbiAgICAgICAgLmZsb3dGaW5kRGVmaW5pdGlvbihmaWxlUGF0aCwgdGV4dEVkaXRvci5nZXRUZXh0KCksIHBvc2l0aW9uLnJvdyArIDEsIHBvc2l0aW9uLmNvbHVtbiArIDEpO1xuICAgIGlmIChsb2NhdGlvbikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2UsXG4gICAgICAgIGNhbGxiYWNrKCkge1xuICAgICAgICAgIGdvVG9Mb2NhdGlvbihsb2NhdGlvbi5maWxlLCBsb2NhdGlvbi5wb2ludC5saW5lLCBsb2NhdGlvbi5wb2ludC5jb2x1bW4pO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmxvd0h5cGVyY2xpY2tQcm92aWRlcjtcbiJdfQ==