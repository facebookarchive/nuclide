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
exports.provideGadgetsService = provideGadgetsService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
  activation.deactivate();
  activation = null;
}

function provideGadgetsService() {
  (0, _assert2['default'])(activation);
  return activation.provideGadgetsService();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWFzQixRQUFROzs7O0FBRTlCLElBQUksVUFBbUIsR0FBRyxJQUFJLENBQUM7O0FBRXhCLFNBQVMsUUFBUSxDQUFDLEtBQWMsRUFBRTtBQUN2QywyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNDLFlBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNwQzs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQiwyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixZQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDeEIsWUFBVSxHQUFHLElBQUksQ0FBQztDQUNuQjs7QUFFTSxTQUFTLHFCQUFxQixHQUFtQjtBQUN0RCwyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixTQUFPLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0NBQzNDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBHYWRnZXRzU2VydmljZSBmcm9tICcuL0dhZGdldHNTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5sZXQgYWN0aXZhdGlvbjogP09iamVjdCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiA9PSBudWxsKTtcbiAgY29uc3QgQWN0aXZhdGlvbiA9IHJlcXVpcmUoJy4vQWN0aXZhdGlvbicpO1xuICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICBhY3RpdmF0aW9uLmRlYWN0aXZhdGUoKTtcbiAgYWN0aXZhdGlvbiA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlR2FkZ2V0c1NlcnZpY2UoKTogR2FkZ2V0c1NlcnZpY2Uge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIHJldHVybiBhY3RpdmF0aW9uLnByb3ZpZGVHYWRnZXRzU2VydmljZSgpO1xufVxuIl19