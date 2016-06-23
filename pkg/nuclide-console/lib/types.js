Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// A regular message, emitted by output providers.

// A normalized type used internally to represent all possible kinds of messages. Responses and
// Messages are transformed into these.

// The source can't be part of the message because we want to be able to populate a filter menu
// before we even have any messages.