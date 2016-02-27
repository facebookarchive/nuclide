Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createStateStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQ3BDLENBQUM7T0FDSDs7QUFBQSxBQUVEO0FBQ0UsWUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBQUEsR0FFNUQ7Q0FDRiIsImZpbGUiOiJjcmVhdGVTdGF0ZVN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCAqIGFzIEFjdGlvblR5cGVzIGZyb20gJy4vQWN0aW9uVHlwZXMnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuLyoqXG4gKiBDb252ZXJ0IGEgc3RyZWFtIG9mIGFjdGlvbnMgaW50byBhIHN0cmVhbSBvZiBhcHBsaWNhdGlvbiBzdGF0ZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVN0YXRlU3RyZWFtKFxuICBhY3Rpb24kOiBSeC5PYnNlcnZhYmxlLFxuICBpbml0aWFsU3RhdGU6IEltbXV0YWJsZS5NYXAsXG4pOiBSeC5CZWhhdmlvclN1YmplY3Qge1xuICBjb25zdCBzdGF0ZSQgPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KGluaXRpYWxTdGF0ZSk7XG4gIGFjdGlvbiQuc2NhbihoYW5kbGVBY3Rpb24sIGluaXRpYWxTdGF0ZSkuc3Vic2NyaWJlKHN0YXRlJCk7XG4gIHJldHVybiBzdGF0ZSQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBzdGF0ZSBiYXNlZCBvbiB0aGUgZ2l2ZW4gYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQWN0aW9uKHN0YXRlLCBhY3Rpb24pIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuXG4gICAgY2FzZSBBY3Rpb25UeXBlcy5DUkVBVEVfUEFORV9JVEVNOiB7XG4gICAgICBjb25zdCB7aXRlbSwgcHJvcHMsIGNvbXBvbmVudH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzdGF0ZS5tZXJnZSh7XG4gICAgICAgIGNvbXBvbmVudHM6IHN0YXRlLmdldCgnY29tcG9uZW50cycpLnNldChpdGVtLCBjb21wb25lbnQpLFxuICAgICAgICBwcm9wczogc3RhdGUuZ2V0KCdwcm9wcycpLnNldChpdGVtLCBwcm9wcyksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLkRFQUNUSVZBVEU6IHtcbiAgICAgIHJldHVybiBzdGF0ZS5zZXQoJ2dhZGdldHMnLCBJbW11dGFibGUuTWFwKCkpO1xuICAgIH1cblxuICAgIGNhc2UgQWN0aW9uVHlwZXMuREVTVFJPWV9QQU5FX0lURU06IHtcbiAgICAgIGNvbnN0IHtpdGVtfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHN0YXRlLm1lcmdlKHtcbiAgICAgICAgY29tcG9uZW50czogc3RhdGUuZ2V0KCdjb21wb25lbnRzJykuZGVsZXRlKGl0ZW0pLFxuICAgICAgICBwcm9wczogc3RhdGUuZ2V0KCdwcm9wcycpLmRlbGV0ZShpdGVtKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhc2UgQWN0aW9uVHlwZXMuUkVHSVNURVJfR0FER0VUOiB7XG4gICAgICBjb25zdCBnYWRnZXRzID0gc3RhdGUuZ2V0KCdnYWRnZXRzJyk7XG4gICAgICBjb25zdCB7Z2FkZ2V0fSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHN0YXRlLnNldChcbiAgICAgICAgJ2dhZGdldHMnLFxuICAgICAgICBnYWRnZXRzLnNldChnYWRnZXQuZ2FkZ2V0SWQsIGdhZGdldCksXG4gICAgICApO1xuICAgIH1cblxuICAgIGNhc2UgQWN0aW9uVHlwZXMuVU5SRUdJU1RFUl9HQURHRVQ6IHtcbiAgICAgIGNvbnN0IGdhZGdldHMgPSBzdGF0ZS5nZXQoJ2dhZGdldHMnKTtcbiAgICAgIGNvbnN0IHtnYWRnZXRJZH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzdGF0ZS5zZXQoXG4gICAgICAgICdnYWRnZXRzJyxcbiAgICAgICAgZ2FkZ2V0cy5maWx0ZXIoZ2FkZ2V0ID0+IGdhZGdldC5nYWRnZXRJZCAhPT0gZ2FkZ2V0SWQpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLlVQREFURV9QQU5FX0lURU06IHtcbiAgICAgIGNvbnN0IHtpdGVtLCBwcm9wc30gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzdGF0ZS5zZXQoXG4gICAgICAgICdwcm9wcycsXG4gICAgICAgIHN0YXRlLmdldCgncHJvcHMnKS5zZXQoaXRlbSwgcHJvcHMpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmhhbmRsZWQgYWN0aW9uIHR5cGU6ICcgKyBhY3Rpb24udHlwZSk7XG5cbiAgfVxufVxuIl19