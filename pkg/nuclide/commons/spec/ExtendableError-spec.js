'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ExtendableError from '../lib/ExtendableError';

class CustomError extends ExtendableError {
  _customMessage: string;

  constructor(errorMessage, customMessage) {
    super(errorMessage);
    this._customMessage = customMessage;
  }

  getCustomMessage(): string {
    return this._customMessage;
  }
}

describe('ExtendableError', () => {
  it('live up with its name', () => {
    const errorMessage = 'error message';
    const customMessage = 'customMessage';

    const error = new CustomError(errorMessage, customMessage);
    expect(error instanceof Error).toBe(true);
    expect(error instanceof ExtendableError).toBe(true);
    expect(error instanceof CustomError).toBe(true);
    expect(error.name).toBe('CustomError');
    expect(error.message).toBe(errorMessage);
    expect(error.getCustomMessage()).toBe(customMessage);
    const stack = error.stack;
    expect(typeof stack).toBe('string');
    expect(stack.length > 0).toBe(true);
  });
});
