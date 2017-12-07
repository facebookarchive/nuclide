/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

export interface ConsoleIO {
  // output does not add a newline. outputLine does.
  output(text: string): void;
  outputLine(line?: string): void;
  stopInput(): void;
  startInput(): void;
}
