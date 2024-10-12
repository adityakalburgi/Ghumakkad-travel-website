const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser'); 
const jwt = require('jsonwebtoken');
const Guide = require('./Models/guide.js');
const GuideDetails = require('./Models/GuideDetails.js')
const Traveller = require('./Models/Traveller.js');
const multer = require('multer');

const router = express.Router();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/Travel_website')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/', (_req, res) => {
    res.redirect('/login'); // or render a specific view
});


// Middleware to check authentication
function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/Login');
    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.redirect('/Login');
        req.user = user;
        next();
    });
}

// Routes
app.get('/Login', (req, res) => { const message = req.query.message || ''; // Get the message from the query
res.render('Login.ejs', { message })});
app.get('/Register', (req, res) => res.render('Register.ejs'));

app.post('/Register', async (req, res) => {
    const { name, email, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (userType === 'guide') {
        const newGuide = new Guide({ name, email, password: hashedPassword });
        await newGuide.save();
    } else {
        const newTraveller = new Traveller({ name, email, password: hashedPassword });
        await newTraveller.save();
    }
    res.redirect('/Login?message=Registration successful!');
    
});


app.post('/Login', async (req, res) => {
    const { email, password, userType } = req.body;
    let user;
    if (userType === 'guide') {
        user = await Guide.findOne({ email });
    } else {
        user = await Traveller.findOne({ email });
    }
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id, type: userType }, 'secretkey');
        res.cookie('token', token);
        if (userType === 'guide') {
            res.render('Guide_home', { guide: user }); // Pass guide data
        } else {
            res.render('traveller_home', { traveller: user });
        }
    } else {
        res.redirect('/Login');
    }
});

app.get('/Guide_prof', async(req,res) =>{
    try {
        const guides = await GuideDetails.find({}); // Fetch all guides from the collection
        res.render('Guide_prof', { guides });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
})
router.post('/Guide_prof', async (req, res) => {
   
  });
  
  module.exports = router;


app.get('/Guide_home', authMiddleware, async (req, res) => {
    if (req.user.type !== 'guide') return res.redirect('/Login');
    const guide = await Guide.findById(req.user.id).populate('bookings');
    res.render('Guide_home', {guide});
});

app.get('/traveller_home', authMiddleware, async (req, res) => {
    
    if (req.user.type !== 'traveller') return res.redirect('/Login');
    const travellers = await Traveller.findById(req.user.id).populate('bookedGuides');
    res.render('traveller_home', { travellers });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/Login');
});


app.get('/Guide_register', authMiddleware, (req, res) => {
    res.render('Guide_register');
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/uploads'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append date to filename to avoid collisions
    }
});

const upload = multer({ storage: storage });

app.post('/Guide_register',upload.single('image'), async (req, res) => {
    const { fullName, agencyName, contactDetails, aadhar, pan, gst, city,languages } = req.body;

    if (!fullName || !agencyName || !contactDetails || !aadhar || !pan || !gst || !city) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const guideDetails = new GuideDetails({ fullName, agencyName, contactDetails, aadhar, pan, gst, city,languages });
        await guideDetails.save();
        alert("profile created successfully")
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error registering user');
    }
});
app.post('/Guide_home', authMiddleware, async (req, res) => {
    if (req.user.type !== 'guide') return res.redirect('/login');
    const guide = await Guide.findById(req.user.id).populate('bookings');
    res.render('Guide_home', { guide });
});

// Endpoint to fetch guides by location
app.post('/guide_list', authMiddleware, async (req, res) => {
    try {
        const location = req.body.city;
    
        if (!location) {
          return res.status(400).send('Location is required.');
        }
    
        const guides = await GuideDetails.find({ city: location });
        res.render('guide_list', { traveller: req.user, guides });
      } catch (error) {
        console.error('Error fetching guides:', error);
        res.status(500).send('Server error while fetching guides');
      }
    
});
   

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
