// Stream = require('node-rtsp-stream');
// stream = new Stream({
//   name: ['name'],
//   streamUrl: ['rtsp://teste:teste@192.168.48.175:554/cam/realmonitor?channel=1&subtype=0'],
//   wsPort: 8181,
//   ffmpegOptions: { // options ffmpeg flags
//     '-stats': '', // an option with no neccessary value uses a blank string
//     '-r': 30 // options with required values specify the value after the key
//   }
// });
// console.log(stream);
const NodeMediaServer = require('node-media-server');
const restify = require('restify');
// const CronJob = require('cron').CronJob;
const bodyParser = require('body-parser');
const queryParser = require('express-query-int');
const _ = require('underscore');

// nms.getSession();
const config = {
    logType: 3, // 3 - Log everything (debug)
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: 8000,
        allow_origin: '*',
        timeout: 1000
    },
    relay: {
        ffmpeg: 'ffmpeg.exe',
        tasks: []
    }
};

var nms = new NodeMediaServer(config)

function respond(req, res, next) {
    console.log(req)
    var task = {
        id:req.body.id,
        app: req.body.path,
        mode: 'static',
        edge: req.body.url,
        name: req.params.teste,
        // type:'mp4',
        rtsp_transport : 'http' //['udp', 'tcp', 'udp_multicast', 'http']
    };
    nms.config.relay.tasks.push(task);
    nms.run();

    res.send(server.url + '/' + req.body.path + '/' + req.params.teste + '.flv');
    next();
}

function remove(req, res, next) {
    var indice = -1;
    _.each(nms.config.relay.tasks, function(t, i){
        if(t.id === req.body.id){
            indice = i;
        }
    });

    if(indice > -1){
        nms.config.relay.tasks.splice(indice, 1);
    }

    nms.run();
    
    res.send(server.url + req.body.path + req.params.teste + '.flv');
    next();
}
  
var server = restify.createServer();

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(queryParser());
server.use(restify.plugins.queryParser());

server.post('/stream/:teste', respond);
server.post('/stream/stop/:teste', remove);

server.listen(8080, function() {
console.log('%s listening at %s', server.name, server.url);
});

new CronJob('59 59 23 * * *', function() {
    nms.stop();
    nms.run();
}, null, true, 'America/Sao_Paulo');