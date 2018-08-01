/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/
/* eslint promise/always-return: "off" */

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
slideDB = require('../database/slideDatabase'), //Database functions specific for slides
co = require('../common');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var EventEmitter = require("events").EventEmitter;

module.exports = {

  //Check a slide for accessibility errors
  checkSlide: function(input, reply) {
      var getSlide = new EventEmitter();
      var html;

      var slide_id = input.payload.slide;
      //694700-5
      //757435-2 ->Testing slide
      request('https://deckservice.slidewiki.org/slide/'+slide_id, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        getSlide.data = body.revisions[0].content;
        getSlide.emit('received');

      });

      getSlide.on('received', function () {
         html = getSlide.data;
         var res = [];
         var image = [];
         const dom = new JSDOM('<!DOCTYPE html><html><head><title>titleTest</title></head><body>'+html+'</body></html>');

         //array for storing the accessibility check results
          var results = [];

//*-----------------------------------------------H3 TAG-----------------------------------

           var has_h3 = {type: "h3", result: (dom.window.document.querySelector("h3").textContent) ? "has h3" : "no h3"};
           results.push(has_h3);
//*-------------------------------------------END OF IMG TAG-----------------------------------

//*-----------------------------------------------IMG TAG-----------------------------------
           //count number of img tags
           var images_found = dom.window.document.getElementsByTagName("img").length;

           if (images_found!=0){
             for (var counter=0; counter<images_found; counter++){
                 var id = dom.window.document.querySelectorAll("img")[counter].id;
                 var has_alt = (dom.window.document.querySelectorAll("img")[counter].alt) ? "has alt" : "no alt";
                 var image = {type: "image", id : id, result: has_alt};

                 results.push(image);
             }
           }
//*-------------------------------------------END OF IMG TAG-----------------------------------

//*-----------------------------------------------Table TAG-----------------------------------

//*-------------------------------------------END OF TABLE TAG-----------------------------------

           reply(results);

      });

  },










};
