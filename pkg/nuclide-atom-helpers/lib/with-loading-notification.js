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