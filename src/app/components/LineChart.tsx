import {
    Chart,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";
import { DateTime } from 'luxon';
import predict from "@/app/utils/predict";

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

export const numViews = 2;
export type ChartViewIndex = 0 | 1;

type Props = {
    pastData: DbSubsTableRow[],
    currentData: CurrentMemberData[],
    view: ChartViewIndex,
    className: string | undefined,
}

export default function LineChart({ pastData, currentData, view, className } : Props) {
    const allData = pastData.concat(currentData);
    const memNameList = currentData.map(mem => mem.name);

    const allTotalSubsData = allData.reduce((obj, row) => {
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
    }, {rows: [] as TimeSeriesGraphXY[], members: Array.from(memNameList), totalSubCount: 0})
        .rows;

    const predictionData = predict(allTotalSubsData);

    const options: ChartOptions<"line"> = {
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
                max: undefined // view === 1 ? "2024-08-01T00:00:00Z" : undefined,
            },
            y: {
                type: "linear",
                // stacked: true,
                title: {
                    display: true,
                    text: "Subs 登録者数",
                    color: "#fff",
                },
                min: 2000000,
                max: undefined // view === 1 ? 2500000 : undefined,
            },
        },
    };

    const data = {
        datasets: [
            {
                id: 1,
                label: "Prediction",
                borderWidth: 1,
                data: view === 1 ? predictionData.points : [],
                borderColor: "#fff",
                backgroundColor: "#bbb",
                fill: false,

                elements: {
                    point: {
                        radius: 2
                    },
                    line: {
                        tension: 0,
                    }
                },
            },
            {
                id: 2,
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
                data: allTotalSubsData,
                borderColor: "#aaa",
                backgroundColor: "#bbb",
                fill: true,
            },
        ]
    };

    console.log({ data });

    return (
        <div className={`chart-container ${className}`}>
            <Line datasetIdKey="id" options={options} data={data} />
            { view === 1 && (
                <div className="prediction-label">
                    Prediction 予測　{DateTime.fromISO(predictionData.points[1].x, {zone: "UTC"}).setZone("Asia/Tokyo").toFormat("yyyy/MM/dd hh:mm:ss")}
                </div>
            )}
        </div>
    );
}