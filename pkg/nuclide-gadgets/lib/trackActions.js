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

var _nuclideAnalytics = require('../../nuclide-analytics');

/**
 * Subscribe to the action stream and track things of interest.
 */

function trackActions(action$) {
  return (0, _nuclideAnalytics.trackEvents)(createTrackingEventStream(action$));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWNrQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBd0J3QixZQUFZOzs7Ozs7O3NCQVRkLFFBQVE7Ozs7MkJBQ0QsZUFBZTs7SUFBaEMsV0FBVzs7a0NBQ2Esc0JBQXNCOztJQUE5QyxrQkFBa0I7O29DQUNHLHdCQUF3Qjs7OztnQ0FDL0IseUJBQXlCOzs7Ozs7QUFLcEMsU0FBUyxZQUFZLENBQUMsT0FBOEIsRUFBZTtBQUNoRixTQUFPLG1DQUFZLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FDeEQ7Ozs7Ozs7QUFNTSxTQUFTLHlCQUF5QixDQUN2QyxPQUE4QixFQUNBO0FBQzlCLFNBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQzFDOzs7OztBQUtELFNBQVMsZ0JBQWdCLENBQUMsV0FBbUIsRUFBd0I7O0FBRW5FLE1BQU0sTUFBVyxHQUFHLFdBQVcsQ0FBQztBQUNoQyxNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7Ozs7O0FBUTlDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDbkQsTUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsR0FDM0QsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyx5QkFBeUIsQ0FBQzs7QUFFeEUsTUFBTSxjQUFjLEdBQUcsQ0FDckIsYUFBYSxFQUNiLGFBQWEsSUFBSSxjQUFjLENBQUMsYUFBYSxDQUFDLENBQy9DLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSztXQUFJLEtBQUssSUFBSSxJQUFJO0dBQUEsQ0FBQyxDQUFDO0FBQ2pDLFNBQVMsY0FBYyxDQUE4QjtDQUN0RDs7Ozs7O0FBTUQsU0FBUyx5QkFBeUIsQ0FBQyxLQUFvQixFQUFrQjtBQUN2RSxVQUFRLEtBQUssQ0FBQyxJQUFJOztBQUVoQixTQUFLLGtCQUFrQixDQUFDLGNBQWM7QUFBRTtBQUN0QyxpQ0FBVSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsZUFBTyxFQUFDLElBQUksRUFBSyx1Q0FBcUIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQWlCLEVBQUMsQ0FBQztPQUM5RTs7QUFBQSxBQUVELFNBQUssa0JBQWtCLENBQUMsbUJBQW1CO0FBQUU7QUFDM0MsaUNBQVUsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLGVBQU8sRUFBQyxJQUFJLEVBQUssdUNBQXFCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUFzQixFQUFDLENBQUM7T0FDbkY7O0FBQUEsR0FFRjtDQUNGOzs7OztBQUtELFNBQVMsZUFBZSxDQUFDLE1BQU0sRUFBa0I7TUFDeEMsSUFBSSxHQUFhLE1BQU0sQ0FBdkIsSUFBSTtNQUFFLE9BQU8sR0FBSSxNQUFNLENBQWpCLE9BQU87O0FBRXBCLFVBQVEsSUFBSTs7QUFFVixTQUFLLFdBQVcsQ0FBQyxnQkFBZ0I7QUFBRTtZQUMxQixRQUFRLEdBQVcsT0FBTyxDQUExQixRQUFRO1lBQUUsS0FBSyxHQUFJLE9BQU8sQ0FBaEIsS0FBSzs7QUFDdEIsZUFBTztBQUNMLGNBQUksRUFBRSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsY0FBYyxHQUFHLGtCQUFrQixDQUFDLG1CQUFtQjtBQUN4RixjQUFJLEVBQUUsRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFDO1NBQ2pCLENBQUM7T0FDSDs7QUFBQSxHQUVGO0NBQ0YiLCJmaWxlIjoidHJhY2tBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0FjdGlvbn0gZnJvbSAnLi4vdHlwZXMvQWN0aW9uJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQgdHlwZSB7VHJhY2tpbmdFdmVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCAqIGFzIFRyYWNraW5nRXZlbnRUeXBlcyBmcm9tICcuL1RyYWNraW5nRXZlbnRUeXBlcyc7XG5pbXBvcnQgbm9ybWFsaXplRXZlbnRTdHJpbmcgZnJvbSAnLi9ub3JtYWxpemVFdmVudFN0cmluZyc7XG5pbXBvcnQge3RyYWNrRXZlbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIHRoZSBhY3Rpb24gc3RyZWFtIGFuZCB0cmFjayB0aGluZ3Mgb2YgaW50ZXJlc3QuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYWNrQWN0aW9ucyhhY3Rpb24kOiBSeC5PYnNlcnZhYmxlPEFjdGlvbj4pOiBJRGlzcG9zYWJsZSB7XG4gIHJldHVybiB0cmFja0V2ZW50cyhjcmVhdGVUcmFja2luZ0V2ZW50U3RyZWFtKGFjdGlvbiQpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBzdHJlYW0gb2YgdHJhY2tpbmcgZXZlbnRzIGZyb20gYSBzdHJlYW0gb2YgYWN0aW9ucy4gVGhpcyBpcyBtb3N0bHkgZXhwb3NlZCBmb3IgdGVzdGluZ1xuICogcHVycG9zZXMgc2luY2UsIHVubGlrZSBgdHJhY2tBY3Rpb25zYCwgaXQncyBzaWRlLWVmZmVjdCBmcmVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhY2tpbmdFdmVudFN0cmVhbShcbiAgYWN0aW9uJDogUnguT2JzZXJ2YWJsZTxBY3Rpb24+LFxuKTogUnguT2JzZXJ2YWJsZTxUcmFja2luZ0V2ZW50PiB7XG4gIHJldHVybiBhY3Rpb24kLmZsYXRNYXAodG9UcmFja2luZ0V2ZW50cyk7XG59XG5cbi8qKlxuICogTWFwIGFuIGFwcGxpY2F0aW9uIGFjdGlvbiB0byBhbiBBcnJheSBvZiB0cmFja2luZyBldmVudHMuXG4gKi9cbmZ1bmN0aW9uIHRvVHJhY2tpbmdFdmVudHModHlwZWRBY3Rpb246IEFjdGlvbik6IEFycmF5PFRyYWNraW5nRXZlbnQ+IHtcbiAgLy8gVE9ETyBNYWtlIHRoaXMgYWxsIHR5cGVjaGVjay4gVGhpcyBpcyBzdGlsbCBiZXR0ZXIgdGhhbiBiZWZvcmUuIFRoZSBhbnkgaXMganVzdCBleHBsaWNpdCBub3cuXG4gIGNvbnN0IGFjdGlvbjogYW55ID0gdHlwZWRBY3Rpb247XG4gIGNvbnN0IHN0YW5kYXJkRXZlbnQgPSB0b1RyYWNraW5nRXZlbnQoYWN0aW9uKTtcblxuICAvLyBGb3IgZWFjaCBldmVudCB3ZSdyZSB0cmFja2luZywgYWxsb3cgdGhlIGdhZGdldCBjcmVhdG9yIHRvIHNwZWNpZnkgdGhlaXIgb3duIGN1c3RvbSBldmVudCB0b28uXG4gIC8vIEFwcGxpY2F0aW9uIGFjdGlvbnMgdGhlbXNlbHZlcyBhcmUgY29uc2lkZXJlZCBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzIHNvIHdlIGRvbid0IHdhbnQgdG8gZXhwb3NlXG4gIC8vIHRob3NlIHRvIHRoZSBnYWRnZXQgY3JlYXRvciwgYnV0IHdlIGRvIHdhbnQgdG8gcHJvdmlkZSBzb21lIGN1c3RvbWl6YXRpb24gb2YgdGhlIHN0YW5kYXJkXG4gIC8vIHRyYWNraW5nIGV2ZW50cyAoY3JlYXRlZCwgZGVzZXJpYWxpemVkLCBldGMuKS4gVGhlcmVmb3JlLCB3ZSBhbGxvdyB0aGUgZ2FkZ2V0IGNyZWF0b3IgdG9cbiAgLy8gcHJvdmlkZSBhIGhvb2sgdGhhdCBjcmVhdGVzIGEgY3VzdG9tIHZlcnNpb24gb2YgdGhvc2UgZXZlbnRzLiBBbnkgb3RoZXIgZXZlbnRzIGNhbiBiZSB0cmFja2VkXG4gIC8vIG5vcm1hbGx5IHVzaW5nIHRoZSBpbnRlcmZhY2VzIHByb3ZpZGVkIGJ5IG51Y2xpZGUtYW5hbHl0aWNzLlxuICBjb25zdCBpdGVtID0gYWN0aW9uLnBheWxvYWQgJiYgYWN0aW9uLnBheWxvYWQuaXRlbTtcbiAgY29uc3QgZ2V0Q3VzdG9tRXZlbnQgPSBpdGVtICYmIGl0ZW0uY3JlYXRlQ3VzdG9tVHJhY2tpbmdFdmVudCA/XG4gICAgaXRlbS5jcmVhdGVDdXN0b21UcmFja2luZ0V2ZW50LmJpbmQoaXRlbSkgOiBjcmVhdGVDdXN0b21UcmFja2luZ0V2ZW50O1xuXG4gIGNvbnN0IHRyYWNraW5nRXZlbnRzID0gW1xuICAgIHN0YW5kYXJkRXZlbnQsXG4gICAgc3RhbmRhcmRFdmVudCAmJiBnZXRDdXN0b21FdmVudChzdGFuZGFyZEV2ZW50KSxcbiAgXS5maWx0ZXIoZXZlbnQgPT4gZXZlbnQgIT0gbnVsbCk7XG4gIHJldHVybiAoKHRyYWNraW5nRXZlbnRzOiBhbnkpOiBBcnJheTxUcmFja2luZ0V2ZW50Pik7XG59XG5cbi8qKlxuICogQSBmYWxsYmFjayBmb3IgY3JlYXRpbmcgXCJjdXN0b21cIiBldmVudHMuIFRoaXMgaXNuJ3Qgc3RyaWN0bHkgbmVjZXNzYXJ5IChzaW5jZSBhbGwgdGhlIGluZm9ybWF0aW9uXG4gKiBjYW4gYmUgZGVyaXZlZCBmcm9tIHRoZSBvcmlnaW5hbCBldmVudCksIGJ1dCBpdCBtYWtlcyBvdXIgZGFzaGJvYXJkIGEgbGl0dGxlIGVhc2llciB0byBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVDdXN0b21UcmFja2luZ0V2ZW50KGV2ZW50OiBUcmFja2luZ0V2ZW50KTogP1RyYWNraW5nRXZlbnQge1xuICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcblxuICAgIGNhc2UgVHJhY2tpbmdFdmVudFR5cGVzLkdBREdFVF9DUkVBVEVEOiB7XG4gICAgICBpbnZhcmlhbnQoZXZlbnQuZGF0YSAmJiBldmVudC5kYXRhLmdhZGdldElkKTtcbiAgICAgIHJldHVybiB7dHlwZTogYCR7bm9ybWFsaXplRXZlbnRTdHJpbmcoZXZlbnQuZGF0YS5nYWRnZXRJZCl9LWdhZGdldC1jcmVhdGVkYH07XG4gICAgfVxuXG4gICAgY2FzZSBUcmFja2luZ0V2ZW50VHlwZXMuR0FER0VUX0RFU0VSSUFMSVpFRDoge1xuICAgICAgaW52YXJpYW50KGV2ZW50LmRhdGEgJiYgZXZlbnQuZGF0YS5nYWRnZXRJZCk7XG4gICAgICByZXR1cm4ge3R5cGU6IGAke25vcm1hbGl6ZUV2ZW50U3RyaW5nKGV2ZW50LmRhdGEuZ2FkZ2V0SWQpfS1nYWRnZXQtZGVzZXJpYWxpemVkYH07XG4gICAgfVxuXG4gIH1cbn1cblxuLyoqXG4gKiBNYXAgYXBwbGljYXRpb24gYWN0aW9ucyB0byB0cmFja2luZyBldmVudHMuXG4gKi9cbmZ1bmN0aW9uIHRvVHJhY2tpbmdFdmVudChhY3Rpb24pOiA/VHJhY2tpbmdFdmVudCB7XG4gIGNvbnN0IHt0eXBlLCBwYXlsb2FkfSA9IGFjdGlvbjtcblxuICBzd2l0Y2ggKHR5cGUpIHtcblxuICAgIGNhc2UgQWN0aW9uVHlwZXMuQ1JFQVRFX1BBTkVfSVRFTToge1xuICAgICAgY29uc3Qge2dhZGdldElkLCBpc05ld30gPSBwYXlsb2FkO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogaXNOZXcgPyBUcmFja2luZ0V2ZW50VHlwZXMuR0FER0VUX0NSRUFURUQgOiBUcmFja2luZ0V2ZW50VHlwZXMuR0FER0VUX0RFU0VSSUFMSVpFRCxcbiAgICAgICAgZGF0YToge2dhZGdldElkfSxcbiAgICAgIH07XG4gICAgfVxuXG4gIH1cbn1cbiJdfQ==