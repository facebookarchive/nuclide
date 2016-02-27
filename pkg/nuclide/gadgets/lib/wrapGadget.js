Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = wrapGadget;

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
  }
};
module.exports = exports['default'];

// Used to restore the item to the correct size when you show its pane.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndyYXBHYWRnZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cUJBNkJ3QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7O2lDQWxCSixxQkFBcUI7Ozs7c0JBQzdCLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJmLFNBQVMsVUFBVSxDQUFDLE1BQVcsRUFBVTs7Ozs7OztNQU1oRCxRQUFRO2NBQVIsUUFBUTs7YUFBUixRQUFROzRCQUFSLFFBQVE7O2lDQUFSLFFBQVE7Ozs7OztpQkFBUixRQUFROzs7OzthQU9ILHFCQUFHO0FBQ1YsZUFBTztBQUNMLHNCQUFZLEVBQUUsbUJBQW1CO0FBQ2pDLGNBQUksRUFBRTtBQUNKLG9CQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRO0FBQ25DLG9CQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFOzs7O0FBSWhELGlDQUFxQixFQUFFLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTs7QUFFbkUsaUJBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3RCLDZCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7V0FDM0M7U0FDRixDQUFDO09BQ0g7OztXQXRCRyxRQUFRO0tBQVMsTUFBTTs7QUE0QjdCLHNDQUFrQjtBQUNoQixvQkFBZ0IsRUFBRSwwQkFBQSxRQUFRO2FBQUksUUFBUSxDQUFDLFFBQVEsRUFBRTtLQUFBO0FBQ2pELG1CQUFlLEVBQUUseUJBQUEsUUFBUTthQUFJLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRTtLQUFBO0dBQzVFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs7O0FBTWIsMkJBQ0UsRUFBRSxXQUFXLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQSxBQUFDLEVBQ2xDLDhHQUM4QixDQUMvQixDQUFDOzs7QUFHRixPQUFLLElBQU0sSUFBSSxJQUFJLE1BQU0sRUFBRTtBQUN6QixRQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoQyxlQUFTO0tBQ1Y7QUFDRCxZQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQy9COzs7QUFHRCxPQUFLLElBQU0sSUFBSSxJQUFJLGNBQWMsRUFBRTtBQUNqQyxRQUFJLElBQUksSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO0FBQzlCLGVBQVM7S0FDVjtBQUNELFlBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2pEOztBQUVELFNBQU8sUUFBUSxDQUFDO0NBQ2pCOztBQUVELElBQU0sY0FBYyxHQUFHO0FBQ3JCLFVBQVEsRUFBQSxvQkFBRzs7QUFFVCxXQUFPLGVBQWUsQ0FBQztHQUN4QjtDQUNGLENBQUMiLCJmaWxlIjoid3JhcEdhZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBhZGRPYnNlcnZlTWV0aG9kcyBmcm9tICcuL2FkZE9ic2VydmVNZXRob2RzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuLyoqXG4gKiBBIGhpZ2hlciBvcmRlciBjb21wb25lbnQgdGhhdCB3cmFwcyB0aGUgcHJvdmlkZWQgZ2FkZ2V0IHRvIGFkYXB0IGl0IHRvIEF0b20ncyBleHBlY3RhdGlvbnMgZm9yXG4gKiBwYW5lIGl0ZW1zLiAoR2FkZ2V0cyB0aGVtc2VsdmVzIGFyZSBwb3RlbnRpYWxseSBwb3J0YWJsZSB0byBvdGhlciBwYXJ0cyBvZiB0aGUgVUktLWZvciBleGFtcGxlLFxuICogc29tZWJvZHkgY291bGQgd3JpdGUgYSBwYWNrYWdlIHRoYXQgZGlzcGxheXMgdGhlbSBpbiBwYW5lbHMgaW5zdGVhZCBvZiBwYW5lIGl0ZW1zLikgVGhlIHdyYXBwZXJcbiAqIGRvZXMgdHdvIHRoaW5nczogKDEpIGl0IHByb3ZpZGVzIHNlbnNpYmxlIGRlZmF1bHRzIGZvciBzdHVmZiB0aGF0IEF0b20gcmVxdWlyZXMgb2YgcGFuZSBpdGVtc1xuICogKGBnZXRUaXRsZWApLCBidXQgdGhhdCBhcmVuJ3QgcmVxdWlyZWQgb2YgZ2FkZ2V0cyBhbmQgKDIpIGl0IGFjdHMgYXMgYSBicmlkZ2UgYmV0d2VlbiBBdG9tJ3NcbiAqIHN0YXRlZnVsLCBtdWx0aS1ldmVudCBtb2RlbCBhbmQgUmVhY3QncyBtb3JlIGZ1bmN0aW9uYWwgYXBwcm9hY2guIEZvciBleGFtcGxlLCBBdG9tIHdvdWxkIGhhdmUgdXNcbiAqIHVwZGF0ZSBwcm9wZXJ0aWVzIGFuZCB0aGVuIGludm9rZSBjb3JyZXNwb25kaW5nIGV2ZW50IGhhbmRsZXJzLCB3aGVyZWFzIHdlJ2QgcHJlZmVyIHRvIHdyaXRlXG4gKiBhY2Nlc3NvcnMgKGxpa2UgYGdldFRpdGxlYCkgYXMgYSBwdXJlIGZ1bmN0aW9uIG9mIHRoZSBjb21wb25lbnQgcHJvcHMgYW5kIHN0YXRlIGFuZCBoYXZlIEF0b21cbiAqIHVwZGF0ZSB3aGVuZXZlciB0aGV5IGNoYW5nZS5cbiAqXG4gKiBJdCBzaG91bGQgYmUgbm90ZWQgdGhhdCBvdXIgYXBwcm9hY2ggbWFrZXMgaXQgc3VwZXIgc2ltcGxlIHRvIG1hbmFnZSB5b3VyIGdhZGdldCBzdGF0ZSB1c2luZ1xuICogUmVhY3QgKGBzZXRTdGF0ZSgpYCkgYnV0IGRvZXNuJ3QgcmVxdWlyZSBpdC4gSWYgeW91J2QgbGlrZSB0byBtYW5hZ2UgaXQgaW4gc29tZSBvdGhlciB3YXkgKGUuZy5cbiAqIEZsdXgpLCBqdXN0IGNhbGwgYHRoaXMuZm9yY2VVcGRhdGUoKWAgd2hlbmV2ZXIgeW91ciBzdG9yZSdzIHN0YXRlIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdyYXBHYWRnZXQoZ2FkZ2V0OiBhbnkpOiBPYmplY3Qge1xuICAvLyBXZSBuZWVkIHRvIG1haW50YWluIHRoZSBpbnN0YW5jZSBtZXRob2RzIG9mIHRoZSBwcm92aWRlZCBnYWRnZXQgKHNpbmNlIHRoYXQncyBob3cgQXRvbSB3aWxsXG4gIC8vIGludGVyYWN0IHdpdGggaXQpLCBzbyB3ZSBjcmVhdGUgb3VyIG5ldyBvbmUgYnkgc3ViY2xhc3NpbmcuIC86IE9uY2UgdGhlIGVudmlyb25tZW50IHN1cHBvcnRzXG4gIC8vIFByb3hpZXMsIHdlIHNob3VsZHMgc3dpdGNoIHRvIHRoZW0gKHNvIHRoYXQgd2UncmUgbm90IHRyYW1wbGluZyBvbiB0aGUgY29tcG9uZW50J3MgbmFtZXNwYWNlKS5cbiAgLy8gVW50aWwgdGhlbiwgbGV0J3MganVzdCB0cnkgcmVhbGx5IGhhcmQgdG8gbWluaW1pemUgdGhlIG51bWJlciBvZiB0aGluZ3Mgd2UgZG8gdGhhdCB0aGVcbiAgLy8gY29tcG9uZW50IGNhbiBzZWUuXG4gIGNsYXNzIFBhbmVJdGVtIGV4dGVuZHMgZ2FkZ2V0IHtcblxuICAgIC8vIFVzZWQgdG8gcmVzdG9yZSB0aGUgaXRlbSB0byB0aGUgY29ycmVjdCBzaXplIHdoZW4geW91IHNob3cgaXRzIHBhbmUuXG4gICAgX2V4cGFuZGVkRmxleFNjYWxlOiA/bnVtYmVyO1xuXG4gICAgLy8gRGVzZXJpYWxpemF0aW9uIGhhcHBlbnMgYmVmb3JlIHRoZSBnYWRnZXRzIGFyZSBhdmFpbGFibGUsIHNvIHdlIG5lZWQgdG8gc2VyaWFsaXplIGdhZGdldHMgYXNcbiAgICAvLyBwbGFjZWhvbGRlcnMgKHdoaWNoIGFyZSBsYXRlciByZXBsYWNlZCB3aXRoIHRoZSByZWFsIHRoaW5nKS5cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkZXNlcmlhbGl6ZXI6ICdHYWRnZXRQbGFjZWhvbGRlcicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBnYWRnZXRJZDogdGhpcy5jb25zdHJ1Y3Rvci5nYWRnZXRJZCxcbiAgICAgICAgICBpY29uTmFtZTogdGhpcy5nZXRJY29uTmFtZSAmJiB0aGlzLmdldEljb25OYW1lKCksXG5cbiAgICAgICAgICAvLyBJdCdzIGF0dHJhY3RpdmUgdG8gdHJ5IHRvIGRvIGEgZGVmYXVsdCBzZXJpYWxpemF0aW9uIGJ1dCB0aGF0J3MgcHJvYmFibHkgYSBiYWQgaWRlYVxuICAgICAgICAgIC8vIGJlY2F1c2UgaXQgY291bGQgYmUgY29zdGx5IGFuZCBjb25mdXNpbmcgdG8gc2VyaWFsaXplIGEgYnVuY2ggb2YgdW5uZWVkZWQgc3R1ZmYuXG4gICAgICAgICAgcmF3SW5pdGlhbEdhZGdldFN0YXRlOiB0aGlzLnNlcmlhbGl6ZVN0YXRlICYmIHRoaXMuc2VyaWFsaXplU3RhdGUoKSxcblxuICAgICAgICAgIHRpdGxlOiB0aGlzLmdldFRpdGxlKCksXG4gICAgICAgICAgZXhwYW5kZWRGbGV4U2NhbGU6IHRoaXMuX2V4cGFuZGVkRmxleFNjYWxlLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgfVxuXG4gIC8vIEFkZCBvYnNlcnZlIG1ldGhvZHMgZm9yIHRpdGxlIGFuZCBpY29uIGJ5IGRlZmF1bHQuIFdlIHNwZWNpYWwgY2FzZSB0aGVzZSBiZWNhdXNlLCBwcmFjdGljYWxseVxuICAvLyBzcGVha2luZywgdGhleSdyZSBwcm9iYWJseSB0aGUgb25seSBvbmVzIHRoYXQgd2lsbCBldmVyIGJlIHVzZWQuXG4gIGFkZE9ic2VydmVNZXRob2RzKHtcbiAgICBvbkRpZENoYW5nZVRpdGxlOiBpbnN0YW5jZSA9PiBpbnN0YW5jZS5nZXRUaXRsZSgpLFxuICAgIG9uRGlkQ2hhbmdlSWNvbjogaW5zdGFuY2UgPT4gaW5zdGFuY2UuZ2V0SWNvbk5hbWUgJiYgaW5zdGFuY2UuZ2V0SWNvbk5hbWUoKSxcbiAgfSkoUGFuZUl0ZW0pO1xuXG4gIC8vIFNpbmNlIHdlIG5lZWQgdG8gc2VyaWFsaXplIGdhZGdldHMgYXMgcGxhY2Vob2xkZXJzLCB3ZSBjYW4ndCBsZXQgdXNlcnMgZGVmaW5lIGBzZXJpYWxpemUoKWBcbiAgLy8gKHdoaWNoIEF0b20gY2FsbHMpIGRpcmVjdGx5LiBCdXQgdGhhdCdzIG9rYXkgYmVjYXVzZSBpdCdzIGtpbmRhIGlja3kgYm9pbGVycGxhdGUgYW55d2F5LiBUaGV5XG4gIC8vIGNhbiBqdXN0IGhhbmRsZSBzZXJpYWxpemluZyBvbmx5IHRoZSBzdGF0ZSAoaWYgdGhleSBuZWVkIHNlcmlhbGl6YXRpb24gYXQgYWxsKSBieSBpbXBsZW1lbnRpbmdcbiAgLy8gYHNlcmlhbGl6ZVN0YXRlKClgLlxuICBpbnZhcmlhbnQoXG4gICAgISgnc2VyaWFsaXplJyBpbiBnYWRnZXQucHJvdG90eXBlKSxcbiAgICBgR2FkZ2V0cyBjYW4ndCBkZWZpbmUgYSBcInNlcmlhbGl6ZVwiIG1ldGhvZC4gVG8gcHJvdmlkZSBjdXN0b20gc2VyaWFsaXphdGlvbiwgYFxuICAgICsgYGltcGxlbWVudCBcInNlcmlhbGl6ZVN0YXRlXCJgXG4gICk7XG5cbiAgLy8gQ29weSBzdGF0aWNzLlxuICBmb3IgKGNvbnN0IHByb3AgaW4gZ2FkZ2V0KSB7XG4gICAgaWYgKCFnYWRnZXQuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBQYW5lSXRlbVtwcm9wXSA9IGdhZGdldFtwcm9wXTtcbiAgfVxuXG4gIC8vIENvcHkgZGVmYXVsdCBtZXRob2RzLlxuICBmb3IgKGNvbnN0IHByb3AgaW4gZGVmYXVsdE1ldGhvZHMpIHtcbiAgICBpZiAocHJvcCBpbiBQYW5lSXRlbS5wcm90b3R5cGUpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBQYW5lSXRlbS5wcm90b3R5cGVbcHJvcF0gPSBkZWZhdWx0TWV0aG9kc1twcm9wXTtcbiAgfVxuXG4gIHJldHVybiBQYW5lSXRlbTtcbn1cblxuY29uc3QgZGVmYXVsdE1ldGhvZHMgPSB7XG4gIGdldFRpdGxlKCkge1xuICAgIC8vIFRPRE86IEdlbmVyYXRlIGRlZmF1bHQgdGl0bGUgZnJvbSBnYWRnZXRJZFxuICAgIHJldHVybiAnRGVmYXVsdCBUaXRsZSc7XG4gIH0sXG59O1xuIl19