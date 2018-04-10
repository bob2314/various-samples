/* @namespace bazaarVoice/reviewsStars */
define(function(require){

  "use strict";


    /* list of require dependencies */
  var merlinBase      = require('core/main'),
    bazaarVoice     = require('bazaarVoice/main'),
    events          = require('events'),
    $               = require('jquery'),
    isMobile        = require('components/isMobile/main'),
    messages        = require('i18n!components/language/nls/messages');

  /**
   * BazaarVoice review stars module
   * @module bazaarVoice/reviewsStars
   * @version 1.0
   * @requires jquery
   * @returns Modified module
   * @see {@link http://localhost:3000/modules/bazaarVoice/reviewsStars/stars.html|BazaarVoice Review Stars}
   * @property {integer} starCount - [Default:5]<br>Defines how many stars.  Should not extend past 5
   * @property {integer} rating - [Default:0]<br>Default Overall Rating for product. Used with stats
   * @property {integer} reviews - [Default:0]<br>Default number of reviews.  Used with reviewstats
   * @property {boolean} stats - [Default:false]<br>Shows review stats included average rating
   * @property {boolean} reviewstats - [Default:false]<br>Shows review count
   * @property {string} mode - [Default:"read"]<br>Defines if the stars can be altered on click. Used for submitting a review.
   *
   */
  return (function(module){

    /** Module Defaults **/
    module.defaults = {
      product : $('.product-id').val(),
      starCount : 5,
      rating : 0,
      reviews : 0,
      stats : false,
      reviewstats : false,
      mode : "read",
      type : "api"
    };


    module.setName("bazaarVoice/stars");

    /** Module Variables **/

    /** Module Public Methods **/
      /* @constructor */
    module.setup = function(){

      var self = this,
        rating = parseInt(self.options.rating,10),
        reviews = self.options.reviews,
        count = self.options.starCount,
        parent = document.createElement('ul');



      parent.className = "rating";
      $(self.elem).html(parent);

      if(self.options.type === 'api'){

        events.sub(events.bazaarVoice.reviews,function(response){
          if(!response.Includes.Products) {
            return;
          }

          var productData = response.Includes.Products[self.options.product];

          rating = productData.ReviewStatistics.AverageOverallRating;
          reviews = productData.ReviewStatistics.TotalReviewCount;

          createStars( $(parent) , count, rating);
          build.call(self,parent,rating,reviews);
          bindEvents.call(self);
        });

        return;
      }

      createStars(parent, count, rating);
      build.call(self,parent,rating,reviews);
      bindEvents.call(this);
    };

    function build(parent,rating,reviews){
      var self = this;
      if(self.options.stats  && rating){

        var avgRate = rating.toFixed(2);
        if(avgRate.split('.')[1]==="00"){
          avgRate = rating.toFixed(0);
        }

        $(parent).append(
          $(document.createElement('li'))
            .addClass("review-count")
            .html(avgRate+" "+messages.bazzarVoice.of+" "+self.options.starCount+" ("+reviews+" "+messages.bazzarVoice.reviews+")")
        );
      }

      if(self.options.reviewstats){

        if(typeof reviews === 'undefined'){
          reviews = 0;
        }

        $(parent).append(
          $(document.createElement('li'))
            .addClass("review-count")
            .html(reviews+" "+messages.bazzarVoice.reviews)
        );
      }
    }

    /**
     * Creates the stars, rendering gray or active stars
     * @name createStars
     * @private
     * @method
     * @memberof! module:bazaarVoice/reviewsStars#
     * @param {element} el Parent element that stars build into
     * @param {integer} count Number of stars to create
     * @param {integer} rating Average Rating to determine number of stars to be active
     */
    function createStars(el,count,rating){
      for(var i=0;i<count;i++){
        var stars = document.createElement('li');

        $(el).append(stars);
      }

      activeStars($('li',el), rating);
    }

    /**
     * Determines which stars are active
     * @name activeStars
     * @private
     * @method
     * @memberof! module:bazaarVoice/reviewsStars#
     * @param {integer} stars Number of stars to create
     * @param {integer} rating Average Rating to determine number of stars to be active
     */
    function activeStars(stars, rating){
      // takes in decimals that have to be rounded
      var ratingDecimal = (Math.round(rating * 2) / 2).toFixed(1).split(".")[1],
        floorRating = Math.floor(rating);

      for(var i=0;i<floorRating;i++){
        $(stars[i]).addClass('active');
      }

      if(ratingDecimal !== "0"){
        $(stars[floorRating]).addClass('semi-active');
      }
    }

    /**
     * In write mode, this method handles the empty value of no stars are selected
     * @name starError
     * @private
     * @method
     * @memberof! module:bazaarVoice/reviewsStars#
     * @param {element} parent Passes the stars parent
     */
    function starError(parent){
      var bvMessages = bazaarVoice.localization(),
        errorField = $(document.createElement('div'))
          .addClass('bv-error-text bvRatingError')
          .html(bvMessages.errorMessages.stars);

      $('.bvRatingError').remove();

      if(!$('#bvRatingSubmission').val()){
        parent.after(errorField);
      } else {
        $('.bvRatingError').remove();
      }
    }

    /** Module Private / Instance / Static Methods **/

      /*  @this Module Instance
       *   @private
       * */
    function bindEvents(){

      var self = this,
        parent = $('ul.rating', self.elem),
        stars = $('li', parent),
        input = document.createElement('input'),
        rating = self.options.rating;

      input.id = "bvRatingSubmission";
      input.type = "text";
      input.name = "bvRatingSubmission";
      input.style.display = "none";

      if(self.options.mode === "write"){

        $(input).attr("value", rating || "");
        parent.append(input);


        $(document).on("click",'.bvVerify',function(){
          starError(parent);

          stars.on("click",function(){
            starError(parent);
          });

        });

        stars.each(function(index){

          $(this).on("click",function(){

            stars.removeClass('active');

            $(this).addClass('active');

            for(var i=0;i<index;i++){
              $(stars[i]).addClass('active');
            }

            // Set input value
            $(input).attr("value",index+1);

          });



        });

      }
      console.log("reviewStars self",self.elem.tagName);
      if( (self.elem.tagName).toLowerCase() === "a"){
        console.log("reviewStars clickable");
        $(self.elem).on("click",function(event){
          event.preventDefault();
          var offset = 65;
          if(!isMobile.check()){
            offset = 100;
          }
          $('html, body').animate({
            scrollTop: $("#ratings-reviews").offset().top - offset
          }, 600);
        });
      }


    }/* bindEvents */

    return module;

  }(Object.create(merlinBase)));


});