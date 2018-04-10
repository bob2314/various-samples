/* @namespace bazaarVoice/reviewsBars */
define(function(require){
    "use strict";


    /* list of require dependencies */
    var $               =   require('jquery'),
        merlinBase      =   require('core/main'),
        events          =   require('events'),
        merlinTemplates =   require('components/templates/main'),
        bazaarVoice     =   require('bazaarVoice/main');

    /**
     * BazaarVoice review bar graph module
     * @module bazaarVoice/reviewsBars
     * @version 1.0
     * @requires merlinTemplates
     * @requires jquery
     * @requires bazaarVoice
     * @returns Modified module
     * @see {@link http://localhost:3000/modules/bazaarVoice/reviewsBars/reviewsBars.html|BazaarVoice Reviews Bar Graph}
     * @property {string} data-option-type - [Default:"static"]<br>This determines where the module will get its data.<br>"static" uses data attributes associated to each bar row.<br>"api" makes an API call to get the data and render the bar graph.
     * @property {string} data-option-product - Product's ID used within BazaarVoice to get the data
     */
    return (function(module){
        module.defaults = {
            type: "api",
            product : $('.product-id').val()
        };

        module.setName("bazaarVoice/reviewsBars");

        module.setup = function(){
            bindEvents.call(this);
        };

        /**
         * Calculates the highest number of reviews in to render that bar at 100% width.
         * @name getHigh
         * @private
         * @method
         * @param {array} array Array of star distributions
         * @memberof! module:bazaarVoice/reviewsBars#
         */
        function getHigh(array){
            var high = 0;

            for(var i=0;i<array.length;i++){
                if(high < array[i].Count) {
                    high = array[i].Count;
                }
            }

            return high;
        }

        /**
         * Within the API version of this modules, some distributions are not given if there are no reviews of that star count.  This adds to the distribution and sets it to 0 if it doesn't exist.
         * @name searchAndCreate
         * @private
         * @method
         * @param {array} array Array of star distributions
         * @param {integer} passIndex Current index of
         * @memberof! module:bazaarVoice/reviewsBars#
         */
        function searchAndCreate(array,passIndex){
            var obj = "";
            $(array.RatingDistribution).each(function(){

                if(this.RatingValue===passIndex){
                    obj=this;
                }
            });
            if(!obj){
                obj = {
                    Count:0,
                    RatingValue:passIndex
                };
            }
            return obj;
        }

        /**
         * Renders handlebar template
         * @name renderTemplate
         * @private
         * @method
         * @param {object} self Assigned element of the module
         * @param {object} data Data to pass to handlebars template
         * @param {string} templatePath Handlebars template namespace path
         * @memberof! module:bazaarVoice/reviewsBars#
         */
        function renderTemplate(self, data, templatePath){
            var template = merlinTemplates.getTemplate(templatePath),
                reviewsTemplate = template(data),
                parentContainer = $("tbody",self.elem);
            parentContainer.html(reviewsTemplate);
        }


        /**
         * Renders and animates bars to UI
         * @name renderBars
         * @private
         * @method
         * @param {array} progressBars Array of progress bars
         * @param {integer} highestReview Value of the largest distribution of stars
         * @memberof! module:bazaarVoice/reviewsBars#
         */
        function renderBars(progressBars,highestReview){
            progressBars.each(function(){

                var parent = $(this).parent('div'),
                    rangeTotal = parseInt(parent.data('slider'),10),
                    barWidth = (rangeTotal/highestReview)*100;

                $(this).animate({
                    width:barWidth+"%"
                },400);

            });
        }



        function bindEvents(){

            var self = this,
                ratingsGroups = {},
                progressBars = $('.range-slider-active-segment',self.elem),
                highestReview = 0;

            if(self.options.type === 'static'){
                var highArray = [];

                progressBars.each(function(){
                    highArray.push($(this).parent('div').data('slider'));
                });

                highestReview = Math.max.apply(Math, highArray);

                renderBars(progressBars,highestReview);

            } else if(self.options.type === 'api') {

                events.sub(events.bazaarVoice.reviews,function(response){

                    //$.validator.format(initData.bvMessages.labels.success, 48)



                    if(response.Includes.Products){
                        var objArray = response.Includes.Products[self.options.product].ReviewStatistics,
                            newArray = [];

                        for(var i=1; i<6; i++){
                            newArray.push(searchAndCreate(objArray,i));
                        }

                        newArray.reverse();

                        ratingsGroups.RatingDistribution = newArray;

                        renderTemplate(self, ratingsGroups, "bazaarVoice/reviewsBars/reviewsBars");

                        var highestReview = getHigh(newArray),
                            progressBars = $('.range-slider-active-segment',self.elem);

                        renderBars(progressBars,highestReview);


                        // Helpful review statistics
                        var messages = bazaarVoice.localization();
                        var helpfulCount = objArray.RecommendedCount;
                        var totalReviewCount = objArray.TotalReviewCount;
                        var helpfulPercent = ((helpfulCount / totalReviewCount) * 100).toFixed(0);
                        var helpfulCountMessage = $.validator.format(messages.labels.usersRecommended, helpfulCount, totalReviewCount, helpfulPercent);

                        console.log("Helpful review statistics",helpfulCount,totalReviewCount,helpfulPercent,helpfulCountMessage);

                        var helpfulCountContainer = $('<tr>')
                            .html(helpfulCountMessage)
                            .addClass('helpful-count');
                        $(self.elem).append(helpfulCountContainer);


                    } else {
                        renderTemplate(self, "", "bazaarVoice/reviewsBars/reviewsBarsEmpty");
                    }


                });
            }

        }



        return module;

    }(Object.create(merlinBase)));

});