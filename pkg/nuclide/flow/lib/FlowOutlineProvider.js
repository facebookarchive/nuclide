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

var FlowOutlineProvider = (function () {
  function FlowOutlineProvider() {
    _classCallCheck(this, FlowOutlineProvider);
  }

  _createClass(FlowOutlineProvider, [{
    key: 'getOutline',
    value: _asyncToGenerator(function* (editor) {
      var filePath = editor.getPath();
      var flowService = require('../../client').getServiceByNuclideUri('FlowService', filePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dPdXRsaW5lUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBaUJvQixNQUFNOztzQkFFSixRQUFROzs7O0lBRWpCLG1CQUFtQjtXQUFuQixtQkFBbUI7MEJBQW5CLG1CQUFtQjs7O2VBQW5CLG1CQUFtQjs7NkJBQ2QsV0FBQyxNQUF1QixFQUFxQjtBQUMzRCxVQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsVUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM1RiwrQkFBVSxXQUFXLElBQUksSUFBSSxDQUFDLENBQUM7QUFDL0IsVUFBTSxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixlQUFPLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ2hELE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQVhVLG1CQUFtQjs7Ozs7QUFjaEMsU0FBUywwQkFBMEIsQ0FDakMsV0FBbUMsRUFDMUI7QUFDVCxTQUFPO0FBQ0wsZ0JBQVksRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDO0dBQ3BELENBQUM7Q0FDSDs7QUFFRCxTQUFTLG9CQUFvQixDQUFDLFFBQVEsRUFBZTtBQUNuRCxTQUFPO0FBQ0wsZUFBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO0FBQ2pDLGlCQUFhLEVBQUUsZ0JBQVUsUUFBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDO0FBQ2xFLFlBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztHQUN0RCxDQUFDO0NBQ0giLCJmaWxlIjoiRmxvd091dGxpbmVQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgT3V0bGluZVRyZWUsXG4gIE91dGxpbmUsXG59IGZyb20gJy4uLy4uL291dGxpbmUtdmlldyc7XG5pbXBvcnQgdHlwZSB7Rmxvd091dGxpbmVUcmVlfSBmcm9tICcuLi8uLi9mbG93LWJhc2UnO1xuXG5pbXBvcnQge1BvaW50fSBmcm9tICdhdG9tJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgY2xhc3MgRmxvd091dGxpbmVQcm92aWRlciB7XG4gIGFzeW5jIGdldE91dGxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPD9PdXRsaW5lPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IGZsb3dTZXJ2aWNlID0gcmVxdWlyZSgnLi4vLi4vY2xpZW50JykuZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmxvd1NlcnZpY2UnLCBmaWxlUGF0aCk7XG4gICAgaW52YXJpYW50KGZsb3dTZXJ2aWNlICE9IG51bGwpO1xuICAgIGNvbnN0IGZsb3dPdXRsaW5lID0gYXdhaXQgZmxvd1NlcnZpY2UuZmxvd0dldE91dGxpbmUoZWRpdG9yLmdldFRleHQoKSk7XG4gICAgaWYgKGZsb3dPdXRsaW5lICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBmbG93T3V0bGluZVRvTm9ybWFsT3V0bGluZShmbG93T3V0bGluZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmbG93T3V0bGluZVRvTm9ybWFsT3V0bGluZShcbiAgZmxvd091dGxpbmU6IEFycmF5PEZsb3dPdXRsaW5lVHJlZT4sXG4pOiBPdXRsaW5lIHtcbiAgcmV0dXJuIHtcbiAgICBvdXRsaW5lVHJlZXM6IGZsb3dPdXRsaW5lLm1hcChmbG93VHJlZVRvTm9ybWFsVHJlZSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGZsb3dUcmVlVG9Ob3JtYWxUcmVlKGZsb3dUcmVlKTogT3V0bGluZVRyZWUge1xuICByZXR1cm4ge1xuICAgIGRpc3BsYXlUZXh0OiBmbG93VHJlZS5kaXNwbGF5VGV4dCxcbiAgICBzdGFydFBvc2l0aW9uOiBuZXcgUG9pbnQoZmxvd1RyZWUuc3RhcnRMaW5lLCBmbG93VHJlZS5zdGFydENvbHVtbiksXG4gICAgY2hpbGRyZW46IGZsb3dUcmVlLmNoaWxkcmVuLm1hcChmbG93VHJlZVRvTm9ybWFsVHJlZSksXG4gIH07XG59XG4iXX0=