'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {EventEmitter} = require('events');

type WatchmanSubscriptionOptions = {
  expression: ?Array<string>; // e.g. ['match', '*.js'],
  fields: ?Array<string>; // e.g. ['name', 'size', 'exists', 'mode']
};

/**
 * @param pathFromSubscriptionRootToSubscriptionPath The relative path from
 *   subscriptionRoot to subscriptionPath. This is the 'relative_path' as described at
 *   https://facebook.github.io/watchman/docs/cmd/watch-project.html#using-watch-project.
 *   Notably, this value should be undefined if subscriptionRoot is the same as
 *   subscriptionPath.
 */
class WatchmanSubscription extends EventEmitter {
  constructor(
      subscriptionRoot: string,
      pathFromSubscriptionRootToSubscriptionPath: ?string,
      subscriptionPath: string,
      subscriptionCount: number,
      subscriptionOptions: WatchmanSubscriptionOptions
      ) {
    super();
    this.root = subscriptionRoot;
    this.pathFromSubscriptionRootToSubscriptionPath = pathFromSubscriptionRootToSubscriptionPath;
    this.path = this.name = subscriptionPath;
    this.subscriptionCount = subscriptionCount;
    this.options = subscriptionOptions;
  }
}

module.exports = WatchmanSubscription;
