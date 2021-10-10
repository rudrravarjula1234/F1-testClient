const {
    F1TelemetryClient,
    constants
} = require('f1-2020-client');
const { type } = require('os');

const fs = require('fs');
const stream = require('stream');

// or: const { F1TelemetryClient, constants } = require('f1-telemetry-client');
const { PACKETS } = constants;


const client = new F1TelemetryClient();
client.on(PACKETS.session, storedata);
client.on(PACKETS.motion, storedata);
client.on(PACKETS.lapData, storedata);
client.on(PACKETS.event, storedata);
client.on(PACKETS.participants, storedata);
client.on(PACKETS.carSetups, storedata);
client.on(PACKETS.carTelemetry, storedata);
client.on(PACKETS.carStatus, storedata);
client.on(PACKETS.finalClassification, storedatafinal);
client.on(PACKETS.lobbyInfo, storedata);

// to start listening:
client.start();
fs.writeFileSync('f12020.json', '','utf8');
var streamdata = openJsonOutputStream('f12020.json');
function storedata(data) {
    
    if (data != undefined) {
        var object = { packetId: data.m_header.m_packetId, packetInfo: data, time: Date.now() }
        streamdata._write(object);
    }
}

function storedatafinal(data) {
    if (data != undefined) {
        var object = { packetId: data.m_header.m_packetId, packetInfo: data, time: Date.now() }
        streamdata._write(object);
        streamdata.end();
        client.stop();
    }
}


function stringify(value) {
    if (value !== undefined) {
        return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    }
}

function openJsonOutputStream(outputFilePath) {

    const fileOutputStream = fs.createWriteStream(outputFilePath);
    fileOutputStream.write("[");

    let numRecords = 0;

    const jsonOutputStream = new stream.Writable({ objectMode: true });
    jsonOutputStream._write = (chunk, encoding, callback) => {
        if (numRecords > 0) {
            fileOutputStream.write(",");
        }

        // Output a single row of a JSON array.
        const jsonData = stringify(chunk);
        fileOutputStream.write(jsonData);
        numRecords += 1;
        //callback();    
    };

    jsonOutputStream.on("finish", () => {
        fileOutputStream.write("]");
        fileOutputStream.end();
    });

    return jsonOutputStream;
};

//const fs = require('fs');
//fs.writeFileSync('f12020.json', '','utf8');

// setInterval(function(){
//     var temp = [...obj];
//     obj = [];
//     //console.log(temp);
//     if(temp.length > 0){
//         var json = stringify(temp);
//         console.log("data worte 10s");
//         require('fs').appendFileSync('f12020.json',json,'utf8');
//     }
// }, 10000)




// and when you want to stop:
