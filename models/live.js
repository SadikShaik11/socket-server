const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const liveSchema = new Schema({
    role: { 
        type: String
    },
    auth: { 
        type: String
    },
    docid: { 
        type: Number
    },
}, { versionKey: false, timestamps: false, collection: 'live-doctors' })

const Live = mongoose.model("Live", liveSchema)

module.exports = Live;