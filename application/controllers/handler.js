/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/
/* eslint promise/always-return: "off" */

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
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

      var slide_id = input.payload.slide_id;
      var settings = [];
      settings = input.payload.settings;
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

           if (settings.indexOf('heading')!=-1){
             var res = dom.window.document.querySelector("h3").textContent;
             var has_h3 = {type: "h3",
                          result: (res && res.length>1) ? "pass" : "fail",
                          description: (res && res.length>1) ? "Slide heading found" : "No slide heading found",
                          instructions: (res && res.length>1) ? "" : "Please add an h3 title. Use the add new text box button and format it as h3 using the styles panel",
                          more_info: "https://www.w3.org/TR/WCAG20-TECHS/G130.html"
                          };
             results.push(has_h3);
           }
//*-------------------------------------------END OF IMG TAG-----------------------------------

//*-----------------------------------------------IMG TAG-----------------------------------
          if (settings.indexOf('img_alt')!=-1){
               //count number of img tags
               var images_found = dom.window.document.getElementsByTagName("img").length;

               if (images_found!=0){
                 for (var counter=0; counter<images_found; counter++){
                     var element_id = dom.window.document.querySelectorAll("img")[counter].id;
                     var res = (dom.window.document.querySelectorAll("img")[counter].alt);
                     var has_alt = {type: "image",
                                  element_id: element_id,
                                  result: (res && res!=" " && res!="image") ? "pass" : "fail",
                                  description: (res && res!=" " && res!="image") ? "This image has an alt text" : "This image does not have an alt text or the text is incorrect",
                                  instructions: (res && res!=" " && res!="image") ? "" : "Please provide an alt text by double clicking the image",
                                  more_info: "https://www.w3.org/TR/WCAG20-TECHS/G95.html"
                                };
                     results.push(has_alt);
                 }
               }
            }
//*-------------------------------------------END OF IMG TAG-----------------------------------

//*-----------------------------------------------Table TAG-----------------------------------
          if (settings.indexOf('table')!=-1){
             //count number of table tags
             var tables_found = dom.window.document.getElementsByTagName("table").length;
             if (tables_found!=0){
                 var res = (dom.window.document.querySelectorAll("thead").length);
                // var element_id = dom.window.document.getElementsByTagName("table")[0].id;
                 var has_headings = {type: "table",
                            //  element_id: element_id,
                              result: (res=== tables_found) ? "pass" : "fail",
                              description: (res=== tables_found) ? "All tables have headings" : "One or more tables does not have defined headings",
                              instructions: (res=== tables_found) ? "" : "Please use the table settings to choose which row/column is a heading",
                              more_info: "https://www.w3.org/TR/WCAG20-TECHS/H43.html"
                            };
                 results.push(has_headings);

              }
          }
//*-------------------------------------------END OF TABLE TAG-----------------------------------



//*-----------------------------------------------DIV TAG-----------------------------------

          if (settings.indexOf('paragraph')!=-1){
            // count div elements
            var div_found = dom.window.document.getElementsByTagName("div").length;
            if (div_found!=0){
              for (var counter=0; counter<div_found; counter++){
                  var element_id = dom.window.document.querySelectorAll("div")[counter].id;
                  var getStyle = dom.window.document.querySelectorAll("div")[counter].style['text-align'];
                  var res = (getStyle.indexOf('justify')===-1);
                  var is_justified = {type: "div",
                               element_id: element_id,
                               result: (res) ? "pass" : "fail",
                               description: (res) ? "This text is not justified" : "This text is justified",
                               instructions: (res) ? "" : "Please change the text alignment using the styles panel",
                               more_info: "https://www.w3.org/TR/WCAG20-TECHS/G169.html"
                             };
                  results.push(is_justified);
              }
            }
          }

//*-------------------------------------------END OF DIV TAG-----------------------------------

//*-----------------------------------------------iFRAME TAG-----------------------------------

          if (settings.indexOf('iframe')!=-1){
            // count p elements
            var iframes_found = dom.window.document.getElementsByTagName("iframe").length;

            if (iframes_found!=0){
              for (var counter=0; counter<iframes_found; counter++){
                  var element_id = dom.window.document.querySelectorAll("iframe")[counter].id;
                  var res = dom.window.document.querySelectorAll("iframe")[counter].title;
                  var has_title = {type: "iframe",
                               element_id: element_id,
                               result: (res) ? "pass" : "fail",
                               description: (res) ? "This iframe has a title" : "This iframe does not have a title",
                               instructions: (res) ? "" : "Please provide a title using the iframe settings",
                               more_info: "https://www.w3.org/TR/WCAG20-TECHS/H64.html"
                             };

                  results.push(has_title);
              }
            }
          }

//*-------------------------------------------END OF iFRAME TAG-----------------------------------

      //return results as a JSON object
      reply(results);

      });

  },


};
