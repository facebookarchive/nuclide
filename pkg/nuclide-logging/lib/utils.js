Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.patchErrorsOfLoggingEvent = patchErrorsOfLoggingEvent;
exports.serializeLoggingEvent = serializeLoggingEvent;
exports.deserializeLoggingEvent = deserializeLoggingEvent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

/**
 * JSON.stringify can't stringify instance of Error. To solve this problem, we
 * patch the errors in loggingEvent.data and convert it to an Object with 'name', 'message',
 * 'stack' and 'stackTrace' as fields.
 * If there is no error attached to loggingEvent.data, we create a new error and append it to
 * loggingEvent.data, so that we could get stack information which helps categorization in
 * logview.
 */

function patchErrorsOfLoggingEvent(loggingEvent) {
  var loggingEventCopy = _extends({}, loggingEvent);
  loggingEventCopy.data = (loggingEventCopy.data || []).slice();

  if (!loggingEventCopy.data.some(function (item) {
    return item instanceof Error;
  })) {
    loggingEventCopy.data.push(new Error('Auto generated Error'));
  }

  loggingEventCopy.data = loggingEventCopy.data.map(function (item) {
    if (item instanceof Error) {
      return {
        name: item.name,
        message: item.message,
        stack: item.stack,
        stackTrace: item.stackTrace
      };
    }
    return item;
  });

  return loggingEventCopy;
}

/**
 * Takes a loggingEvent object, returns string representation of it.
 */

function serializeLoggingEvent(loggingEvent) {
  return JSON.stringify(loggingEvent);
}

/**
 * Takes a string, returns an object with the correct log properties.
 *
 * This method has been "borrowed" from the `multiprocess` appender
 * by `nomiddlename` (https://github.com/nomiddlename/log4js-node/blob/master/lib/appenders/multiprocess.js)
 *
 * Apparently, node.js serializes everything to strings when using `process.send()`,
 * so we need smart deserialization that will recreate log date and level for further processing by
 * log4js internals.
 */

function deserializeLoggingEvent(loggingEventString) {
  var loggingEvent = undefined;
  try {
    loggingEvent = JSON.parse(loggingEventString);
    loggingEvent.startTime = new Date(loggingEvent.startTime);
    loggingEvent.level = _log4js2['default'].levels.toLevel(loggingEvent.level.levelStr);
  } catch (e) {
    // JSON.parse failed, just log the contents probably a naughty.
    loggingEvent = {
      startTime: new Date(),
      categoryName: 'log4js',
      level: _log4js2['default'].levels.ERROR,
      data: ['Unable to parse log:', loggingEventString]
    };
  }
  return loggingEvent;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQVdtQixRQUFROzs7Ozs7Ozs7Ozs7O0FBWXBCLFNBQVMseUJBQXlCLENBQUMsWUFBMEIsRUFBZ0I7QUFDbEYsTUFBTSxnQkFBZ0IsZ0JBQU8sWUFBWSxDQUFDLENBQUM7QUFDM0Msa0JBQWdCLENBQUMsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQSxDQUFFLEtBQUssRUFBRSxDQUFDOztBQUU5RCxNQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7V0FBSSxJQUFJLFlBQVksS0FBSztHQUFBLENBQUMsRUFBRTtBQUM5RCxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztHQUMvRDs7QUFFRCxrQkFBZ0IsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUN4RCxRQUFJLElBQUksWUFBWSxLQUFLLEVBQUU7QUFDekIsYUFBTztBQUNMLFlBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLGVBQU8sRUFBRSxJQUFJLENBQUMsT0FBTztBQUNyQixhQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7QUFDakIsa0JBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtPQUM1QixDQUFDO0tBQ0g7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsQ0FBQzs7QUFFSCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCOzs7Ozs7QUFLTSxTQUFTLHFCQUFxQixDQUFDLFlBQW1CLEVBQVU7QUFDakUsU0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0NBQ3JDOzs7Ozs7Ozs7Ozs7O0FBWU0sU0FBUyx1QkFBdUIsQ0FBQyxrQkFBMEIsRUFBZ0I7QUFDaEYsTUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixNQUFJO0FBQ0YsZ0JBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDOUMsZ0JBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFELGdCQUFZLENBQUMsS0FBSyxHQUFHLG9CQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUN6RSxDQUFDLE9BQU8sQ0FBQyxFQUFFOztBQUVWLGdCQUFZLEdBQUc7QUFDYixlQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7QUFDckIsa0JBQVksRUFBRSxRQUFRO0FBQ3RCLFdBQUssRUFBRSxvQkFBTyxNQUFNLENBQUMsS0FBSztBQUMxQixVQUFJLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxrQkFBa0IsQ0FBQztLQUNuRCxDQUFDO0dBQ0g7QUFDRCxTQUFPLFlBQVksQ0FBQztDQUNyQiIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2c0anMgZnJvbSAnbG9nNGpzJztcblxuaW1wb3J0IHR5cGUge0xvZ2dpbmdFdmVudH0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogSlNPTi5zdHJpbmdpZnkgY2FuJ3Qgc3RyaW5naWZ5IGluc3RhbmNlIG9mIEVycm9yLiBUbyBzb2x2ZSB0aGlzIHByb2JsZW0sIHdlXG4gKiBwYXRjaCB0aGUgZXJyb3JzIGluIGxvZ2dpbmdFdmVudC5kYXRhIGFuZCBjb252ZXJ0IGl0IHRvIGFuIE9iamVjdCB3aXRoICduYW1lJywgJ21lc3NhZ2UnLFxuICogJ3N0YWNrJyBhbmQgJ3N0YWNrVHJhY2UnIGFzIGZpZWxkcy5cbiAqIElmIHRoZXJlIGlzIG5vIGVycm9yIGF0dGFjaGVkIHRvIGxvZ2dpbmdFdmVudC5kYXRhLCB3ZSBjcmVhdGUgYSBuZXcgZXJyb3IgYW5kIGFwcGVuZCBpdCB0b1xuICogbG9nZ2luZ0V2ZW50LmRhdGEsIHNvIHRoYXQgd2UgY291bGQgZ2V0IHN0YWNrIGluZm9ybWF0aW9uIHdoaWNoIGhlbHBzIGNhdGVnb3JpemF0aW9uIGluXG4gKiBsb2d2aWV3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hFcnJvcnNPZkxvZ2dpbmdFdmVudChsb2dnaW5nRXZlbnQ6IExvZ2dpbmdFdmVudCk6IExvZ2dpbmdFdmVudCB7XG4gIGNvbnN0IGxvZ2dpbmdFdmVudENvcHkgPSB7Li4ubG9nZ2luZ0V2ZW50fTtcbiAgbG9nZ2luZ0V2ZW50Q29weS5kYXRhID0gKGxvZ2dpbmdFdmVudENvcHkuZGF0YSB8fCBbXSkuc2xpY2UoKTtcblxuICBpZiAoIWxvZ2dpbmdFdmVudENvcHkuZGF0YS5zb21lKGl0ZW0gPT4gaXRlbSBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgIGxvZ2dpbmdFdmVudENvcHkuZGF0YS5wdXNoKG5ldyBFcnJvcignQXV0byBnZW5lcmF0ZWQgRXJyb3InKSk7XG4gIH1cblxuICBsb2dnaW5nRXZlbnRDb3B5LmRhdGEgPSBsb2dnaW5nRXZlbnRDb3B5LmRhdGEubWFwKGl0ZW0gPT4ge1xuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgbWVzc2FnZTogaXRlbS5tZXNzYWdlLFxuICAgICAgICBzdGFjazogaXRlbS5zdGFjayxcbiAgICAgICAgc3RhY2tUcmFjZTogaXRlbS5zdGFja1RyYWNlLFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW07XG4gIH0pO1xuXG4gIHJldHVybiBsb2dnaW5nRXZlbnRDb3B5O1xufVxuXG4vKipcbiAqIFRha2VzIGEgbG9nZ2luZ0V2ZW50IG9iamVjdCwgcmV0dXJucyBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVMb2dnaW5nRXZlbnQobG9nZ2luZ0V2ZW50OiBtaXhlZCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShsb2dnaW5nRXZlbnQpO1xufVxuXG4vKipcbiAqIFRha2VzIGEgc3RyaW5nLCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIHRoZSBjb3JyZWN0IGxvZyBwcm9wZXJ0aWVzLlxuICpcbiAqIFRoaXMgbWV0aG9kIGhhcyBiZWVuIFwiYm9ycm93ZWRcIiBmcm9tIHRoZSBgbXVsdGlwcm9jZXNzYCBhcHBlbmRlclxuICogYnkgYG5vbWlkZGxlbmFtZWAgKGh0dHBzOi8vZ2l0aHViLmNvbS9ub21pZGRsZW5hbWUvbG9nNGpzLW5vZGUvYmxvYi9tYXN0ZXIvbGliL2FwcGVuZGVycy9tdWx0aXByb2Nlc3MuanMpXG4gKlxuICogQXBwYXJlbnRseSwgbm9kZS5qcyBzZXJpYWxpemVzIGV2ZXJ5dGhpbmcgdG8gc3RyaW5ncyB3aGVuIHVzaW5nIGBwcm9jZXNzLnNlbmQoKWAsXG4gKiBzbyB3ZSBuZWVkIHNtYXJ0IGRlc2VyaWFsaXphdGlvbiB0aGF0IHdpbGwgcmVjcmVhdGUgbG9nIGRhdGUgYW5kIGxldmVsIGZvciBmdXJ0aGVyIHByb2Nlc3NpbmcgYnlcbiAqIGxvZzRqcyBpbnRlcm5hbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZUxvZ2dpbmdFdmVudChsb2dnaW5nRXZlbnRTdHJpbmc6IHN0cmluZyk6IExvZ2dpbmdFdmVudCB7XG4gIGxldCBsb2dnaW5nRXZlbnQ7XG4gIHRyeSB7XG4gICAgbG9nZ2luZ0V2ZW50ID0gSlNPTi5wYXJzZShsb2dnaW5nRXZlbnRTdHJpbmcpO1xuICAgIGxvZ2dpbmdFdmVudC5zdGFydFRpbWUgPSBuZXcgRGF0ZShsb2dnaW5nRXZlbnQuc3RhcnRUaW1lKTtcbiAgICBsb2dnaW5nRXZlbnQubGV2ZWwgPSBsb2c0anMubGV2ZWxzLnRvTGV2ZWwobG9nZ2luZ0V2ZW50LmxldmVsLmxldmVsU3RyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIEpTT04ucGFyc2UgZmFpbGVkLCBqdXN0IGxvZyB0aGUgY29udGVudHMgcHJvYmFibHkgYSBuYXVnaHR5LlxuICAgIGxvZ2dpbmdFdmVudCA9IHtcbiAgICAgIHN0YXJ0VGltZTogbmV3IERhdGUoKSxcbiAgICAgIGNhdGVnb3J5TmFtZTogJ2xvZzRqcycsXG4gICAgICBsZXZlbDogbG9nNGpzLmxldmVscy5FUlJPUixcbiAgICAgIGRhdGE6IFsnVW5hYmxlIHRvIHBhcnNlIGxvZzonLCBsb2dnaW5nRXZlbnRTdHJpbmddLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGxvZ2dpbmdFdmVudDtcbn1cbiJdfQ==