Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.default = wrapGadget;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _addObserveMethods2;

function _addObserveMethods() {
  return _addObserveMethods2 = _interopRequireDefault(require('./addObserveMethods'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

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

  (0, (_addObserveMethods2 || _addObserveMethods()).default)({
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
  (0, (_assert2 || _assert()).default)(!('serialize' in gadget.prototype), "Gadgets can't define a \"serialize\" method. To provide custom serialization, " + 'implement "serializeState"');

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
module.exports = exports.default;

// Used to restore the item to the correct size when you show its pane.