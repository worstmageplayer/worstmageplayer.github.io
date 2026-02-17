function getSydneyTime() {
    const formatter = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney",
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return formatter.format(new Date());
}

document.getElementById("sydneyTime").textContent = getSydneyTime();

setInterval(() => {
    document.getElementById("sydneyTime").textContent = getSydneyTime();
}, 1000);
