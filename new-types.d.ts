declare module 'chartjs-adapter-luxon';

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type Color = RGB | RGBA | HEX;

type PromiseArray<T> = {
    [P in keyof T]: Promise<T[P]>;
};

type MemberName = "ririka" | "ao" | "kanade" | "hajime" | "raden";
type MemberNames = ["ririka", "ao", "kanade", "hajime", "raden"];

interface DbSubsTableRow {
    name: MemberName,
    subCount: number,
    timestamp: string,
};

type YouTubeId = string;

type MemberStaticData = {
    name: MemberName,
    id: YoutubeId,
    channelNameEn: string,
    channelNameJp: string,
    color: Color,
    colorLight: Color,
    pfp: string[],
};

interface CurrentMemberData extends MemberStaticData, DbSubsTableRow {
    since14dAgo: number,
};

type TimeSeriesGraphXY = {
    x: string,
    y: number,
}


// type Asdf = ExpandRecursively<CurrentMemberData>;