enum Days {
    Sunday = 1,
    Monday = 2,
    Tuesday = 4,
    Wednesday = 8,
    Thursday = 16,
    Friday = 32,
    Saturday = 64
}

function formatTime(time: string | null | undefined) {
    if (time === null || time === undefined) {
        return "N/A";
    }

    const hour = parseInt(time.substring(0, 2));
    const minute = parseInt(time.substring(2, 4));
    let date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});
}

function formatDays(days: number | null | undefined) {
    let enumDays = days as Days;
    let result = "";

    if (enumDays & Days.Monday) { result += "M"; }
    if (enumDays & Days.Tuesday) { result += "T"; }
    if (enumDays & Days.Wednesday) { result += "W"; }
    if (enumDays & Days.Thursday) { result += "R"; }
    if (enumDays & Days.Friday) { result += "F"; }
    if (enumDays & Days.Saturday) { result += "S"; }
    if (enumDays & Days.Sunday) { result += "U"; }

    return result;
}

export { Days, formatTime, formatDays };