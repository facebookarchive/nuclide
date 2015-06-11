# Atom Interfaces

Atom type declarations for use with the Flow type checker.

## Usage

1. Add `nuclide-atom-interfaces` as a development dependency in
   package.json:

    ```json
    "devDependencies": {
      "nuclide-atom-interfaces": "0.0.0"
    }
    ```

2. Run the setup script to symlink the local NPM package:

    ```sh
    ./scripts/dev/setup
    ```

3. Reference the interfaces in the local `.flowconfig`:

    ```
    [libs]
    ./node_modules/nuclide-atom-interfaces/1.0
    ```
