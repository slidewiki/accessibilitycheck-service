/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

module.exports = function(server) {
  //Get slide with id id from database and return it (when not available, return NOT FOUND). Validate id
  server.route({
    method: 'POST',
    path: '/check',
    handler: handlers.checkSlide,
    config: {
      validate: {
        payload: Joi.object().keys({
          title: Joi.string(),
          slide: Joi.string(),
          body: Joi.string(),
          user_id: Joi.string().alphanum().lowercase(),
          root_deck_id: Joi.string().alphanum().lowercase(),
          parent_deck_id: Joi.string().alphanum().lowercase(),
          no_new_revision: Joi.boolean(),
          position: Joi.number().integer().min(0),
          language: Joi.string()
        }).requiredKeys('title', 'body'),
      },
      tags: ['api'],
      description: 'Check a slide for accessibility errors'
    }
  });

};
