let mongoose = require('mongoose');
const { DateTime } = require('luxon');

let Schema = mongoose.Schema;

let authorSchema = new Schema(
    {
        first_name: {type: String, required: true, maxLength: 100},
        family_name: {type: String, required: true, maxLength: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date},
    }
);

// Virtual for author's full name
authorSchema
    .virtual('name')
    .get(function () {
        let fullname = '';
        // To avoid errors in cases where an author does not have either a family name or first name
        // We want to make sure we handle the exception by returning an empty string for that case
        if (this.first_name && this.family_name){
            fullname = this.family_name + ', ' + this.first_name;
        }
        if (!this.first_name || !this.family_name){
            fullname = '';
        }
        return fullname;
    });

// Virtual for author's lifespan
authorSchema.virtual('lifespan').get(function() {
    let lifetime_string = '';
    if (this.date_of_birth){
        lifetime_string = this.date_of_birth.getYear().toString();
    }
    lifetime_string += '-';
    if (this.date_of_death){
        lifetime_string += this.date_of_death.getYear();
    }
    return lifetime_string;
});

// virtual for author's url
authorSchema.virtual('url').get(function() {
    return '/catalog/author/' + this._id;
});

// returned formatted date
authorSchema.virtual('birthDate_formated').get(function() {
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
});

authorSchema.virtual('deathDate_formatted').get(function() {
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
});

authorSchema.virtual('lifespan').get(function() {
    let birth = this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
    let death = this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
    return birth + '-' + death;
});

authorSchema.virtual('birthDateYYYYMMDD').get(function() {
    let birth = this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toISODate() : '';
    return birth;
});

authorSchema.virtual('deathDateYYYYMMDD').get(function () {
    let death = this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toISODate() : '';
    return death;
})

module.exports = mongoose.model('Author', authorSchema);