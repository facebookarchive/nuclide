# -*- coding: utf-8 -*-

__all__ = ['WebSocketException', 'FrameTooLargeException', 'ProtocolException',
           'UnsupportedFrameTypeException', 'TextFrameEncodingException',
           'UnsupportedFrameTypeException', 'TextFrameEncodingException',
           'StreamClosed', 'HandshakeError', 'InvalidBytesError']

class WebSocketException(Exception): pass

class ProtocolException(WebSocketException): pass

class FrameTooLargeException(WebSocketException): pass

class UnsupportedFrameTypeException(WebSocketException): pass

class TextFrameEncodingException(WebSocketException): pass

class InvalidBytesError(WebSocketException): pass

class StreamClosed(Exception): pass

class HandshakeError(WebSocketException):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return self.msg
