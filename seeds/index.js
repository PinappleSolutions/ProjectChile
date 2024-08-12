
const mongoose = require('mongoose');
const Campground = require('../models/campGround');
const cities = require('./cities');
const { descriptors, places } = require('./seedhelpers');

//mongoose

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/projectChile');
    console.log('Database connected')
}

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i= 0;i < 50; i++){
        const rand1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'beautiful image of ton ton and pong pong',
            price: Math.floor(Math.random() * 3000) + 900
        })
        await camp.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close;
    console.log('Connection Closed');
})