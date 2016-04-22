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

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideApi = provideApi;
exports.serialize = serialize;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Activation = require('./Activation');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var activation = null;

function activate(state) {
  (0, _assert2['default'])(activation == null);
  activation = new _Activation.Activation(state);
}

function deactivate() {
  (0, _assert2['default'])(activation != null);
  activation.dispose();
  activation = null;
}

function provideApi() {
  (0, _assert2['default'])(activation != null);
  return activation.provideApi();
}

function serialize() {
  (0, _assert2['default'])(activation != null);
  return activation.serialize();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFheUIsY0FBYzs7c0JBQ2pCLFFBQVE7Ozs7QUFFOUIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFRO0FBQzdDLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixZQUFVLEdBQUcsMkJBQWUsS0FBSyxDQUFDLENBQUM7Q0FDcEM7O0FBRU0sU0FBUyxVQUFVLEdBQVM7QUFDakMsMkJBQVUsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzlCLFlBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFVLEdBQUcsSUFBSSxDQUFDO0NBQ25COztBQUVNLFNBQVMsVUFBVSxHQUFXO0FBQ25DLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixTQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztDQUNoQzs7QUFFTSxTQUFTLFNBQVMsR0FBVztBQUNsQywyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsU0FBTyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7Q0FDL0IiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDd2RBcGl9IGZyb20gJy4vQ3dkQXBpJztcblxuaW1wb3J0IHtBY3RpdmF0aW9ufSBmcm9tICcuL0FjdGl2YXRpb24nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gPT0gbnVsbCk7XG4gIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gIGFjdGl2YXRpb24gPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFwaSgpOiBDd2RBcGkge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24ucHJvdmlkZUFwaSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uICE9IG51bGwpO1xuICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbn1cbiJdfQ==