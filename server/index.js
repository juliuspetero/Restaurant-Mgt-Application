const express = require('express');
const app = express();
const winston = require("winston");
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const uuid = require('uuid');

const DIR = './public/';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuid.v4() + '-' + fileName)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});


const logConfiguration = {
    'transports': [
        new winston.transports.Console()
    ]
};
const LOGGER = winston.createLogger(logConfiguration);

app.use(express.json());
app.use(cors());
app.use('/public', express.static('public'));

mongoose.connect('mongodb://root:pass@127.0.0.1:27017/restaurant?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true

})
    .then(() => LOGGER.info('Connected to Mongo Database'))
    .catch(error => LOGGER.error('Error connecting to the database: ', error));

const Restaurant = require('./models/Restaurant');

app.get('/restaurant', async (req, res) => {
    const restaurants = await Restaurant.find();
    res.json(restaurants)
});

app.post('/restaurant', upload.single('imageFile'), async (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const jsonString = req.body.jsonString;
    const requestBody = JSON.parse(jsonString);
    const restaurant = new Restaurant({
        name: requestBody.name,
        cuisineType: requestBody.cuisineType,
        location: requestBody.location
    });
    if (req.file) {
        restaurant.image = url + '/public/' + req.file.filename;
    }else{
        restaurant.image = url + '/public/' + 'No Image';
    }
    restaurant.save();
    res.json(restaurant)
});

app.put('/restaurant/:id', upload.single('imageFile'), async (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const jsonString = req.body.jsonString;
    const requestBody = JSON.parse(jsonString);
    const restaurant = await Restaurant.findById(req.params.id);
    restaurant.name = requestBody.name;
    restaurant.cuisineType = requestBody.cuisineType;
    restaurant.location = requestBody.location;
    if (req.file) {
        restaurant.image = url + '/public/' + req.file.filename;
    }
    restaurant.save();
    res.json(restaurant);
});


app.delete('/restaurant/:id', async (req, res) => {
    const result = await Restaurant.findByIdAndDelete(req.params.id);
    res.json(result);
});


const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
    LOGGER.info(`Server started @ http://localhost:${PORT}`);
})