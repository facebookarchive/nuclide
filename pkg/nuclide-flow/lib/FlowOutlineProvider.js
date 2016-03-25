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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dPdXRsaW5lUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBaUJvQixNQUFNOztzQkFFSixRQUFROzs7O2tDQUt2QixzQkFBc0I7O0lBRWhCLG1CQUFtQjtXQUFuQixtQkFBbUI7MEJBQW5CLG1CQUFtQjs7O2VBQW5CLG1CQUFtQjs7NkJBQ2QsV0FBQyxNQUF1QixFQUFxQjtBQUMzRCxVQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsVUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsbUJBQVcsR0FBRyxvREFBMkIsUUFBUSxDQUFDLENBQUM7T0FDcEQsTUFBTTtBQUNMLG1CQUFXLEdBQUcsOENBQXFCLENBQUM7T0FDckM7QUFDRCwrQkFBVSxXQUFXLElBQUksSUFBSSxDQUFDLENBQUM7QUFDL0IsVUFBTSxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixlQUFPLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ2hELE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQWhCVSxtQkFBbUI7Ozs7O0FBbUJoQyxTQUFTLDBCQUEwQixDQUNqQyxXQUFtQyxFQUMxQjtBQUNULFNBQU87QUFDTCxnQkFBWSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUM7R0FDcEQsQ0FBQztDQUNIOztBQUVELFNBQVMsb0JBQW9CLENBQUMsUUFBUSxFQUFlO0FBQ25ELFNBQU87QUFDTCxlQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVc7QUFDakMsaUJBQWEsRUFBRSxnQkFBVSxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUM7QUFDbEUsWUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDO0dBQ3RELENBQUM7Q0FDSCIsImZpbGUiOiJGbG93T3V0bGluZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBPdXRsaW5lVHJlZSxcbiAgT3V0bGluZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vdXRsaW5lLXZpZXcnO1xuaW1wb3J0IHR5cGUge0Zsb3dPdXRsaW5lVHJlZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1mbG93LWJhc2UnO1xuXG5pbXBvcnQge1BvaW50fSBmcm9tICdhdG9tJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge1xuICBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaSxcbiAgZ2V0TG9jYWxGbG93U2VydmljZSxcbn0gZnJvbSAnLi9GbG93U2VydmljZUZhY3RvcnknO1xuXG5leHBvcnQgY2xhc3MgRmxvd091dGxpbmVQcm92aWRlciB7XG4gIGFzeW5jIGdldE91dGxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPD9PdXRsaW5lPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGxldCBmbG93U2VydmljZTtcbiAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCkge1xuICAgICAgZmxvd1NlcnZpY2UgPSBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaShmaWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZsb3dTZXJ2aWNlID0gZ2V0TG9jYWxGbG93U2VydmljZSgpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQoZmxvd1NlcnZpY2UgIT0gbnVsbCk7XG4gICAgY29uc3QgZmxvd091dGxpbmUgPSBhd2FpdCBmbG93U2VydmljZS5mbG93R2V0T3V0bGluZShlZGl0b3IuZ2V0VGV4dCgpKTtcbiAgICBpZiAoZmxvd091dGxpbmUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZsb3dPdXRsaW5lVG9Ob3JtYWxPdXRsaW5lKGZsb3dPdXRsaW5lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZsb3dPdXRsaW5lVG9Ob3JtYWxPdXRsaW5lKFxuICBmbG93T3V0bGluZTogQXJyYXk8Rmxvd091dGxpbmVUcmVlPixcbik6IE91dGxpbmUge1xuICByZXR1cm4ge1xuICAgIG91dGxpbmVUcmVlczogZmxvd091dGxpbmUubWFwKGZsb3dUcmVlVG9Ob3JtYWxUcmVlKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmxvd1RyZWVUb05vcm1hbFRyZWUoZmxvd1RyZWUpOiBPdXRsaW5lVHJlZSB7XG4gIHJldHVybiB7XG4gICAgZGlzcGxheVRleHQ6IGZsb3dUcmVlLmRpc3BsYXlUZXh0LFxuICAgIHN0YXJ0UG9zaXRpb246IG5ldyBQb2ludChmbG93VHJlZS5zdGFydExpbmUsIGZsb3dUcmVlLnN0YXJ0Q29sdW1uKSxcbiAgICBjaGlsZHJlbjogZmxvd1RyZWUuY2hpbGRyZW4ubWFwKGZsb3dUcmVlVG9Ob3JtYWxUcmVlKSxcbiAgfTtcbn1cbiJdfQ==