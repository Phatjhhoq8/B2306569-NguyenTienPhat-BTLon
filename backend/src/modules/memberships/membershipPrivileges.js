const toPlainPlan = (planDoc) => (planDoc && planDoc.toObject ? planDoc.toObject() : planDoc);

const getPlanRank = (planDoc) => {
  const plan = toPlainPlan(planDoc) || {};
  return [
    Number(plan.giaTien) || 0,
    Number(plan.soSachToiDa) || 0,
    Number(plan.soNgayMuonToiDa) || 0,
    plan.mienTienCoc ? 1 : 0,
    plan.choPhepGiaHanOnline ? 1 : 0
  ];
};

const comparePlanRank = (left, right) => {
  const leftRank = getPlanRank(left);
  const rightRank = getPlanRank(right);
  for (let index = 0; index < leftRank.length; index++) {
    if (leftRank[index] !== rightRank[index]) return leftRank[index] - rightRank[index];
  }
  return 0;
};

const getBestPlan = (plans) => {
  if (!plans.length) return null;
  const bestPlan = [...plans].sort((a, b) => comparePlanRank(b, a))[0];
  const plainPlan = toPlainPlan(bestPlan);
  return plainPlan && plainPlan.mienTienCoc ? { ...plainPlan, tienDatCoc: 0 } : plainPlan;
};

const getActiveSubscriptions = async (readerId, options = {}) => {
  const Subscription = require('./subscription.model');
  const now = options.now || new Date();
  let query = Subscription.find({
    docGia: readerId,
    trangThai: 'DANG_HIEU_LUC',
    ngayBatDau: { $lte: now },
    ngayKetThuc: { $gte: now }
  }).populate('goiDocGia');

  if (options.session) {
    query = query.session(options.session);
  }

  return query;
};

const getActiveAndSharedSubscriptions = async (readerId, options = {}) => {
  const Subscription = require('./subscription.model');
  const now = options.now || new Date();
  let query = Subscription.find({
    $or: [
      { docGia: readerId },
      { nguoiDuocMoi: readerId }
    ],
    trangThai: 'DANG_HIEU_LUC',
    ngayBatDau: { $lte: now },
    ngayKetThuc: { $gte: now }
  }).populate('goiDocGia');

  if (options.session) {
    query = query.session(options.session);
  }

  return query;
};

const getEffectiveMembershipPlan = async (readerId, options = {}) => {
  const subscriptions = await getActiveAndSharedSubscriptions(readerId, options);
  let plans = subscriptions.map((sub) => sub.goiDocGia).filter(Boolean);
  
  if (plans.length === 0) {
    const MembershipPlan = require('./membershipPlan.model');
    let query = MembershipPlan.findOne({ tenGoi: 'Tiêu chuẩn' });
    if (options.session) {
      query = query.session(options.session);
    }
    const standardPlan = await query;
    if (standardPlan) {
      plans = [standardPlan];
    }
  }
  
  return getBestPlan(plans);
};

module.exports = {
  getActiveSubscriptions,
  getActiveAndSharedSubscriptions,
  getEffectiveMembershipPlan,
  getBestPlan,
  comparePlanRank,
  mergePlans: getBestPlan
};
