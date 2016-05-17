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

var _events2;

function _events() {
  return _events2 = require('events');
}

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
})((_events2 || _events()).EventEmitter);

module.exports = WatchmanSubscription;
// e.g. ['match', '*.js'],
// e.g. ['name', 'size', 'exists', 'mode']
// e.g. ['dirname', relativePath]
// e.g. "c:1439492655:58601:1:14195"