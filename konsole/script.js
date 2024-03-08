const urlParams = new URLSearchParams(window.location.search);
const socketLink = urlParams.get("socket");

console.log(socketLink);

let socket = null;
let lastErr = Date.now();

let commands = [];
let actual = 0;

const colorStyles = {
    "l": "font-weight:bold", "o": "font-style:italic",
    "0": "color:#000", "1": "color:#00A", "2": "color:#0A0",
    "3": "color:#0AA", "4": "color:#A00", "5": "color:#A0A",
    "6": "color:#FA0", "7": "color:#AAA", "8": "color:#555",
    "9": "color:#55F", "a": "color:#5F5", "b": "color:#5FF",
    "c": "color:#F55", "d": "color:#F5F", "e": "color:#FF5",
    "f": "color:#FFF", "g": "color:#dd0", "h": "color:#e2d3d1",
    "i": "color:#cec9c9", "j": "color:#44393a", "m": "color:#961506",
    "n": "color:#b4684d", "p": "color:#deb02c", "q": "color:#119f36",
    "s": "color:#2cb9a8", "t": "color:#20487a", "u": "color:#9a5cc5",
};

notify(1, "[CONNECT] Trying to reach remote server");

function notify(type, message) {
    const colors = [
        "a",
        "6",
        "4"
    ];

    console.log(message);
    updateMessages("§" + colors[type] + message);
}

function colorMessage(message) {
    let newStringParts = [];
    let tokens = 0;

    for (const token of message.split(/(§[0-9a-u])/).filter(part => part !== "")) {
        const minimised = token.slice(1);

        if (colorStyles[minimised]) {
            newStringParts.push("<span style=\"" + colorStyles[minimised] + "\">");
            ++tokens;
        } else if (token === "§r") {
            newStringParts.push("</span>".repeat(tokens));
            tokens = 0;
        } else {
            newStringParts.push(token);
        }
    }

    return newStringParts.join("") + "</span>".repeat(tokens);
}

function updateMessages(message) {
    const divMessages = document.querySelector(".messages");
    const p = document.createElement("p");

    p.innerHTML = colorMessage(message);
    divMessages.appendChild(p);

    actual = commands.length;
    divMessages.scrollTop = divMessages.scrollHeight;

}

document.addEventListener("readystatechange", function () {
    const consoleElement = document.querySelector(".console");

    function applyRandomRotation() {
        const randomDegree = randomDeg();
        consoleElement.style.setProperty("--random-rotate", `rotate(${randomDegree}deg)`);
    }

    applyRandomRotation();

    setInterval(applyRandomRotation, 5000);
});

document.getElementById("message").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        enterPressed();
        event.preventDefault();
    }

    if (event.key === "ArrowUp") {
        if (actual > 0) {
            actual--;
            arrowPressed();
        }
    }

    if (event.key === "ArrowDown") {
        if (actual <= commands.length) {
            actual++;
            arrowPressed();
        }
    }
});

function enterPressed() {
    const message = document.getElementById("message");
    const value = message.value || "";

    if (value === "") {
        return;
    }

    console.log(value)
    commands.push(value);

    try {
        if (socket !== null) {
            socket.send(value)
        }
    } catch (error) {
        notify(2, error)
    } finally {
        message.value = "";
    }
}

function arrowPressed() {
    const command = commands[actual] || "";

    const input = document.getElementById("message");
    input.value = command;
}

function randomDeg() {
    const deg = Math.random() * 90 - 45;
    return deg < 10 && deg > -10 ? randomDeg : deg;
}

setInterval(function () {
    if (socket !== null) {
        return;
    }

    const sock = new WebSocket(socketLink || "ws://localhost:8080")

    sock.onopen = function () {
        notify(0, "[OPEN] Connection established");
    }

    sock.onmessage = function (event) {
        const message = event.data;

        console.log(message);
        updateMessages(message);
    }

    sock.onclose = function (event) {
        if (event.wasClean) {
            notify(1, `[CLOSE] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
        } else {
            if (Date.now() - lastErr < 2) {
                notify(2, "[CONNECT] Unable to reach remote server\n")
            } else {
                notify(1, "[CLOSE] Connection died");
            }
        }

        socket = null;
    }

    sock.onerror = function () {
        lastErr = Date.now();
        socket = null;

        // notify(4, error.toString());
    }

    socket = sock
}, 1000);