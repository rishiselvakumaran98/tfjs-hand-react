/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import React, { useEffect } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { drawPredictions } from './drawing';
import { gestureDrawing } from './drawGesture';

let detector;
let videoWidth;
let videoHeight;
let ctx;
let canvas;    // for rendering each finger as a polyline
let persistentCtx; // for persistent drawing

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 500;
const mobile = isMobile();
const state = {
  backend: 'webgl',
};

/* const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom); */

function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
    );
  }

  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      // Only setting the video to a specified size to accommodate a point cloud, so on mobile devices accept the default size.
      width: mobile ? undefined : VIDEO_WIDTH,
      height: mobile ? undefined : VIDEO_HEIGHT,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// This function processes each video frame.
const landmarksRealTime = async (video) => {
  
  async function frameLandmarks() {
    const predictions = await detector.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      // console.log(result);
      drawPredictions(predictions, ctx);
        
      // call our new gesture drawing logic 
      gestureDrawing(predictions, persistentCtx);
    }
    // stats.end();
    requestAnimationFrame(frameLandmarks);
  }
  frameLandmarks();
};

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

if ('xr' in navigator) {
  console.log('WebXR can be used');
} else {
  console.log("WebXR isn't available");
}

async function main() {
  // load model
  await tf.setBackend(state.backend);
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'tfjs',
    modelType: 'full',
  };
  detector = await handPoseDetection.createDetector(model, detectorConfig);

  // setup camera.
  let video;
  try {
    video = await setupCamera();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = e.message;
    info.style.display = 'block';
    throw e;
  }
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;

  // set up the predictions canvas.
  canvas = document.getElementById('output');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;
  
  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, videoWidth, videoHeight);
  
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  // set up the persistent drawing canvas.
  const persistentCanvas = document.getElementById('drawCanvas');
  persistentCanvas.width = videoWidth;
  persistentCanvas.height = videoHeight;
  persistentCtx = persistentCanvas.getContext('2d');

  // switch loading display to loaded.
  let loaded = document.getElementById('loaded');
  let loading = document.getElementById('loading');
  loaded.style.display = 'block';
  loading.style.display = 'none';

  // make predictions and draw to canvas
  landmarksRealTime(video);
}

main();

const HandPoseDetector = () => {
  useEffect(() => {
    main();
  }, []);

  return (
    <div>
      <div id="info" style={{ display: 'none' }}></div>
      <h1>A Hand Gesture Detector</h1>

      {/* Container for the video and both canvas */}
      <div
        style={{
          position: 'relative',
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
        }}
      >
        <video
          autoPlay
          poster="hand.jpg"
          id="video"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
            transform: 'scaleX(-1)', // Mirror video
            zIndex: 0,
          }}
        ></video>
        {/* Persistent drawing canvas (not cleared each frame) */}
        <canvas
          id="drawCanvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            border: '0px',
            transform: 'scaleX(-1)', // Mirror video
          }}
        ></canvas>
        {/* Predictions canvas (cleared every frame) */}
        <canvas
          id="output"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            border: '0px',
          }}
        ></canvas>
      </div>

      <div id="loading">
        <h2>Wait for the ML Hand Detector to load...</h2>
      </div>
      <h2 id="loaded" style={{ display: 'none' }}>
        Make hand gesture and say what happens
      </h2>
      <p id="cnt"></p>
    </div>
  );
};

export default HandPoseDetector;
