# nuclide-side-bar

## API

This package provides a service with which you can integrate other Atom packages. To use it, add the
`nuclide-side-bar` to your package's `consumedServices` in your 'package.json' like the following:

```json
{
  "name": "my-package",
  "consumedServices": {
    "nuclide-side-bar": {
      "versions": {
        "^1.0.0": "consumeSideBar"
      }
    }
  }
}
```

In your package's module, call methods on the instance of the Nuclide Side Bar service passed to
your exported `consumeSideBar` function:

```javascript
import {Disposable} from 'atom';
import {React} from 'react-for-atom';

class SideBarView extends React.Component {
  render() {
    return <h1>Howdy, Side Bar</h1>;
  }
}

export function consumeSideBar(sideBar) {
  sideBar.registerView({
    getComponent() { return SideBarView; },
    id: 'my-package',
    toggleCommand: 'my-package:toggle',
  });

  return new Disposable(() => sideBar.destroyView('my-package'));
}
```

The `nuclide-side-bar` API exposes the following methods:

* `registerView({command: string, viewId: string, getComponent: () => (typeof React.Component)}) => void`
  - Adds a view to the side bar with the following options:
  * `toggleCommand`: `string` - Atom command name for which the side bar will listen on the
    `atom-workspace` element. To show and hide the registered view inside the side bar, dispatch the
    named event via `atom.commands.dispatch(atom.views.get(atom.workspace), 'command-name')`. By
    default the command will toggle the view's visibility. Pass a detail object to the dispatch
    command to force hide or show, for example
    `atom.commands.dispatch(atom.views.get(atom.workspace), 'command-name', {display: true})` will
    show the view. If the view is already visible in the side bar, nothing will happen.
  * `viewId`: `string` - A unique identifier for the view that can be used to later destroy the
    view. If a view with a given ID already exists in the side bar, attempting to register another
    view with the same ID has no effect.
  * `getComponent`: `() => (typeof React.Component)` - When the registered view is shown, a React
    element of the type returned by `getComponent` is mounted into the side bar. React lifecycle
    methods may be used normally. When another view is shown, the active view's React element is
    unmounted.
* `destroyView(viewId: string) => void` - Removes and destroys a view from the side bar. If the
  view with the given ID is the active view, the first view, in insertion order, among remaining
  views is activated.
  * `id`: `string` - Unique identifier passed to the `registerView` call. If no view with the ID
    exists, calling this function does nothing.
