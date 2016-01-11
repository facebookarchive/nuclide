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

exports['default'] = trackActions;
exports.createTrackingEventStream = createTrackingEventStream;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _TrackingEventTypes = require('./TrackingEventTypes');

var TrackingEventTypes = _interopRequireWildcard(_TrackingEventTypes);

var _normalizeEventString = require('./normalizeEventString');

var _normalizeEventString2 = _interopRequireDefault(_normalizeEventString);

var _analytics = require('../../analytics');

/**
 * Subscribe to the action stream and track things of interest.
 */

function trackActions(action$) {
  return (0, _analytics.trackEvents)(createTrackingEventStream(action$));
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
function toTrackingEvents(action) {
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

    case TrackingEventTypes.GADGET_CREATED:
      {
        (0, _assert2['default'])(event.data && event.data.gadgetId);
        return { type: (0, _normalizeEventString2['default'])(event.data.gadgetId) + '-gadget-created' };
      }

    case TrackingEventTypes.GADGET_DESERIALIZED:
      {
        (0, _assert2['default'])(event.data && event.data.gadgetId);
        return { type: (0, _normalizeEventString2['default'])(event.data.gadgetId) + '-gadget-deserialized' };
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

    case ActionTypes.CREATE_PANE_ITEM:
      {
        var gadgetId = payload.gadgetId;
        var isNew = payload.isNew;

        return {
          type: isNew ? TrackingEventTypes.GADGET_CREATED : TrackingEventTypes.GADGET_DESERIALIZED,
          data: { gadgetId: gadgetId }
        };
      }

  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWNrQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBd0J3QixZQUFZOzs7Ozs7O3NCQVRkLFFBQVE7Ozs7MkJBQ0QsZUFBZTs7SUFBaEMsV0FBVzs7a0NBQ2Esc0JBQXNCOztJQUE5QyxrQkFBa0I7O29DQUNHLHdCQUF3Qjs7Ozt5QkFDL0IsaUJBQWlCOzs7Ozs7QUFLNUIsU0FBUyxZQUFZLENBQUMsT0FBOEIsRUFBb0I7QUFDckYsU0FBTyw0QkFBWSx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0NBQ3hEOzs7Ozs7O0FBTU0sU0FBUyx5QkFBeUIsQ0FBQyxPQUFzQixFQUFpQjtBQUMvRSxTQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztDQUMxQzs7Ozs7QUFLRCxTQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBd0I7QUFDdEQsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7Ozs7OztBQVE5QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ25ELE1BQU0sY0FBYyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMseUJBQXlCLEdBQzNELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcseUJBQXlCLENBQUM7O0FBRXhFLE1BQU0sY0FBYyxHQUFHLENBQ3JCLGFBQWEsRUFDYixhQUFhLElBQUksY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUMvQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLElBQUksSUFBSTtHQUFBLENBQUMsQ0FBQztBQUNqQyxTQUFTLGNBQWMsQ0FBOEI7Q0FDdEQ7Ozs7OztBQU1ELFNBQVMseUJBQXlCLENBQUMsS0FBb0IsRUFBa0I7QUFDdkUsVUFBUSxLQUFLLENBQUMsSUFBSTs7QUFFaEIsU0FBSyxrQkFBa0IsQ0FBQyxjQUFjO0FBQUU7QUFDdEMsaUNBQVUsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLGVBQU8sRUFBQyxJQUFJLEVBQUssdUNBQXFCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFpQixFQUFDLENBQUM7T0FDOUU7O0FBQUEsQUFFRCxTQUFLLGtCQUFrQixDQUFDLG1CQUFtQjtBQUFFO0FBQzNDLGlDQUFVLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QyxlQUFPLEVBQUMsSUFBSSxFQUFLLHVDQUFxQixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBc0IsRUFBQyxDQUFDO09BQ25GOztBQUFBLEdBRUY7Q0FDRjs7Ozs7QUFLRCxTQUFTLGVBQWUsQ0FBQyxNQUFNLEVBQWtCO01BQ3hDLElBQUksR0FBYSxNQUFNLENBQXZCLElBQUk7TUFBRSxPQUFPLEdBQUksTUFBTSxDQUFqQixPQUFPOztBQUVwQixVQUFRLElBQUk7O0FBRVYsU0FBSyxXQUFXLENBQUMsZ0JBQWdCO0FBQUU7WUFDMUIsUUFBUSxHQUFXLE9BQU8sQ0FBMUIsUUFBUTtZQUFFLEtBQUssR0FBSSxPQUFPLENBQWhCLEtBQUs7O0FBQ3RCLGVBQU87QUFDTCxjQUFJLEVBQUUsS0FBSyxHQUFHLGtCQUFrQixDQUFDLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxtQkFBbUI7QUFDeEYsY0FBSSxFQUFFLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBQztTQUNqQixDQUFDO09BQ0g7O0FBQUEsR0FFRjtDQUNGIiwiZmlsZSI6InRyYWNrQWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtBY3Rpb259IGZyb20gJy4uL3R5cGVzL0FjdGlvbic7XG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7VHJhY2tpbmdFdmVudH0gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0ICogYXMgQWN0aW9uVHlwZXMgZnJvbSAnLi9BY3Rpb25UeXBlcyc7XG5pbXBvcnQgKiBhcyBUcmFja2luZ0V2ZW50VHlwZXMgZnJvbSAnLi9UcmFja2luZ0V2ZW50VHlwZXMnO1xuaW1wb3J0IG5vcm1hbGl6ZUV2ZW50U3RyaW5nIGZyb20gJy4vbm9ybWFsaXplRXZlbnRTdHJpbmcnO1xuaW1wb3J0IHt0cmFja0V2ZW50c30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gdGhlIGFjdGlvbiBzdHJlYW0gYW5kIHRyYWNrIHRoaW5ncyBvZiBpbnRlcmVzdC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhY2tBY3Rpb25zKGFjdGlvbiQ6IFJ4Lk9ic2VydmFibGU8QWN0aW9uPik6IGF0b20kSURpc3Bvc2FibGUge1xuICByZXR1cm4gdHJhY2tFdmVudHMoY3JlYXRlVHJhY2tpbmdFdmVudFN0cmVhbShhY3Rpb24kKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgc3RyZWFtIG9mIHRyYWNraW5nIGV2ZW50cyBmcm9tIGEgc3RyZWFtIG9mIGFjdGlvbnMuIFRoaXMgaXMgbW9zdGx5IGV4cG9zZWQgZm9yIHRlc3RpbmdcbiAqIHB1cnBvc2VzIHNpbmNlLCB1bmxpa2UgYHRyYWNrQWN0aW9uc2AsIGl0J3Mgc2lkZS1lZmZlY3QgZnJlZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNraW5nRXZlbnRTdHJlYW0oYWN0aW9uJDogUnguT2JzZXJ2YWJsZSk6IFJ4Lk9ic2VydmFibGUge1xuICByZXR1cm4gYWN0aW9uJC5mbGF0TWFwKHRvVHJhY2tpbmdFdmVudHMpO1xufVxuXG4vKipcbiAqIE1hcCBhbiBhcHBsaWNhdGlvbiBhY3Rpb24gdG8gYW4gQXJyYXkgb2YgdHJhY2tpbmcgZXZlbnRzLlxuICovXG5mdW5jdGlvbiB0b1RyYWNraW5nRXZlbnRzKGFjdGlvbik6IEFycmF5PFRyYWNraW5nRXZlbnQ+IHtcbiAgY29uc3Qgc3RhbmRhcmRFdmVudCA9IHRvVHJhY2tpbmdFdmVudChhY3Rpb24pO1xuXG4gIC8vIEZvciBlYWNoIGV2ZW50IHdlJ3JlIHRyYWNraW5nLCBhbGxvdyB0aGUgZ2FkZ2V0IGNyZWF0b3IgdG8gc3BlY2lmeSB0aGVpciBvd24gY3VzdG9tIGV2ZW50IHRvby5cbiAgLy8gQXBwbGljYXRpb24gYWN0aW9ucyB0aGVtc2VsdmVzIGFyZSBjb25zaWRlcmVkIGltcGxlbWVudGF0aW9uIGRldGFpbHMgc28gd2UgZG9uJ3Qgd2FudCB0byBleHBvc2VcbiAgLy8gdGhvc2UgdG8gdGhlIGdhZGdldCBjcmVhdG9yLCBidXQgd2UgZG8gd2FudCB0byBwcm92aWRlIHNvbWUgY3VzdG9taXphdGlvbiBvZiB0aGUgc3RhbmRhcmRcbiAgLy8gdHJhY2tpbmcgZXZlbnRzIChjcmVhdGVkLCBkZXNlcmlhbGl6ZWQsIGV0Yy4pLiBUaGVyZWZvcmUsIHdlIGFsbG93IHRoZSBnYWRnZXQgY3JlYXRvciB0b1xuICAvLyBwcm92aWRlIGEgaG9vayB0aGF0IGNyZWF0ZXMgYSBjdXN0b20gdmVyc2lvbiBvZiB0aG9zZSBldmVudHMuIEFueSBvdGhlciBldmVudHMgY2FuIGJlIHRyYWNrZWRcbiAgLy8gbm9ybWFsbHkgdXNpbmcgdGhlIGludGVyZmFjZXMgcHJvdmlkZWQgYnkgbnVjbGlkZS1hbmFseXRpY3MuXG4gIGNvbnN0IGl0ZW0gPSBhY3Rpb24ucGF5bG9hZCAmJiBhY3Rpb24ucGF5bG9hZC5pdGVtO1xuICBjb25zdCBnZXRDdXN0b21FdmVudCA9IGl0ZW0gJiYgaXRlbS5jcmVhdGVDdXN0b21UcmFja2luZ0V2ZW50ID9cbiAgICBpdGVtLmNyZWF0ZUN1c3RvbVRyYWNraW5nRXZlbnQuYmluZChpdGVtKSA6IGNyZWF0ZUN1c3RvbVRyYWNraW5nRXZlbnQ7XG5cbiAgY29uc3QgdHJhY2tpbmdFdmVudHMgPSBbXG4gICAgc3RhbmRhcmRFdmVudCxcbiAgICBzdGFuZGFyZEV2ZW50ICYmIGdldEN1c3RvbUV2ZW50KHN0YW5kYXJkRXZlbnQpLFxuICBdLmZpbHRlcihldmVudCA9PiBldmVudCAhPSBudWxsKTtcbiAgcmV0dXJuICgodHJhY2tpbmdFdmVudHM6IGFueSk6IEFycmF5PFRyYWNraW5nRXZlbnQ+KTtcbn1cblxuLyoqXG4gKiBBIGZhbGxiYWNrIGZvciBjcmVhdGluZyBcImN1c3RvbVwiIGV2ZW50cy4gVGhpcyBpc24ndCBzdHJpY3RseSBuZWNlc3NhcnkgKHNpbmNlIGFsbCB0aGUgaW5mb3JtYXRpb25cbiAqIGNhbiBiZSBkZXJpdmVkIGZyb20gdGhlIG9yaWdpbmFsIGV2ZW50KSwgYnV0IGl0IG1ha2VzIG91ciBkYXNoYm9hcmQgYSBsaXR0bGUgZWFzaWVyIHRvIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUN1c3RvbVRyYWNraW5nRXZlbnQoZXZlbnQ6IFRyYWNraW5nRXZlbnQpOiA/VHJhY2tpbmdFdmVudCB7XG4gIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuXG4gICAgY2FzZSBUcmFja2luZ0V2ZW50VHlwZXMuR0FER0VUX0NSRUFURUQ6IHtcbiAgICAgIGludmFyaWFudChldmVudC5kYXRhICYmIGV2ZW50LmRhdGEuZ2FkZ2V0SWQpO1xuICAgICAgcmV0dXJuIHt0eXBlOiBgJHtub3JtYWxpemVFdmVudFN0cmluZyhldmVudC5kYXRhLmdhZGdldElkKX0tZ2FkZ2V0LWNyZWF0ZWRgfTtcbiAgICB9XG5cbiAgICBjYXNlIFRyYWNraW5nRXZlbnRUeXBlcy5HQURHRVRfREVTRVJJQUxJWkVEOiB7XG4gICAgICBpbnZhcmlhbnQoZXZlbnQuZGF0YSAmJiBldmVudC5kYXRhLmdhZGdldElkKTtcbiAgICAgIHJldHVybiB7dHlwZTogYCR7bm9ybWFsaXplRXZlbnRTdHJpbmcoZXZlbnQuZGF0YS5nYWRnZXRJZCl9LWdhZGdldC1kZXNlcmlhbGl6ZWRgfTtcbiAgICB9XG5cbiAgfVxufVxuXG4vKipcbiAqIE1hcCBhcHBsaWNhdGlvbiBhY3Rpb25zIHRvIHRyYWNraW5nIGV2ZW50cy5cbiAqL1xuZnVuY3Rpb24gdG9UcmFja2luZ0V2ZW50KGFjdGlvbik6ID9UcmFja2luZ0V2ZW50IHtcbiAgY29uc3Qge3R5cGUsIHBheWxvYWR9ID0gYWN0aW9uO1xuXG4gIHN3aXRjaCAodHlwZSkge1xuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5DUkVBVEVfUEFORV9JVEVNOiB7XG4gICAgICBjb25zdCB7Z2FkZ2V0SWQsIGlzTmV3fSA9IHBheWxvYWQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBpc05ldyA/IFRyYWNraW5nRXZlbnRUeXBlcy5HQURHRVRfQ1JFQVRFRCA6IFRyYWNraW5nRXZlbnRUeXBlcy5HQURHRVRfREVTRVJJQUxJWkVELFxuICAgICAgICBkYXRhOiB7Z2FkZ2V0SWR9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgfVxufVxuIl19