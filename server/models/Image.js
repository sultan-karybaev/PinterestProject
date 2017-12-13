var mongoose = require("mongoose");
var Image = mongoose.Schema({
    image: String,
    mark: {type: mongoose.Schema.Types.ObjectId, ref: "Mark"},
    width: Number,
    height: Number,
    index: Number
}, { versionKey: false });

module.exports = mongoose.model("Image", Image);