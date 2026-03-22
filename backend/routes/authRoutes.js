const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function createAuthPayload(user) {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
    },
  };
}

async function verifyGoogleCredential(credential) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!response.ok) {
    throw new Error('Invalid Google token');
  }

  const payload = await response.json();

  if (!payload.email || payload.email_verified !== 'true') {
    throw new Error('Google account email is not verified');
  }

  if (
    process.env.GOOGLE_CLIENT_ID &&
    payload.aud !== process.env.GOOGLE_CLIENT_ID
  ) {
    throw new Error('Google token audience mismatch');
  }

  return payload;
}


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'manager',
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(createAuthPayload(user));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const googleProfile = await verifyGoogleCredential(credential);

    let user = await User.findOne({
      $or: [{ googleId: googleProfile.sub }, { email: googleProfile.email }],
    });

    if (!user) {
      user = new User({
        name: googleProfile.name || googleProfile.email.split('@')[0],
        email: googleProfile.email,
        role: 'manager',
        provider: 'google',
        googleId: googleProfile.sub,
      });
    } else {
      user.googleId = user.googleId || googleProfile.sub;
      user.provider = 'google';
      user.name = user.name || googleProfile.name || user.email;
    }

    await user.save();

    res.json(createAuthPayload(user));
  } catch (error) {
    res.status(401).json({ error: error.message || 'Google login failed' });
  }
});

router.post('/google/register', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const googleProfile = await verifyGoogleCredential(credential);

    const existingUser = await User.findOne({
      $or: [{ googleId: googleProfile.sub }, { email: googleProfile.email }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Account already exists. Please log in with Google instead.',
      });
    }

    const user = new User({
      name: googleProfile.name || googleProfile.email.split('@')[0],
      email: googleProfile.email,
      role: 'manager',
      provider: 'google',
      googleId: googleProfile.sub,
    });

    await user.save();

    res.status(201).json(createAuthPayload(user));
  } catch (error) {
    res.status(401).json({ error: error.message || 'Google registration failed' });
  }
});


router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    res.json(user);

  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
