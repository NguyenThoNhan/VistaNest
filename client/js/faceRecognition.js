let stream = null;

// Tải các mô hình Face-api.js
async function loadFaceApiModels() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model'),
            faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model')
        ]);
        console.log('Face-api models loaded successfully');
    } catch (error) {
        console.error('Error loading Face-api models:', error);
        alert('Failed to load face recognition models. Please try again.');
    }
}

// Khởi động webcam
async function startWebcam() {
    const video = document.getElementById('video');
    const faceRecognitionSection = document.getElementById('face-recognition-section');
    const loading = document.getElementById('loading');

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        faceRecognitionSection.style.display = 'block';
        loading.style.display = 'block';
        return true;
    } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Cannot access webcam. Please ensure you have granted permission.');
        return false;
    }
}

// Dừng webcam
function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const faceRecognitionSection = document.getElementById('face-recognition-section');
    const loading = document.getElementById('loading');
    faceRecognitionSection.style.display = 'none';
    loading.style.display = 'none';
}

// Tính khoảng cách Euclidean giữa hai descriptor
function computeDistance(descriptor1, descriptor2) {
    if (descriptor1.length !== descriptor2.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        sum += (descriptor1[i] - descriptor2[i]) ** 2;
    }
    return Math.sqrt(sum);
}

// Phát hiện khuôn mặt với nhiều lần thử
async function detectFaceWithRetries(video, maxAttempts = 3, interval = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Detecting face - Attempt ${attempt}/${maxAttempts}`);
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detection) {
            console.log('Face detected successfully');
            return detection;
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }
    console.log('Failed to detect face after all attempts');
    return null;
}

// Đăng ký bằng khuôn mặt
async function handleFaceSignup() {
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (!emailInput || !usernameInput || !passwordInput) {
        console.error('Form fields not found');
        alert('Form fields are missing. Please check the form structure.');
        return;
    }

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log('Face signup data:', { email, username, password });

    if (!email || !username || !password) {
        console.log('Validation failed: Missing fields');
        alert('Please fill in all fields before using face recognition');
        return;
    }

    // Tải mô hình và khởi động webcam
    await loadFaceApiModels();
    const webcamStarted = await startWebcam();
    if (!webcamStarted) return;

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    // Chờ 3 giây để video ổn định
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Phát hiện khuôn mặt với nhiều lần thử
    const detection = await detectFaceWithRetries(video);

    stopWebcam();

    if (!detection) {
        alert('No face detected after multiple attempts. Please try again with better lighting and ensure your face is fully in the frame.');
        return;
    }

    const descriptor = Array.from(detection.descriptor);

    // Gửi dữ liệu (bao gồm descriptor) đến API signup
    try {
        const response = await axios.post('http://localhost:3000/api/auth/signup', {
            email,
            username,
            password,
            face_descriptor: descriptor
        });
        console.log('Face signup response:', response.data);
        alert(response.data.message);
        window.location.href = 'index.html';
    } catch (error) {
        const errorMessage = error.response && error.response.data && error.response.data.message 
            ? error.response.data.message 
            : 'An error occurred during face signup';
        console.error('Face signup error:', errorMessage);
        alert(errorMessage);
    }
}

// Đăng nhập bằng khuôn mặt
async function handleFaceSignin() {
    // Tải mô hình và khởi động webcam
    await loadFaceApiModels();
    const webcamStarted = await startWebcam();
    if (!webcamStarted) return;

    const video = document.getElementById('video');

    // Chờ 3 giây để video ổn định
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Phát hiện khuôn mặt với nhiều lần thử
    const detection = await detectFaceWithRetries(video);

    stopWebcam();

    if (!detection) {
        alert('No face detected after multiple attempts. Please try again with better lighting and ensure your face is fully in the frame.');
        return;
    }

    const newDescriptor = Array.from(detection.descriptor);

    // Lấy danh sách descriptor từ database
    try {
        const response = await axios.get('http://localhost:3000/api/auth/get-face-descriptors');
        const users = response.data;

        if (users.length === 0) {
            alert('No face data found in the database. Please sign up with face recognition first.');
            return;
        }

        // So sánh descriptor mới với các descriptor trong database
        let matchedUser = null;
        const threshold = 0.8;

        for (const user of users) {
            const storedDescriptor = user.descriptor;
            const distance = computeDistance(newDescriptor, storedDescriptor);
            console.log(`Distance for user ${user.username}: ${distance}`);
            if (distance < threshold) {
                matchedUser = user;
                break;
            }
        }

        if (matchedUser) {
            alert(`Login successful with face recognition! Welcome, ${matchedUser.username}!`);
            localStorage.setItem('username', matchedUser.username);
            window.location.href = 'index.html';
        } else {
            alert('No matching face found. Please try again with the same lighting and angle as during signup, or use username/password.');
        }
    } catch (error) {
        const errorMessage = error.response && error.response.data && error.response.data.message 
            ? error.response.data.message 
            : 'An error occurred during face signin';
        console.error('Face signin error:', errorMessage);
        alert(errorMessage);
    }
}