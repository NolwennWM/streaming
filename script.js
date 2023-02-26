import { WS } from "./ws.js";
import { RTC } from "./rtc.js";

const video = document.querySelector(".stream");
const view = document.querySelector(".view");
let rtc, ws;

if(video && view)
{
    rtc = new RTC(video);
    ws = new WS(view);
    start();
}


/**
 * start the share between websocket and RTC
 */
async function start()
{
    await ws.getSocket();
    rtc.ws = ws.ws;
    ws.rtc = rtc.rtc;
}