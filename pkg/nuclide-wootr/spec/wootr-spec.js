'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {WString} from '../lib/main.js';

describe('wootr', () => {
  describe('insert', () => {
    it('should allow a whole string to be passed in', () => {
      const wstring = new WString(1, 50000000);

      expect(wstring._string[1]).toEqual({
        length: 50000000,
        startId: {
          site: 1,
          h: 1,
        },
        startDegree: 1,
        visible: true,
      });

      expect(wstring._string.length).toEqual(3);
    });

    it('should combine adjacent runs', () => {
      const wstring = new WString(1);
      wstring.insert(1, {startId: {site: 1, h: 1}, visible: true, startDegree: 1, length: 1});
      wstring.insert(2, {startId: {site: 1, h: 2}, visible: true, startDegree: 2, length: 1});
      wstring.insert(3, {startId: {site: 1, h: 3}, visible: true, startDegree: 3, length: 1});
      wstring.insert(4, {startId: {site: 1, h: 4}, visible: true, startDegree: 4, length: 1});

      expect(wstring._string[1]).toEqual({
        length: 4,
        startId: {
          site: 1,
          h: 1,
        },
        startDegree: 1,
        visible: true,
      });
      expect(wstring._string.length).toEqual(3);
    });

    it('should append run when inserted after incompatible run', () => {
      const wstring = new WString(1);

      wstring.insert(1, {startId: {site: 1, h: 1}, visible: true, startDegree: 1, length: 1});
      wstring.insert(2, {startId: {site: 2, h: 1}, visible: true, startDegree: 2, length: 1});

      expect(wstring._string[1]).toEqual({
        length: 1,
        startId: {
          site: 1,
          h: 1,
        },
        startDegree: 1,
        visible: true,
      });

      expect(wstring._string[2]).toEqual({
        length: 1,
        startId: {
          site: 2,
          h: 1,
        },
        startDegree: 2,
        visible: true,
      });

      expect(wstring._string.length).toEqual(4);
    });

    it('should split runs when inserted inside a run', () => {
      const wstring = new WString(1);

      wstring.insert(1, {startId: {site: 1, h: 1}, visible: true, startDegree: 1, length: 1});
      wstring.insert(2, {startId: {site: 1, h: 2}, visible: true, startDegree: 2, length: 1});
      wstring.insert(2, {startId: {site: 1, h: 3}, visible: true, startDegree: 3, length: 1});
      wstring.insert(3, {startId: {site: 1, h: 4}, visible: true, startDegree: 4, length: 1});

      expect(wstring._string[1]).toEqual({
        length: 1,
        startId: {
          site: 1,
          h: 1,
        },
        startDegree: 1,
        visible: true,
      });

      expect(wstring._string[2]).toEqual({
        length: 2,
        startId: {
          site: 1,
          h: 3,
        },
        startDegree: 3,
        visible: true,
      });

      expect(wstring._string[3]).toEqual({
        length: 1,
        startId: {
          site: 1,
          h: 2,
        },
        startDegree: 2,
        visible: true,
      });

      expect(wstring._string.length).toEqual(5);
    });

    it('should be the same wstrings when you ' +
    'insert 4 length 1 chars and 1 length 4 char', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(2);
      wstring.insert(1, {startId: {site: 1, h: 1}, visible: true, startDegree: 1, length: 1});
      wstring.insert(2, {startId: {site: 1, h: 2}, visible: true, startDegree: 2, length: 1});
      wstring.insert(3, {startId: {site: 1, h: 3}, visible: true, startDegree: 3, length: 1});
      wstring.insert(4, {startId: {site: 1, h: 4}, visible: true, startDegree: 4, length: 1});

      wstring2.insert(1, {startId: {site: 1, h: 1}, visible: true, startDegree: 1, length: 4});

      expect(wstring2._string).toEqual(wstring._string);
    });
  });

  describe('integrateDelete', function() {
    it('not left edge; not right edge; no merge left; no merge right', function() {
      const wstring = new WString(1, 3); // [+++]
      wstring.integrateDelete(2); // [+][-][+]

      expect(wstring._string.length).toEqual(5);
      expect(wstring._string[1]).toEqual({
        length: 1,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: true,
      });
      expect(wstring._string[2]).toEqual({
        length: 1,
        startDegree: 2,
        startId: {
          h: 2,
          site: 1,
        },
        visible: false,
      });
      expect(wstring._string[3]).toEqual({
        length: 1,
        startDegree: 3,
        startId: {
          h: 3,
          site: 1,
        },
        visible: true,
      });
    });

    it('left edge; right edge; merge left; merge right', function() {
      const wstring = new WString(1, 3); // [+++]
      wstring.integrateDelete(3); // [++][-]
      wstring.integrateDelete(1); // [-][+][-]
      wstring.integrateDelete(1); // [---]

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 3,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });

    it('left edge; not right edge; merge left; no merge right', function() {
      const wstring = new WString(1, 3); // [+++]
      wstring.integrateDelete(1); // [-][++]
      wstring.integrateDelete(1); // [--][+]

      expect(wstring._string.length).toEqual(4);
      expect(wstring._string[1]).toEqual({
        length: 2,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
      expect(wstring._string[2]).toEqual({
        length: 1,
        startDegree: 3,
        startId: {
          h: 3,
          site: 1,
        },
        visible: true,
      });
    });

    it('left edge; not right edge; no merge left; no merge right', function() {
      const wstring = new WString(1, 2); // [++]
      wstring.integrateDelete(1); // [-][+]

      expect(wstring._string.length).toEqual(4);
      expect(wstring._string[1]).toEqual({
        length: 1,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
      expect(wstring._string[2]).toEqual({
        length: 1,
        startDegree: 2,
        startId: {
          h: 2,
          site: 1,
        },
        visible: true,
      });
    });

    it('not left edge; right edge; no merge left; no merge right', function() {
      const wstring = new WString(1, 2); // [++]
      wstring.integrateDelete(2); // [+][-]

      expect(wstring._string.length).toEqual(4);
      expect(wstring._string[1]).toEqual({
        length: 1,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: true,
      });
      expect(wstring._string[2]).toEqual({
        length: 1,
        startDegree: 2,
        startId: {
          h: 2,
          site: 1,
        },
        visible: false,
      });
    });

    it('not left edge; right edge; no merge left; merge right', function() {
      const wstring = new WString(1, 3); // [+++]
      wstring.integrateDelete(3); // [++][-]
      wstring.integrateDelete(2); // [+][--]

      expect(wstring._string.length).toEqual(4);
      expect(wstring._string[1]).toEqual({
        length: 1,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: true,
      });
      expect(wstring._string[2]).toEqual({
        length: 2,
        startDegree: 2,
        startId: {
          h: 2,
          site: 1,
        },
        visible: false,
      });
    });

    it('left edge; right edge; no merge left; merge right', function() {
      const wstring = new WString(1, 2); // [++]
      wstring.integrateDelete(2); // [+][-]
      wstring.integrateDelete(1); // [--]

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 2,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });

    it('left edge; right edge; merge left; no merge right', function() {
      const wstring = new WString(1, 2); // [++]
      wstring.integrateDelete(1); // [-][+]
      wstring.integrateDelete(1); // [--]

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 2,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });

    it('left edge; right edge; no merge left; no merge right', function() {
      const wstring = new WString(1, 1); // [+]
      wstring.integrateDelete(1); // [-]

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 1,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });
  });
});
