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

// import * as handpose from '@tensorflow-models/handpose';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import {drawPredictions} from './drawing';

let detector;
let videoWidth;
let videoHeight;
let ctx;
let canvas; // for rendering each finger as a polyline

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 500;
const mobile = isMobile();
const state = {
  backend: 'webgl',
};

/* const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);*/

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
      // Only setting the video to a specified size in order to accommodate a
      // point cloud, so on mobile devices accept the default size.
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

const landmarksRealTime = async (video) => {
  async function frameLandmarks() {
    const predictions = await detector.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      // console.log(result);
      drawPredictions(predictions, ctx);
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
  console.log('WebXR isn\'t available');
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

  // setup camera
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

  // set up canvas
  canvas = document.getElementById('output');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, videoWidth, videoHeight);

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  // switch loading display to loaded
  let loaded = document.getElementById('loaded');
  let loading = document.getElementById('loading');
  loaded.style.display = 'block';
  loading.style.display = 'none';

  // make predictions and draw to canvas
  landmarksRealTime(video);
}

main();
