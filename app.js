// app.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

// Import models
const User = require('./models/User');
const Course = require('./models/Course');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/attendance-manager', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secretattendanceapp',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration using the local strategy.
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Registration routes
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  User.register(new User({ username }), password, (err, user) => {
    if (err) {
      return res.render('register', { error: err.message });
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/dashboard');
    });
  });
});

// Login routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
}));

// Dashboard: Show user courses
app.get('/dashboard', isLoggedIn, async (req, res) => {
  // Populate courses for the logged-in user
  await req.user.populate('courses');
  res.render('dashboard', { user: req.user });
});

// Route to display form for adding a new course
app.get('/courses/new', isLoggedIn, (req, res) => {
  res.render('addCourse');
});

// Route to add a new course
app.post('/courses', isLoggedIn, async (req, res) => {
  const { courseName, totalClasses, attendedClasses } = req.body;
  const course = new Course({
    courseName,
    totalClasses: parseInt(totalClasses),
    attendedClasses: parseInt(attendedClasses)
  });
  await course.save();
  // Associate the course with the user
  req.user.courses.push(course);
  await req.user.save();
  res.redirect('/dashboard');
});

// Route to view course details and actions (mark attendance, edit, delete)
app.get('/courses/:id', isLoggedIn, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.redirect('/dashboard');
  }
  res.render('courseDetail', { course });
});

// Route to mark attendance for a course (adds one class session)
app.post('/courses/:id/mark', isLoggedIn, async (req, res) => {
  const { attended } = req.body; // Expected values: "yes" or "no"
  const course = await Course.findById(req.params.id);
  if (course) {
    course.totalClasses += 1;
    if (attended === "yes") {
      course.attendedClasses += 1;
    }
    await course.save();
  }
  res.redirect(`/courses/${req.params.id}`);
});

// Route to update course attendance manually (existing update route)
app.post('/courses/:id/update', isLoggedIn, async (req, res) => {
  const { attendedClasses, totalClasses } = req.body;
  const course = await Course.findById(req.params.id);
  if(course) {
    course.attendedClasses = parseInt(attendedClasses);
    course.totalClasses = parseInt(totalClasses);
    await course.save();
  }
  res.redirect('/dashboard');
});

// Route for attendance threshold calculation.
app.post('/courses/:id/threshold', isLoggedIn, async (req, res) => {
  const { threshold } = req.body;
  const course = await Course.findById(req.params.id);
  if(course) {
    const total = course.totalClasses;
    const attended = course.attendedClasses;
    const reqPercent = parseFloat(threshold);
    let message = "";
    // Calculate current attendance percentage
    const currentPercentage = (attended / total) * 100;
    if(currentPercentage < reqPercent) {
      // Calculate additional classes needed:
      const x = Math.ceil((reqPercent * total - 100 * attended) / (100 - reqPercent));
      message = `You need to attend at least ${x} more class(es) to reach ${reqPercent}% attendance.`;
    } else {
      // Calculate how many classes can be missed:
      const x = Math.floor((100 * attended - reqPercent * total) / reqPercent);
      message = `You can afford to miss ${x} more class(es) and still maintain ${reqPercent}% attendance.`;
    }
    // For simplicity, we send the result as JSON.
    res.send({ message, currentPercentage: currentPercentage.toFixed(2) });
  } else {
    res.status(404).send("Course not found");
  }
});

// Route to display edit form for a course
app.get('/courses/:id/edit', isLoggedIn, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.redirect('/dashboard');
  }
  res.render('editCourse', { course });
});

// Route to update course details from edit form
app.post('/courses/:id/edit', isLoggedIn, async (req, res) => {
  const { courseName, totalClasses, attendedClasses } = req.body;
  await Course.findByIdAndUpdate(req.params.id, {
    courseName,
    totalClasses: parseInt(totalClasses),
    attendedClasses: parseInt(attendedClasses)
  });
  res.redirect(`/courses/${req.params.id}`);
});

// Route to delete a course
app.post('/courses/:id/delete', isLoggedIn, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  // Remove the course from the user's courses array
  req.user.courses.pull(req.params.id);
  await req.user.save();
  res.redirect('/dashboard');
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(err => {
    if(err) return next(err);
    res.redirect('/');
  });
});

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

app.listen(3000, () => {
  console.log("Server started on port 3000");
});