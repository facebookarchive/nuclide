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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _FlowServiceFactory = require('./FlowServiceFactory');

var FlowOutlineProvider = (function () {
  function FlowOutlineProvider() {
    _classCallCheck(this, FlowOutlineProvider);
  }

  _createClass(FlowOutlineProvider, [{
    key: 'getOutline',
    value: _asyncToGenerator(function* (editor) {
      var filePath = editor.getPath();
      var flowService = undefined;
      if (filePath != null) {
        flowService = (0, _FlowServiceFactory.getFlowServiceByNuclideUri)(filePath);
      } else {
        flowService = (0, _FlowServiceFactory.getLocalFlowService)();
      }
      (0, _assert2['default'])(flowService != null);
      var flowOutline = yield flowService.flowGetOutline(editor.getText());
      if (flowOutline != null) {
        return flowOutlineToNormalOutline(flowOutline);
      } else {
        return null;
      }
    })
  }]);

  return FlowOutlineProvider;
})();

exports.FlowOutlineProvider = FlowOutlineProvider;

function flowOutlineToNormalOutline(flowOutline) {
  return {
    outlineTrees: flowOutline.map(flowTreeToNormalTree)
  };
}

function flowTreeToNormalTree(flowTree) {
  return {
    displayText: flowTree.displayText,
    startPosition: new _atom.Point(flowTree.startLine, flowTree.startColumn),
    children: flowTree.children.map(flowTreeToNormalTree)
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dPdXRsaW5lUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBaUJvQixNQUFNOztzQkFFSixRQUFROzs7O2tDQUt2QixzQkFBc0I7O0lBRWhCLG1CQUFtQjtXQUFuQixtQkFBbUI7MEJBQW5CLG1CQUFtQjs7O2VBQW5CLG1CQUFtQjs7NkJBQ2QsV0FBQyxNQUF1QixFQUFxQjtBQUMzRCxVQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsVUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsbUJBQVcsR0FBRyxvREFBMkIsUUFBUSxDQUFDLENBQUM7T0FDcEQsTUFBTTtBQUNMLG1CQUFXLEdBQUcsOENBQXFCLENBQUM7T0FDckM7QUFDRCwrQkFBVSxXQUFXLElBQUksSUFBSSxDQUFDLENBQUM7QUFDL0IsVUFBTSxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixlQUFPLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ2hELE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQWhCVSxtQkFBbUI7Ozs7O0FBbUJoQyxTQUFTLDBCQUEwQixDQUNqQyxXQUFtQyxFQUMxQjtBQUNULFNBQU87QUFDTCxnQkFBWSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUM7R0FDcEQsQ0FBQztDQUNIOztBQUVELFNBQVMsb0JBQW9CLENBQUMsUUFBUSxFQUFlO0FBQ25ELFNBQU87QUFDTCxlQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVc7QUFDakMsaUJBQWEsRUFBRSxnQkFBVSxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUM7QUFDbEUsWUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDO0dBQ3RELENBQUM7Q0FDSCIsImZpbGUiOiJGbG93T3V0bGluZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBPdXRsaW5lVHJlZSxcbiAgT3V0bGluZSxcbn0gZnJvbSAnLi4vLi4vb3V0bGluZS12aWV3JztcbmltcG9ydCB0eXBlIHtGbG93T3V0bGluZVRyZWV9IGZyb20gJy4uLy4uL2Zsb3ctYmFzZSc7XG5cbmltcG9ydCB7UG9pbnR9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7XG4gIGdldEZsb3dTZXJ2aWNlQnlOdWNsaWRlVXJpLFxuICBnZXRMb2NhbEZsb3dTZXJ2aWNlLFxufSBmcm9tICcuL0Zsb3dTZXJ2aWNlRmFjdG9yeSc7XG5cbmV4cG9ydCBjbGFzcyBGbG93T3V0bGluZVByb3ZpZGVyIHtcbiAgYXN5bmMgZ2V0T3V0bGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8P091dGxpbmU+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgbGV0IGZsb3dTZXJ2aWNlO1xuICAgIGlmIChmaWxlUGF0aCAhPSBudWxsKSB7XG4gICAgICBmbG93U2VydmljZSA9IGdldEZsb3dTZXJ2aWNlQnlOdWNsaWRlVXJpKGZpbGVQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxvd1NlcnZpY2UgPSBnZXRMb2NhbEZsb3dTZXJ2aWNlKCk7XG4gICAgfVxuICAgIGludmFyaWFudChmbG93U2VydmljZSAhPSBudWxsKTtcbiAgICBjb25zdCBmbG93T3V0bGluZSA9IGF3YWl0IGZsb3dTZXJ2aWNlLmZsb3dHZXRPdXRsaW5lKGVkaXRvci5nZXRUZXh0KCkpO1xuICAgIGlmIChmbG93T3V0bGluZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gZmxvd091dGxpbmVUb05vcm1hbE91dGxpbmUoZmxvd091dGxpbmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmxvd091dGxpbmVUb05vcm1hbE91dGxpbmUoXG4gIGZsb3dPdXRsaW5lOiBBcnJheTxGbG93T3V0bGluZVRyZWU+LFxuKTogT3V0bGluZSB7XG4gIHJldHVybiB7XG4gICAgb3V0bGluZVRyZWVzOiBmbG93T3V0bGluZS5tYXAoZmxvd1RyZWVUb05vcm1hbFRyZWUpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBmbG93VHJlZVRvTm9ybWFsVHJlZShmbG93VHJlZSk6IE91dGxpbmVUcmVlIHtcbiAgcmV0dXJuIHtcbiAgICBkaXNwbGF5VGV4dDogZmxvd1RyZWUuZGlzcGxheVRleHQsXG4gICAgc3RhcnRQb3NpdGlvbjogbmV3IFBvaW50KGZsb3dUcmVlLnN0YXJ0TGluZSwgZmxvd1RyZWUuc3RhcnRDb2x1bW4pLFxuICAgIGNoaWxkcmVuOiBmbG93VHJlZS5jaGlsZHJlbi5tYXAoZmxvd1RyZWVUb05vcm1hbFRyZWUpLFxuICB9O1xufVxuIl19