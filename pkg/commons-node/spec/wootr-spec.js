/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';

import {WString} from '../wootr';

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

  describe('integrateDelete', () => {
    it('not left edge; not right edge; no merge left; no merge right', () => {
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

    it('left edge; right edge; merge left; merge right', () => {
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

    it('left edge; not right edge; merge left; no merge right', () => {
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

    it('left edge; not right edge; no merge left; no merge right', () => {
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

    it('not left edge; right edge; no merge left; no merge right', () => {
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

    it('not left edge; right edge; no merge left; merge right', () => {
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

    it('left edge; right edge; no merge left; merge right', () => {
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

    it('left edge; right edge; merge left; no merge right', () => {
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

    it('left edge; right edge; no merge left; no merge right', () => {
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

  describe('pos', () => {
    it('should work', () => {
      const wstring = new WString(1);
      const wchar1 = {startId: {site: 1, h: 1}, visible: true, startDegree: 1, length: 1};
      const wchar2 = {startId: {site: 1, h: 2}, visible: true, startDegree: 2, length: 1};
      const wchar3 = {startId: {site: 1, h: 3}, visible: true, startDegree: 3, length: 1};
      const wchar4 = {startId: {site: 1, h: 4}, visible: true, startDegree: 4, length: 1};

      wstring.insert(1, wchar1); // [1]
      wstring.insert(1, wchar2); // [2][1]
      wstring.insert(2, wchar3); // [23][1]
      wstring.insert(3, wchar4); // [234][1]
      wstring.integrateDelete(1); // [-2][34][1]

      expect(wstring.pos(wstring.charFromRun(wchar1, 0), true)).toEqual(3);
      expect(wstring.pos(wstring.charFromRun(wchar2, 0), true)).toEqual(-1);
      expect(wstring.pos(wstring.charFromRun(wchar2, 0), /* visibleOnly */ false)).toEqual(1);
      expect(wstring.pos(wstring.charFromRun(wchar3, 0), true)).toEqual(1);
      expect(wstring.pos(wstring.charFromRun(wchar4, 0), true)).toEqual(2);
    });
  });

  describe('ith', () => {
    it('should work', () => {
      const wstring = new WString(1, 4);

      expect(wstring.ith(0)).toEqual({id: {site: -1, h: 0}, visible: true, degree: 0});
      expect(wstring.ith(1)).toEqual({id: {site: 1, h: 1}, visible: true, degree: 1});
      expect(wstring.ith(2)).toEqual({id: {site: 1, h: 2}, visible: true, degree: 2});
      expect(wstring.ith(3)).toEqual({id: {site: 1, h: 3}, visible: true, degree: 3});
      expect(wstring.ith(4)).toEqual({id: {site: 1, h: 4}, visible: true, degree: 4});
      expect(wstring.ith(5)).toEqual({id: {site: -1, h: 1}, visible: true, degree: 0});
    });
  });

  describe('subseq', () => {
    it('should work', () => {
      const wstring = new WString(1, 4);

      expect(wstring.subseq(wstring.ith(1), wstring.ith(4))).toEqual([
        {
          id: {
            site: 1,
            h: 2,
          },
          visible: true,
          degree: 2,
        }, {
          id: {
            site: 1,
            h: 3,
          },
          visible: true,
          degree: 3,
        },
      ]);
    });
  });

  describe('genInsert', () => {
    it('should work with single characters', () => {
      const wstring = new WString(1);

      wstring.genInsert(0, 't');
      wstring.genInsert(0, 'e');
      wstring.genInsert(2, 's');

      expect(wstring._string[1]).toEqual({
        startId: {
          site: 1,
          h: 2,
        },
        visible: true,
        length: 1,
        startDegree: 2,
      });

      expect(wstring._string[2]).toEqual({
        startId: {
          site: 1,
          h: 1,
        },
        visible: true,
        length: 1,
        startDegree: 1,
      });
      expect(wstring._string[3]).toEqual({
        startId: {
          site: 1,
          h: 3,
        },
        visible: true,
        length: 1,
        startDegree: 2,
      });
    });

    it('should work with multiple characters', () => {
      const wstring = new WString(1);

      expect(wstring.genInsert(0, 'test')).toEqual({
        type: 'INS',
        char: {
          startId: {
            site: 1,
            h: 1,
          },
          length: 4,
          startDegree: 1,
          visible: true,
        },
        prev: {
          id: {
            site: -1,
            h: 0,
          },
          visible: true,
          degree: 0,
        },
        next: {
          id: {
            site: -1,
            h: 1,
          },
          visible: true,
          degree: 0,
        },
        text: 'test',
      });

      expect(wstring._string[1]).toEqual({
        startId: {
          site: 1,
          h: 1,
        },
        visible: true,
        length: 4,
        startDegree: 1,
      });
    });
  });

  describe('genDelete', () => {
    it('should delete range', () => {
      const wstring = new WString(1, 4); // 1-4
      wstring.genDelete(0, 4);

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 4,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });

    it('should merge left', () => {
      const wstring = new WString(1, 4); // 1-4
      wstring.genDelete(0);
      wstring.genDelete(0);
      wstring.genDelete(0);
      wstring.genDelete(0);

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 4,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });

    it('should merge right', () => {
      const wstring = new WString(1, 4); // 1-4

      wstring.genDelete(3);
      wstring.genDelete(2);
      wstring.genDelete(1);
      wstring.genDelete(0);

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 4,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });

    it('should merge left and right', () => {
      const wstring = new WString(1, 4); // 1-4

      wstring.genDelete(3);
      wstring.genDelete(0);
      wstring.genDelete(1);
      wstring.genDelete(0);

      expect(wstring._string.length).toEqual(3);
      expect(wstring._string[1]).toEqual({
        length: 4,
        startDegree: 1,
        startId: {
          h: 1,
          site: 1,
        },
        visible: false,
      });
    });
  });

  describe('visibleRanges', () => {
    it('works', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(1);

      wstring.genInsert(0, 'a');
      wstring.genInsert(1, 'a');
      wstring.genInsert(2, 'asdf');
      wstring2.genInsert(0, 'a');
      wstring2.genInsert(1, 'a');
      wstring2.genInsert(2, 'asdf');
      const op = wstring.genDelete(0, 6);
      wstring2.genInsert(2, 'a');

      invariant(op.runs != null);
      expect(wstring2.visibleRanges(op.runs)).toEqual([
        {
          pos: 1,
          count: 2,
        },
        {
          pos: 4,
          count: 4,
        },
      ]);
    });
  });

  describe('receive', () => {
    it('should report correct changes', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(2);

      wstring2.receive(wstring.genInsert(0, 'text')); // both strings 'text'
      wstring2.receive(wstring.genDelete(2)); // both strings 'tet'
      const changes = wstring2.receive(wstring.genInsert(2, 's')); // both strings 'test'

      expect(changes).toEqual([{
        addition: {
          pos: 3,
          text: 's',
        },
      }]);
    });

    it('should work with conflicting add/remove', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(2);

      wstring2.receive(wstring.genInsert(0, 'text'));

      const op1 = wstring2.genInsert(1, 't');
      const op2 = wstring.genDelete(1, 2);

      wstring.receive(op1);
      wstring2.receive(op2);

      expect(wstring2._string).toEqual(wstring._string);
    });

    it('should work with conflicting remove/remove', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(2);

      wstring2.receive(wstring.genInsert(0, 'text'));

      const op1 = wstring2.genDelete(0, 4);
      const op2 = wstring.genDelete(0, 2);

      wstring.receive(op1);
      wstring2.receive(op2);

      expect(wstring2._string).toEqual(wstring._string);
    });

    it('should work with conflicting add/add', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(2);

      wstring2.receive(JSON.parse(JSON.stringify(wstring.genInsert(0, 'text'))));

      expect(wstring2._string).toEqual(wstring._string);

      const op1 = wstring2.genInsert(0, '1');
      const op2 = wstring.genInsert(0, '2');

      wstring.receive(op1);
      wstring2.receive(op2);

      expect(wstring2._string).toEqual(wstring._string);
    });

    it('should allow out of order delete', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(2);

      const insertTextOp = wstring.genInsert(0, 'text');
      const deleteTextOp = wstring.genDelete(0, 4);

      const changesAfterDelete = wstring2.receive(deleteTextOp);
      const changesAfterInsert = wstring2.receive(insertTextOp);

      expect(changesAfterDelete.length).toEqual(0);
      expect(changesAfterInsert.length).toEqual(2);
      expect(wstring2._string).toEqual(wstring._string);
    });

    it('should allow out of order insert', () => {
      const wstring = new WString(1);
      const wstring2 = new WString(2);

      const insertTextOp = wstring.genInsert(0, 'text');
      const insertAsdfOp = wstring.genInsert(4, 'asdf');

      const changesAfterAsdf = wstring2.receive(insertAsdfOp);
      const changesAfterText = wstring2.receive(insertTextOp);

      expect(changesAfterAsdf.length).toEqual(0);
      expect(changesAfterText.length).toEqual(2);
      expect(wstring2._string).toEqual(wstring._string);
    });
  });
});
