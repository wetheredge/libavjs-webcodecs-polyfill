/*
 * This (un)license applies only to this sample code, and not to
 * libavjs-webcodecs-polyfill as a whole:
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or distribute
 * this software, either in source code form or as a compiled binary, for any
 * purpose, commercial or non-commercial, and by any means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors of
 * this software dedicate any and all copyright interest in the software to the
 * public domain. We make this dedication for the benefit of the public at
 * large and to the detriment of our heirs and successors. We intend this
 * dedication to be an overt act of relinquishment in perpetuity of all present
 * and future rights to this software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(async function() {
    await LibAVWebCodecs.load();

    // Create the elements we need
    const videoEl = document.createElement("video");
    videoEl.style.display = "none";
    document.body.appendChild(videoEl);

    const btn = document.createElement("button");
    btn.style.display = "block";
    btn.innerText = "Start";
    btn.onclick = () => { go(LibAVWebCodecs); };
    document.body.appendChild(btn);

    async function go(WebCodecs) {
        // Get our input stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({video: true});
        videoEl.srcObject = mediaStream;
        await videoEl.play();
        const settings = mediaStream.getVideoTracks()[0].getSettings();

        // Make a stop button
        let stop = false;
        btn.innerText = "Stop";
        btn.onclick = () => {
            stop = true;
            btn.innerText = "...";
            btn.onclick = () => {};
        };

        // Make our encoder
        const packets = [];
        const encoder = new WebCodecs.VideoEncoder({
            output: packet => packets.push(packet),
            error: x => alert(x)
        });
        encoder.configure({
            codec: "vp8",
            width: settings.width,
            height: settings.height,
            framerate: settings.frameRate,
            latencyMode: "realtime"
        });

        // Encode
        const startTime = performance.now();
        await new Promise(function(res, rej) {
            const interval = setInterval(async function() {
                // Maybe stop
                if (stop) {
                    clearInterval(interval);
                    res();
                    return;
                }

                // Maybe skip this frame
                if (encoder.encodeQueueSize) {
                    console.log("WARNING: Skipping frame!");
                    return;
                }

                // Make the frame
                const frame = new WebCodecs.VideoFrame(videoEl, {
                    timestamp: (performance.now() - startTime) * 1000
                });

                // And enqueue it
                encoder.encode(frame);
            }, Math.round(1000 / settings.frameRate));
        });

        // Wait for encoding to finish
        await encoder.flush();
        encoder.close();
        await videoEl.pause();

        // And display it
        const out = await sampleMux("tmp.webm", "libvpx", packets);
        const video = document.createElement("video");
        video.style.display = "block";
        video.src = URL.createObjectURL(new Blob([out]));
        video.controls = true;
        document.body.appendChild(video);

        btn.innerText = "Start";
        btn.onclick = () => { go(LibAVWebCodecs); };
    }

    // Make a no-polyfill option
    if (typeof VideoEncoder !== "undefined") {
        const noPoly = document.createElement("button");
        noPoly.style.display = "block";
        noPoly.innerText = "Switch to browser encoder";
        noPoly.onclick = () => {
            if (btn.innerText === "Start") {
                btn.innerText = "Start (no polyfill)";
                btn.onclick = () => { go(window); };
            }
        };
        document.body.appendChild(noPoly);
    }
})();
