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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var activation = null;

function activate(state) {
  (0, _assert2['default'])(activation == null);

  var _require = require('./Activation');

  var Activation = _require.Activation;

  activation = new Activation(state);
}

function deactivate() {
  (0, _assert2['default'])(activation != null);
  activation.dispose();
  activation = null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7QUFFOUIsSUFBSSxVQUEyQixHQUFHLElBQUksQ0FBQzs7QUFFaEMsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFRO0FBQzdDLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQzs7aUJBQ1QsT0FBTyxDQUFDLGNBQWMsQ0FBQzs7TUFBckMsVUFBVSxZQUFWLFVBQVU7O0FBQ2pCLFlBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNwQzs7QUFFTSxTQUFTLFVBQVUsR0FBUztBQUNqQywyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsWUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLFlBQVUsR0FBRyxJQUFJLENBQUM7Q0FDbkIiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtBY3RpdmF0aW9uIGFzIEFjdGl2YXRpb25UeXBlfSBmcm9tICcuL0FjdGl2YXRpb24nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvblR5cGUgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gPT0gbnVsbCk7XG4gIGNvbnN0IHtBY3RpdmF0aW9ufSA9IHJlcXVpcmUoJy4vQWN0aXZhdGlvbicpO1xuICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gIT0gbnVsbCk7XG4gIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICBhY3RpdmF0aW9uID0gbnVsbDtcbn1cbiJdfQ==