
/**
 * Only allow to parse WebSocket frame to text
 * @param {Buffer} buffer
 */
export function parseFrame(buffer) {
    const firstByte = buffer.readUInt8(0);

    const opCode = firstByte & 0xF;
    // We can return null to signify that this is a connection termination frame 
    if (opCode === 0x8) return null;
    // We only care about text frames from this point onward 
    if (opCode !== 0x1) return;

    const secondByte = buffer.readUInt8(1);
    const isMasked = Boolean((secondByte >>> 7) & 0x1);
    // Keep track of our current position as we advance through the buffer 
    let currentOffset = 2; 
    let payloadLength = secondByte & 0x7F;

    if (payloadLength > 125) {
        if (payloadLength === 126) {
            payloadLength = buffer.readUInt16BE(currentOffset);
            currentOffset += 2;
        } else {
            // 127 
            // If this has a value, the frame size is ridiculously huge!
            // Honestly, if the frame length requires 64 bits, you're probably doing it wrong. 
            // In Node.js you'll require the BigInt type, or a special library to handle this. 
            throw new Error('Large payloads not currently implemented');
        }
    }

    let maskingKey;
    if (isMasked) {
        maskingKey = buffer.readUInt32BE(currentOffset);
        currentOffset += 4;
    }

    // Allocate somewhere to store the final message data
    const data = Buffer.alloc(payloadLength);
    // Only unmask the data if the masking bit was set to 1
    if (isMasked) {
        // Loop through the source buffer one byte at a time, keeping track of which
        // byte in the masking key to use in the next XOR calculation
        for (let i = 0, j = 0; i < payloadLength; ++i, j = i % 4) {
            // Extract the correct byte mask from the masking key
            const shift = j == 3 ? 0 : (3 - j) << 3;
            const mask = (shift == 0 ? maskingKey : (maskingKey >>> shift)) & 0xFF;
            // Read a byte from the source buffer 
            const source = buffer.readUInt8(currentOffset++);
            // XOR the source byte and write the result to the data 
            data.writeUInt8(mask ^ source, i);
        }
    } else {
        // Not masked - we can just read the data as-is
        buffer.copy(data, 0, currentOffset++);
    }

    return data.toString('utf8');
}

/**
 * 
 * @param {{ event: string, message: any[] }} data 
 * @returns {Buffer} - Returns a WebSocket frame
 */
export function constructReply(data) {
    // Convert the data to JSON and copy it into a buffer
    const json = JSON.stringify(data)
    const jsonByteLength = Buffer.byteLength(json);
    // Note: we're not supporting > 65535 byte payloads at this stage 
    const lengthByteCount = jsonByteLength < 126 ? 0 : 2;
    const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126;
    const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength);
    // Write out the first byte, using opcode `1` to indicate that the message 
    // payload contains text data 
    buffer.writeUInt8(0b10000001, 0);
    buffer.writeUInt8(payloadLength, 1);
    // Write the length of the JSON payload to the second byte 
    let payloadOffset = 2;
    if (lengthByteCount > 0) {
        buffer.writeUInt16BE(jsonByteLength, 2); payloadOffset += lengthByteCount;
    }
    // Write the JSON data to the data buffer 
    buffer.write(json, payloadOffset);
    return buffer;
}

export function sendTextFrame2(text) {
    let firstByte = 0x00,
    secondByte = 0x00,
    payloadLength = Buffer.from([0, 0]),
    payload = Buffer.alloc(text.length);
    payload.write(text);
    firstByte |= 0x80; // fin bit true
    firstByte |= 0x01; // opt code of 1 (text)
    secondByte |= text.length; // mask and payload len
    let frame = Buffer.concat([Buffer.from([firstByte]), Buffer.from([secondByte]), payload]);
    return frame
};