import * as faceapi from "face-api.js";

export async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models/ssd_mobilenetv1");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark68");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition");
  await faceapi.nets.ageGenderNet.loadFromUri("/models/age_gender");
}

// Resemblance
export async function compareFaces(img1, img2) {
  const d1 = await faceapi
    .detectSingleFace(img1)
    .withFaceLandmarks()
    .withFaceDescriptor();
  const d2 = await faceapi
    .detectSingleFace(img2)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!d1 || !d2) return null;
  const distance = faceapi.euclideanDistance(d1.descriptor, d2.descriptor);
  return Math.max(0, 1 - distance) * 100; // %
}

// Smile intensity
export async function smileIntensity(img) {
  const det = await faceapi.detectSingleFace(img).withFaceLandmarks();
  if (!det) return null;
  const mouth = det.landmarks.getMouth();
  const width = mouth[6].x - mouth[0].x;
  const height = mouth[9].y - mouth[3].y;
  return width / height; // higher ratio = bigger smile
}

// Symmetry score
export async function symmetryScore(img) {
  const det = await faceapi.detectSingleFace(img).withFaceLandmarks();
  if (!det) return null;
  const leftEye = det.landmarks.getLeftEye();
  const rightEye = det.landmarks.getRightEye();
  const nose = det.landmarks.getNose();
  const midX = nose[3].x;
  const leftDist = Math.abs(midX - leftEye[0].x);
  const rightDist = Math.abs(rightEye[3].x - midX);
  return 1 - Math.abs(leftDist - rightDist) / Math.max(leftDist, rightDist);
}

// Age guess
export async function ageGuess(img) {
  const det = await faceapi.detectSingleFace(img).withAgeAndGender();
  if (!det) return null;
  return det.age.toFixed(0);
}
