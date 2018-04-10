import React from 'react';
import { CreditCard } from '../CreditCard';
import { EN_US } from '../../../application/config/localization/en_us';
import { INTL_TEST_HELPER } from '../../../application/config/constants';
import { reduxForm } from 'redux-form';
import renderer from 'react-test-renderer';
import { createComponentWithIntl, composeForm } from '../../../common/util/TestUtil';

const DecoratedCreditCard = reduxForm({form: 'testForm'})(CreditCard);

describe('<CreditCard />', () => {

  it('should render', () => {
    const tree = renderer.create(createComponentWithIntl(
      composeForm(<DecoratedCreditCard intl={INTL_TEST_HELPER} internationalize={{messages: EN_US.localizationText}} />)
    )).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
