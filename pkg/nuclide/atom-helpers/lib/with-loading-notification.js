var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Displays a loading notification while waiting for a promise.
 * Waits delayMs before actually showing the notification (to prevent flicker).
 */

var withLoadingNotification = _asyncToGenerator(function* (promise, message) {
  var delayMs = arguments.length <= 2 || arguments[2] === undefined ? 100 : arguments[2];
  var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var notif = null;
  var timeout = setTimeout(function () {
    notif = atom.notifications.addInfo(message, _extends({
      dismissable: true
    }, options));
  }, delayMs);
  try {
    return yield promise;
  } finally {
    clearTimeout(timeout);
    if (notif) {
      notif.dismiss();
    }
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

module.exports = withLoadingNotification;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpdGgtbG9hZGluZy1ub3RpZmljYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0lBZWUsdUJBQXVCLHFCQUF0QyxXQUNFLE9BQW1CLEVBQ25CLE9BQWUsRUFHSDtNQUZaLE9BQWUseURBQUcsR0FBRztNQUNyQixPQUFlLHlEQUFHLEVBQUU7O0FBRXBCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsWUFBTTtBQUMvQixTQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTztBQUN4QyxpQkFBVyxFQUFFLElBQUk7T0FDZCxPQUFPLEVBQ1YsQ0FBQztHQUNKLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDWixNQUFJO0FBQ0YsV0FBTyxNQUFNLE9BQU8sQ0FBQztHQUN0QixTQUFTO0FBQ1IsZ0JBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixRQUFJLEtBQUssRUFBRTtBQUNULFdBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNqQjtHQUNGO0NBQ0Y7Ozs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6IndpdGgtbG9hZGluZy1ub3RpZmljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIERpc3BsYXlzIGEgbG9hZGluZyBub3RpZmljYXRpb24gd2hpbGUgd2FpdGluZyBmb3IgYSBwcm9taXNlLlxuICogV2FpdHMgZGVsYXlNcyBiZWZvcmUgYWN0dWFsbHkgc2hvd2luZyB0aGUgbm90aWZpY2F0aW9uICh0byBwcmV2ZW50IGZsaWNrZXIpLlxuICovXG5hc3luYyBmdW5jdGlvbiB3aXRoTG9hZGluZ05vdGlmaWNhdGlvbjxUPihcbiAgcHJvbWlzZTogUHJvbWlzZTxUPixcbiAgbWVzc2FnZTogc3RyaW5nLFxuICBkZWxheU1zOiBudW1iZXIgPSAxMDAsXG4gIG9wdGlvbnM6IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxUPiB7XG4gIGxldCBub3RpZiA9IG51bGw7XG4gIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBub3RpZiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UsIHtcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgfSwgZGVsYXlNcyk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHByb21pc2U7XG4gIH0gZmluYWxseSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIGlmIChub3RpZikge1xuICAgICAgbm90aWYuZGlzbWlzcygpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpdGhMb2FkaW5nTm90aWZpY2F0aW9uO1xuIl19