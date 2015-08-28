# nuclide-external-interfaces

Type declarations for external APIs used by Nuclide packages.
These are designed to be used with the Flow type checker.

## Usage

1. Add `nuclide-external-interfaces` as a development dependency in
   package.json:

    ```json
    "devDependencies": {
      "nuclide-external-interfaces": "0.0.0"
    }
    ```

2. Run the setup script to symlink the local NPM package:

    ```sh
    ./scripts/dev/setup
    ```

3. Reference the interfaces in the local `.flowconfig`:

    ```
    [libs]
    ./node_modules/nuclide-external-interfaces/1.0/
    ```
