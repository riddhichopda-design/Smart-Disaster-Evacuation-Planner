let port;
let reader;
let isConnected = false;
let uiIntervalId = null;
let readLoopRunning = false;
let serialBuffer = "";
const decoder = new TextDecoder();

async function connectSerial() {
    if (isConnected) {
        console.log("Already connected.");
        return;
    }

    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        reader = port.readable.getReader();
        isConnected = true;
        console.log("Connected to ESP32");

        startReadLoop();

        uiIntervalId = setInterval(() => {
            console.log("Auto UI refresh (30s)");
            displayRiskData();
            updateLastUpdatedLabel();
        }, 30000);

        displayRiskData();
        updateLastUpdatedLabel();

    } catch (error) {
        console.error("Failed to connect to ESP32:", error);
        alert("Failed to connect to ESP32. Ensure it is plugged in and try again.");
        try { if (reader) { reader.releaseLock(); reader = null; } } catch(e){}
    }
}

async function startReadLoop() {
    if (!reader || readLoopRunning) return;
    readLoopRunning = true;
    console.log("Starting continuous serial read loop...");

    try {
        while (isConnected && reader) {
            const { value, done } = await reader.read();
            if (done) {
                console.log("Serial reader done.");
                break;
            }
            if (value) {
                const chunk = decoder.decode(value);
                serialBuffer += chunk;

                let newlineIndex;
                while ((newlineIndex = serialBuffer.indexOf('\n')) >= 0) {
                    const line = serialBuffer.slice(0, newlineIndex).trim();
                    serialBuffer = serialBuffer.slice(newlineIndex + 1);
                    if (line.length === 0) continue;
                    if (line.startsWith("{") && line.endsWith("}")) {
                        try {
                            const sensorData = JSON.parse(line);
                            console.log("Parsed sensor JSON:", sensorData);
                            updateRiskFromSerial(sensorData);
                            displayRiskData();
                            updateLastUpdatedLabel();
                        } catch (e) {
                            console.error("JSON parse error for line:", line, e);
                        }
                    } else {
                        console.warn("Non-JSON or incomplete line received:", line);
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error in read loop:", err);
    } finally {
        readLoopRunning = false;
        console.log("Read loop stopped.");
    }
}

function manualUpdate() {
    if (!isConnected) {
        alert("Please connect to ESP32 first.");
        return;
    }
    console.log("Manual update requested...");
    const statusEl = document.getElementById("risk-status");
    if (statusEl) statusEl.innerText = "Updating now...";

    displayRiskData();
    updateLastUpdatedLabel();

    if (statusEl) {
        statusEl.innerText = "Updated ✔";
        setTimeout(() => { if (statusEl) statusEl.innerText = ""; }, 2000);
    }
}

function updateLastUpdatedLabel() {
    const el = document.getElementById("last-updated");
    if (!el) return;
    const now = new Date();
    el.innerText = `Last Updated: ${now.toLocaleString()}`;
}

function updateRiskFromSerial(sensorData) {
    const sensorMapping = {
        "Dehradun-Mussoorie": ["vibration"],
        "Dehradun-Haridwar": ["water1"],
        "Dehradun-Rishikesh": ["smoke1"],
        "Haridwar-Rishikesh": ["tilt1"],
        "Mussoorie-Rishikesh": ["water2"],
        "Mussoorie-Chamba": ["smoke2"],
        "Chamba-Tehri": [],
        "Rishikesh-Tehri": ["tilt2"]
    };

    if (typeof graph === 'undefined' || typeof riskData === 'undefined') {
        console.warn("graph or riskData not defined yet in page.");
        return;
    }

    graph.edges.forEach(edge => {
        const key = `${edge.from}-${edge.to}`;
        const sensors = sensorMapping[key] || [];
        let fire = 0, flood = 0, earthquake = 0, landslide = 0;

        sensors.forEach(sensor => {
            if (sensor === "vibration" && sensorData.vibration === 1) earthquake = 1;
            if (sensor === "water1" && sensorData.water1 > 1800) flood = 3;
            if (sensor === "water2" && sensorData.water2 > 1800) flood = 3;
            if (sensor === "smoke1" && sensorData.smoke1 > 1500) fire = 4;
            if (sensor === "smoke2" && sensorData.smoke2 > 3000) fire = 4;
            if (sensor === "tilt1" && sensorData.tilt1 === 1) landslide = 2;
            if (sensor === "tilt2" && sensorData.tilt2 === 1) landslide = 2;
        });

        riskData[key] = { fire, flood, earthquake, landslide };
    });

    localStorage.setItem("riskData", JSON.stringify(riskData));
}

async function disconnectSerial() {
    try {
        if (uiIntervalId) {
            clearInterval(uiIntervalId);
            uiIntervalId = null;
        }

        if (reader) {
            try { await reader.cancel(); } catch(e){}
            try { reader.releaseLock(); } catch(e){}
            reader = null;
        }

        if (port) {
            try { await port.close(); } catch(e){}
            port = null;
        }

    } catch (err) {
        console.error("Error disconnecting:", err);
    }
    isConnected = false;
    serialBuffer = "";
    console.log("Disconnected from ESP32");
}

window.connectSerial = connectSerial;
window.disconnectSerial = disconnectSerial;
window.manualUpdate = manualUpdate;
window.updateLastUpdatedLabel = updateLastUpdatedLabel;
