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
