'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

/**
 * @param pathFromSubscriptionRootToSubscriptionPath The relative path from
 *   subscriptionRoot to subscriptionPath. This is the 'relative_path' as described at
 *   https://facebook.github.io/watchman/docs/cmd/watch-project.html#using-watch-project.
 *   Notably, this value should be undefined if subscriptionRoot is the same as
 *   subscriptionPath.
 */
class WatchmanSubscription extends (_eventKit || _load_eventKit()).Emitter {
  constructor(subscriptionRoot, pathFromSubscriptionRootToSubscriptionPath, subscriptionPath, subscriptionName, subscriptionCount, subscriptionOptions) {
    super();
    this.root = subscriptionRoot;
    this.pathFromSubscriptionRootToSubscriptionPath = pathFromSubscriptionRootToSubscriptionPath;
    this.path = subscriptionPath;
    this.name = subscriptionName;
    this.subscriptionCount = subscriptionCount;
    this.options = subscriptionOptions;
  }
}
exports.default = WatchmanSubscription; /**
                                         * Copyright (c) 2015-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the license found in the LICENSE file in
                                         * the root directory of this source tree.
                                         *
                                         * 
                                         * @format
                                         */