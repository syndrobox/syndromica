import {
  generateUser,
  translate as t,
  resetSyndromicaDB,
} from '../../../../helpers/api-integration/v3';

describe('POST /coupons/enter/:code', () => {
  let user;
  let sudoUser;

  before(async () => {
    await resetSyndromicaDB();
  });

  beforeEach(async () => {
    user = await generateUser();
    sudoUser = await generateUser({
      'permissions.coupons': true,
    });
  });

  it('returns an error if code is missing', async () => {
    await expect(user.post('/coupons/enter')).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });

  it('returns an error if code is invalid', async () => {
    await expect(user.post('/coupons/enter/notValid')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidCoupon'),
    });
  });

  it('returns an error if coupon has been used', async () => {
    const [coupon] = await sudoUser.post('/coupons/generate/wondercon?count=1');
    await user.post(`/coupons/enter/${coupon._id}`); // use coupon

    await expect(user.post(`/coupons/enter/${coupon._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('couponUsed'),
    });
  });

  it('should apply the coupon to the user', async () => {
    const [coupon] = await sudoUser.post('/coupons/generate/wondercon?count=1');
    const userRes = await user.post(`/coupons/enter/${coupon._id}`);
    expect(userRes._id).to.equal(user._id);
    expect(userRes.items.gear.owned.eyewear_special_wondercon_red).to.be.true;
    expect(userRes.items.gear.owned.eyewear_special_wondercon_black).to.be.true;
    expect(userRes.items.gear.owned.back_special_wondercon_black).to.be.true;
    expect(userRes.items.gear.owned.back_special_wondercon_red).to.be.true;
    expect(userRes.items.gear.owned.body_special_wondercon_red).to.be.true;
    expect(userRes.items.gear.owned.body_special_wondercon_black).to.be.true;
    expect(userRes.items.gear.owned.body_special_wondercon_gold).to.be.true;
    expect(userRes.extra).to.eql({ signupEvent: 'wondercon' });
  });
});
