var mongoose = require("mongoose");
var Save = mongoose.Schema({
    coll: {type: mongoose.Schema.Types.ObjectId, ref: "Collection"},
    image: {type: mongoose.Schema.Types.ObjectId, ref: "Image"},
    imageWay: String
}, { versionKey: false });

module.exports = mongoose.model("Save", Save);