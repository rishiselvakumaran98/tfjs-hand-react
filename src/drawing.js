const fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
};

export function drawPredictions(predictions, ctx) {
    if (!predictions) return;
    if (isOKFinger(predictions)) {
        document.getElementById('cnt').innerHTML = 'OK';
    } else {
        document.getElementById('cnt').innerHTML = '';
    }
    console.log("isOKFinger: ", predictions);
        
    predictions.forEach((hand) => {
        // console.log("hand prediction: ", hand['handedness']);
        drawOneHand(hand['keypoints'], hand['handedness'], ctx);
    });
}

function isOKFinger(predictions) {
    let isOK = false;
    predictions.forEach((hand) => {
        const keypoints = hand['keypoints'];
        if (Math.abs(keypoints[4]['x'] - keypoints[8]['x']) < 10 && Math.abs(keypoints[4]['y'] - keypoints[8]['y']) < 30) {
            isOK = true;
        }
    });
    return isOK;
}


function drawOneHand(keypoints, handedness, ctx) {
    ctx.fillStyle = handedness === 'Left' ? 'Red' : 'Blue';
    ctx.strokeStyle = handedness === 'Left' ? 'Red' : 'Blue';


    // draw keypoints
    for (let i = 0; i < keypoints.length; i++) {
        const { x, y } = keypoints[i];
        ctx.beginPath();
        // if (i === THUMB_TIP || i === INDEX_FINGER_TIP)
        // ctx.arc(x, y, 10, 0, 2 * Math.PI);
        // else
        ctx.arc(x - 1, y - 1, 3, 0, 2 * Math.PI); // draw a circle
        ctx.fill();
    }

    // draw fingers
    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i];
        const points = fingerLookupIndices[finger].map((idx) => keypoints[idx]);
        // console.log("points: ", points);
        drawPath(points, false, ctx);
    }
}


function drawPath(points, closePath, ctx) {
    const region = new Path2D();
    region.moveTo(points[0]['x'], points[0]['y']);
    // console.log("points: ", points);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point['x'], point['y']);
    }

    if (closePath) {
        region.closePath();
    }
    ctx.stroke(region);
}

// ---- Gesture Drawing Logic ----

let lastDrawPos = null;

export function gestureDrawing(predictions, persistentCtx) {
  const PINCH_THRESHOLD = 40;
  const ERASER_THRESHOLD = 80;

  const hand = predictions[0];
  const keypoints = hand.landmarks || hand.keypoints;
  if (!keypoints || keypoints.length < 9) {
    lastDrawPos = null;
    return;
  }

  const thumb = keypoints[4]; // thumb tip
  const index = keypoints[8]; // index finger tip
  const dx = thumb.x - index.x;
  const dy = thumb.y - index.y;
  const pinchDistance = Math.sqrt(dx * dx + dy * dy);

  if (pinchDistance < PINCH_THRESHOLD) {
    // Draw mode: use the midpoint of thumb and index finger.
    const currentPos = {
      x: (thumb.x + index.x) / 2,
      y: (thumb.y + index.y) / 2,
    };
    // Connect the previous point to current point.
    if (lastDrawPos) {
      persistentCtx.strokeStyle = 'green';
      persistentCtx.lineWidth = 5;
      persistentCtx.beginPath();
      persistentCtx.moveTo(lastDrawPos.x, lastDrawPos.y);
      persistentCtx.lineTo(currentPos.x, currentPos.y);
      persistentCtx.stroke();
    }
    lastDrawPos = currentPos;
  } else if (pinchDistance > ERASER_THRESHOLD) {
    // Eraser mode assumed at index 0 as the eraser position.
    const erasePos = keypoints[0]; // wrist
    const eraserRadius = 30;
    persistentCtx.save();
    persistentCtx.beginPath();
    persistentCtx.arc(erasePos.x, erasePos.y, eraserRadius, 0, 2 * Math.PI);
    persistentCtx.clip();
    persistentCtx.clearRect(
      erasePos.x - eraserRadius,
      erasePos.y - eraserRadius,
      eraserRadius * 2,
      eraserRadius * 2
    );
    persistentCtx.restore();
    lastDrawPos = null;
  } else {
    // When not drawing/erasing gesture.
    lastDrawPos = null;
  }
}
