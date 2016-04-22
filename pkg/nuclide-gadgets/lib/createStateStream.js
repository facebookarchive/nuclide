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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

/**
 * Convert a stream of actions into a stream of application states.
 */

function createStateStream(action$, initialState) {
  var state$ = new _reactivexRxjs2['default'].BehaviorSubject(initialState);
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
//# sourceMappingURL=data:application/json;base64,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Q1AsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUNwQyxDQUFDO09BQ0g7O0FBQUEsQUFFRDtBQUNFLFlBQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUFBLEdBRTVEO0NBQ0YiLCJmaWxlIjoiY3JlYXRlU3RhdGVTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QWN0aW9ufSBmcm9tICcuLi90eXBlcy9BY3Rpb24nO1xuXG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG4vKipcbiAqIENvbnZlcnQgYSBzdHJlYW0gb2YgYWN0aW9ucyBpbnRvIGEgc3RyZWFtIG9mIGFwcGxpY2F0aW9uIHN0YXRlcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlU3RhdGVTdHJlYW0oXG4gIGFjdGlvbiQ6IFJ4Lk9ic2VydmFibGU8QWN0aW9uPixcbiAgaW5pdGlhbFN0YXRlOiBJbW11dGFibGUuTWFwLFxuKTogUnguQmVoYXZpb3JTdWJqZWN0PEltbXV0YWJsZS5NYXA+IHtcbiAgY29uc3Qgc3RhdGUkOiBSeC5CZWhhdmlvclN1YmplY3Q8SW1tdXRhYmxlLk1hcD4gPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KGluaXRpYWxTdGF0ZSk7XG4gIGFjdGlvbiQuc2NhbihoYW5kbGVBY3Rpb24sIGluaXRpYWxTdGF0ZSkuc3Vic2NyaWJlKHN0YXRlJCk7XG4gIHJldHVybiBzdGF0ZSQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBzdGF0ZSBiYXNlZCBvbiB0aGUgZ2l2ZW4gYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQWN0aW9uKHN0YXRlOiBJbW11dGFibGUuTWFwLCBhY3Rpb246IEFjdGlvbik6IEltbXV0YWJsZS5NYXAge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLkNSRUFURV9QQU5FX0lURU06IHtcbiAgICAgIGNvbnN0IHtpdGVtLCBwcm9wcywgY29tcG9uZW50fSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHN0YXRlLm1lcmdlKHtcbiAgICAgICAgY29tcG9uZW50czogc3RhdGUuZ2V0KCdjb21wb25lbnRzJykuc2V0KGl0ZW0sIGNvbXBvbmVudCksXG4gICAgICAgIHByb3BzOiBzdGF0ZS5nZXQoJ3Byb3BzJykuc2V0KGl0ZW0sIHByb3BzKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhc2UgQWN0aW9uVHlwZXMuREVBQ1RJVkFURToge1xuICAgICAgcmV0dXJuIHN0YXRlLnNldCgnZ2FkZ2V0cycsIEltbXV0YWJsZS5NYXAoKSk7XG4gICAgfVxuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5ERVNUUk9ZX1BBTkVfSVRFTToge1xuICAgICAgY29uc3Qge2l0ZW19ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc3RhdGUubWVyZ2Uoe1xuICAgICAgICBjb21wb25lbnRzOiBzdGF0ZS5nZXQoJ2NvbXBvbmVudHMnKS5kZWxldGUoaXRlbSksXG4gICAgICAgIHByb3BzOiBzdGF0ZS5nZXQoJ3Byb3BzJykuZGVsZXRlKGl0ZW0pLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5SRUdJU1RFUl9HQURHRVQ6IHtcbiAgICAgIGNvbnN0IGdhZGdldHMgPSBzdGF0ZS5nZXQoJ2dhZGdldHMnKTtcbiAgICAgIGNvbnN0IHtnYWRnZXR9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc3RhdGUuc2V0KFxuICAgICAgICAnZ2FkZ2V0cycsXG4gICAgICAgIGdhZGdldHMuc2V0KGdhZGdldC5nYWRnZXRJZCwgZ2FkZ2V0KSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5VTlJFR0lTVEVSX0dBREdFVDoge1xuICAgICAgY29uc3QgZ2FkZ2V0cyA9IHN0YXRlLmdldCgnZ2FkZ2V0cycpO1xuICAgICAgY29uc3Qge2dhZGdldElkfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHN0YXRlLnNldChcbiAgICAgICAgJ2dhZGdldHMnLFxuICAgICAgICBnYWRnZXRzLmZpbHRlcihnYWRnZXQgPT4gZ2FkZ2V0LmdhZGdldElkICE9PSBnYWRnZXRJZCksXG4gICAgICApO1xuICAgIH1cblxuICAgIGNhc2UgQWN0aW9uVHlwZXMuVVBEQVRFX1BBTkVfSVRFTToge1xuICAgICAgY29uc3Qge2l0ZW0sIHByb3BzfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHN0YXRlLnNldChcbiAgICAgICAgJ3Byb3BzJyxcbiAgICAgICAgc3RhdGUuZ2V0KCdwcm9wcycpLnNldChpdGVtLCBwcm9wcyksXG4gICAgICApO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBhY3Rpb24gdHlwZTogJyArIGFjdGlvbi50eXBlKTtcblxuICB9XG59XG4iXX0=