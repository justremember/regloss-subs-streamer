// import dynamic from "next/dynamic";
import CurrentTime from "@/app/components/CurrentTime";
import Display from "@/app/components/Display";

/*
const DisplayNoSSR = dynamic(() => import("@/app/components/Display"), {
    ssr: false,
});
*/

export default async function Home() {
    return (
        <div className="App">
            <CurrentTime />
            <Display />
            {/* <DisplayNoSSR /> */}
        </div>
    )
}