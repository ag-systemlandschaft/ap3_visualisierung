const hash = "d4bdb9881b1370ef7b97f43e95a84254bd21e851279d27b25d4b5cfee96197b0";

async function createHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkAccess() {
    let userInput = prompt("Passwort:");
    let userHash = await createHash(userInput);
    if (userHash !== hash) {
        document.body.innerHTML = "<h1>Kein Zugriff</h1>";
    } else {
        document.getElementById("protected-content").style.display = "block";
    }
}
