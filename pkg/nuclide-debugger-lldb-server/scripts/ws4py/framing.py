# -*- coding: utf-8 -*-
from struct import pack, unpack

from ws4py.exc import FrameTooLargeException, ProtocolException
from ws4py.compat import py3k, ord, range

# Frame opcodes defined in the spec.
OPCODE_CONTINUATION = 0x0
OPCODE_TEXT = 0x1
OPCODE_BINARY = 0x2
OPCODE_CLOSE = 0x8
OPCODE_PING = 0x9
OPCODE_PONG = 0xa

__all__ = ['Frame']

class Frame(object):
    def __init__(self, opcode=None, body=b'', masking_key=None, fin=0, rsv1=0, rsv2=0, rsv3=0):
        """
        Implements the framing protocol as defined by RFC 6455.

        .. code-block:: python
           :linenos:

           >>> test_mask = 'XXXXXX' # perhaps from os.urandom(4)
           >>> f = Frame(OPCODE_TEXT, 'hello world', masking_key=test_mask, fin=1)
           >>> bytes = f.build()
           >>> bytes.encode('hex')
           '818bbe04e66ad6618a06d1249105cc6882'
           >>> f = Frame()
           >>> f.parser.send(bytes[0])
           1
           >>> f.parser.send(bytes[1])
           4

        .. seealso:: Data Framing http://tools.ietf.org/html/rfc6455#section-5.2
        """
        if not isinstance(body, bytes):
            raise TypeError("The body must be properly encoded")

        self.opcode = opcode
        self.body = body
        self.masking_key = masking_key
        self.fin = fin
        self.rsv1 = rsv1
        self.rsv2 = rsv2
        self.rsv3 = rsv3
        self.payload_length = len(body)

        self._parser = None

    @property
    def parser(self):
        if self._parser is None:
            self._parser = self._parsing()
            # Python generators must be initialized once.
            next(self.parser)
        return self._parser

    def _cleanup(self):
        if self._parser:
            self._parser.close()
            self._parser = None

    def build(self):
        """
        Builds a frame from the instance's attributes and returns
        its bytes representation.
        """
        header = b''

        if self.fin > 0x1:
            raise ValueError('FIN bit parameter must be 0 or 1')

        if 0x3 <= self.opcode <= 0x7 or 0xB <= self.opcode:
            raise ValueError('Opcode cannot be a reserved opcode')

        ## +-+-+-+-+-------+
        ## |F|R|R|R| opcode|
        ## |I|S|S|S|  (4)  |
        ## |N|V|V|V|       |
        ## | |1|2|3|       |
        ## +-+-+-+-+-------+
        header = pack('!B', ((self.fin << 7)
                             | (self.rsv1 << 6)
                             | (self.rsv2 << 5)
                             | (self.rsv3 << 4)
                             | self.opcode))

        ##                 +-+-------------+-------------------------------+
        ##                 |M| Payload len |    Extended payload length    |
        ##                 |A|     (7)     |             (16/63)           |
        ##                 |S|             |   (if payload len==126/127)   |
        ##                 |K|             |                               |
        ## +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
        ## |     Extended payload length continued, if payload len == 127  |
        ## + - - - - - - - - - - - - - - - +-------------------------------+
        if self.masking_key: mask_bit = 1 << 7
        else: mask_bit = 0

        length = self.payload_length
        if length < 126:
            header += pack('!B', (mask_bit | length))
        elif length < (1 << 16):
            header += pack('!B', (mask_bit | 126)) + pack('!H', length)
        elif length < (1 << 63):
            header += pack('!B', (mask_bit | 127)) + pack('!Q', length)
        else:
            raise FrameTooLargeException()
        
        ## + - - - - - - - - - - - - - - - +-------------------------------+
        ## |                               |Masking-key, if MASK set to 1  |
        ## +-------------------------------+-------------------------------+
        ## | Masking-key (continued)       |          Payload Data         |
        ## +-------------------------------- - - - - - - - - - - - - - - - +
        ## :                     Payload Data continued ...                :
        ## + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
        ## |                     Payload Data continued ...                |
        ## +---------------------------------------------------------------+
        body = self.body
        if not self.masking_key:
            return bytes(header + body)

        return bytes(header + self.masking_key + self.mask(body))

    def _parsing(self):
        """
        Generator to parse bytes into a frame. Yields until
        enough bytes have been read or an error is met.
        """
        buf = b''
        some_bytes = b''

        # yield until we get the first header's byte
        while not some_bytes:
            some_bytes = (yield 1)

        first_byte = some_bytes[0] if isinstance(some_bytes, bytearray) else ord(some_bytes[0])
        # frame-fin = %x0 ; more frames of this message follow
        #           / %x1 ; final frame of this message
        self.fin = (first_byte >> 7) & 1
        self.rsv1 = (first_byte >> 6) & 1
        self.rsv2 = (first_byte >> 5) & 1
        self.rsv3 = (first_byte >> 4) & 1
        self.opcode = first_byte & 0xf

        # frame-rsv1 = %x0 ; 1 bit, MUST be 0 unless negotiated otherwise
        # frame-rsv2 = %x0 ; 1 bit, MUST be 0 unless negotiated otherwise
        # frame-rsv3 = %x0 ; 1 bit, MUST be 0 unless negotiated otherwise
        if self.rsv1 or self.rsv2 or self.rsv3:
            raise ProtocolException()

        # control frames between 3 and 7 as well as above 0xA are currently reserved
        if 2 < self.opcode < 8 or self.opcode > 0xA:
            raise ProtocolException()

        # control frames cannot be fragmented
        if self.opcode > 0x7 and self.fin == 0:
            raise ProtocolException()

        # do we already have enough some_bytes to continue?
        some_bytes = some_bytes[1:] if some_bytes and len(some_bytes) > 1 else b''

        # Yield until we get the second header's byte
        while not some_bytes:
            some_bytes = (yield 1)

        second_byte = some_bytes[0] if isinstance(some_bytes, bytearray) else ord(some_bytes[0])
        mask = (second_byte >> 7) & 1
        self.payload_length = second_byte & 0x7f

        # All control frames MUST have a payload length of 125 some_bytes or less
        if self.opcode > 0x7 and self.payload_length > 125:
            raise FrameTooLargeException()

        if some_bytes and len(some_bytes) > 1:
            buf = some_bytes[1:]
            some_bytes = buf
        else:
            buf = b''
            some_bytes = b''

        if self.payload_length == 127:
            # This will compute the actual application data size
            if len(buf) < 8:
                nxt_buf_size = 8 - len(buf)
                some_bytes = (yield nxt_buf_size)
                some_bytes = buf + (some_bytes or b'')
                while len(some_bytes) < 8:
                    b = (yield 8 - len(some_bytes))
                    if b is not None:
                        some_bytes = some_bytes + b
                if len(some_bytes) > 8:
                    buf = some_bytes[8:]
                    some_bytes = some_bytes[:8]
            else:
                some_bytes = buf[:8]
                buf = buf[8:]
            extended_payload_length = some_bytes
            self.payload_length = unpack(
                '!Q', extended_payload_length)[0]
            if self.payload_length > 0x7FFFFFFFFFFFFFFF:
                raise FrameTooLargeException()
        elif self.payload_length == 126:
            if len(buf) < 2:
                nxt_buf_size = 2 - len(buf)
                some_bytes = (yield nxt_buf_size)
                some_bytes = buf + (some_bytes or b'')
                while len(some_bytes) < 2:
                    b = (yield 2 - len(some_bytes))
                    if b is not None:
                        some_bytes = some_bytes + b
                if len(some_bytes) > 2:
                    buf = some_bytes[2:]
                    some_bytes = some_bytes[:2]
            else:
                some_bytes = buf[:2]
                buf = buf[2:]
            extended_payload_length = some_bytes
            self.payload_length = unpack(
                '!H', extended_payload_length)[0]

        if mask:
            if len(buf) < 4:
                nxt_buf_size = 4 - len(buf)
                some_bytes = (yield nxt_buf_size)
                some_bytes = buf + (some_bytes or b'')
                while not some_bytes or len(some_bytes) < 4:
                    b = (yield 4 - len(some_bytes))
                    if b is not None:
                        some_bytes = some_bytes + b
                if len(some_bytes) > 4:
                    buf = some_bytes[4:]
            else:
                some_bytes = buf[:4]
                buf = buf[4:]
            self.masking_key = some_bytes

        if len(buf) < self.payload_length:
            nxt_buf_size = self.payload_length - len(buf)
            some_bytes = (yield nxt_buf_size)
            some_bytes = buf + (some_bytes or b'')
            while len(some_bytes) < self.payload_length:
                l = self.payload_length - len(some_bytes)
                b = (yield l)
                if b is not None:
                    some_bytes = some_bytes + b
        else:
            if self.payload_length == len(buf):
                some_bytes = buf
            else:
                some_bytes = buf[:self.payload_length]

        self.body = some_bytes
        yield

    def mask(self, data):
        """
        Performs the masking or unmasking operation on data
        using the simple masking algorithm:

        ..
           j                   = i MOD 4
           transformed-octet-i = original-octet-i XOR masking-key-octet-j

        """
        masked = bytearray(data)
        if py3k: key = self.masking_key
        else: key = map(ord, self.masking_key)
        for i in range(len(data)):
            masked[i] = masked[i] ^ key[i%4]
        return masked
    unmask = mask
