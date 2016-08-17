#!/usr/bin/env python3
from typing import TypeVar, Generic


T = TypeVar('T')


class Node(Generic[T]):
    def __init__(self, label: T = None) -> None:
        pass


def fun(arg1: float, arg2: float) -> float:
    pass


def fun2(a, *, b):
    pass
