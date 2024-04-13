import puppeteer from "puppeteer";
import { PuppeteerScreenRecorder } from "puppeteer-screen-recorder";
import { PassThrough } from "stream";

const config = {
    followNewTab: true,
    fps: 25,
    ffmpeg_Path: null,
    videoFrame: {
      width: 1280,
      height: 720,
    },
    videoCrf: 12,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: {
      color: 'black' | '#35A5FF',
    },
    aspectRatio: '16:9',
};

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

export const streamWebpageView = async (passThrough) => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const recorder = new PuppeteerScreenRecorder(page, config);

    // Set screen size
    await page.setViewport({width: 1280, height: 720});

    await recorder.startStream(passThrough);
    // Navigate the page to a URL
    await page.goto("https://www.bing.com");

    await delay(5000);
    await recorder.stop();
    await browser.close();
}

export async function GET(req, res) {
    const passThrough = new PassThrough();
    passThrough.pipe(res); // do not await
    return new Response(passThrough);
}