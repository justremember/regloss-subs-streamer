import dynamic from "next/dynamic";

const DisplayNoSSR = dynamic(() => import("./Display"), {
    ssr: false,
});

export default async function Home() {
    return (
        <DisplayNoSSR />
    )
}