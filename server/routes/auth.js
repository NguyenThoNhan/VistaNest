const express = require('express');
const crypto = require('crypto');
const db = require('../config/db');

const router = express.Router();

// API đăng ký
router.post('/signup', (req, res) => {
    console.log('Received signup request:', req.body);
    const { email, username, password, face_descriptor } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !username || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Băm mật khẩu bằng SHA-256
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    // Kiểm tra xem email hoặc username đã tồn tại chưa
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], (err, results) => {
        if (err) {
            console.error('Database error during check:', err.message);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        if (results.length > 0) {
            // Email hoặc username đã tồn tại
            const existingUser = results[0];

            // Kiểm tra xem password có khớp không
            const storedHash = existingUser.hash;
            if (hash !== storedHash) {
                console.log('Password does not match for existing user');
                return res.status(400).json({ message: 'Email or username already exists with a different password' });
            }

            // Nếu có face_descriptor, cập nhật bản ghi
            if (face_descriptor) {
                const updateQuery = 'UPDATE users SET face_descriptor = ? WHERE email = ? AND username = ?';
                db.query(updateQuery, [JSON.stringify(face_descriptor), email, username], (updateErr) => {
                    if (updateErr) {
                        console.error('Database error during update:', updateErr.message);
                        return res.status(500).json({ message: 'Database error during update', error: updateErr.message });
                    }
                    console.log('Face descriptor updated for existing user');
                    return res.status(200).json({ message: 'Face recognition data added successfully' });
                });
            } else {
                console.log('User already exists, no face descriptor to update');
                return res.status(400).json({ message: 'Email or username already exists' });
            }
        } else {
            // Nếu chưa tồn tại, tạo bản ghi mới
            const insertQuery = 'INSERT INTO users (email, username, password, hash, face_descriptor) VALUES (?, ?, ?, ?, ?)';
            const values = [email, username, password, hash, face_descriptor ? JSON.stringify(face_descriptor) : null];

            db.query(insertQuery, values, (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Database error during insert:', insertErr.message);
                    return res.status(500).json({ message: 'Database error', error: insertErr.message });
                }
                console.log('User registered successfully');
                res.status(201).json({ message: 'User registered successfully' });
            });
        }
    });
});

// API đăng nhập
router.post('/signin', (req, res) => {
    console.log('Received signin request:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const query = 'SELECT * FROM users WHERE username = ? AND hash = ?';
    db.query(query, [username, hash], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            console.log('Invalid username or password');
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        console.log('Login successful for user:', username);
        res.status(200).json({ message: 'Login successful', username: results[0].username });
    });
});

// API lấy danh sách face descriptors
router.get('/get-face-descriptors', (req, res) => {
    console.log('Received get-face-descriptors request');
    const query = 'SELECT username, face_descriptor FROM users WHERE face_descriptor IS NOT NULL';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        const descriptors = results.map(user => ({
            username: user.username,
            descriptor: user.face_descriptor ? JSON.parse(user.face_descriptor) : null
        }));
        console.log('Face descriptors retrieved:', descriptors.length);
        res.status(200).json(descriptors);
    });
});

module.exports = router;