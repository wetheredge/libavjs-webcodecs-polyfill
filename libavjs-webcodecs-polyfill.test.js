(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LibAVWebCodecs = f()}})(function(){var define,module,exports;
var _$encodedAudioChunk_5 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
Object.defineProperty(_$encodedAudioChunk_5, "__esModule", { value: true });
_$encodedAudioChunk_5.EncodedAudioChunk = void 0;
var EncodedAudioChunk = /** @class */ (function () {
    function EncodedAudioChunk(init) {
        this.type = init.type;
        this.timestamp = init.timestamp;
        this.duration = init.duration || 0;
        var data = this._data =
            new Uint8Array(init.data.buffer || init.data, init.data.byteOffset || 0);
        this.byteLength = data.byteLength;
    }
    // Internal
    EncodedAudioChunk.prototype._libavGetData = function () { return this._data; };
    EncodedAudioChunk.prototype.copyTo = function (destination) {
        (new Uint8Array(destination.buffer || destination, destination.byteOffset || 0)).set(this._data);
    };
    return EncodedAudioChunk;
}());
_$encodedAudioChunk_5.EncodedAudioChunk = EncodedAudioChunk;

var _$audioData_1 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
Object.defineProperty(_$audioData_1, "__esModule", { value: true });
_$audioData_1.isInterleaved = _$audioData_1.AudioData = void 0;
var AudioData = /** @class */ (function () {
    function AudioData(init) {
        var format = this.format = init.format;
        var sampleRate = this.sampleRate = init.sampleRate;
        var numberOfFrames = this.numberOfFrames = init.numberOfFrames;
        this.numberOfChannels = init.numberOfChannels;
        this.timestamp = init.timestamp;
        var data = this._data =
            audioView(format, init.data.buffer || init.data, init.data.byteOffset || 0);
        this.duration = numberOfFrames / sampleRate * 1000000;
    }
    // Internal
    AudioData.prototype._libavGetData = function () { return this._data; };
    AudioData.prototype.allocationSize = function (options) {
        // 1. If [[Detached]] is true, throw an InvalidStateError DOMException.
        if (this._data === null)
            throw new DOMException("Detached", "InvalidStateError");
        /* 2. Let copyElementCount be the result of running the Compute Copy
         * Element Count algorithm with options. */
        var copyElementCount = this._computeCopyElementCount(options);
        // 3. Let destFormat be the value of [[format]].
        var destFormat = this.format;
        // 4. If options.format exists, assign options.format to destFormat.
        if (options.format)
            destFormat = options.format;
        /* 5. Let bytesPerSample be the number of bytes per sample, as defined
         * by the destFormat. */
        var bytesPerSample_ = bytesPerSample(destFormat);
        /* 6. Return the product of multiplying bytesPerSample by
         * copyElementCount. */
        return bytesPerSample_ * copyElementCount;
    };
    AudioData.prototype._computeCopyElementCount = function (options) {
        // 1. Let destFormat be the value of [[format]].
        var destFormat = this.format;
        // 2. If options.format exists, assign options.format to destFormat.
        if (options.format)
            destFormat = options.format;
        /* 3. If destFormat describes an interleaved AudioSampleFormat and
         * options.planeIndex is greater than 0, throw a RangeError. */
        var isInterleaved_ = isInterleaved(destFormat);
        if (isInterleaved_) {
            if (options.planeIndex > 0)
                throw new RangeError("Invalid plane");
        }
        /* 4. Otherwise, if destFormat describes a planar AudioSampleFormat and
         * if options.planeIndex is greater or equal to [[number of channels]],
         * throw a RangeError. */
        else if (options.planeIndex >= this.numberOfChannels)
            throw new RangeError("Invalid plane");
        /* 5. If [[format]] does not equal destFormat and the User Agent does
         * not support the requested AudioSampleFormat conversion, throw a
         * NotSupportedError DOMException. Conversion to f32-planar MUST always
         * be supported. */
        if (this.format !== destFormat &&
            destFormat !== "f32-planar")
            throw new DOMException("Only conversion to f32-planar is supported", "NotSupportedError");
        /* 6. Let frameCount be the number of frames in the plane identified by
         * options.planeIndex. */
        var frameCount = this.numberOfFrames; // All planes have the same number of frames
        /* 7. If options.frameOffset is greater than or equal to frameCount,
         * throw a RangeError. */
        var frameOffset = options.frameOffset || 0;
        if (frameOffset >= frameCount)
            throw new RangeError("Frame offset out of range");
        /* 8. Let copyFrameCount be the difference of subtracting
         * options.frameOffset from frameCount. */
        var copyFrameCount = frameCount - frameOffset;
        // 9. If options.frameCount exists:
        if ("frameCount" in options) {
            /* 1. If options.frameCount is greater than copyFrameCount, throw a
             * RangeError. */
            if (options.frameCount >= copyFrameCount)
                throw new RangeError("Frame count out of range");
            // 2. Otherwise, assign options.frameCount to copyFrameCount.
            copyFrameCount = options.frameCount;
        }
        // 10. Let elementCount be copyFrameCount.
        var elementCount = copyFrameCount;
        /* 11. If destFormat describes an interleaved AudioSampleFormat,
         * mutliply elementCount by [[number of channels]] */
        if (isInterleaved_)
            elementCount *= this.numberOfChannels;
        // 12. return elementCount.
        return elementCount;
    };
    AudioData.prototype.copyTo = function (destination, options) {
        // 1. If [[Detached]] is true, throw an InvalidStateError DOMException.
        if (this._data === null)
            throw new DOMException("Detached", "InvalidStateError");
        /* 2. Let copyElementCount be the result of running the Compute Copy
         * Element Count algorithm with options. */
        var copyElementCount = this._computeCopyElementCount(options);
        // 3. Let destFormat be the value of [[format]].
        var destFormat = this.format;
        // 4. If options.format exists, assign options.format to destFormat.
        if (options.format)
            destFormat = options.format;
        /* 5. Let bytesPerSample be the number of bytes per sample, as defined
         * by the destFormat. */
        var bytesPerSample_ = bytesPerSample(destFormat);
        /* 6. If the product of multiplying bytesPerSample by copyElementCount
         * is greater than destination.byteLength, throw a RangeError. */
        if (bytesPerSample_ * copyElementCount > destination.byteLength)
            throw new RangeError("Buffer too small");
        /* 7. Let resource be the media resource referenced by [[resource
         * reference]]. */
        /* 8. Let planeFrames be the region of resource corresponding to
         * options.planeIndex. */
        var planeFrames = this._data.subarray(options.planeIndex * this.numberOfFrames);
        var frameOffset = options.frameOffset || 0;
        var numberOfChannels = this.numberOfChannels;
        /* 9. Copy elements of planeFrames into destination, starting with the
         * frame positioned at options.frameOffset and stopping after
         * copyElementCount samples have been copied. If destFormat does not
         * equal [[format]], convert elements to the destFormat
         * AudioSampleFormat while making the copy. */
        if (this.format === destFormat) {
            var dest = audioView(destFormat, destination.buffer || destination, destination.byteOffset || 0);
            if (isInterleaved(destFormat)) {
                dest.set(planeFrames.subarray(frameOffset * numberOfChannels, frameOffset * numberOfChannels + copyElementCount));
            }
            else {
                dest.set(planeFrames.subarray(frameOffset, frameOffset + copyElementCount));
            }
        }
        else {
            // Actual conversion necessary. Always to f32-planar.
            var out = audioView(destFormat, destination.buffer || destination, destination.byteOffset || 0);
            // First work out the conversion
            var sub = 0;
            var div = 1;
            switch (this.format) {
                case "u8":
                case "u8-planar":
                    sub = 0x80;
                    div = 0x80;
                    break;
                case "s16":
                case "s16-planar":
                    div = 0x8000;
                    break;
                case "s32":
                case "s32-planar":
                    div = 0x80000000;
                    break;
            }
            // Then do it
            if (isInterleaved(this.format)) {
                for (var i = options.planeIndex + frameOffset * numberOfChannels, o = 0; o < copyElementCount; i += numberOfChannels, o++)
                    out[o] = (planeFrames[i] - sub) / div;
            }
            else {
                for (var i = frameOffset, o = 0; o < copyElementCount; i++, o++)
                    out[o] = (planeFrames[i] - sub) / div;
            }
        }
    };
    AudioData.prototype.clone = function () {
        // 1. If [[Detached]] is true, throw an InvalidStateError DOMException.
        if (this._data === null)
            throw new DOMException("Detached", "InvalidStateError");
        /* 2. Return the result of running the Clone AudioData algorithm with
         * this. */
        return new AudioData({
            format: this.format,
            sampleRate: this.sampleRate,
            numberOfFrames: this.numberOfFrames,
            numberOfChannels: this.numberOfChannels,
            timestamp: this.timestamp,
            data: this._data
        });
    };
    AudioData.prototype.close = function () {
        this._data = null;
    };
    return AudioData;
}());
_$audioData_1.AudioData = AudioData;
/**
 * Construct the appropriate type of ArrayBufferView for the given sample
 * format and buffer.
 * @param format  Sample format
 * @param buffer  ArrayBuffer (NOT view)
 * @param byteOffset  Offset into the buffer
 */
function audioView(format, buffer, byteOffset) {
    switch (format) {
        case "u8":
        case "u8-planar":
            return new Uint8Array(buffer, byteOffset);
        case "s16":
        case "s16-planar":
            return new Int16Array(buffer, byteOffset);
        case "s32":
        case "s32-planar":
            return new Int32Array(buffer, byteOffset);
        case "f32":
        case "f32-planar":
            return new Float32Array(buffer, byteOffset);
        default:
            throw new TypeError("Invalid AudioSampleFormat");
    }
}
/**
 * Number of bytes per sample of this format.
 * @param format  Sample format
 */
function bytesPerSample(format) {
    switch (format) {
        case "u8":
        case "u8-planar":
            return 1;
        case "s16":
        case "s16-planar":
            return 2;
        case "s32":
        case "s32-planar":
        case "f32":
        case "f32-planar":
            return 4;
        default:
            throw new TypeError("Invalid AudioSampleFormat");
    }
}
/**
 * Is this format interleaved?
 * @param format  Sample format
 */
function isInterleaved(format) {
    switch (format) {
        case "u8":
        case "s16":
        case "s32":
        case "f32":
            return true;
        case "u8-planar":
        case "s16-planar":
        case "s32-planar":
        case "f32-planar":
            return false;
        default:
            throw new TypeError("Invalid AudioSampleFormat");
    }
}
_$audioData_1.isInterleaved = isInterleaved;

var _$libav_7 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021-2023 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$libav_7, "__esModule", { value: true });
_$libav_7.encoder = _$libav_7.decoder = _$libav_7.load = _$libav_7.free = _$libav_7.get = _$libav_7.setLibAVOptions = _$libav_7.encoders = _$libav_7.decoders = void 0;
// Currently available libav instances
var libavs = [];
// Options required to create a LibAV instance
var libavOptions = {};
/**
 * Supported decoders.
 */
_$libav_7.decoders = null;
/**
 * Supported encoders.
 */
_$libav_7.encoders = null;
/**
 * Set the libav loading options.
 */
function setLibAVOptions(to) {
    libavOptions = to;
}
_$libav_7.setLibAVOptions = setLibAVOptions;
/**
 * Get a libav instance.
 */
function get() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (libavs.length)
                        return [2 /*return*/, libavs.shift()];
                    return [4 /*yield*/, LibAV.LibAV(libavOptions)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
_$libav_7.get = get;
/**
 * Free a libav instance for later reuse.
 */
function free(libav) {
    libavs.push(libav);
}
_$libav_7.free = free;
/**
 * Get the list of encoders/decoders supported by libav (which are also
 * supported by this polyfill)
 * @param encoders  Check for encoders instead of decoders
 */
function codecs(encoders) {
    return __awaiter(this, void 0, void 0, function () {
        var libav, ret, _i, _a, _b, avname, codec;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, get()];
                case 1:
                    libav = _c.sent();
                    ret = [];
                    _i = 0, _a = [
                        ["flac", "flac"],
                        ["libopus", "opus"],
                        ["libvorbis", "vorbis"],
                        ["libaom-av1", "av01"],
                        ["libvpx-vp9", "vp09"],
                        ["libvpx", "vp8"]
                    ];
                    _c.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], avname = _b[0], codec = _b[1];
                    if (!encoders) return [3 /*break*/, 4];
                    return [4 /*yield*/, libav.avcodec_find_encoder_by_name(avname)];
                case 3:
                    if (_c.sent())
                        ret.push(codec);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, libav.avcodec_find_decoder_by_name(avname)];
                case 5:
                    if (_c.sent())
                        ret.push(codec);
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    free(libav);
                    return [2 /*return*/, ret];
            }
        });
    });
}
/**
 * Load the lists of supported decoders and encoders.
 */
function load() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, codecs(false)];
                case 1:
                    _$libav_7.decoders = _a.sent();
                    return [4 /*yield*/, codecs(true)];
                case 2:
                    _$libav_7.encoders = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
_$libav_7.load = load;
/**
 * Convert a decoder from the codec registry (or libav.js-specific parameters)
 * to libav.js. Returns null if unsupported.
 */
function decoder(codec) {
    if (typeof codec === "string") {
        codec = codec.replace(/\..*/, "");
        var outCodec = codec;
        switch (codec) {
            // Audio
            case "flac":
                break;
            case "opus":
                outCodec = "libopus";
                break;
            case "vorbis":
                outCodec = "libvorbis";
                break;
            // Video
            case "av01":
                outCodec = "libaom-av1";
                break;
            case "vp09":
                outCodec = "libvpx-vp9";
                break;
            case "vp8":
                outCodec = "libvpx";
                break;
            // Unsupported
            case "mp3":
            case "mp4a":
            case "ulaw":
            case "alaw":
            case "avc1":
            case "avc3":
            case "hev1":
            case "hvc1":
                return null;
            // Unrecognized
            default:
                throw new TypeError("Unrecognized codec");
        }
        // Check whether we actually support this codec
        if (!(_$libav_7.decoders.indexOf(codec) >= 0))
            return null;
        return { codec: outCodec };
    }
    else {
        return codec.libavjs;
    }
}
_$libav_7.decoder = decoder;
/**
 * Convert an encoder from the codec registry (or libav.js-specific parameters)
 * to libav.js. Returns null if unsupported.
 */
function encoder(codec, config) {
    if (typeof codec === "string") {
        var codecParts = codec.split(".");
        codec = codecParts[0];
        var outCodec = codec;
        var ctx = {};
        var options = {};
        var video = false;
        switch (codec) {
            // Audio
            case "flac":
                ctx.sample_fmt = 2 /* S32 */;
                ctx.bit_rate = 0;
                if (typeof config.flac === "object" &&
                    config.flac !== null) {
                    var flac = config.flac;
                    // FIXME: Check block size
                    if (typeof flac.blockSize === "number")
                        ctx.frame_size = flac.blockSize;
                    if (typeof flac.compressLevel === "number") {
                        // Not supported
                        return null;
                    }
                }
                break;
            case "opus":
                outCodec = "libopus";
                ctx.sample_fmt = 3 /* FLT */;
                ctx.sample_rate = 48000;
                if (typeof config.opus === "object" &&
                    config.opus !== null) {
                    var opus = config.opus;
                    // FIXME: Check frame duration
                    if (typeof opus.frameDuration === "number")
                        options.frame_duration = "" + (opus.frameDuration / 1000);
                    if (typeof opus.complexity !== "undefined") {
                        // We don't support the complexity option
                        return null;
                    }
                    if (typeof opus.packetlossperc === "number") {
                        if (opus.packetlossperc < 0 || opus.packetlossperc > 100)
                            return null;
                        options.packet_loss = "" + opus.packetlossperc;
                    }
                    if (typeof opus.useinbandfec === "boolean")
                        options.fec = opus.useinbandfec ? "1" : "0";
                    if (typeof opus.usedtx === "boolean") {
                        // We don't support the usedtx option
                        return null;
                    }
                }
                break;
            case "vorbis":
                outCodec = "libvorbis";
                ctx.sample_fmt = 8 /* FLTP */;
                break;
            // Video
            case "av01":
                video = true;
                outCodec = "libaom-av1";
                if (config.latencyMode === "realtime") {
                    options.usage = "realtime";
                    options["cpu-used"] = "8";
                }
                // Check for advanced options
                if (!av1Advanced(codecParts, ctx))
                    return null;
                break;
            case "vp09":
                video = true;
                outCodec = "libvpx-vp9";
                if (config.latencyMode === "realtime") {
                    options.quality = "realtime";
                    options["cpu-used"] = "8";
                }
                // Check for advanced options
                if (!vp9Advanced(codecParts, ctx))
                    return null;
                break;
            case "vp8":
                video = true;
                outCodec = "libvpx";
                if (config.latencyMode === "realtime") {
                    options.quality = "realtime";
                    options["cpu-used"] = "8";
                }
                break;
            // Unsupported
            case "mp3":
            case "mp4a":
            case "ulaw":
            case "alaw":
            case "avc1":
                return null;
            // Unrecognized
            default:
                throw new TypeError("Unrecognized codec");
        }
        // Check whether we actually support this codec
        if (!(_$libav_7.encoders.indexOf(codec) >= 0))
            return null;
        if (video) {
            if (typeof ctx.pix_fmt !== "number")
                ctx.pix_fmt = 0 /* YUV420P */;
            var width = ctx.width = config.width;
            var height = ctx.height = config.height;
            if (config.framerate) {
                /* FIXME: We need this as a rational, not a floating point, and
                 * this is obviously not the right way to do it */
                ctx.framerate_num = Math.round(config.framerate);
                ctx.framerate_den = 1;
            }
            // Check for non-square pixels
            var dWidth = config.displayWidth || config.width;
            var dHeight = config.displayHeight || config.height;
            if (dWidth !== width || dHeight !== height) {
                ctx.sample_aspect_ratio_num = dWidth * height;
                ctx.sample_aspect_ratio_den = dHeight * width;
            }
        }
        else {
            if (!ctx.sample_rate)
                ctx.sample_rate = config.sampleRate || 48000;
            if (config.numberOfChannels) {
                var n = config.numberOfChannels;
                ctx.channel_layout = (n === 1) ? 4 : ((1 << n) - 1);
            }
        }
        if (typeof ctx.bit_rate !== "number" && config.bitrate) {
            // NOTE: CBR requests are, quite rightly, ignored
            ctx.bit_rate = config.bitrate;
        }
        return {
            codec: outCodec,
            ctx: ctx,
            options: options
        };
    }
    else {
        return codec.libavjs;
    }
}
_$libav_7.encoder = encoder;
/**
 * Handler for advanced options for AV1.
 * @param codecParts  .-separated parts of the codec string.
 * @param ctx  Context to populate with advanced options.
 */
function av1Advanced(codecParts, ctx) {
    if (codecParts[1]) {
        var profile = +codecParts[1];
        if (profile >= 0 && profile <= 2)
            ctx.profile = profile;
        else
            throw new TypeError("Invalid AV1 profile");
    }
    if (codecParts[2]) {
        var level = +codecParts[2];
        if (level >= 0 && level <= 23)
            ctx.level = level;
        else
            throw new TypeError("Invalid AV1 level");
    }
    if (codecParts[3]) {
        switch (codecParts[3]) {
            case "M":
                // Default
                break;
            case "H":
                if (ctx.level >= 8) {
                    // Valid but unsupported
                    return false;
                }
                else {
                    throw new TypeError("The AV1 high tier is only available for level 4.0 and up");
                }
                break;
            default:
                throw new TypeError("Invalid AV1 tier");
        }
    }
    if (codecParts[4]) {
        var depth = +codecParts[3];
        if (depth === 10 || depth === 12) {
            // Valid but unsupported
            return false;
        }
        else if (depth !== 8) {
            throw new TypeError("Invalid AV1 bit depth");
        }
    }
    if (codecParts[5]) {
        // Monochrome
        switch (codecParts[5]) {
            case "0":
                // Default
                break;
            case "1":
                // Valid but unsupported
                return false;
            default:
                throw new TypeError("Invalid AV1 monochrome flag");
        }
    }
    if (codecParts[6]) {
        // Subsampling mode
        switch (codecParts[6]) {
            case "000": // YUV444
                ctx.pix_fmt = 5 /* YUV444P */;
                break;
            case "100": // YUV422
                ctx.pix_fmt = 4 /* YUV422P */;
                break;
            case "110": // YUV420P (default)
                ctx.pix_fmt = 0 /* YUV420P */;
                break;
            case "111": // Monochrome
                return false;
            default:
                throw new TypeError("Invalid AV1 subsampling mode");
        }
    }
    /* The remaining values have to do with color formats, which we don't
     * support correctly anyway */
    return true;
}
/**
 * Handler for advanced options for VP9.
 * @param codecParts  .-separated parts of the codec string.
 * @param ctx  Context to populate with advanced options.
 */
function vp9Advanced(codecParts, ctx) {
    if (codecParts[1]) {
        var profile = +codecParts[1];
        if (profile >= 0 && profile <= 3)
            ctx.profile = profile;
        else
            throw new TypeError("Invalid VP9 profile");
    }
    if (codecParts[2]) {
        var level = [+codecParts[2][0], +codecParts[2][1]];
        if (level[0] >= 1 && level[0] <= 4) {
            if (level[1] >= 0 && level[1] <= 1) {
                // OK
            }
            else {
                throw new TypeError("Invalid VP9 level");
            }
        }
        else if (level[0] >= 5 && level[0] <= 6) {
            if (level[1] >= 0 && level[1] <= 2) {
                // OK
            }
            else {
                throw new TypeError("Invalid VP9 level");
            }
        }
        else {
            throw new TypeError("Invalid VP9 level");
        }
        ctx.level = +codecParts[2];
    }
    if (codecParts[3]) {
        var depth = +codecParts[3];
        if (depth === 10 || depth === 12) {
            // Valid but unsupported
            return false;
        }
        else if (depth !== 8) {
            throw new TypeError("Invalid VP9 bit depth");
        }
    }
    if (codecParts[4]) {
        var chromaMode = +codecParts[4];
        switch (chromaMode) {
            case 0:
            case 1:
                // FIXME: These are subtly different YUV420P modes, but we treat them the same
                ctx.pix_fmt = 0 /* YUV420P */;
                break;
            case 2: // YUV422
                ctx.pix_fmt = 4 /* YUV422P */;
                break;
            case 3: // YUV444
                ctx.pix_fmt = 5 /* YUV444P */;
                break;
            default:
                throw new TypeError("Invalid VP9 chroma subsampling format");
        }
    }
    /* The remaining values have to do with color formats, which we don't
     * support correctly anyway */
    return true;
}

var _$misc_9 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
Object.defineProperty(_$misc_9, "__esModule", { value: true });
_$misc_9.cloneConfig = void 0;
/**
 * Clone this configuration. Just copies over the supported/recognized fields.
 */
function cloneConfig(config, fields) {
    var ret = {};
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var field = fields_1[_i];
        if (field in config)
            ret[field] = config[field];
    }
    return ret;
}
_$misc_9.cloneConfig = cloneConfig;

var _$audioDecoder_2 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var ____awaiter_2 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_2 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$audioDecoder_2, "__esModule", { value: true });
_$audioDecoder_2.AudioDecoder = void 0;
/* removed: var _$audioData_1 = require("./audio-data"); */;
/* removed: var _$libav_7 = require("./libav"); */;
/* removed: var _$misc_9 = require("./misc"); */;
var AudioDecoder = /** @class */ (function () {
    function AudioDecoder(init) {
        this._output = init.output;
        this._error = init.error;
        this.state = "unconfigured";
        this.decodeQueueSize = 0;
        this._p = Promise.all([]);
        this._libav = null;
        this._codec = this._c = this._pkt = this._frame = 0;
    }
    AudioDecoder.prototype.configure = function (config) {
        var _this = this;
        var self = this;
        // 1. If config is not a valid AudioDecoderConfig, throw a TypeError.
        // NOTE: We don't support sophisticated codec string parsing (yet)
        // 2. If [[state]] is ÔÇ£closedÔÇØ, throw an InvalidStateError DOMException.
        if (this.state === "closed")
            throw new DOMException("Decoder is closed", "InvalidStateError");
        // Free any internal state
        if (this._libav)
            this._p = this._p.then(function () { return _this._free(); });
        // 3. Set [[state]] to "configured".
        this.state = "configured";
        // 4. Set [[key chunk required]] to true.
        // NOTE: Not implemented
        // 5. Queue a control message to configure the decoder with config.
        this._p = this._p.then(function () {
            return ____awaiter_2(this, void 0, void 0, function () {
                var supported, libav, _a;
                var _b;
                return ____generator_2(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            supported = _$libav_7.decoder(config.codec);
                            if (!supported) return [3 /*break*/, 4];
                            _a = self;
                            return [4 /*yield*/, _$libav_7.get()];
                        case 1:
                            libav = _a._libav = _d.sent();
                            return [4 /*yield*/, libav.ff_init_decoder(supported.codec)];
                        case 2:
                            // Initialize
                            _b = _d.sent(), self._codec = _b[0], self._c = _b[1], self._pkt = _b[2], self._frame = _b[3];
                            return [4 /*yield*/, libav.AVCodecContext_time_base_s(self._c, 1, 1000)];
                        case 3:
                            _d.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            self._closeAudioDecoder(new DOMException("Unsupported codec", "NotSupportedError"));
                            _d.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    // Our own algorithm, close libav
    AudioDecoder.prototype._free = function () {
        return ____awaiter_2(this, void 0, void 0, function () {
            return ____generator_2(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._c) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._libav.ff_free_decoder(this._c, this._pkt, this._frame)];
                    case 1:
                        _a.sent();
                        this._codec = this._c = this._pkt = this._frame = 0;
                        _a.label = 2;
                    case 2:
                        if (this._libav) {
                            _$libav_7.free(this._libav);
                            this._libav = null;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AudioDecoder.prototype._closeAudioDecoder = function (exception) {
        var _this = this;
        // 1. Run the Reset AudioDecoder algorithm with exception.
        this._resetAudioDecoder(exception);
        // 2. Set [[state]] to "closed".
        this.state = "closed";
        /* 3. Clear [[codec implementation]] and release associated system
         * resources. */
        this._p = this._p.then(function () { return _this._free(); });
        /* 4. If exception is not an AbortError DOMException, queue a task on
         * the control thread event loop to invoke the [[error callback]] with
         * exception. */
        if (exception.name !== "AbortError")
            this._p = this._p.then(function () { _this._error(exception); });
    };
    AudioDecoder.prototype._resetAudioDecoder = function (exception) {
        var _this = this;
        // 1. If [[state]] is "closed", throw an InvalidStateError.
        if (this.state === "closed")
            throw new DOMException("Decoder closed", "InvalidStateError");
        // 2. Set [[state]] to "unconfigured".
        this.state = "unconfigured";
        // ... really, we're just going to free it now
        this._p = this._p.then(function () { return _this._free(); });
    };
    AudioDecoder.prototype.decode = function (chunk) {
        var self = this;
        // 1. If [[state]] is not "configured", throw an InvalidStateError.
        if (this.state !== "configured")
            throw new DOMException("Unconfigured", "InvalidStateError");
        // 2. If [[key chunk required]] is true:
        //    1. If chunk.[[type]] is not key, throw a DataError.
        /*    2. Implementers SHOULD inspect the chunkÔÇÖs [[internal data]] to
         *    verify that it is truly a key chunk. If a mismatch is detected,
         *    throw a DataError. */
        //    3. Otherwise, assign false to [[key chunk required]].
        // 3. Increment [[decodeQueueSize]].
        this.decodeQueueSize++;
        // 4. Queue a control message to decode the chunk.
        this._p = this._p.then(function () {
            return ____awaiter_2(this, void 0, void 0, function () {
                var libav, c, pkt, frame, decodedOutputs, ptsFull, pts, ptshi, packet, ex_1;
                return ____generator_2(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            libav = self._libav;
                            c = self._c;
                            pkt = self._pkt;
                            frame = self._frame;
                            decodedOutputs = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            ptsFull = Math.floor(chunk.timestamp / 1000);
                            pts = ptsFull % 0x100000000;
                            ptshi = ~~(ptsFull / 0x100000000);
                            packet = {
                                data: chunk._libavGetData(),
                                pts: pts,
                                ptshi: ptshi,
                                dts: pts,
                                dtshi: ptshi
                            };
                            if (chunk.duration) {
                                packet.duration = Math.floor(chunk.duration / 1000);
                                packet.durationhi = 0;
                            }
                            return [4 /*yield*/, libav.ff_decode_multi(c, pkt, frame, [packet])];
                        case 2:
                            decodedOutputs = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            ex_1 = _a.sent();
                            self._p = self._p.then(function () {
                                self._closeAudioDecoder(ex_1);
                            });
                            return [3 /*break*/, 4];
                        case 4:
                            /* 3. Queue a task on the control thread event loop to decrement
                             * [[decodeQueueSize]]. */
                            self.decodeQueueSize--;
                            /* 4. Let decoded outputs be a list of decoded audio data outputs
                             * emitted by [[codec implementation]]. */
                            /* 5. If decoded outputs is not empty, queue a task on the control
                             * thread event loop to run the Output AudioData algorithm with
                             * decoded outputs. */
                            if (decodedOutputs)
                                self._outputAudioData(decodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    AudioDecoder.prototype._outputAudioData = function (frames) {
        var libav = this._libav;
        for (var _i = 0, frames_1 = frames; _i < frames_1.length; _i++) {
            var frame = frames_1[_i];
            // 1. format
            var format = void 0;
            var planar = false;
            switch (frame.format) {
                case libav.AV_SAMPLE_FMT_U8:
                    format = "u8";
                    break;
                case libav.AV_SAMPLE_FMT_S16:
                    format = "s16";
                    break;
                case libav.AV_SAMPLE_FMT_S32:
                    format = "s32";
                    break;
                case libav.AV_SAMPLE_FMT_FLT:
                    format = "f32";
                    break;
                case libav.AV_SAMPLE_FMT_U8P:
                    format = "u8";
                    planar = true;
                    break;
                case libav.AV_SAMPLE_FMT_S16P:
                    format = "s16";
                    planar = true;
                    break;
                case libav.AV_SAMPLE_FMT_S32P:
                    format = "s32";
                    planar = true;
                    break;
                case libav.AV_SAMPLE_FMT_FLTP:
                    format = "f32";
                    planar = true;
                    break;
                default:
                    throw new DOMException("Unsupported libav format!", "EncodingError");
            }
            // 2. sampleRate
            var sampleRate = frame.sample_rate;
            // 3. numberOfFrames
            var numberOfFrames = frame.nb_samples;
            // 4. numberOfChannels
            var numberOfChannels = frame.channels;
            // 5. timestamp
            var timestamp = (frame.ptshi * 0x100000000 + frame.pts) * 1000;
            // 6. data
            var raw = void 0;
            if (planar) {
                var ct = 0;
                for (var i = 0; i < frame.data.length; i++)
                    ct += frame.data[i].length;
                raw = new (frame.data[0].constructor)(ct);
                ct = 0;
                for (var i = 0; i < frame.data.length; i++) {
                    var part = frame.data[i];
                    raw.set(part, ct);
                    ct += part.length;
                }
            }
            else {
                raw = frame.data;
            }
            var data = new _$audioData_1.AudioData({
                format: format,
                sampleRate: sampleRate,
                numberOfFrames: numberOfFrames,
                numberOfChannels: numberOfChannels,
                timestamp: timestamp,
                data: raw
            });
            this._output(data);
        }
    };
    AudioDecoder.prototype.flush = function () {
        var self = this;
        var ret = this._p.then(function () {
            return ____awaiter_2(this, void 0, void 0, function () {
                var libav, c, pkt, frame, decodedOutputs, ex_2;
                return ____generator_2(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!self._c)
                                return [2 /*return*/];
                            libav = self._libav;
                            c = self._c;
                            pkt = self._pkt;
                            frame = self._frame;
                            decodedOutputs = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, libav.ff_decode_multi(c, pkt, frame, [], true)];
                        case 2:
                            decodedOutputs = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            ex_2 = _a.sent();
                            self._p = self._p.then(function () {
                                self._closeAudioDecoder(ex_2);
                            });
                            return [3 /*break*/, 4];
                        case 4:
                            if (decodedOutputs)
                                self._outputAudioData(decodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        });
        this._p = ret;
        return ret;
    };
    AudioDecoder.prototype.reset = function () {
        this._resetAudioDecoder(new DOMException("Reset", "AbortError"));
    };
    AudioDecoder.prototype.close = function () {
        this._closeAudioDecoder(new DOMException("Close", "AbortError"));
    };
    AudioDecoder.isConfigSupported = function (config) {
        return ____awaiter_2(this, void 0, void 0, function () {
            var dec, supported, libav, _a, c, pkt, frame, ex_3;
            return ____generator_2(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dec = _$libav_7.decoder(config.codec);
                        supported = false;
                        if (!dec) return [3 /*break*/, 8];
                        return [4 /*yield*/, _$libav_7.get()];
                    case 1:
                        libav = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, libav.ff_init_decoder(dec.codec)];
                    case 3:
                        _a = _b.sent(), c = _a[1], pkt = _a[2], frame = _a[3];
                        return [4 /*yield*/, libav.ff_free_decoder(c, pkt, frame)];
                    case 4:
                        _b.sent();
                        supported = true;
                        return [3 /*break*/, 6];
                    case 5:
                        ex_3 = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, _$libav_7.free(libav)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [2 /*return*/, {
                            supported: supported,
                            config: _$misc_9.cloneConfig(config, ["codec", "sampleRate", "numberOfChannels"])
                        }];
                }
            });
        });
    };
    return AudioDecoder;
}());
_$audioDecoder_2.AudioDecoder = AudioDecoder;

var _$audioEncoder_3 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021-2023 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var ____awaiter_3 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_3 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$audioEncoder_3, "__esModule", { value: true });
_$audioEncoder_3.AudioEncoder = void 0;
/* removed: var _$audioData_1 = require("./audio-data"); */;
/* removed: var _$encodedAudioChunk_5 = require("./encoded-audio-chunk"); */;
/* removed: var _$libav_7 = require("./libav"); */;
/* removed: var _$misc_9 = require("./misc"); */;
var AudioEncoder = /** @class */ (function () {
    function AudioEncoder(init) {
        this._output = init.output;
        this._error = init.error;
        this.state = "unconfigured";
        this.encodeQueueSize = 0;
        this._p = Promise.all([]);
        this._libav = null;
        this._codec = this._c = this._frame = this._pkt = 0;
        this._filter_in_ctx = this._filter_out_ctx = null;
        this._filter_graph = this._buffersrc_ctx = this._buffersink_ctx = 0;
    }
    AudioEncoder.prototype.configure = function (config) {
        var _this = this;
        var self = this;
        // 1. If config is not a valid AudioEncoderConfig, throw a TypeError.
        // NOTE: We don't support sophisticated codec string parsing (yet)
        // 2. If [[state]] is "closed", throw an InvalidStateError.
        if (this.state === "closed")
            throw new DOMException("Encoder is closed", "InvalidStateError");
        // Free any internal state
        if (this._libav)
            this._p = this._p.then(function () { return _this._free(); });
        // 3. Set [[state]] to "configured".
        this.state = "configured";
        // 4. Queue a control message to configure the encoder using config.
        this._p = this._p.then(function () {
            return ____awaiter_3(this, void 0, void 0, function () {
                var supported, libav, _a, frame_size;
                var _b;
                return ____generator_3(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            supported = _$libav_7.encoder(config.codec, config);
                            // Get the output metadata now
                            self._outputMetadata = { decoderConfig: {
                                    codec: config.codec,
                                    // Rest will be filled in when we get data
                                    sampleRate: 0,
                                    numberOfChannels: 0
                                } };
                            self._outputMetadataFilled = false;
                            if (!supported) return [3 /*break*/, 4];
                            _a = self;
                            return [4 /*yield*/, _$libav_7.get()];
                        case 1:
                            libav = _a._libav = _d.sent();
                            frame_size = void 0;
                            return [4 /*yield*/, libav.ff_init_encoder(supported.codec, supported)];
                        case 2:
                            _b = _d.sent(), self._codec = _b[0], self._c = _b[1], self._frame = _b[2], self._pkt = _b[3], frame_size = _b[4];
                            self._pts = 0;
                            return [4 /*yield*/, libav.AVCodecContext_time_base_s(self._c, 1, supported.ctx.sample_rate)];
                        case 3:
                            _d.sent();
                            // Be ready to set up the filter
                            self._filter_out_ctx = {
                                sample_rate: supported.ctx.sample_rate,
                                sample_fmt: supported.ctx.sample_fmt,
                                channel_layout: supported.ctx.channel_layout,
                                frame_size: frame_size
                            };
                            return [3 /*break*/, 5];
                        case 4:
                            self._closeAudioEncoder(new DOMException("Unsupported codec", "NotSupportedError"));
                            _d.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    // Our own algorithm, close libav
    AudioEncoder.prototype._free = function () {
        return ____awaiter_3(this, void 0, void 0, function () {
            return ____generator_3(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._filter_graph) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._libav.avfilter_graph_free_js(this._filter_graph)];
                    case 1:
                        _a.sent();
                        this._filter_in_ctx = this._filter_out_ctx = null;
                        this._filter_graph = this._buffersrc_ctx = this._buffersink_ctx =
                            0;
                        _a.label = 2;
                    case 2:
                        if (!this._c) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._libav.ff_free_encoder(this._c, this._frame, this._pkt)];
                    case 3:
                        _a.sent();
                        this._codec = this._c = this._frame = this._pkt = 0;
                        _a.label = 4;
                    case 4:
                        if (this._libav) {
                            _$libav_7.free(this._libav);
                            this._libav = null;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AudioEncoder.prototype._closeAudioEncoder = function (exception) {
        var _this = this;
        // 1. Run the Reset AudioEncoder algorithm with exception.
        this._resetAudioEncoder(exception);
        // 2. Set [[state]] to "closed".
        this.state = "closed";
        /* 3. Clear [[codec implementation]] and release associated system
         * resources. */
        this._p = this._p.then(function () { return _this._free(); });
        /* 4. If exception is not an AbortError DOMException, queue a task on
         * the control thread event loop to invoke the [[error callback]] with
         * exception. */
        if (exception.name !== "AbortError")
            this._p = this._p.then(function () { _this._error(exception); });
    };
    AudioEncoder.prototype._resetAudioEncoder = function (exception) {
        var _this = this;
        // 1. If [[state]] is "closed", throw an InvalidStateError.
        if (this.state === "closed")
            throw new DOMException("Encoder closed", "InvalidStateError");
        // 2. Set [[state]] to "unconfigured".
        this.state = "unconfigured";
        // ... really, we're just going to free it now
        this._p = this._p.then(function () { return _this._free(); });
    };
    AudioEncoder.prototype.encode = function (data) {
        var self = this;
        /* 1. If the value of dataÔÇÖs [[Detached]] internal slot is true, throw
         * a TypeError. */
        if (data._libavGetData() === null)
            throw new TypeError("Detached");
        // 2. If [[state]] is not "configured", throw an InvalidStateError.
        if (this.state !== "configured")
            throw new DOMException("Unconfigured", "InvalidStateError");
        /* 3. Let dataClone hold the result of running the Clone AudioData
         * algorithm with data. */
        var dataClone = data.clone();
        // 4. Increment [[encodeQueueSize]].
        this.encodeQueueSize++;
        // 5. Queue a control message to encode dataClone.
        this._p = this._p.then(function () {
            return ____awaiter_3(this, void 0, void 0, function () {
                var libav, c, pkt, framePtr, encodedOutputs, raw, nb_samples, split, i, format, ptsFull, pts, ptshi, cc, channel_layout, sample_rate, frame, preOutputs, filter_ctx, fframes_1, filter_ctx, fframes, ex_1;
                var _a;
                return ____generator_3(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            libav = self._libav;
                            c = self._c;
                            pkt = self._pkt;
                            framePtr = self._frame;
                            encodedOutputs = null;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 12, , 13]);
                            raw = dataClone._libavGetData();
                            nb_samples = dataClone.numberOfFrames;
                            if (!_$audioData_1.isInterleaved(dataClone.format)) {
                                split = [];
                                for (i = 0; i < dataClone.numberOfChannels; i++)
                                    split.push(raw.subarray(i * nb_samples, (i + 1) * nb_samples));
                                raw = split;
                            }
                            format = void 0;
                            switch (dataClone.format) {
                                case "u8":
                                    format = libav.AV_SAMPLE_FMT_U8;
                                    break;
                                case "s16":
                                    format = libav.AV_SAMPLE_FMT_S16;
                                    break;
                                case "s32":
                                    format = libav.AV_SAMPLE_FMT_S32;
                                    break;
                                case "f32":
                                    format = libav.AV_SAMPLE_FMT_FLT;
                                    break;
                                case "u8-planar":
                                    format = libav.AV_SAMPLE_FMT_U8P;
                                    break;
                                case "s16-planar":
                                    format = libav.AV_SAMPLE_FMT_S16P;
                                    break;
                                case "s32-planar":
                                    format = libav.AV_SAMPLE_FMT_S32P;
                                    break;
                                case "f32-planar":
                                    format = libav.AV_SAMPLE_FMT_FLTP;
                                    break;
                                default:
                                    throw new TypeError("Invalid AudioSampleFormat");
                            }
                            ptsFull = Math.floor(dataClone.timestamp / 1000);
                            pts = ptsFull % 0x100000000;
                            ptshi = ~~(ptsFull / 0x100000000);
                            cc = dataClone.numberOfChannels;
                            channel_layout = (cc === 1) ? 4 : ((1 << cc) - 1);
                            sample_rate = dataClone.sampleRate;
                            frame = {
                                data: raw,
                                format: format,
                                pts: pts,
                                ptshi: ptshi,
                                channel_layout: channel_layout,
                                sample_rate: sample_rate
                            };
                            preOutputs = null;
                            if (!self._filter_in_ctx) return [3 /*break*/, 5];
                            filter_ctx = self._filter_in_ctx;
                            if (!(filter_ctx.sample_fmt !== frame.format ||
                                filter_ctx.channel_layout !== frame.channel_layout ||
                                filter_ctx.sample_rate !== frame.sample_rate)) return [3 /*break*/, 5];
                            return [4 /*yield*/, self._filter([], true)];
                        case 2:
                            fframes_1 = _b.sent();
                            return [4 /*yield*/, libav.ff_encode_multi(c, framePtr, pkt, fframes_1)];
                        case 3:
                            preOutputs =
                                _b.sent();
                            return [4 /*yield*/, libav.avfilter_graph_free_js(self._filter_graph)];
                        case 4:
                            _b.sent();
                            self._filter_in_ctx = null;
                            self._filter_graph = self._buffersrc_ctx =
                                self._buffersink_ctx = 0;
                            _b.label = 5;
                        case 5:
                            if (!!self._filter_graph) return [3 /*break*/, 7];
                            filter_ctx = self._filter_in_ctx = {
                                sample_rate: frame.sample_rate,
                                sample_fmt: frame.format,
                                channel_layout: frame.channel_layout
                            };
                            return [4 /*yield*/, libav.ff_init_filter_graph("anull", filter_ctx, self._filter_out_ctx)];
                        case 6:
                            _a = _b.sent(), self._filter_graph = _a[0], self._buffersrc_ctx = _a[1], self._buffersink_ctx = _a[2];
                            _b.label = 7;
                        case 7: return [4 /*yield*/, self._filter([frame])];
                        case 8:
                            fframes = _b.sent();
                            return [4 /*yield*/, libav.ff_encode_multi(c, framePtr, pkt, fframes)];
                        case 9:
                            // And encode
                            encodedOutputs =
                                _b.sent();
                            if (preOutputs)
                                encodedOutputs = preOutputs.concat(encodedOutputs);
                            if (!(encodedOutputs.length && !self._outputMetadataFilled &&
                                fframes && fframes.length)) return [3 /*break*/, 11];
                            return [4 /*yield*/, self._getOutputMetadata(fframes[0])];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            ex_1 = _b.sent();
                            self._p = self._p.then(function () {
                                self._closeAudioEncoder(ex_1);
                            });
                            return [3 /*break*/, 13];
                        case 13:
                            /* 3. Queue a task on the control thread event loop to decrement
                             * [[encodeQueueSize]]. */
                            self.encodeQueueSize--;
                            /* 4. Let encoded outputs be a list of encoded audio data outputs
                             * emitted by [[codec implementation]]. */
                            /* 5. If encoded outputs is not empty, queue a task on the control
                             * thread event loop to run the Output EncodedAudioChunks algorithm
                             * with encoded outputs. */
                            if (encodedOutputs)
                                self._outputEncodedAudioChunks(encodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    // Internal: Filter the given audio
    AudioEncoder.prototype._filter = function (frames, fin) {
        if (fin === void 0) { fin = false; }
        return ____awaiter_3(this, void 0, void 0, function () {
            var fframes, _i, fframes_2, frame;
            return ____generator_3(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._libav.ff_filter_multi(this._buffersrc_ctx, this._buffersink_ctx, this._frame, frames, fin)];
                    case 1:
                        fframes = _a.sent();
                        for (_i = 0, fframes_2 = fframes; _i < fframes_2.length; _i++) {
                            frame = fframes_2[_i];
                            frame.pts = this._pts;
                            frame.ptshi = 0;
                            this._pts += frame.nb_samples;
                        }
                        return [2 /*return*/, fframes];
                }
            });
        });
    };
    // Internal: Get output metadata
    AudioEncoder.prototype._getOutputMetadata = function (frame) {
        return ____awaiter_3(this, void 0, void 0, function () {
            var libav, c, extradataPtr, extradata_size, extradata;
            return ____generator_3(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        libav = this._libav;
                        c = this._c;
                        return [4 /*yield*/, libav.AVCodecContext_extradata(c)];
                    case 1:
                        extradataPtr = _a.sent();
                        return [4 /*yield*/, libav.AVCodecContext_extradata_size(c)];
                    case 2:
                        extradata_size = _a.sent();
                        extradata = null;
                        if (!(extradataPtr && extradata_size)) return [3 /*break*/, 4];
                        return [4 /*yield*/, libav.copyout_u8(extradataPtr, extradata_size)];
                    case 3:
                        extradata = _a.sent();
                        _a.label = 4;
                    case 4:
                        this._outputMetadata.decoderConfig.sampleRate = frame.sample_rate;
                        this._outputMetadata.decoderConfig.numberOfChannels = frame.channels;
                        if (extradata)
                            this._outputMetadata.decoderConfig.description = extradata;
                        this._outputMetadataFilled = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    AudioEncoder.prototype._outputEncodedAudioChunks = function (packets) {
        var libav = this._libav;
        var sampleRate = this._filter_out_ctx.sample_rate;
        for (var _i = 0, packets_1 = packets; _i < packets_1.length; _i++) {
            var packet = packets_1[_i];
            // 1. type
            var type = (packet.flags & 1) ? "key" : "delta";
            // 2. timestamp
            var timestamp = Math.floor((packet.ptshi * 0x100000000 + packet.pts) / sampleRate * 1000000);
            if (timestamp < 0)
                timestamp = 0;
            var chunk = new _$encodedAudioChunk_5.EncodedAudioChunk({
                type: type,
                timestamp: timestamp,
                data: packet.data
            });
            if (this._outputMetadataFilled)
                this._output(chunk, this._outputMetadata);
            else
                this._output(chunk);
        }
    };
    AudioEncoder.prototype.flush = function () {
        var self = this;
        var ret = this._p.then(function () {
            return ____awaiter_3(this, void 0, void 0, function () {
                var libav, c, frame, pkt, buffersrc_ctx, buffersink_ctx, encodedOutputs, fframes, ex_2;
                return ____generator_3(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!self._c)
                                return [2 /*return*/];
                            libav = self._libav;
                            c = self._c;
                            frame = self._frame;
                            pkt = self._pkt;
                            buffersrc_ctx = self._buffersrc_ctx;
                            buffersink_ctx = self._buffersink_ctx;
                            encodedOutputs = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            fframes = null;
                            if (!buffersrc_ctx) return [3 /*break*/, 3];
                            return [4 /*yield*/, self._filter([], true)];
                        case 2:
                            fframes = _a.sent();
                            _a.label = 3;
                        case 3: return [4 /*yield*/, libav.ff_encode_multi(c, frame, pkt, fframes || [], true)];
                        case 4:
                            encodedOutputs =
                                _a.sent();
                            if (!(!self._outputMetadataFilled && fframes && fframes.length)) return [3 /*break*/, 6];
                            return [4 /*yield*/, self._getOutputMetadata(fframes[0])];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            ex_2 = _a.sent();
                            self._p = self._p.then(function () {
                                self._closeAudioEncoder(ex_2);
                            });
                            return [3 /*break*/, 8];
                        case 8:
                            if (encodedOutputs)
                                self._outputEncodedAudioChunks(encodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        });
        this._p = ret;
        return ret;
    };
    AudioEncoder.prototype.reset = function () {
        this._resetAudioEncoder(new DOMException("Reset", "AbortError"));
    };
    AudioEncoder.prototype.close = function () {
        this._closeAudioEncoder(new DOMException("Close", "AbortError"));
    };
    AudioEncoder.isConfigSupported = function (config) {
        return ____awaiter_3(this, void 0, void 0, function () {
            var enc, supported, libav, _a, c, frame, pkt, ex_3;
            return ____generator_3(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        enc = _$libav_7.encoder(config.codec, config);
                        supported = false;
                        if (!enc) return [3 /*break*/, 8];
                        return [4 /*yield*/, _$libav_7.get()];
                    case 1:
                        libav = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, libav.ff_init_encoder(enc.codec, enc)];
                    case 3:
                        _a = _b.sent(), c = _a[1], frame = _a[2], pkt = _a[3];
                        return [4 /*yield*/, libav.ff_free_encoder(c, frame, pkt)];
                    case 4:
                        _b.sent();
                        supported = true;
                        return [3 /*break*/, 6];
                    case 5:
                        ex_3 = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, _$libav_7.free(libav)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [2 /*return*/, {
                            supported: supported,
                            config: _$misc_9.cloneConfig(config, ["codec", "sampleRate", "numberOfChannels", "bitrate"])
                        }];
                }
            });
        });
    };
    return AudioEncoder;
}());
_$audioEncoder_3.AudioEncoder = AudioEncoder;

var _$encodedVideoChunk_6 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
Object.defineProperty(_$encodedVideoChunk_6, "__esModule", { value: true });
_$encodedVideoChunk_6.EncodedVideoChunk = void 0;
/* removed: var _$encodedAudioChunk_5 = require("./encoded-audio-chunk"); */;
_$encodedVideoChunk_6.EncodedVideoChunk = _$encodedAudioChunk_5.EncodedAudioChunk;

var _$videoFrame_13 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var ____awaiter_13 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_13 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$videoFrame_13, "__esModule", { value: true });
_$videoFrame_13.verticalSubSamplingFactor = _$videoFrame_13.horizontalSubSamplingFactor = _$videoFrame_13.sampleBytes = _$videoFrame_13.numPlanes = _$videoFrame_13.VideoFrame = void 0;
// A canvas element used to convert CanvasImageSources to buffers
var offscreenCanvas = null;
var VideoFrame = /** @class */ (function () {
    function VideoFrame(data, init) {
        if (data instanceof ArrayBuffer ||
            data.buffer instanceof ArrayBuffer) {
            this._constructBuffer(data, init);
        }
        else {
            this._constructCanvas(data, init);
        }
    }
    VideoFrame.prototype._constructCanvas = function (image, init) {
        if (offscreenCanvas === null) {
            offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.style.display = "none";
            document.body.appendChild(offscreenCanvas);
        }
        // Convert it to a buffer
        // Get the width and height
        var width = 0, height = 0;
        if (image.naturalWidth) {
            width = image.naturalWidth;
            height = image.naturalHeight;
        }
        else if (image.videoWidth) {
            width = image.videoWidth;
            height = image.videoHeight;
        }
        else if (image.width) {
            width = image.width;
            height = image.height;
        }
        if (!width || !height)
            throw new DOMException("Could not determine dimensions", "InvalidStateError");
        // Draw it
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        var ctx = offscreenCanvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0);
        this._constructBuffer(ctx.getImageData(0, 0, width, height).data, {
            format: "RGBA",
            codedWidth: width,
            codedHeight: height,
            timestamp: init.timestamp,
            duration: init.duration || 0,
            layout: [{ offset: 0, stride: width * 4 }],
            displayWidth: init.displayWidth || width,
            displayHeight: init.displayHeight || height
        });
    };
    VideoFrame.prototype._constructBuffer = function (data, init) {
        var format = this.format = init.format;
        var width = this.codedWidth = init.codedWidth;
        var height = this.codedHeight = init.codedHeight;
        this.visibleRect = new DOMRect(0, 0, width, height);
        var dWidth = this.displayWidth =
            init.displayWidth || init.codedWidth;
        var dHeight = this.displayHeight =
            init.displayHeight || init.codedHeight;
        // Account for non-square pixels
        if (dWidth !== width ||
            dHeight !== height) {
            // Dubious (but correct) SAR calculation
            this._nonSquarePixels = true;
            this._sar_num = dWidth * height;
            this._sar_den = dHeight * width;
        }
        else {
            this._nonSquarePixels = false;
        }
        this.timestamp = init.timestamp;
        if (init.duration)
            this.duration = init.duration;
        if (init.layout) {
            this._layout = init.layout; // FIXME: Make sure it's the right size
        }
        else {
            var numPlanes_ = numPlanes(format);
            var layout = [];
            var offset = 0;
            for (var i = 0; i < numPlanes_; i++) {
                var sampleWidth = horizontalSubSamplingFactor(format, i);
                var sampleHeight = verticalSubSamplingFactor(format, i);
                var stride = ~~(width / sampleWidth);
                layout.push({ offset: offset, stride: stride });
                offset += stride * (~~(height / sampleHeight));
            }
            this._layout = layout;
        }
        this._data = new Uint8Array(data.buffer || data, data.byteOffset || 0);
    };
    // Internal
    VideoFrame.prototype._libavGetData = function () { return this._data; };
    VideoFrame.prototype.allocationSize = function (options) {
        if (options === void 0) { options = {}; }
        // 1. If [[Detached]] is true, throw an InvalidStateError DOMException.
        if (this._data === null)
            throw new DOMException("Detached", "InvalidStateError");
        // 2. If [[format]] is null, throw a NotSupportedError DOMException.
        if (this.format === null)
            throw new DOMException("Not supported", "NotSupportedError");
        /* 3. Let combinedLayout be the result of running the Parse
         * VideoFrameCopyToOptions algorithm with options. */
        // 4. If combinedLayout is an exception, throw combinedLayout.
        var combinedLayout = this._parseVideoFrameCopyToOptions(options);
        // 5. Return combinedLayoutÔÇÖs allocationSize.
        return combinedLayout.allocationSize;
    };
    VideoFrame.prototype._parseVideoFrameCopyToOptions = function (options) {
        /* 1. Let defaultRect be the result of performing the getter steps for
         * visibleRect. */
        var defaultRect = this.visibleRect;
        // 2. Let overrideRect be undefined.
        // 3. If options.rect exists, assign its value to overrideRect.
        var overrideRect = options.rect ?
            new DOMRect(options.rect.x, options.rect.y, options.rect.width, options.rect.height)
            : null;
        /* 4. Let parsedRect be the result of running the Parse Visible Rect
         * algorithm with defaultRect, overrideRect, [[coded width]], [[coded
         * height]], and [[format]]. */
        // 5. If parsedRect is an exception, return parsedRect.
        var parsedRect = this._parseVisibleRect(defaultRect, overrideRect);
        // 6. Let optLayout be undefined.
        // 7. If options.layout exists, assign its value to optLayout.
        var optLayout = options.layout || null;
        /* 8. Let combinedLayout be the result of running the Compute Layout
         * and Allocation Size algorithm with parsedRect, [[format]], and
         * optLayout. */
        var combinedLayout = this._computeLayoutAndAllocationSize(parsedRect, optLayout);
        // 9. Return combinedLayout.
        return combinedLayout;
    };
    VideoFrame.prototype._parseVisibleRect = function (defaultRect, overrideRect) {
        // 1. Let sourceRect be defaultRect
        var sourceRect = defaultRect;
        // 2. If overrideRect is not undefined:
        if (overrideRect) {
            /* 1. If either of overrideRect.width or height is 0, return a
             * TypeError. */
            if (overrideRect.width === 0 || overrideRect.height === 0)
                throw new TypeError("Invalid rectangle");
            /* 2. If the sum of overrideRect.x and overrideRect.width is
             * greater than [[coded width]], return a TypeError. */
            if (overrideRect.x + overrideRect.width > this.codedWidth)
                throw new TypeError("Invalid rectangle");
            /* 3. If the sum of overrideRect.y and overrideRect.height is
             * greater than [[coded height]], return a TypeError. */
            if (overrideRect.y + overrideRect.height > this.codedHeight)
                throw new TypeError("Invalid rectangle");
            // 4. Assign overrideRect to sourceRect.
            sourceRect = overrideRect;
        }
        /* 3. Let validAlignment be the result of running the Verify Rect
         * Sample Alignment algorithm with format and sourceRect. */
        var validAlignment = this._verifyRectSampleAlignment(sourceRect);
        // 4. If validAlignment is false, throw a TypeError.
        if (!validAlignment)
            throw new TypeError("Invalid alignment");
        // 5. Return sourceRect.
        return sourceRect;
    };
    VideoFrame.prototype._computeLayoutAndAllocationSize = function (parsedRect, layout) {
        // 1. Let numPlanes be the number of planes as defined by format.
        var numPlanes_ = numPlanes(this.format);
        /* 2. If layout is not undefined and its length does not equal
         * numPlanes, throw a TypeError. */
        if (layout && layout.length !== numPlanes_)
            throw new TypeError("Invalid layout");
        // 3. Let minAllocationSize be 0.
        var minAllocationSize = 0;
        // 4. Let computedLayouts be a new list.
        var computedLayouts = [];
        // 5. Let endOffsets be a new list.
        var endOffsets = [];
        // 6. Let planeIndex be 0.
        var planeIndex = 0;
        // 7. While planeIndex < numPlanes:
        while (planeIndex < numPlanes_) {
            /* 1. Let plane be the Plane identified by planeIndex as defined by
             * format. */
            // 2. Let sampleBytes be the number of bytes per sample for plane.
            var sampleBytes_ = sampleBytes(this.format, planeIndex);
            /* 3. Let sampleWidth be the horizontal sub-sampling factor of each
             * subsample for plane. */
            var sampleWidth = horizontalSubSamplingFactor(this.format, planeIndex);
            /* 4. Let sampleHeight be the vertical sub-sampling factor of each
             * subsample for plane. */
            var sampleHeight = verticalSubSamplingFactor(this.format, planeIndex);
            /* 5. Let sampleWidthBytes be the product of multiplying
             * sampleWidth by sampleBytes. */
            var sampleWidthBytes = sampleWidth * sampleBytes_;
            // 6. Let computedLayout be a new computed plane layout.
            var computedLayout = {
                destinationOffset: 0,
                destinationStride: 0,
                /* 7. Set computedLayoutÔÇÖs sourceTop to the result of the
                 * integer division of truncated parsedRect.y by sampleHeight. */
                sourceTop: ~~(parsedRect.y / sampleHeight),
                /* 8. Set computedLayoutÔÇÖs sourceHeight to the result of the
                 * integer division of truncated parsedRect.height by
                 * sampleHeight */
                sourceHeight: ~~(parsedRect.height / sampleHeight),
                /* 9. Set computedLayoutÔÇÖs sourceLeftBytes to the result of the
                 * integer division of truncated parsedRect.x by
                 * sampleWidthBytes. */
                sourceLeftBytes: ~~(parsedRect.x / sampleWidthBytes),
                /* 10. Set computedLayoutÔÇÖs sourceWidthBytes to the result of
                 * the integer division of truncated parsedRect.width by
                 * sampleWidthBytes. */
                sourceWidthBytes: ~~(parsedRect.width / sampleWidthBytes)
            };
            // 11. If layout is not undefined:
            if (layout) {
                /* 1. Let planeLayout be the PlaneLayout in layout at position
                 * planeIndex. */
                var planeLayout = layout[planeIndex];
                /* 2. If planeLayout.stride is less than computedLayoutÔÇÖs
                 * sourceWidthBytes, return a TypeError. */
                if (planeLayout.stride < computedLayout.sourceWidthBytes)
                    throw new TypeError("Invalid stride");
                /* 3. Assign planeLayout.offset to computedLayoutÔÇÖs
                 * destinationOffset. */
                computedLayout.destinationOffset = planeLayout.offset;
                /* 4. Assign planeLayout.stride to computedLayoutÔÇÖs
                 * destinationStride. */
                computedLayout.destinationStride = planeLayout.stride;
                // 12. Otherwise:
            }
            else {
                /* 1. Assign minAllocationSize to computedLayoutÔÇÖs
                 * destinationOffset. */
                computedLayout.destinationOffset = minAllocationSize;
                /* 2. Assign computedLayoutÔÇÖs sourceWidthBytes to
                 * computedLayoutÔÇÖs destinationStride. */
                computedLayout.destinationStride = computedLayout.sourceWidthBytes;
            }
            /* 13. Let planeSize be the product of multiplying computedLayoutÔÇÖs
             * destinationStride and sourceHeight. */
            var planeSize = computedLayout.destinationStride * computedLayout.sourceHeight;
            /* 14. Let planeEnd be the sum of planeSize and computedLayoutÔÇÖs
             * destinationOffset. */
            var planeEnd = planeSize + computedLayout.destinationOffset;
            /* 15. If planeSize or planeEnd is greater than maximum range of
             * unsigned long, return a TypeError. */
            if (planeSize >= 0x100000000 ||
                planeEnd >= 0x100000000)
                throw new TypeError("Plane too large");
            // 16. Append planeEnd to endOffsets.
            endOffsets.push(planeEnd);
            /* 17. Assign the maximum of minAllocationSize and planeEnd to
             * minAllocationSize. */
            if (planeEnd > minAllocationSize)
                minAllocationSize = planeEnd;
            // 18. Let earlierPlaneIndex be 0.
            var earlierPlaneIndex = 0;
            // 19. While earlierPlaneIndex is less than planeIndex.
            while (earlierPlaneIndex < planeIndex) {
                // 1. Let earlierLayout be computedLayouts[earlierPlaneIndex].
                var earlierLayout = computedLayouts[earlierPlaneIndex];
                /* 2. If endOffsets[planeIndex] is less than or equal to
                 * earlierLayoutÔÇÖs destinationOffset or if
                 * endOffsets[earlierPlaneIndex] is less than or equal to
                 * computedLayoutÔÇÖs destinationOffset, continue. */
                if (planeEnd <= earlierLayout.destinationOffset ||
                    endOffsets[earlierPlaneIndex] <= computedLayout.destinationOffset) {
                    // 3. Otherwise, return a TypeError.
                }
                else
                    throw new TypeError("Invalid plane layout");
                // 4. Increment earlierPlaneIndex by 1.
                earlierPlaneIndex++;
            }
            // 20. Append computedLayout to computedLayouts.
            computedLayouts.push(computedLayout);
            // 21. Increment planeIndex by 1.
            planeIndex++;
        }
        /* 8. Let combinedLayout be a new combined buffer layout, initialized
         * as follows: */
        var combinedLayout = {
            // 1. Assign computedLayouts to computedLayouts.
            computedLayouts: computedLayouts,
            // 2. Assign minAllocationSize to allocationSize.
            allocationSize: minAllocationSize
        };
        // 9. Return combinedLayout.
        return combinedLayout;
    };
    VideoFrame.prototype._verifyRectSampleAlignment = function (rect) {
        // 1. If format is null, return true.
        if (!this.format)
            return true;
        // 2. Let planeIndex be 0.
        var planeIndex = 0;
        // 3. Let numPlanes be the number of planes as defined by format.
        var numPlanes_ = numPlanes(this.format);
        // 4. While planeIndex is less than numPlanes:
        while (planeIndex < numPlanes_) {
            /* 1. Let plane be the Plane identified by planeIndex as defined by
             * format. */
            /* 2. Let sampleWidth be the horizontal sub-sampling factor of each
             * subsample for plane. */
            var sampleWidth = horizontalSubSamplingFactor(this.format, planeIndex);
            /* 3. Let sampleHeight be the vertical sub-sampling factor of each
             * subsample for plane. */
            var sampleHeight = verticalSubSamplingFactor(this.format, planeIndex);
            /* 4. If rect.x and rect.width are not both multiples of
             * sampleWidth, return false. */
            var xw = rect.x / sampleWidth;
            if (xw !== ~~xw)
                return false;
            var ww = rect.width / sampleWidth;
            if (ww !== ~~ww)
                return false;
            /* 5. If rect.y and rect.height are not both multiples of
             * sampleHeight, return false. */
            var yh = rect.y / sampleHeight;
            if (yh !== ~~yh)
                return false;
            var hh = rect.height / sampleHeight;
            if (hh !== ~~hh)
                return false;
            // 6. Increment planeIndex by 1.
            planeIndex++;
        }
        // 5. Return true.
        return true;
    };
    VideoFrame.prototype.copyTo = function (destination, options) {
        if (options === void 0) { options = {}; }
        return ____awaiter_13(this, void 0, void 0, function () {
            var destBuf, combinedLayout, ret, numPlanes_, planeIndex, sourceStride, computedLayout, sourceOffset, destinationOffset, rowBytes, row;
            return ____generator_13(this, function (_a) {
                destBuf = new Uint8Array(destination.buffer || destination, destination.byteOffset || 0);
                // 1. If [[Detached]] is true, throw an InvalidStateError DOMException.
                if (this._data === null)
                    throw new DOMException("Detached", "InvalidStateError");
                // 2. If [[format]] is null, throw a NotSupportedError DOMException.
                if (!this.format)
                    throw new DOMException("No format", "NotSupportedError");
                combinedLayout = this._parseVideoFrameCopyToOptions(options);
                /* 5. If destination.byteLength is less than combinedLayoutÔÇÖs
                 * allocationSize, return a promise rejected with a TypeError. */
                if (destination.byteLength < combinedLayout.allocationSize)
                    throw new TypeError("Insufficient space");
                ret = [];
                numPlanes_ = numPlanes(this.format);
                planeIndex = 0;
                // 4. While planeIndex is less than combinedLayoutÔÇÖs numPlanes:
                while (planeIndex < combinedLayout.computedLayouts.length) {
                    sourceStride = this._layout[planeIndex].stride;
                    computedLayout = combinedLayout.computedLayouts[planeIndex];
                    sourceOffset = computedLayout.sourceTop * sourceStride;
                    // 4. Add computedLayoutÔÇÖs sourceLeftBytes to sourceOffset.
                    sourceOffset += computedLayout.sourceLeftBytes;
                    destinationOffset = computedLayout.destinationOffset;
                    rowBytes = computedLayout.sourceWidthBytes;
                    row = 0;
                    // 8. While row is less than computedLayoutÔÇÖs sourceHeight:
                    while (row < computedLayout.sourceHeight) {
                        /* 1. Copy rowBytes bytes from resource starting at
                         * sourceOffset to destination starting at destinationOffset. */
                        destBuf.set(this._data.subarray(sourceOffset, sourceOffset + rowBytes), destinationOffset);
                        // 2. Increment sourceOffset by sourceStride.
                        sourceOffset += sourceStride;
                        /* 3. Increment destinationOffset by computedLayoutÔÇÖs
                         * destinationStride. */
                        destinationOffset += computedLayout.destinationStride;
                        // 4. Increment row by 1.
                        row++;
                    }
                    // 9. Increment planeIndex by 1.
                    planeIndex++;
                    ret.push({
                        offset: computedLayout.destinationOffset,
                        stride: computedLayout.destinationStride
                    });
                }
                // 5. Queue a task on the control thread event loop to resolve p.
                // 6. Return p.
                return [2 /*return*/, ret];
            });
        });
    };
    VideoFrame.prototype.clone = function () {
        return new VideoFrame(this._data, {
            format: this.format,
            codedWidth: this.codedWidth,
            codedHeight: this.codedHeight,
            timestamp: this.timestamp,
            duration: this.duration,
            layout: this._layout
        });
    };
    VideoFrame.prototype.close = function () {
        this._data = null;
    };
    return VideoFrame;
}());
_$videoFrame_13.VideoFrame = VideoFrame;
/**
 * Number of planes in the given format.
 * @param format  The format
 */
function numPlanes(format) {
    switch (format) {
        case "I420":
        case "I422":
        case "I444":
            return 3;
        case "I420A":
            return 4;
        case "NV12":
            return 2;
        case "RGBA":
        case "RGBX":
        case "BGRA":
        case "BGRX":
            return 1;
        default:
            throw new DOMException("Unsupported video pixel format", "NotSupportedError");
    }
}
_$videoFrame_13.numPlanes = numPlanes;
/**
 * Number of bytes per sample in the given format and plane.
 * @param format  The format
 * @param planeIndex  The plane index
 */
function sampleBytes(format, planeIndex) {
    switch (format) {
        case "I420":
        case "I420A":
        case "I422":
        case "I444":
            return 1;
        case "NV12":
            if (planeIndex === 1)
                return 2;
            else
                return 1;
        case "RGBA":
        case "RGBX":
        case "BGRA":
        case "BGRX":
            return 4;
        default:
            throw new DOMException("Unsupported video pixel format", "NotSupportedError");
    }
}
_$videoFrame_13.sampleBytes = sampleBytes;
/**
 * Horizontal sub-sampling factor for the given format and plane.
 * @param format  The format
 * @param planeIndex  The plane index
 */
function horizontalSubSamplingFactor(format, planeIndex) {
    // First plane (often luma) is always full
    if (planeIndex === 0)
        return 1;
    switch (format) {
        case "I420":
        case "I422":
            return 2;
        case "I420A":
            if (planeIndex === 3)
                return 1;
            else
                return 2;
        case "I444":
            return 1;
        case "NV12":
            return 2;
        case "RGBA":
        case "RGBX":
        case "BGRA":
        case "BGRX":
            return 1;
        default:
            throw new DOMException("Unsupported video pixel format", "NotSupportedError");
    }
}
_$videoFrame_13.horizontalSubSamplingFactor = horizontalSubSamplingFactor;
/**
 * Vertical sub-sampling factor for the given format and plane.
 * @param format  The format
 * @param planeIndex  The plane index
 */
function verticalSubSamplingFactor(format, planeIndex) {
    // First plane (often luma) is always full
    if (planeIndex === 0)
        return 1;
    switch (format) {
        case "I420":
            return 2;
        case "I420A":
            if (planeIndex === 3)
                return 1;
            else
                return 2;
        case "I422":
        case "I444":
            return 1;
        case "NV12":
            return 2;
        case "RGBA":
        case "RGBX":
        case "BGRA":
        case "BGRX":
            return 1;
        default:
            throw new DOMException("Unsupported video pixel format", "NotSupportedError");
    }
}
_$videoFrame_13.verticalSubSamplingFactor = verticalSubSamplingFactor;

var _$videoDecoder_11 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021-2023 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var ____awaiter_11 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_11 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$videoDecoder_11, "__esModule", { value: true });
_$videoDecoder_11.VideoDecoder = void 0;
/* removed: var _$libav_7 = require("./libav"); */;
/* removed: var _$misc_9 = require("./misc"); */;
/* removed: var _$videoFrame_13 = require("./video-frame"); */;
var VideoDecoder = /** @class */ (function () {
    function VideoDecoder(init) {
        this._output = init.output;
        this._error = init.error;
        this.state = "unconfigured";
        this.decodeQueueSize = 0;
        this._p = Promise.all([]);
        this._libav = null;
        this._codec = this._c = this._pkt = this._frame = 0;
    }
    VideoDecoder.prototype.configure = function (config) {
        var _this = this;
        var self = this;
        // 1. If config is not a valid VideoDecoderConfig, throw a TypeError.
        // NOTE: We don't support sophisticated codec string parsing (yet)
        // 2. If [[state]] is ÔÇ£closedÔÇØ, throw an InvalidStateError DOMException.
        if (this.state === "closed")
            throw new DOMException("Decoder is closed", "InvalidStateError");
        // Free any internal state
        if (this._libav)
            this._p = this._p.then(function () { return _this._free(); });
        // 3. Set [[state]] to "configured".
        this.state = "configured";
        // 4. Set [[key chunk required]] to true.
        // NOTE: Not implemented
        // 5. Queue a control message to configure the decoder with config.
        this._p = this._p.then(function () {
            return ____awaiter_11(this, void 0, void 0, function () {
                var supported, libav, _a;
                var _b;
                return ____generator_11(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            supported = _$libav_7.decoder(config.codec);
                            if (!supported) return [3 /*break*/, 4];
                            _a = self;
                            return [4 /*yield*/, _$libav_7.get()];
                        case 1:
                            libav = _a._libav = _d.sent();
                            return [4 /*yield*/, libav.ff_init_decoder(supported.codec)];
                        case 2:
                            // Initialize
                            _b = _d.sent(), self._codec = _b[0], self._c = _b[1], self._pkt = _b[2], self._frame = _b[3];
                            return [4 /*yield*/, libav.AVCodecContext_time_base_s(self._c, 1, 1000)];
                        case 3:
                            _d.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            self._closeVideoDecoder(new DOMException("Unsupported codec", "NotSupportedError"));
                            _d.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    // Our own algorithm, close libav
    VideoDecoder.prototype._free = function () {
        return ____awaiter_11(this, void 0, void 0, function () {
            return ____generator_11(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._c) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._libav.ff_free_decoder(this._c, this._pkt, this._frame)];
                    case 1:
                        _a.sent();
                        this._codec = this._c = this._pkt = this._frame = 0;
                        _a.label = 2;
                    case 2:
                        if (this._libav) {
                            _$libav_7.free(this._libav);
                            this._libav = null;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    VideoDecoder.prototype._closeVideoDecoder = function (exception) {
        var _this = this;
        // 1. Run the Reset VideoDecoder algorithm with exception.
        this._resetVideoDecoder(exception);
        // 2. Set [[state]] to "closed".
        this.state = "closed";
        /* 3. Clear [[codec implementation]] and release associated system
         * resources. */
        this._p = this._p.then(function () { return _this._free(); });
        /* 4. If exception is not an AbortError DOMException, queue a task on
         * the control thread event loop to invoke the [[error callback]] with
         * exception. */
        if (exception.name !== "AbortError")
            this._p = this._p.then(function () { _this._error(exception); });
    };
    VideoDecoder.prototype._resetVideoDecoder = function (exception) {
        var _this = this;
        // 1. If [[state]] is "closed", throw an InvalidStateError.
        if (this.state === "closed")
            throw new DOMException("Decoder closed", "InvalidStateError");
        // 2. Set [[state]] to "unconfigured".
        this.state = "unconfigured";
        // ... really, we're just going to free it now
        this._p = this._p.then(function () { return _this._free(); });
    };
    VideoDecoder.prototype.decode = function (chunk) {
        var self = this;
        // 1. If [[state]] is not "configured", throw an InvalidStateError.
        if (this.state !== "configured")
            throw new DOMException("Unconfigured", "InvalidStateError");
        // 2. If [[key chunk required]] is true:
        //    1. If chunk.[[type]] is not key, throw a DataError.
        /*    2. Implementers SHOULD inspect the chunkÔÇÖs [[internal data]] to
         *    verify that it is truly a key chunk. If a mismatch is detected,
         *    throw a DataError. */
        //    3. Otherwise, assign false to [[key chunk required]].
        // 3. Increment [[decodeQueueSize]].
        this.decodeQueueSize++;
        // 4. Queue a control message to decode the chunk.
        this._p = this._p.then(function () {
            return ____awaiter_11(this, void 0, void 0, function () {
                var libav, c, pkt, frame, decodedOutputs, ptsFull, pts, ptshi, packet, ex_1;
                return ____generator_11(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            libav = self._libav;
                            c = self._c;
                            pkt = self._pkt;
                            frame = self._frame;
                            decodedOutputs = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            ptsFull = Math.floor(chunk.timestamp / 1000);
                            pts = ptsFull % 0x100000000;
                            ptshi = ~~(ptsFull / 0x100000000);
                            packet = {
                                data: chunk._libavGetData(),
                                pts: pts,
                                ptshi: ptshi,
                                dts: pts,
                                dtshi: ptshi
                            };
                            if (chunk.duration) {
                                packet.duration = Math.floor(chunk.duration / 1000);
                                packet.durationhi = 0;
                            }
                            return [4 /*yield*/, libav.ff_decode_multi(c, pkt, frame, [packet])];
                        case 2:
                            decodedOutputs = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            ex_1 = _a.sent();
                            self._p = self._p.then(function () {
                                self._closeVideoDecoder(ex_1);
                            });
                            return [3 /*break*/, 4];
                        case 4:
                            /* 3. Queue a task on the control thread event loop to decrement
                             * [[decodeQueueSize]]. */
                            self.decodeQueueSize--;
                            /* 4. Let decoded outputs be a list of decoded audio data outputs
                             * emitted by [[codec implementation]]. */
                            /* 5. If decoded outputs is not empty, queue a task on the control
                             * thread event loop to run the Output VideoData algorithm with
                             * decoded outputs. */
                            if (decodedOutputs)
                                self._outputVideoFrames(decodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    VideoDecoder.prototype._outputVideoFrames = function (frames) {
        var libav = this._libav;
        for (var _i = 0, frames_1 = frames; _i < frames_1.length; _i++) {
            var frame = frames_1[_i];
            // 1. format
            var format = void 0;
            switch (frame.format) {
                case libav.AV_PIX_FMT_YUV420P:
                    format = "I420";
                    break;
                case libav.AV_PIX_FMT_YUVA420P:
                    format = "I420A";
                    break;
                case libav.AV_PIX_FMT_YUV422P:
                    format = "I422";
                    break;
                case libav.AV_PIX_FMT_YUV444P:
                    format = "I444";
                    break;
                case libav.AV_PIX_FMT_NV12:
                    format = "NV12";
                    break;
                case libav.AV_PIX_FMT_RGBA:
                    format = "RGBA";
                    break;
                case libav.AV_PIX_FMT_BGRA:
                    format = "BGRA";
                    break;
                default:
                    throw new DOMException("Unsupported libav format!", "EncodingError");
            }
            // 2. width and height
            var codedWidth = frame.width;
            var codedHeight = frame.height;
            // Check for non-square pixels
            var displayWidth = codedWidth;
            var displayHeight = codedHeight;
            if (frame.sample_aspect_ratio[0]) {
                var sar = frame.sample_aspect_ratio;
                if (sar[0] > sar[1])
                    displayWidth = ~~(codedWidth * sar[0] / sar[1]);
                else
                    displayHeight = ~~(codedHeight * sar[1] / sar[0]);
            }
            // 3. timestamp
            var timestamp = (frame.ptshi * 0x100000000 + frame.pts) * 1000;
            // 4. data
            var raw = void 0;
            {
                var size = 0;
                var planes = _$videoFrame_13.numPlanes(format);
                var sbs = [];
                var hssfs = [];
                var vssfs = [];
                for (var i = 0; i < planes; i++) {
                    sbs.push(_$videoFrame_13.sampleBytes(format, i));
                    hssfs.push(_$videoFrame_13.horizontalSubSamplingFactor(format, i));
                    vssfs.push(_$videoFrame_13.verticalSubSamplingFactor(format, i));
                }
                for (var i = 0; i < planes; i++) {
                    size += frame.width * frame.height * sbs[i] / hssfs[i]
                        / vssfs[i];
                }
                raw = new Uint8Array(size);
                var off = 0;
                for (var i = 0; i < planes; i++) {
                    var fd = frame.data[i];
                    for (var j = 0; j < frame.height / vssfs[i]; j++) {
                        var part = fd[j].subarray(0, frame.width / hssfs[i]);
                        raw.set(part, off);
                        off += part.length;
                    }
                }
            }
            var data = new _$videoFrame_13.VideoFrame(raw, {
                format: format,
                codedWidth: codedWidth,
                codedHeight: codedHeight,
                displayWidth: displayWidth,
                displayHeight: displayHeight,
                timestamp: timestamp
            });
            this._output(data);
        }
    };
    VideoDecoder.prototype.flush = function () {
        var self = this;
        var ret = this._p.then(function () {
            return ____awaiter_11(this, void 0, void 0, function () {
                var libav, c, pkt, frame, decodedOutputs, ex_2;
                return ____generator_11(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!self._c)
                                return [2 /*return*/];
                            libav = self._libav;
                            c = self._c;
                            pkt = self._pkt;
                            frame = self._frame;
                            decodedOutputs = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, libav.ff_decode_multi(c, pkt, frame, [], true)];
                        case 2:
                            decodedOutputs = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            ex_2 = _a.sent();
                            self._p = self._p.then(function () {
                                self._closeVideoDecoder(ex_2);
                            });
                            return [3 /*break*/, 4];
                        case 4:
                            if (decodedOutputs)
                                self._outputVideoFrames(decodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        });
        this._p = ret;
        return ret;
    };
    VideoDecoder.prototype.reset = function () {
        this._resetVideoDecoder(new DOMException("Reset", "AbortError"));
    };
    VideoDecoder.prototype.close = function () {
        this._closeVideoDecoder(new DOMException("Close", "AbortError"));
    };
    VideoDecoder.isConfigSupported = function (config) {
        return ____awaiter_11(this, void 0, void 0, function () {
            var dec, supported, libav, _a, c, pkt, frame, ex_3;
            return ____generator_11(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dec = _$libav_7.decoder(config.codec);
                        supported = false;
                        if (!dec) return [3 /*break*/, 8];
                        return [4 /*yield*/, _$libav_7.get()];
                    case 1:
                        libav = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, libav.ff_init_decoder(dec.codec)];
                    case 3:
                        _a = _b.sent(), c = _a[1], pkt = _a[2], frame = _a[3];
                        return [4 /*yield*/, libav.ff_free_decoder(c, pkt, frame)];
                    case 4:
                        _b.sent();
                        supported = true;
                        return [3 /*break*/, 6];
                    case 5:
                        ex_3 = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, _$libav_7.free(libav)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [2 /*return*/, {
                            supported: supported,
                            config: _$misc_9.cloneConfig(config, ["codec", "codedWidth", "codedHeight"])
                        }];
                }
            });
        });
    };
    return VideoDecoder;
}());
_$videoDecoder_11.VideoDecoder = VideoDecoder;

var _$videoEncoder_12 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var ____awaiter_12 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_12 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$videoEncoder_12, "__esModule", { value: true });
_$videoEncoder_12.VideoEncoder = void 0;
/* removed: var _$encodedVideoChunk_6 = require("./encoded-video-chunk"); */;
/* removed: var _$libav_7 = require("./libav"); */;
/* removed: var _$misc_9 = require("./misc"); */;
/* removed: var _$videoFrame_13 = require("./video-frame"); */;
var VideoEncoder = /** @class */ (function () {
    function VideoEncoder(init) {
        this._output = init.output;
        this._error = init.error;
        this.state = "unconfigured";
        this.encodeQueueSize = 0;
        this._p = Promise.all([]);
        this._libav = null;
        this._codec = this._c = this._frame = this._pkt = 0;
    }
    VideoEncoder.prototype.configure = function (config) {
        var _this = this;
        var self = this;
        // 1. If config is not a valid VideoEncoderConfig, throw a TypeError.
        // NOTE: We don't support sophisticated codec string parsing (yet)
        // 2. If [[state]] is "closed", throw an InvalidStateError.
        if (this.state === "closed")
            throw new DOMException("Encoder is closed", "InvalidStateError");
        // Free any internal state
        if (this._libav)
            this._p = this._p.then(function () { return _this._free(); });
        // 3. Set [[state]] to "configured".
        this.state = "configured";
        // 4. Queue a control message to configure the encoder using config.
        this._p = this._p.then(function () {
            return ____awaiter_12(this, void 0, void 0, function () {
                var supported, libav, _a, width, height, dWidth, dHeight;
                var _b;
                return ____generator_12(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            supported = _$libav_7.encoder(config.codec, config);
                            if (!supported) return [3 /*break*/, 4];
                            _a = self;
                            return [4 /*yield*/, _$libav_7.get()];
                        case 1:
                            libav = _a._libav = _d.sent();
                            self._metadata = {
                                decoderConfig: {
                                    codec: supported.codec
                                }
                            };
                            return [4 /*yield*/, libav.ff_init_encoder(supported.codec, supported)];
                        case 2:
                            // And initialize
                            _b = _d.sent(), self._codec = _b[0], self._c = _b[1], self._frame = _b[2], self._pkt = _b[3];
                            self._extradataSet = false;
                            self._extradata = null;
                            return [4 /*yield*/, libav.AVCodecContext_time_base_s(self._c, 1, 1000)];
                        case 3:
                            _d.sent();
                            width = config.width;
                            height = config.height;
                            self._sws = 0;
                            self._swsFrame = 0;
                            self._swsOut = {
                                width: width,
                                height: height,
                                format: supported.ctx.pix_fmt
                            };
                            dWidth = config.displayWidth || width;
                            dHeight = config.displayHeight || height;
                            if (dWidth !== width || dHeight !== height) {
                                self._nonSquarePixels = true;
                                self._sar_num = dWidth * height;
                                self._sar_den = dHeight * width;
                            }
                            else {
                                self._nonSquarePixels = false;
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            self._closeVideoEncoder(new DOMException("Unsupported codec", "NotSupportedError"));
                            _d.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    // Our own algorithm, close libav
    VideoEncoder.prototype._free = function () {
        return ____awaiter_12(this, void 0, void 0, function () {
            return ____generator_12(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._sws) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._libav.av_frame_free_js(this._swsFrame)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._libav.sws_freeContext(this._sws)];
                    case 2:
                        _a.sent();
                        this._sws = this._swsFrame = 0;
                        this._swsIn = this._swsOut = null;
                        _a.label = 3;
                    case 3:
                        if (!this._c) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._libav.ff_free_encoder(this._c, this._frame, this._pkt)];
                    case 4:
                        _a.sent();
                        this._codec = this._c = this._frame = this._pkt = 0;
                        _a.label = 5;
                    case 5:
                        if (this._libav) {
                            _$libav_7.free(this._libav);
                            this._libav = null;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    VideoEncoder.prototype._closeVideoEncoder = function (exception) {
        var _this = this;
        // 1. Run the Reset VideoEncoder algorithm with exception.
        this._resetVideoEncoder(exception);
        // 2. Set [[state]] to "closed".
        this.state = "closed";
        /* 3. Clear [[codec implementation]] and release associated system
         * resources. */
        this._p = this._p.then(function () { return _this._free(); });
        /* 4. If exception is not an AbortError DOMException, queue a task on
         * the control thread event loop to invoke the [[error callback]] with
         * exception. */
        if (exception.name !== "AbortError")
            this._p = this._p.then(function () { _this._error(exception); });
    };
    VideoEncoder.prototype._resetVideoEncoder = function (exception) {
        var _this = this;
        // 1. If [[state]] is "closed", throw an InvalidStateError.
        if (this.state === "closed")
            throw new DOMException("Encoder closed", "InvalidStateError");
        // 2. Set [[state]] to "unconfigured".
        this.state = "unconfigured";
        // ... really, we're just going to free it now
        this._p = this._p.then(function () { return _this._free(); });
    };
    VideoEncoder.prototype.encode = function (frame, options) {
        if (options === void 0) { options = {}; }
        var self = this;
        /* 1. If the value of frameÔÇÖs [[Detached]] internal slot is true, throw
         * a TypeError. */
        if (frame._libavGetData() === null)
            throw new TypeError("Detached");
        // 2. If [[state]] is not "configured", throw an InvalidStateError.
        if (this.state !== "configured")
            throw new DOMException("Unconfigured", "InvalidStateError");
        /* 3. Let frameClone hold the result of running the Clone VideoFrame
         * algorithm with frame. */
        var frameClone = frame.clone();
        // 4. Increment [[encodeQueueSize]].
        this.encodeQueueSize++;
        // 5. Queue a control message to encode frameClone.
        this._p = this._p.then(function () {
            return ____awaiter_12(this, void 0, void 0, function () {
                var libav, c, pkt, framePtr, swsOut, encodedOutputs, format, rawU8, rawIdx, raw, planes, p, plane, sb, hssf, vssf, w, h, y, ptsFull, pts, ptshi, frame_1, sws, swsIn, swsFrame, _a, _b, swsRes, encRes, recv, _d, _e, ex_1;
                return ____generator_12(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            libav = self._libav;
                            c = self._c;
                            pkt = self._pkt;
                            framePtr = self._frame;
                            swsOut = self._swsOut;
                            encodedOutputs = null;
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 17, , 18]);
                            format = void 0;
                            switch (frameClone.format) {
                                case "I420":
                                    format = libav.AV_PIX_FMT_YUV420P;
                                    break;
                                case "I420A":
                                    format = libav.AV_PIX_FMT_YUVA420P;
                                    break;
                                case "I422":
                                    format = libav.AV_PIX_FMT_YUV422P;
                                    break;
                                case "I444":
                                    format = libav.AV_PIX_FMT_YUV444P;
                                    break;
                                case "NV12":
                                    format = libav.AV_PIX_FMT_NV12;
                                    break;
                                case "RGBA":
                                case "RGBX":
                                    format = libav.AV_PIX_FMT_RGBA;
                                    break;
                                case "BGRA":
                                case "BGRX":
                                    format = libav.AV_PIX_FMT_BGRA;
                                    break;
                                default:
                                    throw new TypeError("Invalid VideoPixelFormat");
                            }
                            rawU8 = frameClone._libavGetData();
                            rawIdx = 0;
                            raw = [];
                            planes = _$videoFrame_13.numPlanes(frameClone.format);
                            for (p = 0; p < planes; p++) {
                                plane = [];
                                raw.push(plane);
                                sb = _$videoFrame_13.sampleBytes(frameClone.format, p);
                                hssf = _$videoFrame_13.horizontalSubSamplingFactor(frameClone.format, p);
                                vssf = _$videoFrame_13.verticalSubSamplingFactor(frameClone.format, p);
                                w = ~~(frameClone.codedWidth * sb / hssf);
                                h = ~~(frameClone.codedHeight / vssf);
                                for (y = 0; y < h; y++) {
                                    plane.push(rawU8.subarray(rawIdx, rawIdx + w));
                                    rawIdx += w;
                                }
                            }
                            ptsFull = Math.floor(frameClone.timestamp / 1000);
                            pts = ptsFull % 0x100000000;
                            ptshi = ~~(ptsFull / 0x100000000);
                            frame_1 = {
                                data: raw,
                                format: format,
                                pts: pts,
                                ptshi: ptshi,
                                width: frameClone.codedWidth,
                                height: frameClone.codedHeight,
                                key_frame: options.keyFrame ? 1 : 0,
                                pict_type: options.keyFrame ? 1 : 0
                            };
                            if (!(frame_1.width !== swsOut.width ||
                                frame_1.height !== swsOut.height ||
                                frame_1.format !== swsOut.format)) return [3 /*break*/, 12];
                            if (frameClone._nonSquarePixels) {
                                frame_1.sample_aspect_ratio = [
                                    frameClone._sar_num,
                                    frameClone._sar_den
                                ];
                            }
                            sws = self._sws, swsIn = self._swsIn, swsFrame = self._swsFrame;
                            if (!(!sws ||
                                frame_1.width !== swsIn.width ||
                                frame_1.height !== swsIn.height ||
                                frame_1.format !== swsIn.format)) return [3 /*break*/, 6];
                            if (!sws) return [3 /*break*/, 3];
                            return [4 /*yield*/, libav.sws_freeContext(sws)];
                        case 2:
                            _f.sent();
                            _f.label = 3;
                        case 3:
                            swsIn = {
                                width: frame_1.width,
                                height: frame_1.height,
                                format: frame_1.format
                            };
                            return [4 /*yield*/, libav.sws_getContext(swsIn.width, swsIn.height, swsIn.format, swsOut.width, swsOut.height, swsOut.format, 2, 0, 0, 0)];
                        case 4:
                            sws = _f.sent();
                            self._sws = sws;
                            self._swsIn = swsIn;
                            if (!!swsFrame) return [3 /*break*/, 6];
                            _a = self;
                            return [4 /*yield*/, libav.av_frame_alloc()];
                        case 5:
                            _a._swsFrame = swsFrame = _f.sent();
                            _f.label = 6;
                        case 6: return [4 /*yield*/, Promise.all([
                                libav.ff_copyin_frame(framePtr, frame_1),
                                libav.sws_scale_frame(sws, swsFrame, framePtr),
                                self._nonSquarePixels ?
                                    libav.AVFrame_sample_aspect_ratio_s(swsFrame, self._sar_num, self._sar_den) :
                                    null,
                                libav.AVFrame_pts_s(swsFrame, pts),
                                libav.AVFrame_ptshi_s(swsFrame, ptshi),
                                libav.AVFrame_key_frame_s(swsFrame, options.keyFrame ? 1 : 0),
                                libav.AVFrame_pict_type_s(swsFrame, options.keyFrame ? 1 : 0),
                                libav.avcodec_send_frame(c, swsFrame)
                            ])];
                        case 7:
                            _b = _f.sent(), swsRes = _b[1], encRes = _b[7];
                            if (swsRes < 0 || encRes < 0)
                                throw new Error("Encoding failed!");
                            encodedOutputs = [];
                            _f.label = 8;
                        case 8:
                            if (!true) return [3 /*break*/, 11];
                            return [4 /*yield*/, libav.avcodec_receive_packet(c, pkt)];
                        case 9:
                            recv = _f.sent();
                            if (recv === -libav.EAGAIN)
                                return [3 /*break*/, 11];
                            else if (recv < 0)
                                throw new Error("Encoding failed!");
                            _e = (_d = encodedOutputs).push;
                            return [4 /*yield*/, libav.ff_copyout_packet(pkt)];
                        case 10:
                            _e.apply(_d, [_f.sent()]);
                            return [3 /*break*/, 8];
                        case 11: return [3 /*break*/, 14];
                        case 12:
                            if (self._nonSquarePixels) {
                                frame_1.sample_aspect_ratio = [
                                    self._sar_num,
                                    self._sar_den
                                ];
                            }
                            return [4 /*yield*/, libav.ff_encode_multi(c, framePtr, pkt, [frame_1])];
                        case 13:
                            // Encode directly
                            encodedOutputs =
                                _f.sent();
                            _f.label = 14;
                        case 14:
                            if (!(encodedOutputs.length && !self._extradataSet)) return [3 /*break*/, 16];
                            return [4 /*yield*/, self._getExtradata()];
                        case 15:
                            _f.sent();
                            _f.label = 16;
                        case 16: return [3 /*break*/, 18];
                        case 17:
                            ex_1 = _f.sent();
                            self._p = self._p.then(function () {
                                self._closeVideoEncoder(ex_1);
                            });
                            return [3 /*break*/, 18];
                        case 18:
                            /* 3. Queue a task on the control thread event loop to decrement
                             * [[encodeQueueSize]]. */
                            self.encodeQueueSize--;
                            /* 4. Let encoded outputs be a list of encoded video data outputs
                             * emitted by [[codec implementation]]. */
                            /* 5. If encoded outputs is not empty, queue a task on the control
                             * thread event loop to run the Output EncodedVideoChunks algorithm
                             * with encoded outputs. */
                            if (encodedOutputs)
                                self._outputEncodedVideoChunks(encodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        }).catch(this._error);
    };
    // Internal: Get extradata
    VideoEncoder.prototype._getExtradata = function () {
        return ____awaiter_12(this, void 0, void 0, function () {
            var libav, c, extradata, extradata_size, _a, _b;
            return ____generator_12(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        libav = this._libav;
                        c = this._c;
                        return [4 /*yield*/, libav.AVCodecContext_extradata(c)];
                    case 1:
                        extradata = _d.sent();
                        return [4 /*yield*/, libav.AVCodecContext_extradata_size(c)];
                    case 2:
                        extradata_size = _d.sent();
                        if (!(extradata && extradata_size)) return [3 /*break*/, 4];
                        _a = this._metadata.decoderConfig;
                        _b = this;
                        return [4 /*yield*/, libav.copyout_u8(extradata, extradata_size)];
                    case 3:
                        _a.description = _b._extradata =
                            _d.sent();
                        _d.label = 4;
                    case 4:
                        this._extradataSet = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    VideoEncoder.prototype._outputEncodedVideoChunks = function (packets) {
        var libav = this._libav;
        for (var _i = 0, packets_1 = packets; _i < packets_1.length; _i++) {
            var packet = packets_1[_i];
            // 1. type
            var type = (packet.flags & 1) ? "key" : "delta";
            // 2. timestamp
            var timestamp = Math.floor((packet.ptshi * 0x100000000 + packet.pts) * 1000);
            if (timestamp < 0)
                timestamp = 0;
            var chunk = new _$encodedVideoChunk_6.EncodedVideoChunk({
                type: type,
                timestamp: timestamp,
                data: packet.data
            });
            if (this._extradataSet)
                this._output(chunk, this._metadata);
            else
                this._output(chunk);
        }
    };
    VideoEncoder.prototype.flush = function () {
        var self = this;
        var ret = this._p.then(function () {
            return ____awaiter_12(this, void 0, void 0, function () {
                var libav, c, frame, pkt, encodedOutputs, ex_2;
                return ____generator_12(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!self._c)
                                return [2 /*return*/];
                            libav = self._libav;
                            c = self._c;
                            frame = self._frame;
                            pkt = self._pkt;
                            encodedOutputs = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, libav.ff_encode_multi(c, frame, pkt, [], true)];
                        case 2:
                            encodedOutputs =
                                _a.sent();
                            if (!!self._extradataSet) return [3 /*break*/, 4];
                            return [4 /*yield*/, self._getExtradata()];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            ex_2 = _a.sent();
                            self._p = self._p.then(function () {
                                self._closeVideoEncoder(ex_2);
                            });
                            return [3 /*break*/, 6];
                        case 6:
                            if (encodedOutputs)
                                self._outputEncodedVideoChunks(encodedOutputs);
                            return [2 /*return*/];
                    }
                });
            });
        });
        this._p = ret;
        return ret;
    };
    VideoEncoder.prototype.reset = function () {
        this._resetVideoEncoder(new DOMException("Reset", "AbortError"));
    };
    VideoEncoder.prototype.close = function () {
        this._closeVideoEncoder(new DOMException("Close", "AbortError"));
    };
    VideoEncoder.isConfigSupported = function (config) {
        return ____awaiter_12(this, void 0, void 0, function () {
            var enc, supported, libav, _a, c, frame, pkt, ex_3;
            return ____generator_12(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        enc = _$libav_7.encoder(config.codec, config);
                        supported = false;
                        if (!enc) return [3 /*break*/, 8];
                        return [4 /*yield*/, _$libav_7.get()];
                    case 1:
                        libav = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, libav.ff_init_encoder(enc.codec, enc)];
                    case 3:
                        _a = _b.sent(), c = _a[1], frame = _a[2], pkt = _a[3];
                        return [4 /*yield*/, libav.ff_free_encoder(c, frame, pkt)];
                    case 4:
                        _b.sent();
                        supported = true;
                        return [3 /*break*/, 6];
                    case 5:
                        ex_3 = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, _$libav_7.free(libav)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [2 /*return*/, {
                            supported: supported,
                            config: _$misc_9.cloneConfig(config, ["codec", "width", "height", "bitrate", "framerate", "latencyMode"])
                        }];
                }
            });
        });
    };
    return VideoEncoder;
}());
_$videoEncoder_12.VideoEncoder = VideoEncoder;
;

var _$rendering_10 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var ____awaiter_10 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_10 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$rendering_10, "__esModule", { value: true });
_$rendering_10.createImageBitmap = _$rendering_10.canvasDrawImage = _$rendering_10.load = void 0;
/* removed: var _$videoFrame_13 = require("./video-frame"); */;
/* A non-threaded libav.js instance for scaling. This is an any because the
 * type definitions only expose the async versions, but this API requires the
 * _sync methods. */
var scalerSync = null;
// A synchronous libav.js instance for scaling.
var scalerAsync = null;
// The original drawImage
var origDrawImage = null;
// The original drawImage Offscreen
var origDrawImageOffscreen = null;
// The original createImageBitmap
var origCreateImageBitmap = null;
/**
 * Load rendering capability.
 * @param libavOptions  Options to use while loading libav, only asynchronous
 * @param polyfill  Set to polyfill CanvasRenderingContext2D.drawImage
 */
function __load_10(libavOptions, polyfill) {
    return ____awaiter_10(this, void 0, void 0, function () {
        return ____generator_10(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, LibAV.LibAV({ noworker: true })];
                case 1:
                    // Get our scalers
                    scalerSync = _a.sent();
                    return [4 /*yield*/, LibAV.LibAV(libavOptions)];
                case 2:
                    scalerAsync = _a.sent();
                    // Polyfill drawImage
                    if ('CanvasRenderingContext2D' in globalThis) {
                        origDrawImage = CanvasRenderingContext2D.prototype.drawImage;
                        if (polyfill)
                            CanvasRenderingContext2D.prototype.drawImage = drawImagePolyfill;
                    }
                    if ('OffscreenCanvasRenderingContext2D' in globalThis) {
                        origDrawImageOffscreen = OffscreenCanvasRenderingContext2D.prototype.drawImage;
                        if (polyfill)
                            OffscreenCanvasRenderingContext2D.prototype.drawImage = drawImagePolyfillOffscreen;
                    }
                    // Polyfill createImageBitmap
                    origCreateImageBitmap = globalThis.createImageBitmap;
                    if (polyfill)
                        globalThis.createImageBitmap = createImageBitmap;
                    return [2 /*return*/];
            }
        });
    });
}
_$rendering_10.load = __load_10;
/**
 * Draw this video frame on this canvas, synchronously.
 * @param ctx  CanvasRenderingContext2D to draw on
 * @param image  VideoFrame (or anything else) to draw
 * @param sx  Source X position OR destination X position
 * @param sy  Source Y position OR destination Y position
 * @param sWidth  Source width OR destination width
 * @param sHeight  Source height OR destination height
 * @param dx  Destination X position
 * @param dy  Destination Y position
 * @param dWidth  Destination width
 * @param dHeight  Destination height
 */
function canvasDrawImage(ctx, image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    if (!(image._data)) {
        // Just use the original
        return origDrawImage.apply(ctx, Array.prototype.slice.call(arguments, 1));
    }
    // Normalize the arguments
    if (typeof sWidth === "undefined") {
        // dx, dy
        dx = sx;
        dy = sy;
        sx = void 0;
        sy = void 0;
    }
    else if (typeof dx === "undefined") {
        // dx, dy, dWidth, dHeight
        dx = sx;
        dy = sy;
        dWidth = sWidth;
        dHeight = sHeight;
        sx = void 0;
        sy = void 0;
        sWidth = void 0;
        sHeight = void 0;
    }
    if (typeof dWidth === "undefined") {
        dWidth = image.codedWidth;
        dHeight = image.codedHeight;
    }
    // Convert the format to libav.js
    var format = scalerSync.AV_PIX_FMT_RGBA;
    switch (image.format) {
        case "I420":
            format = scalerSync.AV_PIX_FMT_YUV420P;
            break;
        case "I420A":
            format = scalerSync.AV_PIX_FMT_YUVA420P;
            break;
        case "I422":
            format = scalerSync.AV_PIX_FMT_YUV422P;
            break;
        case "I444":
            format = scalerSync.AV_PIX_FMT_YUV444P;
            break;
        case "NV12":
            format = scalerSync.AV_PIX_FMT_NV12;
            break;
        case "RGBA":
        case "RGBX":
            format = scalerSync.AV_PIX_FMT_RGBA;
            break;
        case "BGRA":
        case "BGRX":
            format = scalerSync.AV_PIX_FMT_BGRA;
            break;
    }
    // Convert the frame synchronously
    var frameData = new ImageData(dWidth, dHeight);
    var sctx = scalerSync.sws_getContext_sync(image.codedWidth, image.codedHeight, format, dWidth, dHeight, scalerSync.AV_PIX_FMT_RGBA, 2, 0, 0, 0);
    var inFrame = scalerSync.av_frame_alloc_sync();
    var outFrame = scalerSync.av_frame_alloc_sync();
    // Convert the data (FIXME: duplication)
    var rawU8 = image._libavGetData ? image._libavGetData() : image._data;
    var rawIdx = 0;
    var raw = [];
    var planes = _$videoFrame_13.numPlanes(image.format);
    for (var p = 0; p < planes; p++) {
        var plane = [];
        raw.push(plane);
        var sb = _$videoFrame_13.sampleBytes(image.format, p);
        var hssf = _$videoFrame_13.horizontalSubSamplingFactor(image.format, p);
        var vssf = _$videoFrame_13.verticalSubSamplingFactor(image.format, p);
        var w = ~~(image.codedWidth * sb / hssf);
        var h = ~~(image.codedHeight / vssf);
        for (var y = 0; y < h; y++) {
            plane.push(rawU8.subarray(rawIdx, rawIdx + w));
            rawIdx += w;
        }
    }
    // Copy it in
    scalerSync.ff_copyin_frame_sync(inFrame, {
        data: raw,
        format: format,
        width: image.codedWidth,
        height: image.codedHeight
    });
    // Rescale
    scalerSync.sws_scale_frame_sync(sctx, outFrame, inFrame);
    // Get the data back out again
    var frame = scalerSync.ff_copyout_frame_sync(outFrame);
    // Transfer all the data
    var idx = 0;
    for (var i = 0; i < frame.data.length; i++) {
        var plane = frame.data[i];
        for (var y = 0; y < plane.length; y++) {
            var row = plane[y];
            frameData.data.set(row, idx);
            idx += row.length;
        }
    }
    // Finally, draw it
    ctx.putImageData(frameData, dx, dy);
    // And clean up
    scalerSync.av_frame_free_js_sync(outFrame);
    scalerSync.av_frame_free_js_sync(inFrame);
    scalerSync.sws_freeContext_sync(sctx);
}
_$rendering_10.canvasDrawImage = canvasDrawImage;
/**
 * Polyfill version of canvasDrawImage.
 */
function drawImagePolyfill(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    if (image instanceof _$videoFrame_13.VideoFrame) {
        return canvasDrawImage(this, image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
    return origDrawImage.apply(this, arguments);
}
/**
 * Polyfill version of offscreenCanvasDrawImage.
 */
function drawImagePolyfillOffscreen(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    if (image instanceof _$videoFrame_13.VideoFrame) {
        return canvasDrawImage(this, image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
    return origDrawImageOffscreen.apply(this, arguments);
}
/**
 * Create an ImageBitmap from this drawable, asynchronously. NOTE:
 * Sub-rectangles are not implemented for VideoFrames, so only options is
 * available, and there, only scaling is available.
 * @param image  VideoFrame (or anything else) to draw
 * @param options  Other options
 */
function createImageBitmap(image, opts) {
    var _this = this;
    if (opts === void 0) { opts = {}; }
    if (!(image._data)) {
        // Just use the original
        return origCreateImageBitmap.apply(globalThis, arguments);
    }
    // Convert the format to libav.js
    var format = scalerAsync.AV_PIX_FMT_RGBA;
    switch (image.format) {
        case "I420":
            format = scalerAsync.AV_PIX_FMT_YUV420P;
            break;
        case "I420A":
            format = scalerAsync.AV_PIX_FMT_YUVA420P;
            break;
        case "I422":
            format = scalerAsync.AV_PIX_FMT_YUV422P;
            break;
        case "I444":
            format = scalerAsync.AV_PIX_FMT_YUV444P;
            break;
        case "NV12":
            format = scalerAsync.AV_PIX_FMT_NV12;
            break;
        case "RGBA":
        case "RGBX":
            format = scalerAsync.AV_PIX_FMT_RGBA;
            break;
        case "BGRA":
        case "BGRX":
            format = scalerAsync.AV_PIX_FMT_BGRA;
            break;
    }
    // Normalize arguments
    var dWidth = (typeof opts.resizeWidth === "number")
        ? opts.resizeWidth : image.displayWidth;
    var dHeight = (typeof opts.resizeHeight === "number")
        ? opts.resizeHeight : image.displayHeight;
    // Convert the frame
    var frameData = new ImageData(dWidth, dHeight);
    return (function () { return ____awaiter_10(_this, void 0, void 0, function () {
        var _a, sctx, inFrame, outFrame, rawU8, rawIdx, raw, planes, p, plane, sb, hssf, vssf, w, h, y, _b, frame, idx, i, plane, y, row;
        return ____generator_10(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        scalerAsync.sws_getContext(image.codedWidth, image.codedHeight, format, dWidth, dHeight, scalerAsync.AV_PIX_FMT_RGBA, 2, 0, 0, 0),
                        scalerAsync.av_frame_alloc(),
                        scalerAsync.av_frame_alloc()
                    ])];
                case 1:
                    _a = _c.sent(), sctx = _a[0], inFrame = _a[1], outFrame = _a[2];
                    rawU8 = image._libavGetData ? image._libavGetData() : image._data;
                    rawIdx = 0;
                    raw = [];
                    planes = _$videoFrame_13.numPlanes(image.format);
                    for (p = 0; p < planes; p++) {
                        plane = [];
                        raw.push(plane);
                        sb = _$videoFrame_13.sampleBytes(image.format, p);
                        hssf = _$videoFrame_13.horizontalSubSamplingFactor(image.format, p);
                        vssf = _$videoFrame_13.verticalSubSamplingFactor(image.format, p);
                        w = ~~(image.codedWidth * sb / hssf);
                        h = ~~(image.codedHeight / vssf);
                        for (y = 0; y < h; y++) {
                            plane.push(rawU8.subarray(rawIdx, rawIdx + w));
                            rawIdx += w;
                        }
                    }
                    return [4 /*yield*/, Promise.all([
                            // Copy it in
                            scalerAsync.ff_copyin_frame(inFrame, {
                                data: raw,
                                format: format,
                                width: image.codedWidth,
                                height: image.codedHeight
                            }),
                            // Rescale
                            scalerAsync.sws_scale_frame(sctx, outFrame, inFrame),
                            // Get the data back out again
                            scalerAsync.ff_copyout_frame(outFrame),
                            // And clean up
                            scalerAsync.av_frame_free_js(outFrame),
                            scalerAsync.av_frame_free_js(inFrame),
                            scalerAsync.sws_freeContext(sctx)
                        ])];
                case 2:
                    _b = _c.sent(), frame = _b[2];
                    idx = 0;
                    for (i = 0; i < frame.data.length; i++) {
                        plane = frame.data[i];
                        for (y = 0; y < plane.length; y++) {
                            row = plane[y];
                            frameData.data.set(row, idx);
                            idx += row.length;
                        }
                    }
                    return [4 /*yield*/, origCreateImageBitmap(frameData)];
                case 3: 
                // And make the ImageBitmap
                return [2 /*return*/, _c.sent()];
            }
        });
    }); })();
}
_$rendering_10.createImageBitmap = createImageBitmap;

var _$config_4 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ____awaiter_4 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_4 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$config_4, "__esModule", { value: true });
_$config_4.getVideoEncoder = _$config_4.getAudioEncoder = _$config_4.getVideoDecoder = _$config_4.getAudioDecoder = _$config_4.UnsupportedException = void 0;
/* removed: var _$encodedAudioChunk_5 = require("./encoded-audio-chunk"); */;
/* removed: var _$audioData_1 = require("./audio-data"); */;
/* removed: var _$audioDecoder_2 = require("./audio-decoder"); */;
/* removed: var _$audioEncoder_3 = require("./audio-encoder"); */;
/* removed: var _$encodedVideoChunk_6 = require("./encoded-video-chunk"); */;
/* removed: var _$videoFrame_13 = require("./video-frame"); */;
/* removed: var _$videoDecoder_11 = require("./video-decoder"); */;
/* removed: var _$videoEncoder_12 = require("./video-encoder"); */;
/**
 * Error thrown to indicate a configuration is unsupported.
 */
var UnsupportedException = /** @class */ (function (_super) {
    __extends(UnsupportedException, _super);
    function UnsupportedException() {
        return _super.call(this, "The requested configuration is not supported") || this;
    }
    return UnsupportedException;
}(Error));
_$config_4.UnsupportedException = UnsupportedException;
/**
 * Get an AudioDecoder environment that supports this configuration. Throws an
 * UnsupportedException if no environment supports the configuration.
 * @param config  Audio decoder configuration
 */
function getAudioDecoder(config) {
    return ____awaiter_4(this, void 0, void 0, function () {
        var _a, ex_1;
        return ____generator_4(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = typeof window.AudioDecoder !== "undefined";
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, window.AudioDecoder.isConfigSupported(config)];
                case 1:
                    _a = (_b.sent()).supported;
                    _b.label = 2;
                case 2:
                    if (_a) {
                        return [2 /*return*/, {
                                AudioDecoder: window.AudioDecoder,
                                EncodedAudioChunk: window.EncodedAudioChunk,
                                AudioData: window.AudioData
                            }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    ex_1 = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, _$audioDecoder_2.AudioDecoder.isConfigSupported(config)];
                case 5:
                    if ((_b.sent()).supported) {
                        return [2 /*return*/, {
                                AudioDecoder: _$audioDecoder_2.AudioDecoder,
                                EncodedAudioChunk: _$encodedAudioChunk_5.EncodedAudioChunk,
                                AudioData: _$audioData_1.AudioData
                            }];
                    }
                    throw new UnsupportedException();
            }
        });
    });
}
_$config_4.getAudioDecoder = getAudioDecoder;
/**
 * Get an VideoDecoder environment that supports this configuration. Throws an
 * UnsupportedException if no environment supports the configuration.
 * @param config  Video decoder configuration
 */
function getVideoDecoder(config) {
    return ____awaiter_4(this, void 0, void 0, function () {
        var _a, ex_2;
        return ____generator_4(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = typeof window.VideoDecoder !== "undefined";
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, window.VideoDecoder.isConfigSupported(config)];
                case 1:
                    _a = (_b.sent()).supported;
                    _b.label = 2;
                case 2:
                    if (_a) {
                        return [2 /*return*/, {
                                VideoDecoder: window.VideoDecoder,
                                EncodedVideoChunk: window.EncodedVideoChunk,
                                VideoFrame: window.VideoFrame
                            }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    ex_2 = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, _$videoDecoder_11.VideoDecoder.isConfigSupported(config)];
                case 5:
                    if ((_b.sent()).supported) {
                        return [2 /*return*/, {
                                VideoDecoder: _$videoDecoder_11.VideoDecoder,
                                EncodedVideoChunk: _$encodedVideoChunk_6.EncodedVideoChunk,
                                VideoFrame: _$videoFrame_13.VideoFrame
                            }];
                    }
                    throw new UnsupportedException();
            }
        });
    });
}
_$config_4.getVideoDecoder = getVideoDecoder;
/**
 * Get an AudioEncoder environment that supports this configuration. Throws an
 * UnsupportedException if no environment supports the configuration.
 * @param config  Audio encoder configuration
 */
function getAudioEncoder(config) {
    return ____awaiter_4(this, void 0, void 0, function () {
        var _a, ex_3;
        return ____generator_4(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = typeof window.AudioEncoder !== "undefined";
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, window.AudioEncoder.isConfigSupported(config)];
                case 1:
                    _a = (_b.sent()).supported;
                    _b.label = 2;
                case 2:
                    if (_a) {
                        return [2 /*return*/, {
                                AudioEncoder: window.AudioEncoder,
                                EncodedAudioChunk: window.EncodedAudioChunk,
                                AudioData: window.AudioData
                            }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    ex_3 = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, _$audioEncoder_3.AudioEncoder.isConfigSupported(config)];
                case 5:
                    if ((_b.sent()).supported) {
                        return [2 /*return*/, {
                                AudioEncoder: _$audioEncoder_3.AudioEncoder,
                                EncodedAudioChunk: _$encodedAudioChunk_5.EncodedAudioChunk,
                                AudioData: _$audioData_1.AudioData
                            }];
                    }
                    throw new UnsupportedException();
            }
        });
    });
}
_$config_4.getAudioEncoder = getAudioEncoder;
/**
 * Get an VideoEncoder environment that supports this configuration. Throws an
 * UnsupportedException if no environment supports the configuration.
 * @param config  Video encoder configuration
 */
function getVideoEncoder(config) {
    return ____awaiter_4(this, void 0, void 0, function () {
        var _a, ex_4;
        return ____generator_4(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = typeof window.VideoEncoder !== "undefined";
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, window.VideoEncoder.isConfigSupported(config)];
                case 1:
                    _a = (_b.sent()).supported;
                    _b.label = 2;
                case 2:
                    if (_a) {
                        return [2 /*return*/, {
                                VideoEncoder: window.VideoEncoder,
                                EncodedVideoChunk: window.EncodedVideoChunk,
                                VideoFrame: window.VideoFrame
                            }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    ex_4 = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, _$videoEncoder_12.VideoEncoder.isConfigSupported(config)];
                case 5:
                    if ((_b.sent()).supported) {
                        return [2 /*return*/, {
                                VideoEncoder: _$videoEncoder_12.VideoEncoder,
                                EncodedVideoChunk: _$encodedVideoChunk_6.EncodedVideoChunk,
                                VideoFrame: _$videoFrame_13.VideoFrame
                            }];
                    }
                    throw new UnsupportedException();
            }
        });
    });
}
_$config_4.getVideoEncoder = getVideoEncoder;

var _$main_8 = {};
"use strict";
/*
 * This file is part of the libav.js WebCodecs Polyfill implementation. The
 * interface implemented is derived from the W3C standard. No attribution is
 * required when using this library.
 *
 * Copyright (c) 2021-2023 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var ____awaiter_8 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ____generator_8 = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(_$main_8, "__esModule", { value: true });
_$main_8.getVideoEncoder = _$main_8.getAudioEncoder = _$main_8.getVideoDecoder = _$main_8.getAudioDecoder = _$main_8.UnsupportedException = _$main_8.createImageBitmap = _$main_8.canvasDrawImage = _$main_8.VideoEncoder = _$main_8.VideoDecoder = _$main_8.VideoFrame = _$main_8.EncodedVideoChunk = _$main_8.AudioEncoder = _$main_8.AudioDecoder = _$main_8.AudioData = _$main_8.EncodedAudioChunk = _$main_8.load = void 0;
/* removed: var _$encodedAudioChunk_5 = require("./encoded-audio-chunk"); */;
/* removed: var _$audioData_1 = require("./audio-data"); */;
/* removed: var _$audioDecoder_2 = require("./audio-decoder"); */;
/* removed: var _$audioEncoder_3 = require("./audio-encoder"); */;
/* removed: var _$encodedVideoChunk_6 = require("./encoded-video-chunk"); */;
/* removed: var _$videoFrame_13 = require("./video-frame"); */;
/* removed: var _$videoDecoder_11 = require("./video-decoder"); */;
/* removed: var _$videoEncoder_12 = require("./video-encoder"); */;
/* removed: var _$rendering_10 = require("./rendering"); */;
/* removed: var _$config_4 = require("./config"); */;
/* removed: var _$libav_7 = require("./libav"); */;
/**
 * Load LibAV-WebCodecs-Polyfill.
 */
function __load_8(options) {
    if (options === void 0) { options = {}; }
    return ____awaiter_8(this, void 0, void 0, function () {
        var libavOptions, _i, _a, exp;
        return ____generator_8(this, function (_b) {
            switch (_b.label) {
                case 0:
                    libavOptions = {};
                    if (options.libavOptions)
                        Object.assign(libavOptions, options.libavOptions);
                    if (!(typeof LibAV === "undefined")) return [3 /*break*/, 2];
                    return [4 /*yield*/, new Promise(function (res, rej) {
                            // Can't load workers from another origin
                            libavOptions.noworker = true;
                            // Load libav
                            LibAV = { base: "https://unpkg.com/libav.js@3.10.5" };
                            var scr = document.createElement("script");
                            scr.src = "https://unpkg.com/libav.js@3.10.5/libav-3.10.5.1.2-webm-opus-flac.js";
                            scr.onload = res;
                            scr.onerror = rej;
                            document.body.appendChild(scr);
                        })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    // And load the libav handler
                    _$libav_7.setLibAVOptions(libavOptions);
                    return [4 /*yield*/, _$libav_7.load()];
                case 3:
                    _b.sent();
                    if (options.polyfill) {
                        for (_i = 0, _a = [
                            "EncodedAudioChunk", "AudioData", "AudioDecoder", "AudioEncoder",
                            "EncodedVideoChunk", "VideoFrame", "VideoDecoder", "VideoEncoder"
                        ]; _i < _a.length; _i++) {
                            exp = _a[_i];
                            if (!window[exp])
                                window[exp] = this[exp];
                        }
                    }
                    return [4 /*yield*/, _$rendering_10.load(libavOptions, !!options.polyfill)];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
_$main_8.load = __load_8;
_$main_8.EncodedAudioChunk = _$encodedAudioChunk_5.EncodedAudioChunk;
_$main_8.AudioData = _$audioData_1.AudioData;
_$main_8.AudioDecoder = _$audioDecoder_2.AudioDecoder;
_$main_8.AudioEncoder = _$audioEncoder_3.AudioEncoder;
_$main_8.EncodedVideoChunk = _$encodedVideoChunk_6.EncodedVideoChunk;
_$main_8.VideoFrame = _$videoFrame_13.VideoFrame;
_$main_8.VideoDecoder = _$videoDecoder_11.VideoDecoder;
_$main_8.VideoEncoder = _$videoEncoder_12.VideoEncoder;
// Rendering
_$main_8.canvasDrawImage = _$rendering_10.canvasDrawImage;
_$main_8.createImageBitmap = _$rendering_10.createImageBitmap;
_$main_8.UnsupportedException = _$config_4.UnsupportedException;
_$main_8.getAudioDecoder = _$config_4.getAudioDecoder;
_$main_8.getVideoDecoder = _$config_4.getVideoDecoder;
_$main_8.getAudioEncoder = _$config_4.getAudioEncoder;
_$main_8.getVideoEncoder = _$config_4.getVideoEncoder;

return _$main_8;

});

