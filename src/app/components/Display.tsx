/* eslint-disable @next/next/no-img-element */
/*
    TODO:
    - [DONE] Create POST request for sqlite api (auto datetime timestamp)
    - [DONE] POST to sqlite after youtube api query (hourly)
    - [DONE] Clean up redundant data in query (not hourly data)
    - [DONE] add "set_id" column (but maybe not, just rely on timestamp and add 5 rows at the same time manually setting timestamp)
    - [DONE] Search how to plot time series data ~~d3.js~~ chartjs
    - [DONE] Test first if possible without an adapter
    - [DONE] Plot the GET data from db along w/ new data
    - Think of design
    - Implement design
    - [DONE] Buy digitalocean server
    - [DONE] Setup react server
    - [DONE] Setup obs & obs websocket (possible deadend)
    - Try setting up http server with other stream than puppeteer stream
    - Look into source code of puppeteer-screen-recorder

    OPTIONAL:
    - Setup new database with the unique key being the day & hour component of
        the timestamp along with the name
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        subcount INTEGER NOT NULL,
        timestamp_dayhour TEXT NOT NULL,
        timestamp_minsec TEXT,
        UNIQUE(name, timestamp_dayhour)
    - [DONE] typescript
    - eslint
    - take full advantage of ssr
    - stricter type checking
        - distinguish between two timezones
        - immediately convert db rows to something more
          enforceable by typescript
*/

"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import LineChart, { numViews, ChartViewIndex } from "@/app/components/LineChart";

const numPfpsPerMem = 2;
type PfpIndex = 0 | 1;

const numLanguages = 2;
type LanguageIndex = 0 | 1;

const REGLOSS: { members: MemberStaticData[] } = {
    members: [
        {
            name: "ririka",
            id: "UCtyWhCj3AqKh2dXctLkDtng",
            channelNameEn: "Ririka Ch.",
            channelNameJp: "一条莉々華",
            color: "#ee558b",
            colorLight: "#f47da9",
            pfp: [
                "ririka.jpg",
                "ririka-orig.png",
            ],
        },
        {
            name: "ao",
            id: "UCMGfV7TVTmHhEErVJg1oHBQ",
            channelNameEn: "Ao Ch.",
            channelNameJp: "火威青",
            color: "#16264b",
            colorLight: "#1d3467",
            pfp: [
                "ao.jpg",
                "ao-orig.png",
            ],
        },
        {
            name: "kanade",
            id: "UCWQtYtq9EOB4-I5P-3fh8lA",
            channelNameEn: "Kanade Ch.",
            channelNameJp: "音乃瀬奏",
            color: "#f6c663",
            colorLight: "#ffe7b5",
            pfp: [
                "kanade.jpg",
                "kanade-orig.png",
            ],
        },
        {
            name: "hajime",
            id: "UC1iA6_NT4mtAcIII6ygrvCw",
            channelNameEn: "Hajime Ch.",
            channelNameJp: "轟はじめ",
            color: "#9293fe",
            colorLight: "#b6b9ff",
            pfp: [
                "hajime.jpg",
                "hajime-orig.png",
            ],
        },
        {
            name: "raden",
            id: "UCdXAk5MpyLD8594lm_OvtGQ",
            channelNameEn: "Raden Ch.",
            channelNameJp: "儒烏風亭らでん",
            color: "#1c5e4f",
            colorLight: "#3c7c71",
            pfp: [
                "raden.jpg",
                "raden-orig.png",
            ],
        },
    ],
};

const typography = {
    since14dAgo: [
        "Since 14 days ago: ",
        "過去 14 日間で ",
    ],
};

function numberWithCommas(x: number) {
    return x.toLocaleString("en-US");
}

async function fetchSubCount(id: YouTubeId) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${id}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();
    const subscriberCount: string = data.items[0].statistics.subscriberCount;
    console.log(data);
    return parseInt(subscriberCount);
}

async function fetchPastDataFromDb() {
    const response = await fetch("api", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data: DbSubsTableRow[] = await response.json();
    return data;
}

function find14dAgoSubCount(name: MemberName, currentTimestamp: string, pastData: DbSubsTableRow[]) {
    const timestamp7dAgo = DateTime.fromFormat(
        currentTimestamp,
        "yyyy-MM-dd hh:mm:ss",
        { zone: "UTC" }
    ).minus({ days: 14 })
    .toFormat("yyyy-MM-dd hh:mm:ss");
    console.log(timestamp7dAgo);
    for (let i = pastData.length - 1; i >= 0; i--) {
        if (pastData[i].name === name
            && pastData[i].timestamp < timestamp7dAgo) {
            console.log(pastData[i]);
            return pastData[i].subCount;
        }
    }
    return 0;
}

// Accepts [{ name: string, subcount: int, timestamp: string }]
async function saveDataToDb(data: DbSubsTableRow[]) {
    await fetch("api", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export default function Display() {
    const [pastData, setPastData] = useState<DbSubsTableRow[]>([]);
    const [currentData, setCurrentData] = useState<CurrentMemberData[]>([]);
    const [pfpIndex, setPfpIndex] = useState<PfpIndex>(0);
    const [currentView, setCurrentView] = useState<ChartViewIndex>(0);
    const [currentLanguage, setCurrentLanguage] = useState<LanguageIndex>(0);

    useEffect(() => {
        // fetch past data
        const fetchPastData = async () => {
            setPastData(await fetchPastDataFromDb());
        }
        fetchPastData();
    }, []);

    useEffect(() => {
        if (pastData.length === 0) return () => {};
        const fetchAndSaveCurrentData = async () => {
            // get current timestamp as a string with the same format as sqlite3 timestamps
            const currentTimestamp = (new Date()).toISOString().replace("T", " ").slice(0, 19);

            // fetch current subcount from youtube for each member
            const newDataPromisesArray = REGLOSS.members.map(async member => {
                const subCount = await fetchSubCount(member.id);
                const since14dAgo = subCount - find14dAgoSubCount(member.name, currentTimestamp, pastData);
                const memberData: CurrentMemberData = { ...member, subCount, timestamp: currentTimestamp, since14dAgo };
                return memberData;
            });
            const newData = await Promise.all(newDataPromisesArray);
            setCurrentData(newData);

            // get the timestamp of the last entry saved to db
            const lastPastDataEntry = pastData[pastData.length - 1];
            const lastSavedTimestamp = lastPastDataEntry.timestamp;
            // get both the date & the hour of the timestamps to compare
            const lastSavedDateAndHour = lastSavedTimestamp.slice(0, 13);
            const currentDateAndHour = currentTimestamp.slice(0, 13);
            // if the current date and hour is not the same as the last saved date & hour,
            // (i.e. more than an hour has passed since the db was last updated)
            // save the new data to db
            // e.g. "2024-04-07 06" !== "2024-04-07 07"
            if (lastSavedDateAndHour.localeCompare(currentDateAndHour) === -1) {
                // transform current subcount data into a saveable format for sqlite3
                const dataToSave = newData.map(row => ({
                    name: row.name,
                    subCount: row.subCount,
                    timestamp: row.timestamp,
                }));
                // save data to sqlite3 db
                await saveDataToDb(dataToSave);

                // fetch data again to update it
                setPastData(await fetchPastDataFromDb());
            }
        }

        // run fetchAndSaveCurrentData once after loading page
        fetchAndSaveCurrentData();

        // then run fetchAndSaveCurrentData every 60 seconds
        const id = setInterval(fetchAndSaveCurrentData, 60000);
        return () => clearInterval(id);
    }, [pastData]);

    useEffect(() => {
        const changePfp = () => {
            setPfpIndex(pfpIndex => (pfpIndex + 1) % numPfpsPerMem as PfpIndex);
        };
        const id = setInterval(changePfp, 30000);
        return () => clearInterval(id);
    }, [])

    useEffect(() => {
        const changeView = () => {
            setCurrentView(currentView => (currentView + 1) % numViews as ChartViewIndex);
        };
        const id = setInterval(changeView, 30000);
        return () => clearInterval(id);
    }, [])

    useEffect(() => {
        const changeLanguage = () => {
            setCurrentLanguage(currentLanguage => (currentLanguage + 1) % numLanguages as LanguageIndex);
        }
        const id = setInterval(changeLanguage, 10000);
        return () => clearInterval(id);
    }, [])

    console.log({ currentData });
    console.log({ pastData });

    const totalSubs = currentData?.map(m => m.subCount).reduce((a, b) => a + b, 0);
    const subsGoal = 2500000;

    return currentData.length > 0 && pastData.length > 0 && (
        <div className="container">
            <div className="cards">
                {currentData.map(member => (
                    <div className="card" key={member.name}>
                        <div className="channel-image-container">
                            {member.pfp.map((pfpName, i) => (
                                <Image
                                    src={`/images/pfp/${pfpName}`}
                                    alt={`picture of ${member.name}`}
                                    className={`channel-image ${i === pfpIndex ? "visible" : "invisible"} ${member.name}`}
                                    key={pfpName}
                                    height={200}
                                    width={200}
                                    priority={true}
                                />
                            ))}
                        </div>
                        <div className="channel-name">{member.channelNameEn}</div>
                        <div className="channel-name">{member.channelNameJp}</div>
                        <div className="sub-count">{numberWithCommas(member.subCount)}</div>
                        <div className="since-14d-ago-container">
                            <div className="hidden-placeholder-text">hidden text here</div>
                            <div className={`since-14d-ago ${0 === currentLanguage ? "visible" : "invisible"}`}>
                                {typography.since14dAgo[0]}+ {numberWithCommas(member.since14dAgo)}
                            </div>
                            <div className={`since-14d-ago ${1 === currentLanguage ? "visible" : "invisible"}`}>
                                {typography.since14dAgo[1]}+ {numberWithCommas(member.since14dAgo)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="total-subs-container">
                <span className="total-subs-label">Total 合計</span>
                <span className="total-subs">{`　${numberWithCommas(totalSubs)}/${numberWithCommas(subsGoal)}（${Math.floor(totalSubs/subsGoal * 100)}％）`}</span>
            </div>

        <div className="bottom-part">
                <LineChart pastData={pastData} currentData={currentData} view={0} className={0 === currentView ? "visible" : "invisible"}/>
                <LineChart pastData={pastData} currentData={currentData} view={1} className={1 === currentView ? "visible" : "invisible"}/>
                <div className="extra-part" style={{ display: "none" }}>
                    <img src="/images/nerissa-gyatt.gif" alt="wow" className="extra-part-img"/>
                </div>
            </div>
        </div>
    );
}