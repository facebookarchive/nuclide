Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('events');

var EventEmitter = _require.EventEmitter;

/**
 * @param pathFromSubscriptionRootToSubscriptionPath The relative path from
 *   subscriptionRoot to subscriptionPath. This is the 'relative_path' as described at
 *   https://facebook.github.io/watchman/docs/cmd/watch-project.html#using-watch-project.
 *   Notably, this value should be undefined if subscriptionRoot is the same as
 *   subscriptionPath.
 */

var WatchmanSubscription = (function (_EventEmitter) {
  _inherits(WatchmanSubscription, _EventEmitter);

  function WatchmanSubscription(subscriptionRoot, pathFromSubscriptionRootToSubscriptionPath, subscriptionPath, subscriptionName, subscriptionCount, subscriptionOptions) {
    _classCallCheck(this, WatchmanSubscription);

    _get(Object.getPrototypeOf(WatchmanSubscription.prototype), 'constructor', this).call(this);
    this.root = subscriptionRoot;
    this.pathFromSubscriptionRootToSubscriptionPath = pathFromSubscriptionRootToSubscriptionPath;
    this.path = subscriptionPath;
    this.name = subscriptionName;
    this.subscriptionCount = subscriptionCount;
    this.options = subscriptionOptions;
  }

  return WatchmanSubscription;
})(EventEmitter);

module.exports = WatchmanSubscription;
// e.g. ['match', '*.js'],
// e.g. ['name', 'size', 'exists', 'mode']
// e.g. ['dirname', relativePath]
// e.g. "c:1439492655:58601:1:14195"
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldhdGNobWFuU3Vic2NyaXB0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQVd1QixPQUFPLENBQUMsUUFBUSxDQUFDOztJQUFqQyxZQUFZLFlBQVosWUFBWTs7Ozs7Ozs7OztJQWlCYixvQkFBb0I7WUFBcEIsb0JBQW9COztBQU9iLFdBUFAsb0JBQW9CLENBUXBCLGdCQUF3QixFQUN4QiwwQ0FBbUQsRUFDbkQsZ0JBQXdCLEVBQ3hCLGdCQUF3QixFQUN4QixpQkFBeUIsRUFDekIsbUJBQWdELEVBQzlDOzBCQWRGLG9CQUFvQjs7QUFldEIsK0JBZkUsb0JBQW9CLDZDQWVkO0FBQ1IsUUFBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztBQUM3QixRQUFJLENBQUMsMENBQTBDLEdBQUcsMENBQTBDLENBQUM7QUFDN0YsUUFBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztBQUM3QixRQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0FBQzdCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztBQUMzQyxRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDO0dBQ3BDOztTQXRCRyxvQkFBb0I7R0FBUyxZQUFZOztBQXdCL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyIsImZpbGUiOiJXYXRjaG1hblN1YnNjcmlwdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5cbmV4cG9ydCB0eXBlIFdhdGNobWFuU3Vic2NyaXB0aW9uT3B0aW9ucyA9IHtcbiAgZXhwcmVzc2lvbjogP0FycmF5PHN0cmluZz47IC8vIGUuZy4gWydtYXRjaCcsICcqLmpzJ10sXG4gIGZpZWxkczogP0FycmF5PHN0cmluZz47IC8vIGUuZy4gWyduYW1lJywgJ3NpemUnLCAnZXhpc3RzJywgJ21vZGUnXVxuICBleHByZXNzaW9uPzogQXJyYXk8bWl4ZWQ+OyAvLyBlLmcuIFsnZGlybmFtZScsIHJlbGF0aXZlUGF0aF1cbiAgc2luY2U/OiBzdHJpbmc7IC8vIGUuZy4gXCJjOjE0Mzk0OTI2NTU6NTg2MDE6MToxNDE5NVwiXG4gIGRlZmVyX3Zjcz86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIEBwYXJhbSBwYXRoRnJvbVN1YnNjcmlwdGlvblJvb3RUb1N1YnNjcmlwdGlvblBhdGggVGhlIHJlbGF0aXZlIHBhdGggZnJvbVxuICogICBzdWJzY3JpcHRpb25Sb290IHRvIHN1YnNjcmlwdGlvblBhdGguIFRoaXMgaXMgdGhlICdyZWxhdGl2ZV9wYXRoJyBhcyBkZXNjcmliZWQgYXRcbiAqICAgaHR0cHM6Ly9mYWNlYm9vay5naXRodWIuaW8vd2F0Y2htYW4vZG9jcy9jbWQvd2F0Y2gtcHJvamVjdC5odG1sI3VzaW5nLXdhdGNoLXByb2plY3QuXG4gKiAgIE5vdGFibHksIHRoaXMgdmFsdWUgc2hvdWxkIGJlIHVuZGVmaW5lZCBpZiBzdWJzY3JpcHRpb25Sb290IGlzIHRoZSBzYW1lIGFzXG4gKiAgIHN1YnNjcmlwdGlvblBhdGguXG4gKi9cbmNsYXNzIFdhdGNobWFuU3Vic2NyaXB0aW9uIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgc3Vic2NyaXB0aW9uQ291bnQ6IG51bWJlcjtcbiAgcm9vdDogc3RyaW5nO1xuICBwYXRoOiBzdHJpbmc7XG4gIHBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvU3Vic2NyaXB0aW9uUGF0aDogP3N0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBvcHRpb25zOiBXYXRjaG1hblN1YnNjcmlwdGlvbk9wdGlvbnM7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3Vic2NyaXB0aW9uUm9vdDogc3RyaW5nLFxuICAgICAgcGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9TdWJzY3JpcHRpb25QYXRoOiA/c3RyaW5nLFxuICAgICAgc3Vic2NyaXB0aW9uUGF0aDogc3RyaW5nLFxuICAgICAgc3Vic2NyaXB0aW9uTmFtZTogc3RyaW5nLFxuICAgICAgc3Vic2NyaXB0aW9uQ291bnQ6IG51bWJlcixcbiAgICAgIHN1YnNjcmlwdGlvbk9wdGlvbnM6IFdhdGNobWFuU3Vic2NyaXB0aW9uT3B0aW9uc1xuICAgICAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnJvb3QgPSBzdWJzY3JpcHRpb25Sb290O1xuICAgIHRoaXMucGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9TdWJzY3JpcHRpb25QYXRoID0gcGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9TdWJzY3JpcHRpb25QYXRoO1xuICAgIHRoaXMucGF0aCA9IHN1YnNjcmlwdGlvblBhdGg7XG4gICAgdGhpcy5uYW1lID0gc3Vic2NyaXB0aW9uTmFtZTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbkNvdW50ID0gc3Vic2NyaXB0aW9uQ291bnQ7XG4gICAgdGhpcy5vcHRpb25zID0gc3Vic2NyaXB0aW9uT3B0aW9ucztcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBXYXRjaG1hblN1YnNjcmlwdGlvbjtcbiJdfQ==