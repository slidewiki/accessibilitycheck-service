/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

module.exports = function(server) {
//Retrieve the slide id and the check settings
  server.route({
    method: 'POST',
    path: '/check',
    handler: handlers.checkSlide,
    config: {
      validate: {
        payload: Joi.object().keys({
          slide_id: Joi.string(),
          settings: Joi.array(),
        }).requiredKeys('slide_id', 'settings'),
      },
      tags: ['api'],
      description: 'Check a slide for accessibility errors'
    }
  });

};
