import { DateTime } from "luxon";

export default function predict(xyDataArr) {
    const xyDataArrUnix = xyDataArr.map(({ x, y }) => {
        return { x: DateTime.fromISO(x, {zone: "UTC"}).toSeconds(), y }
    })
    const n = xyDataArrUnix.length;

    const sxy = xyDataArrUnix.reduce((a, b) => {
        return a + b.x * b.y;
    }, 0);
    const sx = xyDataArrUnix.reduce((a, b) => {
        return a + b.x;
    }, 0);
    const sy = xyDataArrUnix.reduce((a, b) => {
        return a + b.y;
    }, 0);
    const sx2 = xyDataArrUnix.reduce((a, b) => {
        return a + b.x * b.x;
    }, 0);

    const xbar = sx / n;
    const ybar = sy / n;
    const b = (sxy - sx * sy / n) / (sx2 - sx * sx / n);
    const a = ybar - b * xbar;
    
    const x1 = xyDataArrUnix[0].x;
    const y1 = a + b * x1;

    const y2 = 2500000;
    const x2 = (y2 - a) / b;

    const unixToUTC = (n) => DateTime.fromSeconds(n, { zone: "UTC" }).toFormat("yyyy-MM-dd'T'hh:mm:ss'Z'")

    return { a, b, points: [{ x: unixToUTC(x1), y: 2001000 /* Math.floor(y1) */ }, { x: unixToUTC(x2), y: y2 }] };
}