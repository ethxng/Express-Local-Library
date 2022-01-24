var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const { body, validationResult } = require('express-validator');


// Display list of all Genre.
exports.genre_list = function(req, res) {
    //res.send('NOT IMPLEMENTED: Genre list');
    Genre.find().sort([['name', 'ascending']]).exec(function(err, genre_list) {
        if (err != null)    return next(err);
        res.render('genre_list', { title: "Genre List", genre_list: genre_list});
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res) {
    //res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
              .exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });

};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post =  [

    // Validate and sanitize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ 'name': req.body.name })
          .exec( function(err, found_genre) {
             if (err) { return next(err); }
  
             if (found_genre) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_genre.url);
             }
             else {
  
               genre.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(genre.url);
               });
  
             }
  
           });
      }
    }
];
  

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    async.parallel({
        genre: function(callback){
            Genre.findById(req.params.id).exec(callback);
        }, 
        genre_books: function(callback){
            Book.find({'genre' : req.params.id}).exec(callback);
        }
    }, function(err, results){
        if (err) return next(err);
        if (results.genre==null){ // no genre to be found
            res.redirect('/catalog/genre');
        }
        // successful
        res.render('genre_delete', { title: "Delete Genre", genre: results.genre, genre_books: results.genre_books});
    })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    async.parallel({
        genre: function(callback){
            Genre.findById(req.body.genreid).exec(callback);
        }, 
        genre_books: function(callback){
            Book.find({'genre' : req.body.genreid}).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        // there are books associated so just render and don't delete
        if (results.genre_books.length > 0){
            res.render('genre_delete', { title: "Delete Genre", genre: results.genre, genre_books: results.genre_books});
            return;
        }
        else{
            // Genre has no associated books. Delete
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) return next(err)
                // success, redirect to genre list
                res.redirect('/catalog/genres');
            })
        }
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    Genre.findById(req.params.id).exec(function (err, genre) {
        if (err) return next(err);
        if (genre==null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_form',{title: "Updating Genre"});
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name', 'Genre must not be empty').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        // extract errors while validating above
        const errors = validationResult(req);
        let updatedGenre = new Genre({
            name: req.body.name,
            _id: req.params.id // this field is required to be the same as the existing obj in the database
        });
        if (!errors.isEmpty()){
            // errors spotted while validating
            Genre.findById(req.params.id).exec(function (err, genre) {
                if (err) return next(err);
                if (genre==null){
                    var err = new Error('Genre not found');
                    err.status = 404;
                    return next(err);
                }
                res.render('genre_form',{title: "Updating Genre", genre: updatedGenre, errors: errors.array()});
            });
        }
        else{
            Genre.findByIdAndUpdate(req.params.id, updatedGenre, {}, function(err, genre) {
                if (err) return next(err);
                // success, redirect back to the detail page of that genre
                res.redirect(genre.url);
            })
        }
    }
];
