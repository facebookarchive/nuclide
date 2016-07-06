Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = trackActions;
exports.createTrackingEventStream = createTrackingEventStream;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _TrackingEventTypes2;

function _TrackingEventTypes() {
  return _TrackingEventTypes2 = _interopRequireWildcard(require('./TrackingEventTypes'));
}

var _normalizeEventString2;

function _normalizeEventString() {
  return _normalizeEventString2 = _interopRequireDefault(require('./normalizeEventString'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

/**
 * Subscribe to the action stream and track things of interest.
 */

function trackActions(action$) {
  return (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackEvents)(createTrackingEventStream(action$));
}

/**
 * Create a stream of tracking events from a stream of actions. This is mostly exposed for testing
 * purposes since, unlike `trackActions`, it's side-effect free.
 */

function createTrackingEventStream(action$) {
  return action$.flatMap(toTrackingEvents);
}

/**
 * Map an application action to an Array of tracking events.
 */
function toTrackingEvents(typedAction) {
  // TODO Make this all typecheck. This is still better than before. The any is just explicit now.
  var action = typedAction;
  var standardEvent = toTrackingEvent(action);

  // For each event we're tracking, allow the gadget creator to specify their own custom event too.
  // Application actions themselves are considered implementation details so we don't want to expose
  // those to the gadget creator, but we do want to provide some customization of the standard
  // tracking events (created, deserialized, etc.). Therefore, we allow the gadget creator to
  // provide a hook that creates a custom version of those events. Any other events can be tracked
  // normally using the interfaces provided by nuclide-analytics.
  var item = action.payload && action.payload.item;
  var getCustomEvent = item && item.createCustomTrackingEvent ? item.createCustomTrackingEvent.bind(item) : createCustomTrackingEvent;

  var trackingEvents = [standardEvent, standardEvent && getCustomEvent(standardEvent)].filter(function (event) {
    return event != null;
  });
  return trackingEvents;
}

/**
 * A fallback for creating "custom" events. This isn't strictly necessary (since all the information
 * can be derived from the original event), but it makes our dashboard a little easier to process.
 */
function createCustomTrackingEvent(event) {
  switch (event.type) {

    case (_TrackingEventTypes2 || _TrackingEventTypes()).GADGET_CREATED:
      {
        (0, (_assert2 || _assert()).default)(event.data && event.data.gadgetId);
        return { type: (0, (_normalizeEventString2 || _normalizeEventString()).default)(event.data.gadgetId) + '-gadget-created' };
      }

    case (_TrackingEventTypes2 || _TrackingEventTypes()).GADGET_DESERIALIZED:
      {
        (0, (_assert2 || _assert()).default)(event.data && event.data.gadgetId);
        return { type: (0, (_normalizeEventString2 || _normalizeEventString()).default)(event.data.gadgetId) + '-gadget-deserialized' };
      }

  }
}

/**
 * Map application actions to tracking events.
 */
function toTrackingEvent(action) {
  var type = action.type;
  var payload = action.payload;

  switch (type) {

    case (_ActionTypes2 || _ActionTypes()).CREATE_PANE_ITEM:
      {
        var gadgetId = payload.gadgetId;
        var isNew = payload.isNew;

        return {
          type: isNew ? (_TrackingEventTypes2 || _TrackingEventTypes()).GADGET_CREATED : (_TrackingEventTypes2 || _TrackingEventTypes()).GADGET_DESERIALIZED,
          data: { gadgetId: gadgetId }
        };
      }

  }
}