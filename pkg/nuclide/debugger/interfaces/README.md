# Nuclide Debugger Interfaces

Nuclide debugger type declarations for use with the Flow type checker.

## Usage

1. Add `nuclide-debugger-interfaces` as a development dependency in
   package.json:

    ```json
    "devDependencies": {
      "nuclide-debugger-interfaces": "0.0.0"
    }
    ```

2. Run the setup script to symlink the local NPM package:

    ```sh
    ./scripts/dev/setup
    ```

3. Reference the interfaces in the local `.flowconfig`:

    ```
    [libs]
    ./node_modules/nuclide-debugger-interfaces/
    ```
