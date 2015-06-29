'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var DataCache = require('../lib/DataCache');

describe('debugger-hhvm-proxy DataCache', () => {
    var socket;
    var cache;

    beforeEach(() => {
      socket = jasmine.createSpyObj('socket', ['getContextsForFrame']);
      socket.getContextsForFrame = jasmine.createSpy('getContextsForFrame').
      andReturn(Promise.resolve([
        {
          name: 'Locals',
          id: '0',
        },
        {
          name: 'Superglobals',
          id: '1',
        },
        {
          name: 'User defined constants',
          id : '2',
        },
      ]));

      cache = new DataCache(socket);
    });

    it ('no enable', () => {
      waitsForPromise(
        {shouldReject: true, timeout: 0},
        async () => { await cache.getScopesForFrame(4); });
    });

    it ('enable/disable', () => {
      waitsForPromise(
        {shouldReject: true, timeout: 0},
        async () => {
          cache.enable();
          cache.disable();
          await cache.getScopesForFrame(4);
        });
    });

    it('getScopesForFrame', () => {
      waitsForPromise(async () => {
        cache.enable();
        var result = await cache.getScopesForFrame(42);

        expect(socket.getContextsForFrame).toHaveBeenCalledWith(42);
        expect(result).toEqual([
          {
            object: {
              description: 'Locals',
              type: 'object',
              objectId: '{"enableCount":1,"frameIndex":42,"contextId":"0"}',
            },
            type: 'local',
          },
          {
            object: {
              description: 'Superglobals',
              type: 'object',
              objectId: '{"enableCount":1,"frameIndex":42,"contextId":"1"}',
            },
            type: 'global',
          },
          {
            object: {
              description: 'User defined constants',
              type: 'object',
              objectId: '{"enableCount":1,"frameIndex":42,"contextId":"2"}',
            },
            type: 'global',
          },
        ]);
      });
    });
});
