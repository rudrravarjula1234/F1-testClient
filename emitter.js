const bfj = require('bfj');
const { json } = require('express');
const fs = require('fs');
const stream = require('stream');
const JSONSocket = require('udp-json');
const dgram = require('dgram');
const { resourceLimits } = require('worker_threads');
const socket = dgram.createSocket('udp4');
function openJsonInputStream(inputFilePath) {

const ircSocket = new JSONSocket(socket, {maxPayload: 496, timeout: 1000});

const ip = '';
const port = '';
  //const jsonInputStream = new stream.Readable({ objectMode: true });
  // jsonInputStream._read = () => { 
  //   //console.log(this.data);
  // };

  const fileInputStream = fs.createReadStream(inputFilePath);

  let curObject = null;
  let curProperty = null;

  const emitter = bfj.walk(fileInputStream);

  emitter.on(bfj.events.object, () => {
    curObject = {};
  });

  emitter.on(bfj.events.property, name => {
    curProperty = name;
  });

  let onValue = value => {
    curObject[curProperty] = value;
    curProperty = null;
  };

  emitter.on(bfj.events.string, onValue);
  emitter.on(bfj.events.number, onValue);
  emitter.on(bfj.events.literal, onValue);

  emitter.on(bfj.events.endObject, async () => {
    //jsonInputStream.push(curObject);
    
    const resume = emitter.pause();
    ircSocket.send(curObject,port,ip,(error)=>{
      if(error){
        console.log('error',e);
        return;
      }
    });
    
    await new Promise((resolve) => {
      setTimeout(resolve, 1000/60);
    });
    resume();
    curObject = null;
  });

  emitter.on(bfj.events.endArray, () => {
    console.log("end");
    //jsonInputStream.push(null);
  });

  emitter.on(bfj.events.error, err => {
    // jsonInputStream.emit("error", err);
    console.log("error");
  });

};

openJsonInputStream('f12020.json');
//jsonout._read();