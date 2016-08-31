var WORKER_PATH = '/js/audio-worker.js'

class Recorder {
    config
    bufferLen
    numChannels
    context
    node
    worker: Worker

    recording = false
    stopRecording = false
    currCallback: (any) => void

    constructor(source, cfg?) {
        this.config = cfg || {};
        this.bufferLen = this.config.bufferLen || 4096;
        this.numChannels = this.config.numChannels || 1;

        this.context = source.context;
        this.node = (this.context.createScriptProcessor ||
            this.context.createJavaScriptNode).call(this.context,
            this.bufferLen, this.numChannels, this.numChannels);
        
        this.worker = new Worker(this.config.workerPath || WORKER_PATH);

        this.worker.postMessage({
            command: 'init',
            config: {
                sampleRate: this.context.sampleRate,
                numChannels: this.numChannels
            }
        });

        this.node.onaudioprocess = (e) => {
            if (!this.recording) {
                return
            };


            var buffer = [];
            for (var channel = 0; channel < this.numChannels; channel++) {
                buffer.push(e.inputBuffer.getChannelData(channel));
            }

            this.worker.postMessage({
                command: 'record',
                buffer: buffer
            });

            if (this.stopRecording) {
                this.recording = false
            }
        }

        this.worker.onmessage = (e) => {
            var blob = e.data;
            this.currCallback(blob);
        }

        source.connect(this.node);
        this.node.connect(this.context.destination);    //this should not be necessary
    }


    configure(cfg) {
        for (var prop in cfg) {
            if (cfg.hasOwnProperty(prop)) {
                this.config[prop] = cfg[prop];
            }
        }
    }

    record() {
        this.recording = true;
        this.stopRecording = false;
    }

    stop() {
        // can't stop it directly or we miss the current sample
        this.stopRecording = true;
    }

    clear() {
        this.worker.postMessage({ command: 'clear' });
    }

    getBuffer(cb: (any) => void) {
        this.currCallback = cb || this.config.callback;
        
        this.worker.postMessage({ command: 'getBuffer' })
    }

    exportWAV(cb: (any) => void, type: string) {
        this.currCallback = cb || this.config.callback;
        type = type || this.config.type || 'audio/wav';
        
        if (!this.currCallback) {
            throw new Error('Callback not set');
        } 

        this.worker.postMessage({
            command: 'exportWAV',
            type: type
        })
    }
}

var audio_context;
var recorder;

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream)

    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //__log('Input connected to audio context destination.');
    recorder = new Recorder(input)
}

function startRecording(sentenceId, audioId) {
    if (!recorder) {
        throw new Error();
    }

    recorder.record()
    recorder.sentenceId = sentenceId
    recorder.audioId = audioId
}

function stopRecording() {
    if (!recorder) {
        throw new Error()
    }

    return new Promise((resolve, reject) => {
        recorder.stop()

        recorder.exportWAV((blob) => {
            store(blob, recorder.audioId, recorder.sentenceId)
                .then(function() {
                    resolve(window.URL.createObjectURL(blob))
                },
                reject)
        })

        recorder.clear()
    })
}

function store(blob, audioId, sentenceId) {
    function failStoring(req) {
        console.warn('Storing audio failed. Status: ' + req.status)

        alert('Something went wrong while storing the audio.')
    }

    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest()

        req.open('POST', '/api/ru/sentence/' + sentenceId + '/audio', true)

        var fd = new FormData()

        fd.append('data', blob, audioId)

        req.onerror = function() {
            failStoring(req)
            reject(new Error('Could not store'))
        }

        req.onload = function() {
            if (req.status != 200) {
                failStoring(req)
            }
            else {
                resolve()
            }
        }

        req.send(fd)
    })
}

function init() {
    audio_context = new AudioContext;

    (navigator as any).webkitGetUserMedia({audio: true}, startUserMedia, function (e) {
    })
}

export default {
    startRecording: startRecording,
    stopRecording: stopRecording,
    init: init
}