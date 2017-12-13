var mongoose = require("mongoose");
var Collection = mongoose.Schema({
    imagecount: Number,
    title: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
}, { versionKey: false });

module.exports = mongoose.model("Collection", Collection);