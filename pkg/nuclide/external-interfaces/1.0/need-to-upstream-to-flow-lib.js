/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * APIs listed in this file are ones that should be built into Flow and need to be upstreamed.
 */

/* eslint-disable no-unused-vars */

// Add this to Flow: https://github.com/facebook/flow/issues/774.
// API taken from https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.
declare class MouseEvent extends Event {
  altKey: boolean;
  // TODO: Include -1 when Flow fixes the bug where it does not support negative
  // numbers in union types.
  button: 0 | 1 | 2 | 3 | 4;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  offsetX: number;
  offsetY: number;
  region: ?string;
  relatedTarget: ?EventTarget;
  screenX: number;
  screenY: number;
  shiftKey: boolean;

  /**
   * Returns the current state of the specified modifier key.
   * @param keyArg is a string like "CapsLock" or "Shift". It must be one of the possible values for
   *   `KeyboardEvent.key`.
   * @return whether the specified modifier key is being held down.
   */
  getModifierState(keyArg: string): boolean;
}

type CreateInterfaceOptions = {
  input: stream$Readable;
  output?: stream$Writable;
  completer?: (line: string) => [Array<string>, string];
  terminal?: boolean;
  historySize?: number;
}

declare module 'readline' {
  declare class Interface {
    on: (event: string, listener: Function) => void;
    close: () => void;
  }
  declare function createInterface(options: CreateInterfaceOptions): Interface;
}
