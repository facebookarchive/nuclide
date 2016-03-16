# nuclide-external-interfaces

Type declarations for external APIs used by Nuclide features.
These are designed to be used with the Flow type checker.

## Usage

1. Add `nuclide` as a development dependency in
   package.json:

    ```json
    "devDependencies": {
      "nuclide": "0.0.0"
    }
    ```

2. Reference the interfaces in the local `.flowconfig`:

    ```
    [libs]
    ./node_modules/nuclide/pkg/nuclide-external-interfaces/1.0/
    ```
