Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeToolBar = consumeToolBar;
exports.serialize = serialize;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var activation = null;

function activate(state) {
  (0, _assert2['default'])(activation == null);
  var Activation = require('./Activation');
  activation = new Activation(state);
}

function deactivate() {
  (0, _assert2['default'])(activation);
  activation.dispose();
  activation = null;
}

function consumeToolBar(getToolBar) {
  (0, _assert2['default'])(activation);
  activation.consumeToolBar(getToolBar);
}

function serialize() {
  (0, _assert2['default'])(activation);
  return activation.serialize();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQVdzQixRQUFROzs7O0FBRTlCLElBQUksVUFBbUIsR0FBRyxJQUFJLENBQUM7O0FBRXhCLFNBQVMsUUFBUSxDQUFDLEtBQWMsRUFBRTtBQUN2QywyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNDLFlBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNwQzs7QUFFTSxTQUFTLFVBQVUsR0FBUztBQUNqQywyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixZQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsWUFBVSxHQUFHLElBQUksQ0FBQztDQUNuQjs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxVQUFxQyxFQUFRO0FBQzFFLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFlBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDdkM7O0FBRU0sU0FBUyxTQUFTLEdBQVc7QUFDbEMsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7Q0FDL0IiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxubGV0IGFjdGl2YXRpb246ID9PYmplY3QgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gPT0gbnVsbCk7XG4gIGNvbnN0IEFjdGl2YXRpb24gPSByZXF1aXJlKCcuL0FjdGl2YXRpb24nKTtcbiAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gIGFjdGl2YXRpb24gPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIGFjdGl2YXRpb24uY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbn1cbiJdfQ==