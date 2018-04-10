import React, { Component } from 'react';
import { Row } from 'react-foundation';
import { Field } from 'redux-form';
import { FormattedMessage, intlShape } from 'react-intl';
import { generateSelectOptionForYears } from '../../common/util/DateUtil';
import { normalizeCreditCard } from '../../common/util/CreditCardUtil';
import FormSelect from '../common/input/FormSelect';
import FormField from '../common/input/FormField';
import { MONTHS } from '../../application/config/constants';
import Tooltip from '../common/misc/Tooltip';
import helpIcon from '../common/input/assets/help-icon.png';

export class CreditCard extends Component {
  renderSecurityCodeTooltip() {
    const {
      intl: {
        formatMessage
      }
    } = this.props;

    return (
      <Tooltip
        className="tooltip--security-code"
        icon={helpIcon}
        formatMessage={formatMessage}
        iconAlt="creditCard_security_code_tooltip_icon_alt"
      >
        <div className="tooltip-content">
          <FormattedMessage id="creditCard_security_code_tooltip" />
        </div>
      </Tooltip>
    );
  }

  constrainSecurityCodeToFourNumbers(value = '') {
    return value.replace(/[^0-9]/g, '').slice(0, 4);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const years = generateSelectOptionForYears();
    const ccNumberLabel = formatMessage( { id: 'paymentMethod_ccNumber' });
    const ccMonthLabel = formatMessage( { id: 'paymentMethod_ccMonth' });
    const ccYearLabel = formatMessage( { id: 'paymentMethod_ccYear' });
    const ccSecurityCodeLabel = formatMessage({ id: 'paymentMethod_ccSecurity' });
    const ccNumberPlaceholder = formatMessage( { id: 'paymentMethod_ccNumberPlaceholder' });
    const ccMonthPlaceholder = formatMessage( { id: 'paymentMethod_ccMonthPlaceholder' });
    const ccYearPlaceholder = formatMessage( { id: 'paymentMethod_ccYearPlaceholder' });
    const ccSecurityCodePlaceholder = formatMessage({ id: 'paymentMethod_ccSecurityPlaceholder' });
    const ccNumberClass = (this.props.intl.sourceLocale === 'EN_GB') ? 'credit-card-number-uk' : 'credit-card-number';
    const wholeNumberInputType = 'tel';

    return (
     <div className="credit-card columns">
      <h2 id="credit-card-title" className="title">{formatMessage({ id: 'creditCard_title' })}</h2>
      <Row>
        <Field normalize={normalizeCreditCard} id="credit-card-number" className={ccNumberClass} name="credit-card-number" ariaLabel={ccNumberLabel}
          small={12} component={FormField} type="text" placeholder={ccNumberPlaceholder} maxLength={16}
          floatingPlaceholder={ccNumberLabel} customValue={this.props.mask} customFocus={this.props.customFocus}/>
      </Row>
      <Row>
        <Field
          id="credit-card-security-code"
          name="credit-card-security-code"
          ariaLabel={ccSecurityCodePlaceholder}
          medium={4}
          large={4}
          component={FormField}
          placeholder={ccSecurityCodeLabel}
          floatingPlaceholder={ccSecurityCodePlaceholder}
          type={wholeNumberInputType}
          maxLength="4"
          formattingFunction={this.constrainSecurityCodeToFourNumbers}
        >
          {this.renderSecurityCodeTooltip()}
        </Field>
        <Field
          id="credit-card-month"
          name="credit-card-month"
          ariaLabel={ccMonthLabel}
          medium={4}
          large={4}
          component={FormSelect}
          options={MONTHS}
          defaultValue={ccMonthPlaceholder}
          floatingPlaceholder={ccMonthLabel}
        />
        <Field
          id="credit-card-year"
          name="credit-card-year"
          ariaLabel={ccYearLabel}
          medium={4}
          large={4}
          component={FormSelect}
          options={years}
          defaultValue={ccYearPlaceholder}
          floatingPlaceholder={ccYearLabel}
        />
      </Row>
    </div>
    );
  }
}

CreditCard.propTypes = {
  intl: intlShape.isRequired
};

export default CreditCard;
