'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var {EventEmitter} = require('events');

type WatchmanSubscriptionOptions = {
  expression: ?Array<string>; // e.g. ['match', '*.js'],
  fields: ?Array<string>; // e.g. ['name', 'size', 'exists', 'mode']
};

class WatchmanSubscription extends EventEmitter {
  constructor(
      subscriptionRoot: string,
      subscriptionIsRelative: boolean,
      subscriptionPath: string,
      subscriptionCount: number,
      subscriptionOptions: WatchmanSubscriptionOptions
      ) {
    super();
    this.root = subscriptionRoot;
    this.isRelative = subscriptionIsRelative;
    this.path = this.name = subscriptionPath;
    this.subscriptionCount = subscriptionCount;
    this.options = subscriptionOptions;
  }
}

module.exports = WatchmanSubscription;
