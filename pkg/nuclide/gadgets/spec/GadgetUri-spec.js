'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import * as GadgetUri from '../lib/GadgetUri';

describe('GadgetUri', () => {

  describe('parse', () => {

    it('extracts gadget IDs from gadget URIs', () => {
      const uri = 'atom://nuclide-gadgets/my-awesome-gadget';
      const parsed = GadgetUri.parse(uri);
      invariant(parsed);
      expect(parsed.gadgetId).toBe('my-awesome-gadget');
    });

    it("returns null when a URI doesn't match", () => {
      const uri = 'atom://something-else/that-shant-be-parsed';
      const parsed = GadgetUri.parse(uri);
      expect(parsed).toBe(null);
    });

  });

  describe('format', () => {

    it('constructs a gadget URI from an ID', () => {
      const uri = GadgetUri.format({gadgetId: 'my-awesome-gadget'});
      expect(uri).toBe('atom://nuclide-gadgets/my-awesome-gadget');
    });

  });

});
