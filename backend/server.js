// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { Client } = require('postmark');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3001;

// MongoDB setup
console.log('MongoDB URI:', process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('communication_platform');
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Postmark client
const postmarkClient = new Client(process.env.POSTMARK_API_KEY);

// Google OAuth configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists, if not create a new user
      const user = await db.collection('users').findOneAndUpdate(
        { googleId: profile.id },
        { $set: { 
            googleId: profile.id, 
            displayName: profile.displayName, 
            email: profile.emails[0].value 
          } 
        },
        { upsert: true, returnDocument: 'after' }
      );
      done(null, user.value);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email' ] }));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/google/callback', failureFlash: true }),
    (req, res) => {
      console.log('Authentication successful');
      res.redirect('http://localhost:3000/dashboard');
    }
  );
  
  app.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.error('Authentication failed:', info);
        return res.redirect('/auth/google');
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        console.log('Authentication successful');
        return res.redirect('http://localhost:3000/dashboard');
      });
    })(req, res, next);
  });
app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/api/communications', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const communications = await db.collection('communications')
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

app.post('/api/send-email', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { to, subject, body, templateId } = req.body;

  try {
    const response = await postmarkClient.sendEmailWithTemplate({
      From: 'sender@example.com',
      To: to,
      TemplateId: templateId,
      TemplateModel: {
        subject: subject,
        body: body
      }
    });

    // Save communication to database
    await db.collection('communications').insertOne({
      userId: req.user._id,
      type: 'email',
      to,
      subject,
      body,
      templateId,
      status: 'sent',
      createdAt: new Date()
    });

    res.json(response);
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});