/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import {Observable} from 'rxjs';

export interface ConsoleIO {
  // output does not add a newline. outputLine does.
  output(text: string): void;
  outputLine(line?: string): void;
  write(data: string): void;
  more(text: string): Promise<void>;
  setPrompt(prompt: ?string): void;
  prompt(): void;
  stopInput(keepPromptWhenStopped?: boolean): void;
  startInput(): void;
  observeInterrupts(): Observable<void>;
  observeLines(): Observable<string>;
  observeKeys(): Observable<string>;
  isTTY(): boolean;
}
