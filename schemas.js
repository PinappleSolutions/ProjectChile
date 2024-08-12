const JOI = require("joi");

module.exports.campgroundSchema = JOI.object({
    campground: JOI.object({
        title: JOI.string().required(),
        price: JOI.number().required().min(1)
    }).required()
})