Object.defineProperty(exports, '__esModule', {
  value: true
});

/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var passesGK = _asyncToGenerator(function* (gatekeeperName, timeout) {
  try {
    var _require = require('../../fb-gatekeeper');

    var gatekeeper = _require.gatekeeper;

    return Boolean((yield gatekeeper.asyncIsGkEnabled(gatekeeperName, timeout)));
  } catch (e) {
    return false;
  }
});

exports.passesGK = passesGK;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0lBV3NCLFFBQVEscUJBQXZCLFdBQXdCLGNBQXNCLEVBQUUsT0FBZSxFQUFvQjtBQUN4RixNQUFJO21CQUNtQixPQUFPLENBQUMscUJBQXFCLENBQUM7O1FBQTVDLFVBQVUsWUFBVixVQUFVOztBQUNqQixXQUFPLE9BQU8sRUFDWixNQUFNLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUEsQ0FDM0QsQ0FBQztHQUNILENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0YiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBub2Zsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXNzZXNHSyhnYXRla2VlcGVyTmFtZTogc3RyaW5nLCB0aW1lb3V0OiBudW1iZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7Z2F0ZWtlZXBlcn0gPSByZXF1aXJlKCcuLi8uLi9mYi1nYXRla2VlcGVyJyk7XG4gICAgcmV0dXJuIEJvb2xlYW4oXG4gICAgICBhd2FpdCBnYXRla2VlcGVyLmFzeW5jSXNHa0VuYWJsZWQoZ2F0ZWtlZXBlck5hbWUsIHRpbWVvdXQpXG4gICAgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19