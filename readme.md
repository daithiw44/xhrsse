**XHR AND SSE**

Server side events (SSE) seem to be the forgotten/ugly sibling of websockets. SocketIO or any @substack talk with socksJS has highlighted why websockets are so sexy. The power of streaming to the UI, or the ability to have bi-directional communication over a single long lived connection. The thing is I found on a budget,(or none at all) or trying to play with websockets in a nodeJS hosting enviornment isn't always as easy as firing up a localhost on port 3000 and watching the magic happen. Of hosts like cloudfoundry, nodejitsu or appfog etc only dotcloud or a micro instance of an EC2 machine will allow you fire up and connect ot a websocket.

Roll in the ugly sibling, SSE. An alternative in some cases but more cases than you'd think to websockets. SSE can be that kind of XHR streaming that developers have been looking for or talking about but ended up at the websocket door. XHRSSE is an example of using SSE but using XHR to steer, poke and manipulate the SSE into communicating what we are interested in hearing. I'm not saying this is better than websockets in all instances but in certain circumstances where websockets are possible, or you don't want the whole weight of socketIO, this can be at least be a very crediable alternative or at best a better or the only  way of doing the job.

A communication channel where the broadcast is seen by the listener as the message is posted to the server via XHR and then broadcast out to these listeners, all this with out long polling or websockets.

A chunk of data too large for an XHR response delivery, requested by an XHR response but delivered by SSE, thus avoiding filling up an XHR responseText buffer and having all the issues that go along with that.

Finally as in our example here we have 3 channels broadcasting random unicode characters (as an example) from a server and a user utilizing XHR to tune in and tune out of stream of data for one to three of these channels. Thats the power of SSE one directional communication from the server steered from the client.

Remember XHR is not a dirty word, users don't care as long as it works. SSE is not the ugy sibling of websockets. Its pretty, well supported and is worth a look and finally websockets aren't always available and you might not always want socketIO.
