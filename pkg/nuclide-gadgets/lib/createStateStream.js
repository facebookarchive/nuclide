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

exports.default = createStateStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

/**
 * Convert a stream of actions into a stream of application states.
 */

function createStateStream(action$, initialState) {
  var state$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.BehaviorSubject(initialState);
  action$.scan(handleAction, initialState).subscribe(state$);
  return state$;
}

/**
 * Transform the state based on the given action and return the result.
 */
function handleAction(state, action) {
  switch (action.type) {

    case (_ActionTypes2 || _ActionTypes()).CREATE_PANE_ITEM:
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

    case (_ActionTypes2 || _ActionTypes()).DEACTIVATE:
      {
        return state.set('gadgets', (_immutable2 || _immutable()).default.Map());
      }

    case (_ActionTypes2 || _ActionTypes()).DESTROY_PANE_ITEM:
      {
        var item = action.payload.item;

        return state.merge({
          components: state.get('components').delete(item),
          props: state.get('props').delete(item)
        });
      }

    case (_ActionTypes2 || _ActionTypes()).REGISTER_GADGET:
      {
        var gadgets = state.get('gadgets');
        var gadget = action.payload.gadget;

        return state.set('gadgets', gadgets.set(gadget.gadgetId, gadget));
      }

    case (_ActionTypes2 || _ActionTypes()).UNREGISTER_GADGET:
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

    case (_ActionTypes2 || _ActionTypes()).UPDATE_PANE_ITEM:
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
module.exports = exports.default;