'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as ActionTypes from '../lib/ActionTypes';
import {createTrackingEventStream} from '../lib/trackActions';
import Rx from 'rx';

describe('createTrackingEventStream', () => {

  it('ignores unknown actions', () => {
    waitsForPromise(async () => {
      const action$ = Rx.Observable.of({type: 'something-unknown'});
      const trackingEvent$ = createTrackingEventStream(action$);
      const eventList = await trackingEvent$.toArray().toPromise();
      expect(eventList.length).toBe(0);
    });
  });

  it('adds a default custom event for gadget creation', () => {
    waitsForPromise(async () => {
      const action$ = Rx.Observable.of({
        type: ActionTypes.CREATE_PANE_ITEM,
        payload: {
          gadgetId: 'My Awesome Gadget',
          isNew: true,
          item: {},
        },
      });
      const trackingEvent$ = createTrackingEventStream(action$);
      const types = (await trackingEvent$.toArray().toPromise()).map(event => event.type);
      expect(types).toContain('my-awesome-gadget-gadget-created');
    });
  });

  it('adds a default custom event for gadget deserialization', () => {
    waitsForPromise(async () => {
      const action$ = Rx.Observable.of({
        type: ActionTypes.CREATE_PANE_ITEM,
        payload: {
          gadgetId: 'My Awesome Gadget',
          isNew: false,
          item: {},
        },
      });
      const trackingEvent$ = createTrackingEventStream(action$);
      const types = (await trackingEvent$.toArray().toPromise()).map(event => event.type);
      expect(types).toContain('my-awesome-gadget-gadget-deserialized');
    });
  });

  it('uses custom event creation methods', () => {
    waitsForPromise(async () => {
      const action$ = Rx.Observable.of({
        type: ActionTypes.CREATE_PANE_ITEM,
        payload: {
          gadgetId: 'My Awesome Gadget',
          isNew: true,
          item: {
            createCustomTrackingEvent(event) {
              return {type: 'woot'};
            },
          },
        },
      });
      const trackingEvent$ = createTrackingEventStream(action$);
      const types = (await trackingEvent$.toArray().toPromise()).map(event => event.type);
      expect(types).toContain('woot');
    });
  });

});
