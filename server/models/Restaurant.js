const mongoose = require('mongoose');
const schema = mongoose.Schema;

const restaurantSchema = new schema({
    name: {
        type: String,
        required: true
    },
    cuisineType: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    created_at: {
        type: String,
        default: new Date(Date.now()).toISOString()
    }
},
    {
        collection: 'Restaurant',
        versionKey: false 
    });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;