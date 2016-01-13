Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = wrapGadget;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _addObserveMethods = require('./addObserveMethods');

var _addObserveMethods2 = _interopRequireDefault(_addObserveMethods);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _GadgetUri = require('./GadgetUri');

var GadgetUri = _interopRequireWildcard(_GadgetUri);

/**
 * A higher order component that wraps the provided gadget to adapt it to Atom's expectations for
 * pane items. (Gadgets themselves are potentially portable to other parts of the UI--for example,
 * somebody could write a package that displays them in panels instead of pane items.) The wrapper
 * does two things: (1) it provides sensible defaults for stuff that Atom requires of pane items
 * (`getTitle`), but that aren't required of gadgets and (2) it acts as a bridge between Atom's
 * stateful, multi-event model and React's more functional approach. For example, Atom would have us
 * update properties and then invoke corresponding event handlers, whereas we'd prefer to write
 * accessors (like `getTitle`) as a pure function of the component props and state and have Atom
 * update whenever they change.
 *
 * It should be noted that our approach makes it super simple to manage your gadget state using
 * React (`setState()`) but doesn't require it. If you'd like to manage it in some other way (e.g.
 * Flux), just call `this.forceUpdate()` whenever your store's state changes.
 */

function wrapGadget(gadget) {
  // We need to maintain the instance methods of the provided gadget (since that's how Atom will
  // interact with it), so we create our new one by subclassing. /: Once the environment supports
  // Proxies, we shoulds switch to them (so that we're not trampling on the component's namespace).
  // Until then, let's just try really hard to minimize the number of things we do that the
  // component can see.

  var PaneItem = (function (_gadget) {
    _inherits(PaneItem, _gadget);

    function PaneItem() {
      _classCallCheck(this, PaneItem);

      _get(Object.getPrototypeOf(PaneItem.prototype), 'constructor', this).apply(this, arguments);
    }

    // Add observe methods for title and icon by default. We special case these because, practically
    // speaking, they're probably the only ones that will ever be used.

    _createClass(PaneItem, [{
      key: 'serialize',

      // Deserialization happens before the gadgets are available, so we need to serialize gadgets as
      // placeholders (which are later replaced with the real thing).
      value: function serialize() {
        return {
          deserializer: 'GadgetPlaceholder',
          data: {
            gadgetId: this.constructor.gadgetId,
            iconName: this.getIconName && this.getIconName(),

            // It's attractive to try to do a default serialization but that's probably a bad idea
            // because it could be costly and confusing to serialize a bunch of unneeded stuff.
            rawInitialGadgetState: this.serializeState && this.serializeState(),

            title: this.getTitle(),
            expandedFlexScale: this._expandedFlexScale
          }
        };
      }
    }]);

    return PaneItem;
  })(gadget);

  (0, _addObserveMethods2['default'])({
    onDidChangeTitle: function onDidChangeTitle(instance) {
      return instance.getTitle();
    },
    onDidChangeIcon: function onDidChangeIcon(instance) {
      return instance.getIconName && instance.getIconName();
    }
  })(PaneItem);

  // Since we need to serialize gadgets as placeholders, we can't let users define `serialize()`
  // (which Atom calls) directly. But that's okay because it's kinda icky boilerplate anyway. They
  // can just handle serializing only the state (if they need serialization at all) by implementing
  // `serializeState()`.
  (0, _assert2['default'])(!('serialize' in gadget.prototype), 'Gadgets can\'t define a "serialize" method. To provide custom serialization, ' + 'implement "serializeState"');

  // Copy statics.
  for (var prop in gadget) {
    if (!gadget.hasOwnProperty(prop)) {
      continue;
    }
    PaneItem[prop] = gadget[prop];
  }

  // Copy default methods.
  for (var prop in defaultMethods) {
    if (prop in PaneItem.prototype) {
      continue;
    }
    PaneItem.prototype[prop] = defaultMethods[prop];
  }

  return PaneItem;
}

var defaultMethods = {
  getTitle: function getTitle() {
    // TODO: Generate default title from gadgetId
    return 'Default Title';
  },
  getURI: function getURI() {
    return GadgetUri.format({ gadgetId: this.constructor.gadgetId });
  }
};
module.exports = exports['default'];

// Used to restore the item to the correct size when you show its pane.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndyYXBHYWRnZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cUJBOEJ3QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7aUNBbkJKLHFCQUFxQjs7OztzQkFDN0IsUUFBUTs7Ozt5QkFDSCxhQUFhOztJQUE1QixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQk4sU0FBUyxVQUFVLENBQUMsTUFBVyxFQUFVOzs7Ozs7O01BTWhELFFBQVE7Y0FBUixRQUFROzthQUFSLFFBQVE7NEJBQVIsUUFBUTs7aUNBQVIsUUFBUTs7Ozs7O2lCQUFSLFFBQVE7Ozs7O2FBT0gscUJBQUc7QUFDVixlQUFPO0FBQ0wsc0JBQVksRUFBRSxtQkFBbUI7QUFDakMsY0FBSSxFQUFFO0FBQ0osb0JBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVE7QUFDbkMsb0JBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Ozs7QUFJaEQsaUNBQXFCLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFOztBQUVuRSxpQkFBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDdEIsNkJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtXQUMzQztTQUNGLENBQUM7T0FDSDs7O1dBdEJHLFFBQVE7S0FBUyxNQUFNOztBQTRCN0Isc0NBQWtCO0FBQ2hCLG9CQUFnQixFQUFFLDBCQUFBLFFBQVE7YUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO0tBQUE7QUFDakQsbUJBQWUsRUFBRSx5QkFBQSxRQUFRO2FBQUksUUFBUSxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO0tBQUE7R0FDNUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7QUFNYiwyQkFDRSxFQUFFLFdBQVcsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFBLEFBQUMsRUFDbEMsOEdBQzhCLENBQy9CLENBQUM7OztBQUdGLE9BQUssSUFBTSxJQUFJLElBQUksTUFBTSxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2hDLGVBQVM7S0FDVjtBQUNELFlBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDL0I7OztBQUdELE9BQUssSUFBTSxJQUFJLElBQUksY0FBYyxFQUFFO0FBQ2pDLFFBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7QUFDOUIsZUFBUztLQUNWO0FBQ0QsWUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDakQ7O0FBRUQsU0FBTyxRQUFRLENBQUM7Q0FDakI7O0FBRUQsSUFBTSxjQUFjLEdBQUc7QUFDckIsVUFBUSxFQUFBLG9CQUFHOztBQUVULFdBQU8sZUFBZSxDQUFDO0dBQ3hCO0FBQ0QsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsV0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztHQUNoRTtDQUNGLENBQUMiLCJmaWxlIjoid3JhcEdhZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBhZGRPYnNlcnZlTWV0aG9kcyBmcm9tICcuL2FkZE9ic2VydmVNZXRob2RzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIEdhZGdldFVyaSBmcm9tICcuL0dhZGdldFVyaSc7XG5cbi8qKlxuICogQSBoaWdoZXIgb3JkZXIgY29tcG9uZW50IHRoYXQgd3JhcHMgdGhlIHByb3ZpZGVkIGdhZGdldCB0byBhZGFwdCBpdCB0byBBdG9tJ3MgZXhwZWN0YXRpb25zIGZvclxuICogcGFuZSBpdGVtcy4gKEdhZGdldHMgdGhlbXNlbHZlcyBhcmUgcG90ZW50aWFsbHkgcG9ydGFibGUgdG8gb3RoZXIgcGFydHMgb2YgdGhlIFVJLS1mb3IgZXhhbXBsZSxcbiAqIHNvbWVib2R5IGNvdWxkIHdyaXRlIGEgcGFja2FnZSB0aGF0IGRpc3BsYXlzIHRoZW0gaW4gcGFuZWxzIGluc3RlYWQgb2YgcGFuZSBpdGVtcy4pIFRoZSB3cmFwcGVyXG4gKiBkb2VzIHR3byB0aGluZ3M6ICgxKSBpdCBwcm92aWRlcyBzZW5zaWJsZSBkZWZhdWx0cyBmb3Igc3R1ZmYgdGhhdCBBdG9tIHJlcXVpcmVzIG9mIHBhbmUgaXRlbXNcbiAqIChgZ2V0VGl0bGVgKSwgYnV0IHRoYXQgYXJlbid0IHJlcXVpcmVkIG9mIGdhZGdldHMgYW5kICgyKSBpdCBhY3RzIGFzIGEgYnJpZGdlIGJldHdlZW4gQXRvbSdzXG4gKiBzdGF0ZWZ1bCwgbXVsdGktZXZlbnQgbW9kZWwgYW5kIFJlYWN0J3MgbW9yZSBmdW5jdGlvbmFsIGFwcHJvYWNoLiBGb3IgZXhhbXBsZSwgQXRvbSB3b3VsZCBoYXZlIHVzXG4gKiB1cGRhdGUgcHJvcGVydGllcyBhbmQgdGhlbiBpbnZva2UgY29ycmVzcG9uZGluZyBldmVudCBoYW5kbGVycywgd2hlcmVhcyB3ZSdkIHByZWZlciB0byB3cml0ZVxuICogYWNjZXNzb3JzIChsaWtlIGBnZXRUaXRsZWApIGFzIGEgcHVyZSBmdW5jdGlvbiBvZiB0aGUgY29tcG9uZW50IHByb3BzIGFuZCBzdGF0ZSBhbmQgaGF2ZSBBdG9tXG4gKiB1cGRhdGUgd2hlbmV2ZXIgdGhleSBjaGFuZ2UuXG4gKlxuICogSXQgc2hvdWxkIGJlIG5vdGVkIHRoYXQgb3VyIGFwcHJvYWNoIG1ha2VzIGl0IHN1cGVyIHNpbXBsZSB0byBtYW5hZ2UgeW91ciBnYWRnZXQgc3RhdGUgdXNpbmdcbiAqIFJlYWN0IChgc2V0U3RhdGUoKWApIGJ1dCBkb2Vzbid0IHJlcXVpcmUgaXQuIElmIHlvdSdkIGxpa2UgdG8gbWFuYWdlIGl0IGluIHNvbWUgb3RoZXIgd2F5IChlLmcuXG4gKiBGbHV4KSwganVzdCBjYWxsIGB0aGlzLmZvcmNlVXBkYXRlKClgIHdoZW5ldmVyIHlvdXIgc3RvcmUncyBzdGF0ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3cmFwR2FkZ2V0KGdhZGdldDogYW55KTogT2JqZWN0IHtcbiAgLy8gV2UgbmVlZCB0byBtYWludGFpbiB0aGUgaW5zdGFuY2UgbWV0aG9kcyBvZiB0aGUgcHJvdmlkZWQgZ2FkZ2V0IChzaW5jZSB0aGF0J3MgaG93IEF0b20gd2lsbFxuICAvLyBpbnRlcmFjdCB3aXRoIGl0KSwgc28gd2UgY3JlYXRlIG91ciBuZXcgb25lIGJ5IHN1YmNsYXNzaW5nLiAvOiBPbmNlIHRoZSBlbnZpcm9ubWVudCBzdXBwb3J0c1xuICAvLyBQcm94aWVzLCB3ZSBzaG91bGRzIHN3aXRjaCB0byB0aGVtIChzbyB0aGF0IHdlJ3JlIG5vdCB0cmFtcGxpbmcgb24gdGhlIGNvbXBvbmVudCdzIG5hbWVzcGFjZSkuXG4gIC8vIFVudGlsIHRoZW4sIGxldCdzIGp1c3QgdHJ5IHJlYWxseSBoYXJkIHRvIG1pbmltaXplIHRoZSBudW1iZXIgb2YgdGhpbmdzIHdlIGRvIHRoYXQgdGhlXG4gIC8vIGNvbXBvbmVudCBjYW4gc2VlLlxuICBjbGFzcyBQYW5lSXRlbSBleHRlbmRzIGdhZGdldCB7XG5cbiAgICAvLyBVc2VkIHRvIHJlc3RvcmUgdGhlIGl0ZW0gdG8gdGhlIGNvcnJlY3Qgc2l6ZSB3aGVuIHlvdSBzaG93IGl0cyBwYW5lLlxuICAgIF9leHBhbmRlZEZsZXhTY2FsZTogP251bWJlcjtcblxuICAgIC8vIERlc2VyaWFsaXphdGlvbiBoYXBwZW5zIGJlZm9yZSB0aGUgZ2FkZ2V0cyBhcmUgYXZhaWxhYmxlLCBzbyB3ZSBuZWVkIHRvIHNlcmlhbGl6ZSBnYWRnZXRzIGFzXG4gICAgLy8gcGxhY2Vob2xkZXJzICh3aGljaCBhcmUgbGF0ZXIgcmVwbGFjZWQgd2l0aCB0aGUgcmVhbCB0aGluZykuXG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGVzZXJpYWxpemVyOiAnR2FkZ2V0UGxhY2Vob2xkZXInLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgZ2FkZ2V0SWQ6IHRoaXMuY29uc3RydWN0b3IuZ2FkZ2V0SWQsXG4gICAgICAgICAgaWNvbk5hbWU6IHRoaXMuZ2V0SWNvbk5hbWUgJiYgdGhpcy5nZXRJY29uTmFtZSgpLFxuXG4gICAgICAgICAgLy8gSXQncyBhdHRyYWN0aXZlIHRvIHRyeSB0byBkbyBhIGRlZmF1bHQgc2VyaWFsaXphdGlvbiBidXQgdGhhdCdzIHByb2JhYmx5IGEgYmFkIGlkZWFcbiAgICAgICAgICAvLyBiZWNhdXNlIGl0IGNvdWxkIGJlIGNvc3RseSBhbmQgY29uZnVzaW5nIHRvIHNlcmlhbGl6ZSBhIGJ1bmNoIG9mIHVubmVlZGVkIHN0dWZmLlxuICAgICAgICAgIHJhd0luaXRpYWxHYWRnZXRTdGF0ZTogdGhpcy5zZXJpYWxpemVTdGF0ZSAmJiB0aGlzLnNlcmlhbGl6ZVN0YXRlKCksXG5cbiAgICAgICAgICB0aXRsZTogdGhpcy5nZXRUaXRsZSgpLFxuICAgICAgICAgIGV4cGFuZGVkRmxleFNjYWxlOiB0aGlzLl9leHBhbmRlZEZsZXhTY2FsZSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gIH1cblxuICAvLyBBZGQgb2JzZXJ2ZSBtZXRob2RzIGZvciB0aXRsZSBhbmQgaWNvbiBieSBkZWZhdWx0LiBXZSBzcGVjaWFsIGNhc2UgdGhlc2UgYmVjYXVzZSwgcHJhY3RpY2FsbHlcbiAgLy8gc3BlYWtpbmcsIHRoZXkncmUgcHJvYmFibHkgdGhlIG9ubHkgb25lcyB0aGF0IHdpbGwgZXZlciBiZSB1c2VkLlxuICBhZGRPYnNlcnZlTWV0aG9kcyh7XG4gICAgb25EaWRDaGFuZ2VUaXRsZTogaW5zdGFuY2UgPT4gaW5zdGFuY2UuZ2V0VGl0bGUoKSxcbiAgICBvbkRpZENoYW5nZUljb246IGluc3RhbmNlID0+IGluc3RhbmNlLmdldEljb25OYW1lICYmIGluc3RhbmNlLmdldEljb25OYW1lKCksXG4gIH0pKFBhbmVJdGVtKTtcblxuICAvLyBTaW5jZSB3ZSBuZWVkIHRvIHNlcmlhbGl6ZSBnYWRnZXRzIGFzIHBsYWNlaG9sZGVycywgd2UgY2FuJ3QgbGV0IHVzZXJzIGRlZmluZSBgc2VyaWFsaXplKClgXG4gIC8vICh3aGljaCBBdG9tIGNhbGxzKSBkaXJlY3RseS4gQnV0IHRoYXQncyBva2F5IGJlY2F1c2UgaXQncyBraW5kYSBpY2t5IGJvaWxlcnBsYXRlIGFueXdheS4gVGhleVxuICAvLyBjYW4ganVzdCBoYW5kbGUgc2VyaWFsaXppbmcgb25seSB0aGUgc3RhdGUgKGlmIHRoZXkgbmVlZCBzZXJpYWxpemF0aW9uIGF0IGFsbCkgYnkgaW1wbGVtZW50aW5nXG4gIC8vIGBzZXJpYWxpemVTdGF0ZSgpYC5cbiAgaW52YXJpYW50KFxuICAgICEoJ3NlcmlhbGl6ZScgaW4gZ2FkZ2V0LnByb3RvdHlwZSksXG4gICAgYEdhZGdldHMgY2FuJ3QgZGVmaW5lIGEgXCJzZXJpYWxpemVcIiBtZXRob2QuIFRvIHByb3ZpZGUgY3VzdG9tIHNlcmlhbGl6YXRpb24sIGBcbiAgICArIGBpbXBsZW1lbnQgXCJzZXJpYWxpemVTdGF0ZVwiYFxuICApO1xuXG4gIC8vIENvcHkgc3RhdGljcy5cbiAgZm9yIChjb25zdCBwcm9wIGluIGdhZGdldCkge1xuICAgIGlmICghZ2FkZ2V0Lmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgUGFuZUl0ZW1bcHJvcF0gPSBnYWRnZXRbcHJvcF07XG4gIH1cblxuICAvLyBDb3B5IGRlZmF1bHQgbWV0aG9kcy5cbiAgZm9yIChjb25zdCBwcm9wIGluIGRlZmF1bHRNZXRob2RzKSB7XG4gICAgaWYgKHByb3AgaW4gUGFuZUl0ZW0ucHJvdG90eXBlKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgUGFuZUl0ZW0ucHJvdG90eXBlW3Byb3BdID0gZGVmYXVsdE1ldGhvZHNbcHJvcF07XG4gIH1cblxuICByZXR1cm4gUGFuZUl0ZW07XG59XG5cbmNvbnN0IGRlZmF1bHRNZXRob2RzID0ge1xuICBnZXRUaXRsZSgpIHtcbiAgICAvLyBUT0RPOiBHZW5lcmF0ZSBkZWZhdWx0IHRpdGxlIGZyb20gZ2FkZ2V0SWRcbiAgICByZXR1cm4gJ0RlZmF1bHQgVGl0bGUnO1xuICB9LFxuICBnZXRVUkkoKSB7XG4gICAgcmV0dXJuIEdhZGdldFVyaS5mb3JtYXQoe2dhZGdldElkOiB0aGlzLmNvbnN0cnVjdG9yLmdhZGdldElkfSk7XG4gIH0sXG59O1xuIl19