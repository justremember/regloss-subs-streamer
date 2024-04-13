import {
    Chart,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";

Chart.register(
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
);

Chart.defaults.borderColor = "#777";
Chart.defaults.color = "#fff";

export default function LineChart({ pastData, currentData, view, className }) {
    const allData = pastData.concat(currentData);
    const memNameList = currentData.map(mem => mem.name);
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        color: "#fff",
        animation: {
            duration: 2000,
        },
        elements: {
            point: {
                radius: 0
            },
            line: {
                tension: 0,
            }
        },
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "day",
                },
                adapters: {
                    date: {
                        locale: "ja-JP-u-ca-gregory-hc-h23",
                        zone: "Asia/Tokyo",
                    },
                },
                title: {
                    display: false,
                    text: "Timestamp タイムスタンプ",
                    color: "#fff",
                },
                max: view === 1 ? "2024-08-01T00:00:00Z" : undefined,
            },
            y: {
                type: "linear",
                stacked: true,
                title: {
                    display: true,
                    text: "Subs 登録者数",
                    color: "#fff",
                },
                min: 2000000,
                max: view === 1 ? 2500000 : undefined,
            },
        },
    };

    const data = {
        datasets: [
            {
                id: 1,
                label: "Total",
                borderWidth: 1,
                /*
                    this data transformation makes one assumption about the data:
                    all data are in this format
                    [
                        {
                            name: "ririka",
                            timestamp: "2024-04-05 00:01:00", # same timestamp
                            subCount: "300000",
                        },
                        {
                            name: "ao",
                            timestamp: "2024-04-05 00:01:00", # same timestamp
                            subCount: "400000",
                        },
                        {
                            name: "hajime",
                            timestamp: "2024-04-05 00:01:00", # same timestamp
                            subCount: "500000",
                        },
                        {
                            name: "kanade",
                            timestamp: "2024-04-05 00:01:00", # same timestamp
                            subCount: "600000",
                        },
                        {
                            name: "raden",
                            timestamp: "2024-04-05 00:01:00", # same timestamp
                            subCount: "700000",
                        },
                        {
                            name: "ririka",
                            timestamp: "2024-04-05 01:00:38", # different timestamp
                            subCount: "300000",
                        },
                        etc.
                    ]
                    the mems should be grouped together. order of each mem within the group doesn't matter
                    (can also be ao kanade raden ririka hajime) but each grouping per timestamp needs to
                    be together. naturally, the total number of rows is a multiple of 5 (# of mems.)
                    this reduce function returns [
                        {
                            x: "2024-04-05 00:01:00",
                            y: 20001000, # total subs for that timestamp
                        },
                        {
                            x: "2024-04-05 01:00:38",
                            y: 20002000,
                        },
                        etc.
                    ]
                */
                data: allData.reduce((obj, row) => {
                    obj.totalSubCount += row.subCount;
                    obj.members = obj.members.filter(mem => mem !== row.name);
                    if (obj.members.length === 0) {
                        obj.rows.push({
                            x: row.timestamp.replace(" ", "T") + "Z",
                            y: obj.totalSubCount,
                        });
                        obj.members = Array.from(memNameList);
                        obj.totalSubCount = 0;
                    }
                    return obj;
                }, {rows: [], members: Array.from(memNameList), totalSubCount: 0})
                    .rows,
                borderColor: "#aaa",
                backgroundColor: "#bbb",
                fill: true,
            }
        ]
        /*
        datasets: Array.from(currentData).reverse().map(memData => ({
            id: memData.name,
            label: memData.channelNameJp,
            borderWidth: 1,
            data: allData.reduce((rows, row) => {
                if (row.name !== memData.name) return rows;
                rows.push({
                    x: row.timestamp.replace(" ", "T") + "Z",
                    y: row.subCount,
                });
                return rows;
            }, []),
            borderColor: memData.color,
            backgroundColor: memData.colorLight,
            fill: true,
        })),
        */
    };

    console.log({ data });

    return (
        <div className={`chart-container ${className}`}>
            <Line datasetIdKey="id" options={options} data={data} />
        </div>
    );
}