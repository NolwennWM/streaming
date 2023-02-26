export class WS
{
    #ws;
    #settings;
    #rtc;
    #view;
    /**
     * 
     * @param {HTMLElement} view 
     */
    constructor(view)
    {
        if(view instanceof HTMLElement)
        this.#view = view;
    }
    /**
     * Create a new websocket then set events.
     */
    async getSocket()
    {
        try {
            const response = await fetch("../config.json");
            this.#settings = await response.json();
            this.#ws = new WebSocket(this.#settings.wsUrl);
            this.#setting();
        } catch (e) {
            console.error(e.message);
        }
    }
    /**
     * Set events for websocket
     */
    #setting()
    {
        this.#ws.onopen = ()=>console.log("Connected to websocket");
        this.#ws.onclose = this.#onClose.bind(this);
        this.#ws.onmessage = this.#onMessage.bind(this);
        this.#ws.onerror = function(e){
            console.error(`Socket encountered error. Closing socket.`);
            this.#ws.close();
        }.bind(this)
    }
    /**
     * Event triggered if websocket close
     */
    #onClose()
    {
        console.log(this);
        console.log(`Socket is closed. Reconnect will be attempted in ${Math.min(
            this.#settings.timeoutDuration / 1000 )} second.`);
        setTimeout(async function(){
            //check if websocket instance is closed, if so renew connection
            if (!this.#ws || this.#ws.readyState === WebSocket.CLOSED) {
                this.getSocket();
            }
            }.bind(this), this.#settings.timeoutDuration);
    }
    /**
     * Event triggered when receive websocket message
     * @param {MessageEvent} e 
     * @returns {void}
     */
    async #onMessage(e)
    {
        console.log(e);
        const msg = JSON.parse(e.data);

        if (!msg) {
            console.log("Failed to parse msg");
            return;
        }

        const offerCandidate = msg.data;

        if (!offerCandidate) {
            console.log("Failed to parse offer msg data");
            return;
        }

        switch (msg.event) {
            case "offer":
                console.log("Offer");
                this.#rtc.setRemoteDescription(offerCandidate);

                try {
                    const answer = await this.#rtc.createAnswer();
                    console.log("answer");
                    this.#rtc.setLocalDescription(answer);
                    this.#ws.send(
                        JSON.stringify({
                            event: "answer",
                            data: answer,
                        })
                    );
                } catch (e) {
                    console.error(e.message);
                }

                return;
            case "candidate":
                console.log("Candidate");
                this.#rtc.addIceCandidate(offerCandidate);
                return;
            case "info":
                console.log("Info");
                this.#view.textContent = msg.data.no_connections??"0";
                return;
        }
    }
    /**
     * Set a RTCPeerConnection.
     * @param {RTCPeerConnection} r
     */
    set rtc(r)
    {
        if(r instanceof RTCPeerConnection)
            this.#rtc = r;
        else
            console.error("RTC not configured in WS");
    } 
    /**
     * get the current websocket
     * @returns {WebSocket}
     */
    get ws()
    {
        return this.#ws;
    }  
}