document.getElementById("infoBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    const info = {};

    // Browser data
    info.userAgent = navigator.userAgent;
    info.language = navigator.language;
    info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    info.screen = `${window.screen.width}x${window.screen.height}`;
    info.cpuThreads = navigator.hardwareConcurrency || "Unknown";

    // GPU
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        const gpu = gl.getExtension("WEBGL_debug_renderer_info");
        info.gpu = gpu
            ? gl.getParameter(gpu.UNMASKED_RENDERER_WEBGL)
            : "Unknown";
    } catch {
        info.gpu = "Error reading GPU";
    }

    // Public IP
    try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        info.publicIP = data.ip;
    } catch {
        info.publicIP = "Error fetching";
    }

    // WebRTC Leak IP (IMPORTANT for VPN)
    info.webrtcIP = await getWebRTCIP();

    document.getElementById("info-content").textContent = `
Public IP: ${info.publicIP}
WebRTC IP: ${info.webrtcIP}
Browser: ${info.userAgent}
GPU: ${info.gpu}
CPU Threads: ${info.cpuThreads}
Screen: ${info.screen}
Language: ${info.language}
Timezone: ${info.timezone}
`;

    document.getElementById("info-modal-backdrop").style.display = "flex";
});

document.getElementById("info-close").addEventListener("click", () => {
    document.getElementById("info-modal-backdrop").style.display = "none";
});

function getWebRTCIP() {
    return new Promise((resolve) => {
        try {
            const pc = new RTCPeerConnection({ iceServers: [] });
            pc.createDataChannel("");
            pc.createOffer().then((offer) => pc.setLocalDescription(offer));

            pc.onicecandidate = (event) => {
                if (!event || !event.candidate) {
                    resolve("No leak");
                    return;
                }
                const ipMatch = event.candidate.candidate.match(/candidate:.+ (\d+\.\d+\.\d+\.\d+)/);
                resolve(ipMatch ? ipMatch[1] : "Unknown");
                pc.close();
            };
        } catch {
            resolve("Error");
        }
    });
}
