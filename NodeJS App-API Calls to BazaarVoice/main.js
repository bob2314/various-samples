/* @namespace bazaarVoice */
define(function (require) {

    "use strict";


    /* list of require dependencies */
    var merlinBase = require('core/main'),
        bvMessages = require('i18n!components/form/nls/bazaarVoiceMessages'),
        customMessages = require('i18n!components/form/nls/customMessages'),
        mConfig = require('components/merlinConfig/main'),
        $ = require('jquery');

    require('jquery.xdomain');

    /**
     * BazaarVoice API calls and settings.  This module is used as a component by other BazaarVoice module to make API calls
     * and set parameters based on the type of API call.  User data is passed in and returned to modules for use.
     * @module bazaarVoice
     * @version 1.0
     * @requires components/form/nls/bazaarVoiceMessages
     * @requires jquery
     * @returns Modified module
     */
    return (function (module) {


        module.setName("bazaarVoice");

        /**
         * Defines API pass key depending on environment
         * @name passKey
         * @private
         * @method
         * @memberof! module:bazaarVoice#
         */
        function passKey(){
            var currentEnviron = $('#curEnviron').val() || window.environment;
            return currentEnviron === 'prod' ? "mkbygmrp4j03p454nek0ppqhx" : "jxqk9kzr5vqtcznceckse7ev";
        }

        function randomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i){
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            }
            return result;
        }


        /**
         * Sets BV object for setSubmitParameters API call.
         * @name setSubmitParameters
         * @public
         * @method
         * @param {object} bvObj Data object to set user information
         * @memberof! module:bazaarVoice#
         */
        module.setSubmitParameters = function (bvObj) {


            var rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

            var userLocation = null;

            if(bvObj.bvUserCity && bvObj.bvUserState){
                userLocation = bvObj.bvUserCity + ", " + bvObj.bvUserState;
            }

            return {
                Action: "submit",
                Passkey: passKey(),
                ProductId: $('.product-id').val() || window.digitalData.product.productInfo.productID,
                UserId: bvObj.bvUserId,
                UserNickname: bvObj.bvUserName,
                IsRecommended: bvObj.bvRecommend,
                //Locale:$('html').attr('lang'),
                Rating: bvObj.bvRating,
                Title: bvObj.bvTitle,
                ReviewText: bvObj.bvReview,
                UserEmail: bvObj.bvUserEmail,
                SendEmailAlertWhenPublished: bvObj.bvUserNotification,
                UserLocation: userLocation,
                ApiVersion:"5.4"
            };
        };

        /**
         * Sets BV object for setGetReviewsParameters API call.
         * This may be updated to look at local database to minimize API calls
         * @name setGetReviewsParameters
         * @public
         * @method
         * @param {string} productID Current product ID in which review will represent
         * @param {integer} limit [Default:10]<br>Number of reviews per API call
         * @param {integer} offset [Default:0]<br>Initial start of iteration
         * @memberof! module:bazaarVoice#
         */
        module.setGetReviewsParameters = function (productID,limit,offset) {

            var obj = {};
            obj.ApiVersion = "5.4";
            obj.PassKey = passKey();
            obj.Stats = "Reviews";

            if(limit){
                obj.Limit = limit || 99;
            }

            if(offset){
                obj.Offset = offset || 0;
            }

            obj.Include = "Products";
            obj.Filter = "ProductId:"+productID;

            return obj;
        };

        /**
         * Sets BV object for setHelpfulnessParameters API call
         * @name setHelpfulnessParameters
         * @public
         * @method
         * @param {object} obj Data parameters to pass in call
         * @memberof! module:bazaarVoice#
         */
        module.setHelpfulnessParameters = function (obj) {

            var rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

            return {
                ApiVersion:"5.4",
                ContentType:"review",
                ContentId:obj.id,
                UserId:$("#bvUid").val() || rString,
                FeedbackType:obj.type,
                ReasonText:obj.reason || "",
                Vote:obj.vote || "",
                PassKey: passKey()
            };
        };

        /**
         * Handles all API calls made to BazaarVoice.
         * API call based off of parameters and URL by environment
         * @name callBV
         * @public
         * @method
         * @param {string} path URL path to call
         * @param {object} obj Data parameters to pass in call
         * @param {function} handler Response handler
         * @param {string} type [Default:"GET"]<br>Type of API call
         * @memberof! module:bazaarVoice#
         */
        module.callATG = function (path, obj, handler, type) {
            console.log("BV Calling Reviews....",mConfig.rest.bazaarvoice+path,obj);
            var dataType = 'jsonp';
            if(type==="POST" || type === "post"){
                dataType = 'json';
            }
            $.ajax({
                url: mConfig.rest.bazaarvoice+path,
                data: obj,
                dataType:dataType,
                success: function (data) {

                    console.log("bv (ATG) Response Data", data);

                    if (handler) {
                        handler(data);
                    }

                },
                error : function(re,error, thrown){
                    window.bv = thrown;
                    console.log("BV Get Reviews ERROR!!!!",error,JSON.stringify(thrown));
                },
                type: type || "GET"
            });
        };

        /**
         * Handles all API calls made to BazaarVoice.
         * API call based off of parameters and URL by environment
         * @name callBV
         * @public
         * @method
         * @param {string} path URL path to call
         * @param {object} obj Data parameters to pass in call
         * @param {function} handler Response handler
         * @param {string} type [Default:"GET"]<br>Type of API call
         * @memberof! module:bazaarVoice#
         */
        module.callBV = function (path, obj, handler, type) {

            var urlPath = "http://"+url()+".bazaarvoice.com/"+path;

            $.support.cors = true;

            if($('html').hasClass('ie version9') && window.XDomainRequest && type.toLowerCase() === 'post') {

                var params = $.param(obj);

                var xdr = new window.XDomainRequest();
                xdr.open('POST', urlPath+"?"+params);
                xdr.onload = function(data) {
                    var jsonData = $.parseJSON(xdr.responseText);

                    if(jsonData === null || typeof(jsonData) === 'undefined') {
                        jsonData = $.parseJSON(data.firstChild.textContent);
                    }

                    console.log("BV IE Response ",JSON.stringify(jsonData));

                    if (handler) {
                        handler(jsonData);
                    }
                };

                console.log('BV IE Call Parameters ', params);
                console.log('BV IE Call Url ', urlPath);
                xdr.send();


            } else {

                $.ajax({
                    url: urlPath,
                    data: obj,
                    success: function (data) {
                        console.log("bv Submit Data", obj);
                        console.log("bv Response Data", data);

                        if (handler) {
                            handler(data);
                        }

                    },
                    type: type || "GET"
                });
            }



        };

        /**
         * Get localization content
         * @name localization
         * @public
         * @method
         * @memberof! module:bazaarVoice#

         */
        module.localization = function(){
            bvMessages.customMessages = customMessages;
            return bvMessages;
        };

        /**
         * Defines API url parameter (ie. api or stg.api)
         * @name url
         * @private
         * @method
         * @example stg.api.bazaarvoice.com
         * @memberof! module:bazaarVoice#
         */
        function url(){
            var currentEnviron = $('#curEnviron').val() || window.environment;
            return currentEnviron === 'prod' ? "api" : "stg.api";
        }


        /**
         * Handles BazaarVoice cookie
         * @name BVCookie
         * @public
         * @method
         * @memberof! module:bazaarVoice#
         * @example bazaarVoice.BVCookie.set({}}
         * @example bazaarVoice.BVCookie.get();
         */
        module.BVCookie = (function(){

            return {
                set:function(obj){
                    $.cookie.json = true;
                    $.cookie('bvCookie', obj, { expires: 7 });
                },
                get:function(){
                    $.cookie.json = true;
                    var cookie;
                    if(!$.cookie('bvCookie')){
                        $.cookie('bvCookie', {}, { expires: 1 });
                        cookie = $.cookie('bvCookie');
                    } else {
                        cookie = $.cookie('bvCookie');
                    }

                    return cookie;

                }
            };
        })();


        return module;

    }(Object.create(merlinBase)));


});