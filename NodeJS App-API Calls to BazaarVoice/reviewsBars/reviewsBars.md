#BazaarVoice: Reviews Bars
***


API Version
-----

    <table class="overall"
             data-module="bazaarVoice/reviewsBars"
             data-option-reviews="${dspTotalReviews}"
             data-option-product="<dsp:valueof param='productId' />">
          <tbody>
          <tr>
              <td class="icon icon-spinner icon-spin"></td>
          </tr>
          </tbody>
      </table>


#Static Version
-----

    <table class="overall"
         data-module="bazaarVoice/reviewsBars"
         data-option-reviews="${dspTotalReviews}"
         data-option-type="static"
         data-option-product="<dsp:valueof param='productId' />">
      <tbody>
          <tr>
              <td class="stars">5 star</td>
              <td class="range">
                  <div class="range-slider disabled" data-slider="<dsp:valueof param='stars[4]'/>">
                      <span class="range-slider-active-segment"></span>
                  </div>
              </td>
              <td class="total"><dsp:valueof param='stars[4]'/></td>
          </tr>
          <tr>
              <td class="stars">4 star</td>
              <td class="range">
                  <div class="range-slider disabled" data-slider="<dsp:valueof param='stars[3]'/>">
                      <span class="range-slider-active-segment"></span>
                  </div>
              </td>
              <td class="total"><dsp:valueof param='stars[3]'/></td>
          </tr>
          <tr>
              <td class="stars">3 star</td>
              <td class="range">
                  <div class="range-slider disabled" data-slider="<dsp:valueof param='stars[2]'/>">
                      <span class="range-slider-active-segment"></span>
                  </div>
              </td>
              <td class="total"><dsp:valueof param='stars[4]'/></td>
          </tr>
          <tr>
              <td class="stars">2 star</td>
              <td class="range">
                  <div class="range-slider disabled" data-slider="<dsp:valueof param='stars[1]'/>">
                      <span class="range-slider-active-segment"></span>
                  </div>
              </td>
              <td class="total"><dsp:valueof param='stars[1]'/></td>
          </tr>
          <tr>
              <td class="stars">1 star</td>
              <td class="range">
                  <div class="range-slider disabled" data-slider="<dsp:valueof param='stars[0]'/>">
                      <span class="range-slider-active-segment"></span>
                  </div>
              </td>
              <td class="total"><dsp:valueof param='stars[0]'/></td>
          </tr>

      </tbody>
  </table>