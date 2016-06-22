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

/**
 * A function that can be optionally passed to ProcessOutputView to override
 * ProcessOutputView's default behavior for handling new data from the process.
 * By default, ProcessOutputView simply appends the `newText` to its `buffer`.
 * However, for example sometimes the output may contain escape sequences
 * (e.g. ANSI) that you want to interpret and strip from the data before appending
 * to the buffer. You can do this by implementing a custom ProcessOutputHandler.
 */