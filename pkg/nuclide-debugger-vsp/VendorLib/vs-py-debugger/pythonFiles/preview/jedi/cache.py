"""
This caching is very important for speed and memory optimizations. There's
nothing really spectacular, just some decorators. The following cache types are
available:

- module caching (`load_parser` and `save_parser`), which uses pickle and is
  really important to assure low load times of modules like ``numpy``.
- ``time_cache`` can be used to cache something for just a limited time span,
  which can be useful if there's user interaction and the user cannot react
  faster than a certain time.

This module is one of the reasons why |jedi| is not thread-safe. As you can see
there are global variables, which are holding the cache information. Some of
these variables are being cleaned after every API usage.
"""
import time

from jedi import settings
from jedi.parser.utils import parser_cache
from jedi.parser.utils import underscore_memoization

_time_caches = {}


def clear_time_caches(delete_all=False):
    """ Jedi caches many things, that should be completed after each completion
    finishes.

    :param delete_all: Deletes also the cache that is normally not deleted,
        like parser cache, which is important for faster parsing.
    """
    global _time_caches

    if delete_all:
        for cache in _time_caches.values():
            cache.clear()
        parser_cache.clear()
    else:
        # normally just kill the expired entries, not all
        for tc in _time_caches.values():
            # check time_cache for expired entries
            for key, (t, value) in list(tc.items()):
                if t < time.time():
                    # delete expired entries
                    del tc[key]


def time_cache(time_add_setting):
    """
    This decorator works as follows: Call it with a setting and after that
    use the function with a callable that returns the key.
    But: This function is only called if the key is not available. After a
    certain amount of time (`time_add_setting`) the cache is invalid.

    If the given key is None, the function will not be cached.
    """
    def _temp(key_func):
        dct = {}
        _time_caches[time_add_setting] = dct

        def wrapper(*args, **kwargs):
            generator = key_func(*args, **kwargs)
            key = next(generator)
            try:
                expiry, value = dct[key]
                if expiry > time.time():
                    return value
            except KeyError:
                pass

            value = next(generator)
            time_add = getattr(settings, time_add_setting)
            if key is not None:
                dct[key] = time.time() + time_add, value
            return value
        return wrapper
    return _temp


def memoize_method(method):
    """A normal memoize function."""
    def wrapper(self, *args, **kwargs):
        dct = self.__dict__.setdefault('_memoize_method_dct', {})
        key = (args, frozenset(kwargs.items()))
        try:
            return dct[key]
        except KeyError:
            result = method(self, *args, **kwargs)
            dct[key] = result
            return result
    return wrapper


def cache_star_import(func):
    @time_cache("star_import_cache_validity")
    def wrapper(self):
        yield self.base  # The cache key
        yield func(self)
    return wrapper


def _invalidate_star_import_cache_module(module, only_main=False):
    """ Important if some new modules are being reparsed """
    try:
        t, modules = _time_caches['star_import_cache_validity'][module]
    except KeyError:
        pass
    else:
        del _time_caches['star_import_cache_validity'][module]

        # This stuff was part of load_parser. However since we're most likely
        # not going to use star import caching anymore, just ignore it.
        #else:
            # In case there is already a module cached and this module
            # has to be reparsed, we also need to invalidate the import
            # caches.
        #    _invalidate_star_import_cache_module(parser_cache_item.parser.module)


def invalidate_star_import_cache(path):
    """On success returns True."""
    try:
        parser_cache_item = parser_cache[path]
    except KeyError:
        pass
    else:
        _invalidate_star_import_cache_module(parser_cache_item.parser.module)
