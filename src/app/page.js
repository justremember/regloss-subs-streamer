import dynamic from "next/dynamic";

const DisplayNoSSR = dynamic(() => import("@/app/components/Display"), {
    ssr: false,
});

export default async function Home() {
    return (
        <div className="App">
            <DisplayNoSSR />
        </div>
    )
}