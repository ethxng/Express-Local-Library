let mongoose = require('mongoose');
const { DateTime } = require('luxon');

let Schema = mongoose.Schema;

let bookInstanceSchema = new Schema(
    {
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
        imprint: {type: String, required: true},
        status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
        due_back: {type: Date, default: Date.now}
    }
)

// virtual for bookInstance's url
bookInstanceSchema.virtual('url').get(function() {
    return '/catalog/bookinstance/' + this._id;
});

bookInstanceSchema.virtual('due_back_formatted').get(function() {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

bookInstanceSchema.virtual('due_back_YYYY_MM_DD').get(function (){
    return DateTime.fromJSDate(this.due_back).toISODate();
})

module.exports = mongoose.model("BookInstance", bookInstanceSchema);