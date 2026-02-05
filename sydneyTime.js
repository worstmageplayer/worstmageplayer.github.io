function getSydneyTime() {
    const sydneyTime = new Date(new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"}));
    const pad = (num) => num.toString().padStart(2, '0');

    const hour = pad(sydneyTime.getHours());
    const minute = pad(sydneyTime.getMinutes());
    const second = pad(sydneyTime.getSeconds());

    const time = `${hour}:${minute}:${second}`;
    return time;
}

document.getElementById("sydneyTime").textContent = getSydneyTime();

setInterval(() => {
    document.getElementById("sydneyTime").textContent = getSydneyTime();
}, 1000);
