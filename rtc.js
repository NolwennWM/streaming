export class RTC
{
    #ws;
    #rtc;
    #stream;
    #video;

    /**
     * 
     * @param {HTMLVideoElement} video 
     * @returns {void}
     */
    constructor(video)
    { 
        this.#rtc = new RTCPeerConnection();
        this.#stream = new MediaStream();
        if(!video instanceof HTMLVideoElement) return;
        this.#video = video;
        this.#settings();
    }
    /**
     * set Event listener for RTC
     */
    #settings()
    {
        this.#rtc.onicecandidate = this.#onIceCandidate.bind(this)
        this.#rtc.ontrack = this.#onTrack.bind(this);
    }
    /**
     * Send the new Ice Candidate to the back end.
     * @param {RTCPeerConnectionIceEvent} e 
     * @returns {void}
     */
    #onIceCandidate(e)
    {
        console.log(e);
        if(!e.candidate)return;
        console.log("Candidate success");
        this.#ws.send(
            JSON.stringify({
                event: "candidate",
                data: e.candidate,
            })
        );
    }
    /**
     * Set the video when a track is received
     * @param {RTCTrackEvent} e 
     */
    #onTrack(e)
    {
        console.log("event", e);
        this.#stream.addTrack(e.track);
        this.#video.srcObject = this.#stream;
        console.log("tracks", this.#stream.getTracks());
    }
    /**
     * set websocket;
     * @param {WebSocket} socket
     */
    set ws(socket)
    {
        if(socket instanceof WebSocket)
            this.#ws = socket;
        else
            console.error("Socket not configured in RTC");
    }
    /**
     * return the current RTCPeerConnection
     * @returns {RTCPeerConnection} 
     */
    get rtc()
    {
        return this.#rtc
    }
}


