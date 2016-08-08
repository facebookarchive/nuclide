'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  zeroPaddedHex,
  decodeSurrogateCodePoints,
  extractCodePoints,
} from '../lib/Unicode';

describe('Unicode', () => {
  it('not zero-padding values does not add zeroes', () => {
    expect(zeroPaddedHex(0x6, 0)).toEqual('6');
  });
  it('zero-padding small values adds zeroes', () => {
    expect(zeroPaddedHex(0xF, 2)).toEqual('0F');
  });
  it('zero-padding small values adds many zeroes', () => {
    expect(zeroPaddedHex(0xF, 6)).toEqual('00000F');
  });
  it('zero-padding equal values does not add zeroes', () => {
    expect(zeroPaddedHex(0x42, 2)).toEqual('42');
  });
  it('zero-padding large values does not add zeroes', () => {
    expect(zeroPaddedHex(0x64738, 2)).toEqual('64738');
  });
  it('decoding empty array does nothing', () => {
    expect(decodeSurrogateCodePoints([])).toEqual([]);
  });
  it('decoding non-surrogate returns as-is', () => {
    expect(decodeSurrogateCodePoints([0x1234])).toEqual([0x1234]);
  });
  it('decoding SMP non-surrogate returns as-is', () => {
    expect(decodeSurrogateCodePoints([0x12345])).toEqual([0x12345]);
  });
  it('decoding surrogate pair returns code point', () => {
    expect(decodeSurrogateCodePoints([0xD83D, 0xDCA9])).toEqual([0x1F4A9]);
  });
  it('decoding dangling high surrogate returns as-is', () => {
    expect(decodeSurrogateCodePoints([0xD83D, 0x1234])).toEqual([0xD83D, 0x1234]);
  });
  it('decoding dangling low surrogate returns as-is', () => {
    expect(decodeSurrogateCodePoints([0xDCA9, 0x1234])).toEqual([0xDCA9, 0x1234]);
  });
  it('decoding trailing high surrogate surrogate returns as-is', () => {
    expect(decodeSurrogateCodePoints([0x1234, 0xD83D])).toEqual([0x1234, 0xD83D]);
  });
  it('extracting from empty string does nothing', () => {
    expect(extractCodePoints('')).toEqual([]);
  });
  it('extracting non-escaped returns code points', () => {
    expect(extractCodePoints('abc')).toEqual([0x61, 0x62, 0x63]);
  });
  it('extracting single escaped code point returns unescaped value', () => {
    expect(extractCodePoints('\\uABCD')).toEqual([0xABCD]);
  });
  it('extracting multiple escaped code points returns unescaped values', () => {
    expect(extractCodePoints('\\uAB12\\uCD34')).toEqual([0xAB12, 0xCD34]);
  });
  it('extracting SMP code points returns unescaped values', () => {
    expect(extractCodePoints('\\U0001F4A9')).toEqual([0x1F4A9]);
  });
  it('extracting SMP code points with curlies returns unescaped values', () => {
    expect(extractCodePoints('\\u{1F4A9}')).toEqual([0x1F4A9]);
  });
  it('extracting multiple escapes returns unescaped values', () => {
    expect(extractCodePoints('\\uABCD\\u{1F4A9}\\U0001F4A0')).toEqual([
      0xABCD,
      0x1F4A9,
      0x1F4A0,
    ]);
  });
  it('extracting mixed escaped and non-escaped returns unescaped values', () => {
    expect(extractCodePoints('abc\\uABCDabc')).toEqual([
      0x61,
      0x62,
      0x63,
      0xABCD,
      0x61,
      0x62,
      0x63,
    ]);
  });
});

