'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {addSystemInfoPropertiesTo} = require('../lib/sysinfo');

describe('Test sysinfo.addSystemInfoPropertiesTo', () => {
  beforeEach(() => {
    // TODO jessicalin Remove this.
    // Set this config because logging requires it.
    atom.config.set('nuclide-flow.pathToFlow', 'flow');
  });

  it('Test addSystemInfoPropertiesTo work as expected', () => {
    waitsForPromise(async () => {
      var data = {};
      await addSystemInfoPropertiesTo(data);
      expect(typeof data.version).toEqual('string');
      expect(typeof data.buildNumber).toEqual('string');
      expect(typeof data.smokeBuildNumber).toEqual('string');
      expect(typeof data.userID).toEqual('string');
      expect(typeof data.unixname).toEqual('string');
      expect(typeof data.osVersion).toEqual('string');
      expect(typeof data.clangVersion).toEqual('string');
      expect(typeof data.flowVersion).toEqual('string');
    });
  });
});
