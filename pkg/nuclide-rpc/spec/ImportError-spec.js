'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import nuclideUri from '../../nuclide-remote-uri';
import {ServiceRegistry} from '../lib/ServiceRegistry';

describe('Import Errors', () => {

  it('Importing class', () => {
    waitsForPromise(async () => {
      let hadError = false;
      try {
        ServiceRegistry.createLocal([{
          name: 'ImportClassService',
          definition: nuclideUri.join(__dirname, 'ImportClassService.js'),
          implementation: nuclideUri.join(__dirname, 'ImportClassService.js'),
        }]);
      } catch (e) {
        hadError = true;
        expect(e.message).toMatch('Exported class in imported RPC file');
      }
      expect(hadError).toBe(true);
    });
  });

  it('Importing function', () => {
    waitsForPromise(async () => {
      let hadError = false;
      try {
        ServiceRegistry.createLocal([{
          name: 'ImportFunctionService',
          definition: nuclideUri.join(__dirname, 'ImportFunctionService.js'),
          implementation: nuclideUri.join(__dirname, 'ImportFunctionService.js'),
        }]);
      } catch (e) {
        hadError = true;
        expect(e.message).toMatch('Exported function in imported RPC file');
      }
      expect(hadError).toBe(true);
    });
  });
});
