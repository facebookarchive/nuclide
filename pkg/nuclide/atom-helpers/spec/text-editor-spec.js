'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {createTextEditor, isTextEditor} from '../lib/main';

describe('isTextEditor', () => {
  it('returns appropriate value for various inputs', () => {
    expect(isTextEditor(null)).toBe(false);
    expect(isTextEditor(undefined)).toBe(false);
    expect(isTextEditor(42)).toBe(false);
    expect(isTextEditor(false)).toBe(false);
    expect(isTextEditor('TextEditor')).toBe(false);
    expect(isTextEditor([])).toBe(false);
    expect(isTextEditor({})).toBe(false);

    const textEditor = createTextEditor(/* params */ {});
    expect(isTextEditor(textEditor)).toBe(true);
  });
});
