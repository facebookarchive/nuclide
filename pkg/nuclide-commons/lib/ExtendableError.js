'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Define your own error by extending this class. Note we use Error.captureStackTrace
 * to get stacktrace which is v8-engine only.
 */
export default class ExtendableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    /* $FlowFixMe */
    Error.captureStackTrace(this, this.constructor.name);
  }
}
