# atom-ide-debugger-java

Desktop Java Debugger for Atom IDE.

## Usage

Run `apm install atom-ide-debugger-java` to install the Atom package.

There is some additional setup necessary to use the Java debugger.

1. Run `mvn package` and expect it to fail.
2. Change your directory to the `atom-ide-debugger-java` directory.
3. Run `./scripts/grab-tools-jar.py`.
4. Move the output jar (`tools-1.0.0.jar`) to `~/.m2/repository/com/sun/tools/1.0.0/`.
5. Manually download `org.eclipse.jdt:org.eclipse.jdt.debug:jar:3.10.1` from a central maven repository into your current directory.
6. Run `./scripts/extract-model-jar.py org.eclipse.jdt.debug-3.10.1.jar`.
7. Move the output jar (`org.eclipse.jdt.debug.jdimodel-3.10.1.jar`) to `~/.m2/repository/org/eclipse/jdt/org.eclipse.jdt.debug.jdimodel/3.10.1/`.
8. Run `mvn package`. This time it should succeed.
9. Move the output jar into the Build folder by running `mv target/nuclide-java-debugger-0.7.2.jar Build/java_debugger_server.jar`.

You are now ready to use the Java debugger.

## License

`atom-ide-debugger-java` is BSD-licensed. We also provide an additional patent grant.
