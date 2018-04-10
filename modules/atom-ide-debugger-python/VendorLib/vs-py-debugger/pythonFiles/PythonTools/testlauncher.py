def main():
    import os
    import sys
    from ptvsd.visualstudio_py_debugger import DONT_DEBUG, DEBUG_ENTRYPOINTS, get_code
    from ptvsd.attach_server import DEFAULT_PORT, enable_attach, wait_for_attach
    
    sys.path[0] = os.getcwd()
    os.chdir(sys.argv[1])
    secret = sys.argv[2]
    port = int(sys.argv[3])
    testFx = sys.argv[4]
    args = sys.argv[5:]    

    DONT_DEBUG.append(os.path.normcase(__file__))
    DEBUG_ENTRYPOINTS.add(get_code(main))

    enable_attach(secret, ('127.0.0.1', port), redirect_output = False)
    sys.stdout.flush()
    print('READY')
    sys.stdout.flush()
    wait_for_attach()

    try:
        if testFx == 'pytest':
            import pytest
            pytest.main(args)
        else:
            import nose
            nose.run(argv=args)
        sys.exit()
    finally:
        pass

if __name__ == '__main__':
    main()