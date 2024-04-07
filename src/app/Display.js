/*
    TODO:
    - [DONE] Create POST request for sqlite api (auto datetime timestamp)
    - POST to sqlite after youtube api query (hourly)
    - Search how to plot time series data d3.js
    - Plot the GET data from db along w/ new data
    - Think of design
    - Implement design
    - Buy digitalocean server
    - Setup react server
    - Setup obs & obs websocket
*/

'use client'

import { useEffect, useState } from "react";

const REGLOSS = {
    members: [
        {
            name: "ririka",
            id: "UCtyWhCj3AqKh2dXctLkDtng",
            channelNameEn: "Ririka Ch.",
            channelNameJp: "一条莉々華",
        },
        {
            name: "ao",
            id: "UCMGfV7TVTmHhEErVJg1oHBQ",
            channelNameEn: "Ao Ch.",
            channelNameJp: "火威青",
        },
        {
            name: "kanade",
            id: "UCWQtYtq9EOB4-I5P-3fh8lA",
            channelNameEn: "Kanade Ch.",
            channelNameJp: "音乃瀬奏",
        },
        {
            name: "hajime",
            id: "UC1iA6_NT4mtAcIII6ygrvCw",
            channelNameEn: "Hajime Ch.",
            channelNameJp: "轟はじめ",
        },
        {
            name: "raden",
            id: "UCdXAk5MpyLD8594lm_OvtGQ",
            channelNameEn: "Raden Ch.",
            channelNameJp: "儒烏風亭らでん",
        },
    ],
};

async function fetchSubCount(id) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${id}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();
    const subscriberCount = data.items[0].statistics.subscriberCount;
    console.log(data);
    return subscriberCount;
}

async function fetchPastData() {
    const response = await fetch("api/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
}

// Accepts [{ name: string, subcount: int }]
async function saveData(data) {
    const response = await fetch("api/", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export default function Display() {
    const [data, setData] = useState();
    const [pastData, setPastData] = useState();

    useEffect(() => {
        const fetchData = async () => {
            setPastData(await fetchPastData());
        }
        fetchData();
    }, []);

    useEffect(() => {
        const fetchAndSaveData = async () => {
            const newDataPromisesArray = REGLOSS.members.map(async member => {
                const subCount = parseInt(await fetchSubCount(member.id));
                const memberData = { ...member, subCount };
                return memberData;
            });
            const newData = await Promise.all(newDataPromisesArray);
            setData(newData);
            const dataToSave = newData.map(row => ({ name: row.name, subCount: row.subCount }));
            saveData(dataToSave);
        }
        fetchAndSaveData();
        const id = setInterval(fetchAndSaveData, 60000);
        return () => clearInterval(id);
    }, []);

    console.log({ data });
    console.log({ pastData });

    const totalSubs = data?.map(m => m.subCount).reduce((a, b) => a + b, 0);
    const subsGoal = 2500000;

    return data && pastData && (
        <div className="App">
            <div className="cards">
                {data.map(member => (
                    <div className="card" key={member.name}>
                        <div className="channel-image-container">
                            <img src={`images/pfp/${member.name}.jpg`} />
                        </div>
                        <div className="channel-name">{member.channelNameEn}</div>
                        <div className="channel-name">{member.channelNameJp}</div>
                        <div className="sub-count">{member.subCount}</div>
                    </div>
                ))}
            </div>

            <div className="total-subs-container">
                <span className="total-subs-label">合計</span>
                <span className="total-subs">{`　${totalSubs}/${subsGoal}（${Math.floor(totalSubs/subsGoal * 100)}％）`}</span>
            </div>
        </div>
    );
}