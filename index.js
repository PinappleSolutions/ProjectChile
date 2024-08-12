
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campGround');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const AsyncError = require('./utilities/AsyncError');
const ExpressError = require('./utilities/expressError');
const {campgroundSchema} = require('./schemas');
const Review = require('./models/review');

//mongoose

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/projectChile');
    console.log('Database connected')
}


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


app.get('/', (req, res) => {
    res.render('views/home');
});

app.get('/campgrounds', AsyncError(async (req, res) => {
    const campgrounds = await Campground.find({});
    console.log(campgrounds);
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/newcampground', (req, res) => {
    res.render('campgrounds/newcampground');
});

app.post('/campgrounds', validateCampground, AsyncError(async(req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', AsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', AsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', validateCampground, AsyncError(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.post('/campgrounds/:id/reviews', AsyncError(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', AsyncError(async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))



app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if(!err.message) err.message = 'Something went wrong'
    res.status(status).render('errors', { err })
})


app.listen(3000, () => {
    console.log('Listening: port 3000')
})