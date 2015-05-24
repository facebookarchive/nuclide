# nuclide-click-to-symbol

Pluggable click to symbol widget for [Atom](https://atom.io/).

# Disclaimer: This package will go away!

We are working with Atom to get a more generic version of this package integrated
as part of Atom core because we believe this functionality should be available to
all Atom packages out of the box. We also want to move away from the current
delegate pattern (because it introduces a dependency on another package:
`nuclide-click-to-symbol-delegate`) and provide
an API that is more like [autocomplete-plus](https://github.com/atom/autocomplete-plus).

# How it works

`nuclide-click-to-symbol` is triggered by two events:
- `alt + mousemove` underlines clickable ranges of text in the text buffer under
the mouse cursor.
- `alt + mousedown` does something if range of text in the text buffer under the
 mouse cursor is clickable.

## API

`nuclide-click-to-symbol` uses the *delegate* pattern so you can insert your
custom click-to-symbol behavior. There is an
[abstract implementation of the delegate](../click-to-symbol-delegate/lib/ClickToSymbolDelegate.js) that
defines the required method which you should override:

```javascript
getClickableRangesAndCallback(
    editor: TextEditor,
    row: number,
    column: number
    ): ?Promise<{clickableRanges: Array<Range>, callback: () => void}>
```

This method is given the mouse location as editor and position (row and column)
in `editor`'s text buffer. It should return a `Promise` that resolves to an object
with following properties:
* `clickableRanges` - array of text buffer ranges that are considered clickable.
* `callback` - function that can handle mouse click to the given location.

If your delegate doesn't consider the location clickable, then this method should return
`null` or a `Promise` that resolves to `null`.

There is also a helper method, `getWordMatchAndRange()`, that is used to find a word
that contains the given position. It returns an object literal with the following
properties:
* `match` - word match against the given regex, groups from `String.prototype.match(RegExp)`.
* `range` - text buffer range of the word.

```javascript
getWordMatchAndRange(
    editor: TextEditor,
    row: number,
    column: column,
    wordRegExp: ?RegExp
    ): ?{match: Array<string>, range: Range}
```
You can specify your own regex to define a word. If you don't, Atom's default one
will be used.

Here are examples of creating your custom delegate, `MyDelegate`, by subclassing
`AbstractDelegate` from the `nuclide-click-to-symbol-delegate` package. We assume that
`MyDelegate` is defined in a file named `delegate.coffee` or `delegate.js`.
This example delegate recognizes clicks to words in Python files and outputs
them into the console:

**CoffeeScript**
```coffee
# Subclass the AbstractDelegate from nuclide-click-to-symbol-delegate.
AbstractDelegate = require 'nuclide-click-to-symbol-delegate'

module.exports =
class MyDelegate extends AbstractDelegate
  getClickableRangesAndCallback: (editor, row, column) ->
    if editor.getGrammar().scopeName is 'source.python'
      matchAndRange = @getWordMatchAndRange(editor, row, column)
      if matchAndRange
        {range} = matchAndRange
        return Promise.resolve(
          {
            clickableRanges: [range],
            callback: -> console.log(editor.getBuffer().getTextInRange(range)),
          }
        )
    null
```

**JavaScript**
```javascript
'use babel';
// Subclass the AbstractDelegate from nuclide-click-to-symbol-delegate.
var AbstractDelegate = require('nuclide-click-to-symbol-delegate');

class MyDelegate extends AbstractDelegate {
  getClickableRangesAndCallback(editor, row, column) {
    if (editor.getGrammar().scopeName === 'source.python') {
      var matchAndRange = this.getWordMatchAndRange(editor, row, column);
      if (matchAndRange) {
        return Promise.resolve({
          clickableRanges: [matchAndRange.range],
          callback: function() {
            console.log(editor.getBuffer().getTextInRange(matchAndRange.range));
          },
        });
      }
    }
    return null;
  }
}

module.exports = MyDelegate;
```


You can create and register a delegate from your package
using the Services API:

```js
// main.js
module.exports = {
  activate() { /*...*/ },
  createClickToSymbolDelegate() {
    // Set up click-to-symbol.
    var ClickToSymbolDelegate = require('./delegate');
    return new ClickToSymbolDelegate();
  },
};
```

Remember to declare your provide in your `package.json`:

```json
"nuclide-click-to-symbol.provider": {
  "versions": {
    "0.0.0": "createClickToSymbolDelegate"
  }
}
```

Finally, note that multiple delegates may be registered via this mechanism,
possibly by independent packages. This is why it is important that
`getClickableRangesAndCallback()` returns `null` (or a `Promise` that resolves to `null`)
if it wouldn't be able to handle click to the given location,
as it gives the other registered delegates a chance to offer their services.
Each time the click-to-symbol is triggered, a different delegate may be
chosen, but it will always be at most one delegate per trigger.
