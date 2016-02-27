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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWNrQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBd0J3QixZQUFZOzs7Ozs7O3NCQVRkLFFBQVE7Ozs7MkJBQ0QsZUFBZTs7SUFBaEMsV0FBVzs7a0NBQ2Esc0JBQXNCOztJQUE5QyxrQkFBa0I7O29DQUNHLHdCQUF3Qjs7Ozt5QkFDL0IsaUJBQWlCOzs7Ozs7QUFLNUIsU0FBUyxZQUFZLENBQUMsT0FBOEIsRUFBZTtBQUNoRixTQUFPLDRCQUFZLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FDeEQ7Ozs7Ozs7QUFNTSxTQUFTLHlCQUF5QixDQUFDLE9BQXNCLEVBQWlCO0FBQy9FLFNBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQzFDOzs7OztBQUtELFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUF3QjtBQUN0RCxNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7Ozs7O0FBUTlDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDbkQsTUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsR0FDM0QsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyx5QkFBeUIsQ0FBQzs7QUFFeEUsTUFBTSxjQUFjLEdBQUcsQ0FDckIsYUFBYSxFQUNiLGFBQWEsSUFBSSxjQUFjLENBQUMsYUFBYSxDQUFDLENBQy9DLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSztXQUFJLEtBQUssSUFBSSxJQUFJO0dBQUEsQ0FBQyxDQUFDO0FBQ2pDLFNBQVMsY0FBYyxDQUE4QjtDQUN0RDs7Ozs7O0FBTUQsU0FBUyx5QkFBeUIsQ0FBQyxLQUFvQixFQUFrQjtBQUN2RSxVQUFRLEtBQUssQ0FBQyxJQUFJOztBQUVoQixTQUFLLGtCQUFrQixDQUFDLGNBQWM7QUFBRTtBQUN0QyxpQ0FBVSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsZUFBTyxFQUFDLElBQUksRUFBSyx1Q0FBcUIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQWlCLEVBQUMsQ0FBQztPQUM5RTs7QUFBQSxBQUVELFNBQUssa0JBQWtCLENBQUMsbUJBQW1CO0FBQUU7QUFDM0MsaUNBQVUsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLGVBQU8sRUFBQyxJQUFJLEVBQUssdUNBQXFCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUFzQixFQUFDLENBQUM7T0FDbkY7O0FBQUEsR0FFRjtDQUNGOzs7OztBQUtELFNBQVMsZUFBZSxDQUFDLE1BQU0sRUFBa0I7TUFDeEMsSUFBSSxHQUFhLE1BQU0sQ0FBdkIsSUFBSTtNQUFFLE9BQU8sR0FBSSxNQUFNLENBQWpCLE9BQU87O0FBRXBCLFVBQVEsSUFBSTs7QUFFVixTQUFLLFdBQVcsQ0FBQyxnQkFBZ0I7QUFBRTtZQUMxQixRQUFRLEdBQVcsT0FBTyxDQUExQixRQUFRO1lBQUUsS0FBSyxHQUFJLE9BQU8sQ0FBaEIsS0FBSzs7QUFDdEIsZUFBTztBQUNMLGNBQUksRUFBRSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsY0FBYyxHQUFHLGtCQUFrQixDQUFDLG1CQUFtQjtBQUN4RixjQUFJLEVBQUUsRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFDO1NBQ2pCLENBQUM7T0FDSDs7QUFBQSxHQUVGO0NBQ0YiLCJmaWxlIjoidHJhY2tBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0FjdGlvbn0gZnJvbSAnLi4vdHlwZXMvQWN0aW9uJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtUcmFja2luZ0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCAqIGFzIFRyYWNraW5nRXZlbnRUeXBlcyBmcm9tICcuL1RyYWNraW5nRXZlbnRUeXBlcyc7XG5pbXBvcnQgbm9ybWFsaXplRXZlbnRTdHJpbmcgZnJvbSAnLi9ub3JtYWxpemVFdmVudFN0cmluZyc7XG5pbXBvcnQge3RyYWNrRXZlbnRzfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byB0aGUgYWN0aW9uIHN0cmVhbSBhbmQgdHJhY2sgdGhpbmdzIG9mIGludGVyZXN0LlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFja0FjdGlvbnMoYWN0aW9uJDogUnguT2JzZXJ2YWJsZTxBY3Rpb24+KTogSURpc3Bvc2FibGUge1xuICByZXR1cm4gdHJhY2tFdmVudHMoY3JlYXRlVHJhY2tpbmdFdmVudFN0cmVhbShhY3Rpb24kKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgc3RyZWFtIG9mIHRyYWNraW5nIGV2ZW50cyBmcm9tIGEgc3RyZWFtIG9mIGFjdGlvbnMuIFRoaXMgaXMgbW9zdGx5IGV4cG9zZWQgZm9yIHRlc3RpbmdcbiAqIHB1cnBvc2VzIHNpbmNlLCB1bmxpa2UgYHRyYWNrQWN0aW9uc2AsIGl0J3Mgc2lkZS1lZmZlY3QgZnJlZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNraW5nRXZlbnRTdHJlYW0oYWN0aW9uJDogUnguT2JzZXJ2YWJsZSk6IFJ4Lk9ic2VydmFibGUge1xuICByZXR1cm4gYWN0aW9uJC5mbGF0TWFwKHRvVHJhY2tpbmdFdmVudHMpO1xufVxuXG4vKipcbiAqIE1hcCBhbiBhcHBsaWNhdGlvbiBhY3Rpb24gdG8gYW4gQXJyYXkgb2YgdHJhY2tpbmcgZXZlbnRzLlxuICovXG5mdW5jdGlvbiB0b1RyYWNraW5nRXZlbnRzKGFjdGlvbik6IEFycmF5PFRyYWNraW5nRXZlbnQ+IHtcbiAgY29uc3Qgc3RhbmRhcmRFdmVudCA9IHRvVHJhY2tpbmdFdmVudChhY3Rpb24pO1xuXG4gIC8vIEZvciBlYWNoIGV2ZW50IHdlJ3JlIHRyYWNraW5nLCBhbGxvdyB0aGUgZ2FkZ2V0IGNyZWF0b3IgdG8gc3BlY2lmeSB0aGVpciBvd24gY3VzdG9tIGV2ZW50IHRvby5cbiAgLy8gQXBwbGljYXRpb24gYWN0aW9ucyB0aGVtc2VsdmVzIGFyZSBjb25zaWRlcmVkIGltcGxlbWVudGF0aW9uIGRldGFpbHMgc28gd2UgZG9uJ3Qgd2FudCB0byBleHBvc2VcbiAgLy8gdGhvc2UgdG8gdGhlIGdhZGdldCBjcmVhdG9yLCBidXQgd2UgZG8gd2FudCB0byBwcm92aWRlIHNvbWUgY3VzdG9taXphdGlvbiBvZiB0aGUgc3RhbmRhcmRcbiAgLy8gdHJhY2tpbmcgZXZlbnRzIChjcmVhdGVkLCBkZXNlcmlhbGl6ZWQsIGV0Yy4pLiBUaGVyZWZvcmUsIHdlIGFsbG93IHRoZSBnYWRnZXQgY3JlYXRvciB0b1xuICAvLyBwcm92aWRlIGEgaG9vayB0aGF0IGNyZWF0ZXMgYSBjdXN0b20gdmVyc2lvbiBvZiB0aG9zZSBldmVudHMuIEFueSBvdGhlciBldmVudHMgY2FuIGJlIHRyYWNrZWRcbiAgLy8gbm9ybWFsbHkgdXNpbmcgdGhlIGludGVyZmFjZXMgcHJvdmlkZWQgYnkgbnVjbGlkZS1hbmFseXRpY3MuXG4gIGNvbnN0IGl0ZW0gPSBhY3Rpb24ucGF5bG9hZCAmJiBhY3Rpb24ucGF5bG9hZC5pdGVtO1xuICBjb25zdCBnZXRDdXN0b21FdmVudCA9IGl0ZW0gJiYgaXRlbS5jcmVhdGVDdXN0b21UcmFja2luZ0V2ZW50ID9cbiAgICBpdGVtLmNyZWF0ZUN1c3RvbVRyYWNraW5nRXZlbnQuYmluZChpdGVtKSA6IGNyZWF0ZUN1c3RvbVRyYWNraW5nRXZlbnQ7XG5cbiAgY29uc3QgdHJhY2tpbmdFdmVudHMgPSBbXG4gICAgc3RhbmRhcmRFdmVudCxcbiAgICBzdGFuZGFyZEV2ZW50ICYmIGdldEN1c3RvbUV2ZW50KHN0YW5kYXJkRXZlbnQpLFxuICBdLmZpbHRlcihldmVudCA9PiBldmVudCAhPSBudWxsKTtcbiAgcmV0dXJuICgodHJhY2tpbmdFdmVudHM6IGFueSk6IEFycmF5PFRyYWNraW5nRXZlbnQ+KTtcbn1cblxuLyoqXG4gKiBBIGZhbGxiYWNrIGZvciBjcmVhdGluZyBcImN1c3RvbVwiIGV2ZW50cy4gVGhpcyBpc24ndCBzdHJpY3RseSBuZWNlc3NhcnkgKHNpbmNlIGFsbCB0aGUgaW5mb3JtYXRpb25cbiAqIGNhbiBiZSBkZXJpdmVkIGZyb20gdGhlIG9yaWdpbmFsIGV2ZW50KSwgYnV0IGl0IG1ha2VzIG91ciBkYXNoYm9hcmQgYSBsaXR0bGUgZWFzaWVyIHRvIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUN1c3RvbVRyYWNraW5nRXZlbnQoZXZlbnQ6IFRyYWNraW5nRXZlbnQpOiA/VHJhY2tpbmdFdmVudCB7XG4gIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuXG4gICAgY2FzZSBUcmFja2luZ0V2ZW50VHlwZXMuR0FER0VUX0NSRUFURUQ6IHtcbiAgICAgIGludmFyaWFudChldmVudC5kYXRhICYmIGV2ZW50LmRhdGEuZ2FkZ2V0SWQpO1xuICAgICAgcmV0dXJuIHt0eXBlOiBgJHtub3JtYWxpemVFdmVudFN0cmluZyhldmVudC5kYXRhLmdhZGdldElkKX0tZ2FkZ2V0LWNyZWF0ZWRgfTtcbiAgICB9XG5cbiAgICBjYXNlIFRyYWNraW5nRXZlbnRUeXBlcy5HQURHRVRfREVTRVJJQUxJWkVEOiB7XG4gICAgICBpbnZhcmlhbnQoZXZlbnQuZGF0YSAmJiBldmVudC5kYXRhLmdhZGdldElkKTtcbiAgICAgIHJldHVybiB7dHlwZTogYCR7bm9ybWFsaXplRXZlbnRTdHJpbmcoZXZlbnQuZGF0YS5nYWRnZXRJZCl9LWdhZGdldC1kZXNlcmlhbGl6ZWRgfTtcbiAgICB9XG5cbiAgfVxufVxuXG4vKipcbiAqIE1hcCBhcHBsaWNhdGlvbiBhY3Rpb25zIHRvIHRyYWNraW5nIGV2ZW50cy5cbiAqL1xuZnVuY3Rpb24gdG9UcmFja2luZ0V2ZW50KGFjdGlvbik6ID9UcmFja2luZ0V2ZW50IHtcbiAgY29uc3Qge3R5cGUsIHBheWxvYWR9ID0gYWN0aW9uO1xuXG4gIHN3aXRjaCAodHlwZSkge1xuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5DUkVBVEVfUEFORV9JVEVNOiB7XG4gICAgICBjb25zdCB7Z2FkZ2V0SWQsIGlzTmV3fSA9IHBheWxvYWQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBpc05ldyA/IFRyYWNraW5nRXZlbnRUeXBlcy5HQURHRVRfQ1JFQVRFRCA6IFRyYWNraW5nRXZlbnRUeXBlcy5HQURHRVRfREVTRVJJQUxJWkVELFxuICAgICAgICBkYXRhOiB7Z2FkZ2V0SWR9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgfVxufVxuIl19