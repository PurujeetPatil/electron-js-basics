// Buttons
const videoElement = window.document.querySelector('video');

const startButton = window.document.getElementById('start-button');
startButton.addEventListener('click', function() {
	console.log('Start Button clicked');
	mediaRecorder.start();
  	startButton.classList.add('is-danger');
  	startButton.innerText = 'Recording';
});

const stopButton = window.document.getElementById('stop-button');
stopButton.addEventListener('click', function() {
	console.log('Stop Button clicked');
	mediaRecorder.stop();
  	startButton.classList.remove('is-danger');
  	startButton.innerText = 'Start';	
});

const videoSelectButton = window.document.getElementById('video-select-button');

const desktopCapturer = window.require('electron').desktopCapturer;
const remote = window.require('electron').remote;
const Menu = require('electron').remote.Menu;
const dialog = require('electron').remote.dialog;

let mediaRecorder;
const recordedChunks = [];

videoSelectButton.addEventListener('click', getVideoSources () )

// Get the available video sources
async function getVideoSources() {
	const inputSources = await desktopCapturer.getSources({
	  types: ['window', 'screen']
	});
  
	const videoOptionsMenu = Menu.buildFromTemplate(
	  inputSources.map(source => {
		return {
		  label: source.name,
		  click: () => selectSource(source)
		};
	  })
	);
  
	videoOptionsMenu.popup();
}

async function selectSource(source) {
	videoSelectButton.innerHTML = source.name;

	var constraints = {
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: source.id
			}
		}
	};

	// Create Stream
	const promise = window.navigator.mediaDevices.getUserMedia(constraints);
	promise.then(function(stream) {
		// Preview the source in video element
		videoElement.srcObject = stream;
		videoElement.play();
		
		// Create Media Recorder
		var options;
		if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
			options = {mimeType: 'video/webm; codecs=vp9'};
		} else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
			options = {mimeType: 'video/webm; codecs=vp8'};
		}
		mediaRecorder = new MediaRecorder(stream, options);

		// Handle Events
		mediaRecorder.ondatavailable = handleDataAvailable;
		mediaRecorder.onstop = handleStop;
	});
}

// Captures recorded chunks
function handleDataAvailable (e) {
	console.log('video data available');
	recordedChunks.push(e.data);
}

const { writeFile } = require('fs');

// Saves recorded chunks
async function handleStop (e) {
	console.log(typeof(recordedChunks));
	console.log(recordedChunks);
	const blob = new Blob(recordedChunks, {
		type: 'video/webm'
	});

	const buffer = Buffer.from(await blob.arrayBuffer());
	
	const { filePath } = await dialog.showSaveDialog({
		buttonLabel: 'Save Video',
		defaultPath: `vid-${Date.now()}.webm`
	});

	console.log(filePath);

	if (filePath) {
		writeFile(filePath, buffer, () => {
			console.log('video saved successfully!');
		});	
	}
}