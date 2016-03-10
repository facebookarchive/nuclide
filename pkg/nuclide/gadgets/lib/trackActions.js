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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWNrQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBd0J3QixZQUFZOzs7Ozs7O3NCQVRkLFFBQVE7Ozs7MkJBQ0QsZUFBZTs7SUFBaEMsV0FBVzs7a0NBQ2Esc0JBQXNCOztJQUE5QyxrQkFBa0I7O29DQUNHLHdCQUF3Qjs7Ozt5QkFDL0IsaUJBQWlCOzs7Ozs7QUFLNUIsU0FBUyxZQUFZLENBQUMsT0FBOEIsRUFBZTtBQUNoRixTQUFPLDRCQUFZLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FDeEQ7Ozs7Ozs7QUFNTSxTQUFTLHlCQUF5QixDQUN2QyxPQUE4QixFQUNBO0FBQzlCLFNBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQzFDOzs7OztBQUtELFNBQVMsZ0JBQWdCLENBQUMsV0FBbUIsRUFBd0I7O0FBRW5FLE1BQU0sTUFBVyxHQUFHLFdBQVcsQ0FBQztBQUNoQyxNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7Ozs7O0FBUTlDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDbkQsTUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsR0FDM0QsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyx5QkFBeUIsQ0FBQzs7QUFFeEUsTUFBTSxjQUFjLEdBQUcsQ0FDckIsYUFBYSxFQUNiLGFBQWEsSUFBSSxjQUFjLENBQUMsYUFBYSxDQUFDLENBQy9DLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSztXQUFJLEtBQUssSUFBSSxJQUFJO0dBQUEsQ0FBQyxDQUFDO0FBQ2pDLFNBQVMsY0FBYyxDQUE4QjtDQUN0RDs7Ozs7O0FBTUQsU0FBUyx5QkFBeUIsQ0FBQyxLQUFvQixFQUFrQjtBQUN2RSxVQUFRLEtBQUssQ0FBQyxJQUFJOztBQUVoQixTQUFLLGtCQUFrQixDQUFDLGNBQWM7QUFBRTtBQUN0QyxpQ0FBVSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsZUFBTyxFQUFDLElBQUksRUFBSyx1Q0FBcUIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQWlCLEVBQUMsQ0FBQztPQUM5RTs7QUFBQSxBQUVELFNBQUssa0JBQWtCLENBQUMsbUJBQW1CO0FBQUU7QUFDM0MsaUNBQVUsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLGVBQU8sRUFBQyxJQUFJLEVBQUssdUNBQXFCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUFzQixFQUFDLENBQUM7T0FDbkY7O0FBQUEsR0FFRjtDQUNGOzs7OztBQUtELFNBQVMsZUFBZSxDQUFDLE1BQU0sRUFBa0I7TUFDeEMsSUFBSSxHQUFhLE1BQU0sQ0FBdkIsSUFBSTtNQUFFLE9BQU8sR0FBSSxNQUFNLENBQWpCLE9BQU87O0FBRXBCLFVBQVEsSUFBSTs7QUFFVixTQUFLLFdBQVcsQ0FBQyxnQkFBZ0I7QUFBRTtZQUMxQixRQUFRLEdBQVcsT0FBTyxDQUExQixRQUFRO1lBQUUsS0FBSyxHQUFJLE9BQU8sQ0FBaEIsS0FBSzs7QUFDdEIsZUFBTztBQUNMLGNBQUksRUFBRSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsY0FBYyxHQUFHLGtCQUFrQixDQUFDLG1CQUFtQjtBQUN4RixjQUFJLEVBQUUsRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFDO1NBQ2pCLENBQUM7T0FDSDs7QUFBQSxHQUVGO0NBQ0YiLCJmaWxlIjoidHJhY2tBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0FjdGlvbn0gZnJvbSAnLi4vdHlwZXMvQWN0aW9uJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtUcmFja2luZ0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCAqIGFzIFRyYWNraW5nRXZlbnRUeXBlcyBmcm9tICcuL1RyYWNraW5nRXZlbnRUeXBlcyc7XG5pbXBvcnQgbm9ybWFsaXplRXZlbnRTdHJpbmcgZnJvbSAnLi9ub3JtYWxpemVFdmVudFN0cmluZyc7XG5pbXBvcnQge3RyYWNrRXZlbnRzfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byB0aGUgYWN0aW9uIHN0cmVhbSBhbmQgdHJhY2sgdGhpbmdzIG9mIGludGVyZXN0LlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFja0FjdGlvbnMoYWN0aW9uJDogUnguT2JzZXJ2YWJsZTxBY3Rpb24+KTogSURpc3Bvc2FibGUge1xuICByZXR1cm4gdHJhY2tFdmVudHMoY3JlYXRlVHJhY2tpbmdFdmVudFN0cmVhbShhY3Rpb24kKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgc3RyZWFtIG9mIHRyYWNraW5nIGV2ZW50cyBmcm9tIGEgc3RyZWFtIG9mIGFjdGlvbnMuIFRoaXMgaXMgbW9zdGx5IGV4cG9zZWQgZm9yIHRlc3RpbmdcbiAqIHB1cnBvc2VzIHNpbmNlLCB1bmxpa2UgYHRyYWNrQWN0aW9uc2AsIGl0J3Mgc2lkZS1lZmZlY3QgZnJlZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNraW5nRXZlbnRTdHJlYW0oXG4gIGFjdGlvbiQ6IFJ4Lk9ic2VydmFibGU8QWN0aW9uPixcbik6IFJ4Lk9ic2VydmFibGU8VHJhY2tpbmdFdmVudD4ge1xuICByZXR1cm4gYWN0aW9uJC5mbGF0TWFwKHRvVHJhY2tpbmdFdmVudHMpO1xufVxuXG4vKipcbiAqIE1hcCBhbiBhcHBsaWNhdGlvbiBhY3Rpb24gdG8gYW4gQXJyYXkgb2YgdHJhY2tpbmcgZXZlbnRzLlxuICovXG5mdW5jdGlvbiB0b1RyYWNraW5nRXZlbnRzKHR5cGVkQWN0aW9uOiBBY3Rpb24pOiBBcnJheTxUcmFja2luZ0V2ZW50PiB7XG4gIC8vIFRPRE8gTWFrZSB0aGlzIGFsbCB0eXBlY2hlY2suIFRoaXMgaXMgc3RpbGwgYmV0dGVyIHRoYW4gYmVmb3JlLiBUaGUgYW55IGlzIGp1c3QgZXhwbGljaXQgbm93LlxuICBjb25zdCBhY3Rpb246IGFueSA9IHR5cGVkQWN0aW9uO1xuICBjb25zdCBzdGFuZGFyZEV2ZW50ID0gdG9UcmFja2luZ0V2ZW50KGFjdGlvbik7XG5cbiAgLy8gRm9yIGVhY2ggZXZlbnQgd2UncmUgdHJhY2tpbmcsIGFsbG93IHRoZSBnYWRnZXQgY3JlYXRvciB0byBzcGVjaWZ5IHRoZWlyIG93biBjdXN0b20gZXZlbnQgdG9vLlxuICAvLyBBcHBsaWNhdGlvbiBhY3Rpb25zIHRoZW1zZWx2ZXMgYXJlIGNvbnNpZGVyZWQgaW1wbGVtZW50YXRpb24gZGV0YWlscyBzbyB3ZSBkb24ndCB3YW50IHRvIGV4cG9zZVxuICAvLyB0aG9zZSB0byB0aGUgZ2FkZ2V0IGNyZWF0b3IsIGJ1dCB3ZSBkbyB3YW50IHRvIHByb3ZpZGUgc29tZSBjdXN0b21pemF0aW9uIG9mIHRoZSBzdGFuZGFyZFxuICAvLyB0cmFja2luZyBldmVudHMgKGNyZWF0ZWQsIGRlc2VyaWFsaXplZCwgZXRjLikuIFRoZXJlZm9yZSwgd2UgYWxsb3cgdGhlIGdhZGdldCBjcmVhdG9yIHRvXG4gIC8vIHByb3ZpZGUgYSBob29rIHRoYXQgY3JlYXRlcyBhIGN1c3RvbSB2ZXJzaW9uIG9mIHRob3NlIGV2ZW50cy4gQW55IG90aGVyIGV2ZW50cyBjYW4gYmUgdHJhY2tlZFxuICAvLyBub3JtYWxseSB1c2luZyB0aGUgaW50ZXJmYWNlcyBwcm92aWRlZCBieSBudWNsaWRlLWFuYWx5dGljcy5cbiAgY29uc3QgaXRlbSA9IGFjdGlvbi5wYXlsb2FkICYmIGFjdGlvbi5wYXlsb2FkLml0ZW07XG4gIGNvbnN0IGdldEN1c3RvbUV2ZW50ID0gaXRlbSAmJiBpdGVtLmNyZWF0ZUN1c3RvbVRyYWNraW5nRXZlbnQgP1xuICAgIGl0ZW0uY3JlYXRlQ3VzdG9tVHJhY2tpbmdFdmVudC5iaW5kKGl0ZW0pIDogY3JlYXRlQ3VzdG9tVHJhY2tpbmdFdmVudDtcblxuICBjb25zdCB0cmFja2luZ0V2ZW50cyA9IFtcbiAgICBzdGFuZGFyZEV2ZW50LFxuICAgIHN0YW5kYXJkRXZlbnQgJiYgZ2V0Q3VzdG9tRXZlbnQoc3RhbmRhcmRFdmVudCksXG4gIF0uZmlsdGVyKGV2ZW50ID0+IGV2ZW50ICE9IG51bGwpO1xuICByZXR1cm4gKCh0cmFja2luZ0V2ZW50czogYW55KTogQXJyYXk8VHJhY2tpbmdFdmVudD4pO1xufVxuXG4vKipcbiAqIEEgZmFsbGJhY2sgZm9yIGNyZWF0aW5nIFwiY3VzdG9tXCIgZXZlbnRzLiBUaGlzIGlzbid0IHN0cmljdGx5IG5lY2Vzc2FyeSAoc2luY2UgYWxsIHRoZSBpbmZvcm1hdGlvblxuICogY2FuIGJlIGRlcml2ZWQgZnJvbSB0aGUgb3JpZ2luYWwgZXZlbnQpLCBidXQgaXQgbWFrZXMgb3VyIGRhc2hib2FyZCBhIGxpdHRsZSBlYXNpZXIgdG8gcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3VzdG9tVHJhY2tpbmdFdmVudChldmVudDogVHJhY2tpbmdFdmVudCk6ID9UcmFja2luZ0V2ZW50IHtcbiAgc3dpdGNoIChldmVudC50eXBlKSB7XG5cbiAgICBjYXNlIFRyYWNraW5nRXZlbnRUeXBlcy5HQURHRVRfQ1JFQVRFRDoge1xuICAgICAgaW52YXJpYW50KGV2ZW50LmRhdGEgJiYgZXZlbnQuZGF0YS5nYWRnZXRJZCk7XG4gICAgICByZXR1cm4ge3R5cGU6IGAke25vcm1hbGl6ZUV2ZW50U3RyaW5nKGV2ZW50LmRhdGEuZ2FkZ2V0SWQpfS1nYWRnZXQtY3JlYXRlZGB9O1xuICAgIH1cblxuICAgIGNhc2UgVHJhY2tpbmdFdmVudFR5cGVzLkdBREdFVF9ERVNFUklBTElaRUQ6IHtcbiAgICAgIGludmFyaWFudChldmVudC5kYXRhICYmIGV2ZW50LmRhdGEuZ2FkZ2V0SWQpO1xuICAgICAgcmV0dXJuIHt0eXBlOiBgJHtub3JtYWxpemVFdmVudFN0cmluZyhldmVudC5kYXRhLmdhZGdldElkKX0tZ2FkZ2V0LWRlc2VyaWFsaXplZGB9O1xuICAgIH1cblxuICB9XG59XG5cbi8qKlxuICogTWFwIGFwcGxpY2F0aW9uIGFjdGlvbnMgdG8gdHJhY2tpbmcgZXZlbnRzLlxuICovXG5mdW5jdGlvbiB0b1RyYWNraW5nRXZlbnQoYWN0aW9uKTogP1RyYWNraW5nRXZlbnQge1xuICBjb25zdCB7dHlwZSwgcGF5bG9hZH0gPSBhY3Rpb247XG5cbiAgc3dpdGNoICh0eXBlKSB7XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLkNSRUFURV9QQU5FX0lURU06IHtcbiAgICAgIGNvbnN0IHtnYWRnZXRJZCwgaXNOZXd9ID0gcGF5bG9hZDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IGlzTmV3ID8gVHJhY2tpbmdFdmVudFR5cGVzLkdBREdFVF9DUkVBVEVEIDogVHJhY2tpbmdFdmVudFR5cGVzLkdBREdFVF9ERVNFUklBTElaRUQsXG4gICAgICAgIGRhdGE6IHtnYWRnZXRJZH0sXG4gICAgICB9O1xuICAgIH1cblxuICB9XG59XG4iXX0=