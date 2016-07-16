'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Immutable from 'immutable';

const OptionsRecord = Immutable.Record({

  // Line length settings.

  /**
   * This is the length with which reprint will try to keep each line within.
   *
   * Note: It's not guaranteed to keep lines within this length, but it will
   * do its best.
   */
  maxLineLength: 80,

  // Tab Settings.

  /**
   * The width of a tab. If using spaces this is how many spaces will be
   * inserted. If using tab charcters this is how many spaces a single tab
   * is expected to be displayed as.
   */
  tabWidth: 2,
  /**
   * If true spaces will be used for indentation, otherwise tabs will be used.
   */
  useSpaces: true,

});

/**
 * Set up a class to get strong type checking.
 */
class Options extends OptionsRecord {

  maxLineLength: number;
  tabWidth: number;
  useSpaces: boolean;

  constructor(init?: {
    maxLineLength?: number,
    tabWidth?: number,
    useSpaces?: boolean,
  }) {
    super(init);
  }
}

module.exports = Options;
