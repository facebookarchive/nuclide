'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Action,
  Location,
  LocationFactory,
  Store,
  Viewable,
  ViewableFactory,
} from '../lib/types';

import * as Actions from '../lib/redux/Actions';
import {
  createViewableEpic,
  registerLocationFactoryEpic,
  setItemVisibilityEpic,
  trackActionsEpic,
  unregisterLocationEpic,
  unregisterViewableFactoryEpic,
} from '../lib/redux/Epics';
import {ActionsObservable} from '../../commons-node/redux-observable';
import invariant from 'assert';
import {Observable, ReplaySubject, Subject} from 'rxjs';

describe('Epics', () => {

  describe('registerLocationFactoryEpic', () => {

    it('creates the location using the serialized state from last time', () => {
      waitsForPromise(async () => {
        const serialized = {value: 1};
        const store = {
          getState: () => ({
            serializedLocationStates: new Map([['test-location', serialized]]),
          }),
        };

        const locationFactory = createMockLocationFactory();
        spyOn(locationFactory, 'create');

        await runActions(
          [Actions.registerLocationFactory(locationFactory)],
          registerLocationFactoryEpic,
          ((store: any): Store),
        )
          .first()
          .toPromise();

        expect(locationFactory.create).toHaveBeenCalledWith(serialized);
      });
    });

  });

  describe('createViewableEpic', () => {

    it('create and shows items', () => {
      const viewableFactory = createMockViewableFactory();
      const location = createMockLocation();
      const store = {
        getState: () => ({
          locations: new Map([['test-location', location]]),
          viewableFactories: new Map([['test-view', viewableFactory]]),
        }),
      };

      const item = createMockViewable();
      spyOn(viewableFactory, 'create').andReturn(item);
      spyOn(location, 'showItem');

      runActions(
        [Actions.createViewable('test-view')],
        createViewableEpic,
        ((store: any): Store),
      );

      expect(viewableFactory.create).toHaveBeenCalled();
      expect(location.showItem).toHaveBeenCalledWith(item);
    });

  });

  describe('setItemVisibilityEpic', () => {

    it('shows items', () => {
      const location = createMockLocation();
      const store = {
        getState: () => ({
          locations: new Map([['test-location', location]]),
        }),
      };
      const item = createMockViewable();

      spyOn(location, 'showItem');

      runActions(
        [Actions.setItemVisibility({item, locationId: 'test-location', visible: true})],
        setItemVisibilityEpic,
        ((store: any): Store),
      );
      expect(location.showItem).toHaveBeenCalledWith(item);
    });

    it('hides items', () => {
      const location = createMockLocation();
      const store = {
        getState: () => ({
          locations: new Map([['test-location', location]]),
        }),
      };
      const item = createMockViewable();

      spyOn(location, 'hideItem');

      runActions(
        [Actions.setItemVisibility({item, locationId: 'test-location', visible: false})],
        setItemVisibilityEpic,
        ((store: any): Store),
      );
      expect(location.hideItem).toHaveBeenCalledWith(item);
    });

  });

  describe('unregisterLocationEpic', () => {

    it('destroys the location', () => {
      const location = createMockLocation();
      const store = {
        getState: () => ({
          locations: new Map([['test-location', location]]),
        }),
      };

      spyOn(location, 'destroy');

      runActions(
        [Actions.unregisterLocation('test-location')],
        unregisterLocationEpic,
        ((store: any): Store),
      );
      expect(location.destroy).toHaveBeenCalledWith();
    });

  });

  describe('trackActionsEpic', () => {

    it('tracks when views are created', () => {
      waitsForPromise(async () => {
        const trackAction = await runActions(
          [Actions.itemCreated({}, 'test-view')],
          trackActionsEpic,
          ((null: any): Store),
        ).first().toPromise();
        invariant(trackAction.type === 'TRACK');
        expect(trackAction.type).toBe('TRACK');
        const {event} = trackAction.payload;
        expect(event.type).toBe('workspace-view-created');
        invariant(event.data != null);
        expect(event.data.itemType).toBe('test-view');
      });
    });

  });

  describe('unregisterViewableFactoryEpic', () => {

    it('destroys items', () => {
      const location = createMockLocation();
      const viewableFactory = createMockViewableFactory();
      const store = {
        getState: () => ({
          locations: new Map([['test-location', location]]),
          viewableFactories: new Map([['test-viewable', viewableFactory]]),
        }),
      };
      const item = createMockViewable();

      spyOn(location, 'getItems').andReturn([item]);
      spyOn(location, 'destroyItem');
      spyOn(viewableFactory, 'isInstance').andReturn(true);

      runActions(
        [Actions.unregisterViewableFactory('test-viewable')],
        unregisterViewableFactoryEpic,
        ((store: any): Store),
      );
      expect(location.destroyItem).toHaveBeenCalledWith(item);
    });

  });

});

function createMockLocationFactory(): LocationFactory {
  return {
    id: 'test-location',
    create: createMockLocation,
  };
}

function createMockViewableFactory(): ViewableFactory {
  return {
    id: 'test-viewable',
    name: 'Test Viewable',
    create: () => ((null: any): Viewable),
    isInstance: item => true,
  };
}

function createMockLocation(): Location {
  const location = {
    destroy: () => {},
    destroyItem: item => {},
    getItems: () => {},
    hideItem: item => {},
    showItem: item => {},
  };
  return ((location: any): Location);
}

function createMockViewable(): Viewable {
  return (({}: any): Viewable);
}

type Epic = (actions: ActionsObservable<Action>, store: Store) => Observable<Action>;
function runActions(actions: Array<Action>, epic: Epic, store: Store): ReplaySubject<Action> {
  const input = new Subject();
  const output = new ReplaySubject();
  epic(new ActionsObservable(input), store).subscribe(output);
  actions.forEach(input.next.bind(input));
  input.complete();
  return output;
}
