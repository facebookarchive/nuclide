# -*- coding: utf-8 -*-
import struct
from struct import unpack

from ws4py.utf8validator import Utf8Validator
from ws4py.messaging import TextMessage, BinaryMessage, CloseControlMessage,\
     PingControlMessage, PongControlMessage
from ws4py.framing import Frame, OPCODE_CONTINUATION, OPCODE_TEXT, \
     OPCODE_BINARY, OPCODE_CLOSE, OPCODE_PING, OPCODE_PONG
from ws4py.exc import FrameTooLargeException, ProtocolException, InvalidBytesError,\
     TextFrameEncodingException, UnsupportedFrameTypeException, StreamClosed
from ws4py.compat import py3k

VALID_CLOSING_CODES = [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011]

class Stream(object):
    def __init__(self, always_mask=False, expect_masking=True):
        """ Represents a websocket stream of bytes flowing in and out.

        The stream doesn't know about the data provider itself and
        doesn't even know about sockets. Instead the stream simply
        yields for more bytes whenever it requires them. The stream owner
        is responsible to provide the stream with those bytes until
        a frame can be interpreted.

        .. code-block:: python
           :linenos:

           >>> s = Stream()
           >>> s.parser.send(BYTES)
           >>> s.has_messages
           False
           >>> s.parser.send(MORE_BYTES)
           >>> s.has_messages
           True
           >>> s.message
           <TextMessage ... >

        Set ``always_mask`` to mask all frames built.

        Set ``expect_masking`` to indicate masking will be
        checked on all parsed frames.
        """

        self.message = None
        """
        Parsed test or binary messages. Whenever the parser
        reads more bytes from a fragment message, those bytes
        are appended to the most recent message.
        """

        self.pings = []
        """
        Parsed ping control messages. They are instances of
        :class:`ws4py.messaging.PingControlMessage`
        """

        self.pongs = []
        """
        Parsed pong control messages. They are instances of
        :class:`ws4py.messaging.PongControlMessage`
        """

        self.closing = None
        """
        Parsed close control messsage. Instance of
        :class:`ws4py.messaging.CloseControlMessage`
        """

        self.errors = []
        """
        Detected errors while parsing. Instances of
        :class:`ws4py.messaging.CloseControlMessage`
        """

        self._parser = None
        """
        Parser in charge to process bytes it is fed with.
        """

        self.always_mask = always_mask
        self.expect_masking = expect_masking

    @property
    def parser(self):
        if self._parser is None:
            self._parser = self.receiver()
            # Python generators must be initialized once.
            next(self.parser)
        return self._parser

    def _cleanup(self):
        """
        Frees the stream's resources rendering it unusable.
        """
        self.message = None
        if self._parser is not None:
            if not self._parser.gi_running:
                self._parser.close()
            self._parser = None
        self.errors = None
        self.pings = None
        self.pongs = None
        self.closing = None

    def text_message(self, text):
        """
        Returns a :class:`ws4py.messaging.TextMessage` instance
        ready to be built. Convenience method so
        that the caller doesn't need to import the
        :class:`ws4py.messaging.TextMessage` class itself.
        """
        return TextMessage(text=text)

    def binary_message(self, bytes):
        """
        Returns a :class:`ws4py.messaging.BinaryMessage` instance
        ready to be built. Convenience method so
        that the caller doesn't need to import the
        :class:`ws4py.messaging.BinaryMessage` class itself.
        """
        return BinaryMessage(bytes)

    @property
    def has_message(self):
        """
        Checks if the stream has received any message
        which, if fragmented, is now completed.
        """
        if self.message is not None:
            return self.message.completed

        return False

    def close(self, code=1000, reason=''):
        """
        Returns a close control message built from
        a :class:`ws4py.messaging.CloseControlMessage` instance,
        using the given status ``code`` and ``reason`` message.
        """
        return CloseControlMessage(code=code, reason=reason)

    def ping(self, data=''):
        """
        Returns a ping control message built from
        a :class:`ws4py.messaging.PingControlMessage` instance.
        """
        return PingControlMessage(data).single(mask=self.always_mask)

    def pong(self, data=''):
        """
        Returns a ping control message built from
        a :class:`ws4py.messaging.PongControlMessage` instance.
        """
        return PongControlMessage(data).single(mask=self.always_mask)

    def receiver(self):
        """
        Parser that keeps trying to interpret bytes it is fed with as
        incoming frames part of a message.

        Control message are single frames only while data messages, like text
        and binary, may be fragmented accross frames.

        The way it works is by instanciating a :class:`wspy.framing.Frame` object,
        then running its parser generator which yields how much bytes
        it requires to performs its task. The stream parser yields this value
        to its caller and feeds the frame parser.

        When the frame parser raises :exc:`StopIteration`, the stream parser
        tries to make sense of the parsed frame. It dispatches the frame's bytes
        to the most appropriate message type based on the frame's opcode.

        Overall this makes the stream parser totally agonstic to
        the data provider.
        """
        utf8validator = Utf8Validator()
        running = True
        frame = None
        while running:
            frame = Frame()
            while 1:
                try:
                    some_bytes = (yield next(frame.parser))
                    frame.parser.send(some_bytes)
                except GeneratorExit:
                    running = False
                    break
                except StopIteration:
                    frame._cleanup()
                    some_bytes = frame.body

                    # Let's avoid unmasking when there is no payload
                    if some_bytes:
                        if frame.masking_key and self.expect_masking:
                            some_bytes = frame.unmask(some_bytes)
                        elif not frame.masking_key and self.expect_masking:
                            msg = CloseControlMessage(code=1002, reason='Missing masking when expected')
                            self.errors.append(msg)
                            break
                        elif frame.masking_key and not self.expect_masking:
                            msg = CloseControlMessage(code=1002, reason='Masked when not expected')
                            self.errors.append(msg)
                            break
                        else:
                            # If we reach this stage, it's because
                            # the frame wasn't masked and we didn't expect
                            # it anyway. Therefore, on py2k, the bytes
                            # are actually a str object and can't be used
                            # in the utf8 validator as we need integers
                            # when we get each byte one by one.
                            # Our only solution here is to convert our
                            # string to a bytearray.
                            some_bytes = bytearray(some_bytes)

                    if frame.opcode == OPCODE_TEXT:
                        if self.message and not self.message.completed:
                            # We got a text frame before we completed the previous one
                            msg = CloseControlMessage(code=1002, reason='Received a new message before completing previous')
                            self.errors.append(msg)
                            break

                        m = TextMessage(some_bytes)
                        m.completed = (frame.fin == 1)
                        self.message = m

                        if some_bytes:
                            is_valid, end_on_code_point, _, _ = utf8validator.validate(some_bytes)

                            if not is_valid or (m.completed and not end_on_code_point):
                                self.errors.append(CloseControlMessage(code=1007, reason='Invalid UTF-8 bytes'))
                                break

                    elif frame.opcode == OPCODE_BINARY:
                        if self.message and not self.message.completed:
                            # We got a text frame before we completed the previous one
                            msg = CloseControlMessage(code=1002, reason='Received a new message before completing previous')
                            self.errors.append(msg)
                            break

                        m = BinaryMessage(some_bytes)
                        m.completed = (frame.fin == 1)
                        self.message = m

                    elif frame.opcode == OPCODE_CONTINUATION:
                        m = self.message
                        if m is None:
                            self.errors.append(CloseControlMessage(code=1002, reason='Message not started yet'))
                            break

                        m.extend(some_bytes)
                        m.completed = (frame.fin == 1)
                        if m.opcode == OPCODE_TEXT:
                            if some_bytes:
                                is_valid, end_on_code_point, _, _ = utf8validator.validate(some_bytes)

                                if not is_valid or (m.completed and not end_on_code_point):
                                    self.errors.append(CloseControlMessage(code=1007, reason='Invalid UTF-8 bytes'))
                                    break

                    elif frame.opcode == OPCODE_CLOSE:
                        code = 1000
                        reason = ""
                        if frame.payload_length == 0:
                            self.closing = CloseControlMessage(code=1000)
                        elif frame.payload_length == 1:
                            self.closing = CloseControlMessage(code=1002, reason='Payload has invalid length')
                        else:
                            try:
                                # at this stage, some_bytes have been unmasked
                                # so actually are held in a bytearray
                                code = int(unpack("!H", bytes(some_bytes[0:2]))[0])
                            except struct.error:
                                code = 1002
                                reason = 'Failed at decoding closing code'
                            else:
                                # Those codes are reserved or plainly forbidden
                                if code not in VALID_CLOSING_CODES and not (2999 < code < 5000):
                                    reason = 'Invalid Closing Frame Code: %d' % code
                                    code = 1002
                                elif frame.payload_length > 1:
                                    reason = some_bytes[2:] if frame.masking_key else frame.body[2:]

                                    if not py3k: reason = bytearray(reason)
                                    is_valid, end_on_code_point, _, _ = utf8validator.validate(reason)
                                    if not is_valid or not end_on_code_point:
                                        self.errors.append(CloseControlMessage(code=1007, reason='Invalid UTF-8 bytes'))
                                        break
                                    reason = bytes(reason)
                            self.closing = CloseControlMessage(code=code, reason=reason)

                    elif frame.opcode == OPCODE_PING:
                        self.pings.append(PingControlMessage(some_bytes))

                    elif frame.opcode == OPCODE_PONG:
                        self.pongs.append(PongControlMessage(some_bytes))

                    else:
                        self.errors.append(CloseControlMessage(code=1003))

                    break

                except ProtocolException:
                    self.errors.append(CloseControlMessage(code=1002))
                    break
                except FrameTooLargeException:
                    self.errors.append(CloseControlMessage(code=1002, reason="Frame was too large"))
                    break

            frame._cleanup()
            frame.body = None
            frame = None

            if self.message is not None and self.message.completed:
                utf8validator.reset()

        utf8validator.reset()
        utf8validator = None

        self._cleanup()
