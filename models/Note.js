const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema(
    {    
    user: {
        type:  mongoose.Schema.Types.ObjectId, 
        require: true, 
        ref: 'User'
    },
    title: {
        type: String, 
        require: true
    },
    text: {
        type: String, 
        require: true
    },
    completed: {
        type: Boolean, 
        default: false
    }
}, 
{
    timestamps: true
}
)
//Auto incremnet done via MongoDB Triggers code is: 
/*
exports = async function(changeEvent) {
    var docId = changeEvent.fullDocument._id;
    
    const countercollection = context.services.get("techNotesDB").db(changeEvent.ns.db).collection("counters");
    const studentcollection = context.services.get("techNotesDB").db(changeEvent.ns.db).collection(changeEvent.ns.coll);
    
    var counter = await countercollection.findOneAndUpdate({_id: changeEvent.ns },{ $inc: { seq_value: 500 }}, { returnNewDocument: true, upsert : true});
    var updateRes = await studentcollection.updateOne({_id : docId},{ $set : {ticketID : counter.seq_value}});
    
    console.log(`Updated ${JSON.stringify(changeEvent.ns)} with counter ${counter.seq_value} result : ${JSON.stringify(updateRes)}`);
    };
*/


module.exports = mongoose.model('Note', noteSchema)