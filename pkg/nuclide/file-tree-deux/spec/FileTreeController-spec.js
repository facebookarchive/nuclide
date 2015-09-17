'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeController = require('../lib/FileTreeController');

describe('FileTreeController', () => {
  var controller: FileTreeController;

  beforeEach(() => {
    controller = new FileTreeController(null);
  });

  afterEach(() => {
    controller.destroy();
  });

  it('shows/unhides its panel when "Reveal in File Tree" is used', () => {
    // Ensure the file tree's panel is hidden at first.
    controller.toggleVisibility(false);
    expect(controller._isVisible).toBe(false);

    controller.revealActiveFile();
    expect(controller._isVisible).toBe(true);
  });
});
