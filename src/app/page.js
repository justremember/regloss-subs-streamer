// import dynamic from "next/dynamic";
import Display from "@/app/components/Display";

/*
const DisplayNoSSR = dynamic(() => import("@/app/components/Display"), {
    ssr: false,
});
*/

export default async function Home() {
    return (
        <div className="App">
            <Display />
            {/* <DisplayNoSSR /> */}
        </div>
    )
}