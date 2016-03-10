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

exports['default'] = createStateStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

/**
 * Convert a stream of actions into a stream of application states.
 */

function createStateStream(action$, initialState) {
  var state$ = new _rx2['default'].BehaviorSubject(initialState);
  action$.scan(handleAction, initialState).subscribe(state$);
  return state$;
}

/**
 * Transform the state based on the given action and return the result.
 */
function handleAction(state, action) {
  switch (action.type) {

    case ActionTypes.CREATE_PANE_ITEM:
      {
        var _action$payload = action.payload;
        var item = _action$payload.item;
        var props = _action$payload.props;
        var component = _action$payload.component;

        return state.merge({
          components: state.get('components').set(item, component),
          props: state.get('props').set(item, props)
        });
      }

    case ActionTypes.DEACTIVATE:
      {
        return state.set('gadgets', _immutable2['default'].Map());
      }

    case ActionTypes.DESTROY_PANE_ITEM:
      {
        var item = action.payload.item;

        return state.merge({
          components: state.get('components')['delete'](item),
          props: state.get('props')['delete'](item)
        });
      }

    case ActionTypes.REGISTER_GADGET:
      {
        var gadgets = state.get('gadgets');
        var gadget = action.payload.gadget;

        return state.set('gadgets', gadgets.set(gadget.gadgetId, gadget));
      }

    case ActionTypes.UNREGISTER_GADGET:
      {
        var _ret = (function () {
          var gadgets = state.get('gadgets');
          var gadgetId = action.payload.gadgetId;

          return {
            v: state.set('gadgets', gadgets.filter(function (gadget) {
              return gadget.gadgetId !== gadgetId;
            }))
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }

    case ActionTypes.UPDATE_PANE_ITEM:
      {
        var _action$payload2 = action.payload;
        var item = _action$payload2.item;
        var props = _action$payload2.props;

        return state.set('props', state.get('props').set(item, props));
      }

    default:
      throw new Error('Unhandled action type: ' + action.type);

  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZVN0YXRlU3RyZWFtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztxQkFvQndCLGlCQUFpQjs7Ozs7OzJCQVBaLGVBQWU7O0lBQWhDLFdBQVc7O3lCQUNELFdBQVc7Ozs7a0JBQ2xCLElBQUk7Ozs7Ozs7O0FBS0osU0FBUyxpQkFBaUIsQ0FDdkMsT0FBOEIsRUFDOUIsWUFBMkIsRUFDUTtBQUNuQyxNQUFNLE1BQXlDLEdBQUcsSUFBSSxnQkFBRyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkYsU0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7Ozs7O0FBS0QsU0FBUyxZQUFZLENBQUMsS0FBb0IsRUFBRSxNQUFjLEVBQWlCO0FBQ3pFLFVBQVEsTUFBTSxDQUFDLElBQUk7O0FBRWpCLFNBQUssV0FBVyxDQUFDLGdCQUFnQjtBQUFFOzhCQUNBLE1BQU0sQ0FBQyxPQUFPO1lBQXhDLElBQUksbUJBQUosSUFBSTtZQUFFLEtBQUssbUJBQUwsS0FBSztZQUFFLFNBQVMsbUJBQVQsU0FBUzs7QUFDN0IsZUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ2pCLG9CQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztBQUN4RCxlQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztTQUMzQyxDQUFDLENBQUM7T0FDSjs7QUFBQSxBQUVELFNBQUssV0FBVyxDQUFDLFVBQVU7QUFBRTtBQUMzQixlQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLHVCQUFVLEdBQUcsRUFBRSxDQUFDLENBQUM7T0FDOUM7O0FBQUEsQUFFRCxTQUFLLFdBQVcsQ0FBQyxpQkFBaUI7QUFBRTtZQUMzQixJQUFJLEdBQUksTUFBTSxDQUFDLE9BQU8sQ0FBdEIsSUFBSTs7QUFDWCxlQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDakIsb0JBQVUsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFPLENBQUMsSUFBSSxDQUFDO0FBQ2hELGVBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFPLENBQUMsSUFBSSxDQUFDO1NBQ3ZDLENBQUMsQ0FBQztPQUNKOztBQUFBLEFBRUQsU0FBSyxXQUFXLENBQUMsZUFBZTtBQUFFO0FBQ2hDLFlBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUIsTUFBTSxHQUFJLE1BQU0sQ0FBQyxPQUFPLENBQXhCLE1BQU07O0FBQ2IsZUFBTyxLQUFLLENBQUMsR0FBRyxDQUNkLFNBQVMsRUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQ3JDLENBQUM7T0FDSDs7QUFBQSxBQUVELFNBQUssV0FBVyxDQUFDLGlCQUFpQjtBQUFFOztBQUNsQyxjQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2NBQzlCLFFBQVEsR0FBSSxNQUFNLENBQUMsT0FBTyxDQUExQixRQUFROztBQUNmO2VBQU8sS0FBSyxDQUFDLEdBQUcsQ0FDZCxTQUFTLEVBQ1QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFBLE1BQU07cUJBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRO2FBQUEsQ0FBQyxDQUN2RDtZQUFDOzs7O09BQ0g7O0FBQUEsQUFFRCxTQUFLLFdBQVcsQ0FBQyxnQkFBZ0I7QUFBRTsrQkFDWCxNQUFNLENBQUMsT0FBTztZQUE3QixJQUFJLG9CQUFKLElBQUk7WUFBRSxLQUFLLG9CQUFMLEtBQUs7O0FBQ2xCLGVBQU8sS0FBSyxDQUFDLEdBQUcsQ0FDZCxPQUFPLEVBQ1AsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUNwQyxDQUFDO09BQ0g7O0FBQUEsQUFFRDtBQUNFLFlBQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUFBLEdBRTVEO0NBQ0YiLCJmaWxlIjoiY3JlYXRlU3RhdGVTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QWN0aW9ufSBmcm9tICcuLi90eXBlcy9BY3Rpb24nO1xuXG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbi8qKlxuICogQ29udmVydCBhIHN0cmVhbSBvZiBhY3Rpb25zIGludG8gYSBzdHJlYW0gb2YgYXBwbGljYXRpb24gc3RhdGVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTdGF0ZVN0cmVhbShcbiAgYWN0aW9uJDogUnguT2JzZXJ2YWJsZTxBY3Rpb24+LFxuICBpbml0aWFsU3RhdGU6IEltbXV0YWJsZS5NYXAsXG4pOiBSeC5CZWhhdmlvclN1YmplY3Q8SW1tdXRhYmxlLk1hcD4ge1xuICBjb25zdCBzdGF0ZSQ6IFJ4LkJlaGF2aW9yU3ViamVjdDxJbW11dGFibGUuTWFwPiA9IG5ldyBSeC5CZWhhdmlvclN1YmplY3QoaW5pdGlhbFN0YXRlKTtcbiAgYWN0aW9uJC5zY2FuKGhhbmRsZUFjdGlvbiwgaW5pdGlhbFN0YXRlKS5zdWJzY3JpYmUoc3RhdGUkKTtcbiAgcmV0dXJuIHN0YXRlJDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIHN0YXRlIGJhc2VkIG9uIHRoZSBnaXZlbiBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICovXG5mdW5jdGlvbiBoYW5kbGVBY3Rpb24oc3RhdGU6IEltbXV0YWJsZS5NYXAsIGFjdGlvbjogQWN0aW9uKTogSW1tdXRhYmxlLk1hcCB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblxuICAgIGNhc2UgQWN0aW9uVHlwZXMuQ1JFQVRFX1BBTkVfSVRFTToge1xuICAgICAgY29uc3Qge2l0ZW0sIHByb3BzLCBjb21wb25lbnR9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc3RhdGUubWVyZ2Uoe1xuICAgICAgICBjb21wb25lbnRzOiBzdGF0ZS5nZXQoJ2NvbXBvbmVudHMnKS5zZXQoaXRlbSwgY29tcG9uZW50KSxcbiAgICAgICAgcHJvcHM6IHN0YXRlLmdldCgncHJvcHMnKS5zZXQoaXRlbSwgcHJvcHMpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5ERUFDVElWQVRFOiB7XG4gICAgICByZXR1cm4gc3RhdGUuc2V0KCdnYWRnZXRzJywgSW1tdXRhYmxlLk1hcCgpKTtcbiAgICB9XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLkRFU1RST1lfUEFORV9JVEVNOiB7XG4gICAgICBjb25zdCB7aXRlbX0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzdGF0ZS5tZXJnZSh7XG4gICAgICAgIGNvbXBvbmVudHM6IHN0YXRlLmdldCgnY29tcG9uZW50cycpLmRlbGV0ZShpdGVtKSxcbiAgICAgICAgcHJvcHM6IHN0YXRlLmdldCgncHJvcHMnKS5kZWxldGUoaXRlbSksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLlJFR0lTVEVSX0dBREdFVDoge1xuICAgICAgY29uc3QgZ2FkZ2V0cyA9IHN0YXRlLmdldCgnZ2FkZ2V0cycpO1xuICAgICAgY29uc3Qge2dhZGdldH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzdGF0ZS5zZXQoXG4gICAgICAgICdnYWRnZXRzJyxcbiAgICAgICAgZ2FkZ2V0cy5zZXQoZ2FkZ2V0LmdhZGdldElkLCBnYWRnZXQpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLlVOUkVHSVNURVJfR0FER0VUOiB7XG4gICAgICBjb25zdCBnYWRnZXRzID0gc3RhdGUuZ2V0KCdnYWRnZXRzJyk7XG4gICAgICBjb25zdCB7Z2FkZ2V0SWR9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc3RhdGUuc2V0KFxuICAgICAgICAnZ2FkZ2V0cycsXG4gICAgICAgIGdhZGdldHMuZmlsdGVyKGdhZGdldCA9PiBnYWRnZXQuZ2FkZ2V0SWQgIT09IGdhZGdldElkKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5VUERBVEVfUEFORV9JVEVNOiB7XG4gICAgICBjb25zdCB7aXRlbSwgcHJvcHN9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc3RhdGUuc2V0KFxuICAgICAgICAncHJvcHMnLFxuICAgICAgICBzdGF0ZS5nZXQoJ3Byb3BzJykuc2V0KGl0ZW0sIHByb3BzKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5oYW5kbGVkIGFjdGlvbiB0eXBlOiAnICsgYWN0aW9uLnR5cGUpO1xuXG4gIH1cbn1cbiJdfQ==