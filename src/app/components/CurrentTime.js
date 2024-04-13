"use client"

import { useState, useEffect } from 'react'

export default function CurrentTime() {
    const [dateTime, setDateTime] = useState();
    useEffect(() => {
        const intervalId = setInterval(() => {
            setDateTime(new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
        }, 10);
        return () => {
            clearInterval(intervalId);
        }
    }, [])
    return (
        <div style={{ position: "absolute", right: 0, zIndex: 1000, fontSize: 10 }}>
            {dateTime}
        </div>
    )
}