'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action} from '../types/Action';
import type Rx from 'rx';
import type {TrackingEvent} from '../../nuclide-analytics';

import invariant from 'assert';
import * as ActionTypes from './ActionTypes';
import * as TrackingEventTypes from './TrackingEventTypes';
import normalizeEventString from './normalizeEventString';
import {trackEvents} from '../../nuclide-analytics';

/**
 * Subscribe to the action stream and track things of interest.
 */
export default function trackActions(action$: Rx.Observable<Action>): IDisposable {
  return trackEvents(createTrackingEventStream(action$));
}

/**
 * Create a stream of tracking events from a stream of actions. This is mostly exposed for testing
 * purposes since, unlike `trackActions`, it's side-effect free.
 */
export function createTrackingEventStream(
  action$: Rx.Observable<Action>,
): Rx.Observable<TrackingEvent> {
  return action$.flatMap(toTrackingEvents);
}

/**
 * Map an application action to an Array of tracking events.
 */
function toTrackingEvents(typedAction: Action): Array<TrackingEvent> {
  // TODO Make this all typecheck. This is still better than before. The any is just explicit now.
  const action: any = typedAction;
  const standardEvent = toTrackingEvent(action);

  // For each event we're tracking, allow the gadget creator to specify their own custom event too.
  // Application actions themselves are considered implementation details so we don't want to expose
  // those to the gadget creator, but we do want to provide some customization of the standard
  // tracking events (created, deserialized, etc.). Therefore, we allow the gadget creator to
  // provide a hook that creates a custom version of those events. Any other events can be tracked
  // normally using the interfaces provided by nuclide-analytics.
  const item = action.payload && action.payload.item;
  const getCustomEvent = item && item.createCustomTrackingEvent ?
    item.createCustomTrackingEvent.bind(item) : createCustomTrackingEvent;

  const trackingEvents = [
    standardEvent,
    standardEvent && getCustomEvent(standardEvent),
  ].filter(event => event != null);
  return ((trackingEvents: any): Array<TrackingEvent>);
}

/**
 * A fallback for creating "custom" events. This isn't strictly necessary (since all the information
 * can be derived from the original event), but it makes our dashboard a little easier to process.
 */
function createCustomTrackingEvent(event: TrackingEvent): ?TrackingEvent {
  switch (event.type) {

    case TrackingEventTypes.GADGET_CREATED: {
      invariant(event.data && event.data.gadgetId);
      return {type: `${normalizeEventString(event.data.gadgetId)}-gadget-created`};
    }

    case TrackingEventTypes.GADGET_DESERIALIZED: {
      invariant(event.data && event.data.gadgetId);
      return {type: `${normalizeEventString(event.data.gadgetId)}-gadget-deserialized`};
    }

  }
}

/**
 * Map application actions to tracking events.
 */
function toTrackingEvent(action): ?TrackingEvent {
  const {type, payload} = action;

  switch (type) {

    case ActionTypes.CREATE_PANE_ITEM: {
      const {gadgetId, isNew} = payload;
      return {
        type: isNew ? TrackingEventTypes.GADGET_CREATED : TrackingEventTypes.GADGET_DESERIALIZED,
        data: {gadgetId},
      };
    }

  }
}
