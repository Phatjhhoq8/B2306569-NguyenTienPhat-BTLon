const getBetterMin = (current, next, fallback = 0) => {
  if (current === undefined || current === null) {
    return next === undefined || next === null ? fallback : next;
  }
  const nextValue = next === undefined || next === null ? fallback : next;
  return Math.min(current, nextValue);
};

const mergePlans = (plans) => {
  if (!plans.length) return null;

  const effectivePlan = plans.reduce((best, planDoc) => {
    const plan = planDoc.toObject ? planDoc.toObject() : planDoc;
    return {
      ...best,
      tenGoi: best.tenGoi ? `${best.tenGoi} + ${plan.tenGoi}` : plan.tenGoi,
      soSachToiDa: Math.max(best.soSachToiDa || 0, plan.soSachToiDa || 0),
      soNgayMuonToiDa: Math.max(best.soNgayMuonToiDa || 0, plan.soNgayMuonToiDa || 0),
      mienTienCoc: Boolean(best.mienTienCoc || plan.mienTienCoc),
      choPhepGiaHanOnline: Boolean(best.choPhepGiaHanOnline || plan.choPhepGiaHanOnline),
      quayNhanUuTien: Boolean(best.quayNhanUuTien || plan.quayNhanUuTien),
      chiaSeNhomGiaDinh: Boolean(best.chiaSeNhomGiaDinh || plan.chiaSeNhomGiaDinh),
      docEbookKhongGioiHan: Boolean(best.docEbookKhongGioiHan || plan.docEbookKhongGioiHan),
      giaoSachTanNha: Boolean(best.giaoSachTanNha || plan.giaoSachTanNha),
      workshopDocQuyen: Boolean(best.workshopDocQuyen || plan.workshopDocQuyen),
      phiMuonSachGiay: getBetterMin(best.phiMuonSachGiay, plan.phiMuonSachGiay, 0),
      phiPhatTreHan: getBetterMin(best.phiPhatTreHan, plan.phiPhatTreHan, 5000),
      tienDatCoc: getBetterMin(best.tienDatCoc, plan.tienDatCoc, 0)
    };
  }, {});

  if (effectivePlan.mienTienCoc) {
    effectivePlan.tienDatCoc = 0;
  }

  return effectivePlan;
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

const getEffectiveMembershipPlan = async (readerId, options = {}) => {
  const subscriptions = await getActiveSubscriptions(readerId, options);
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
  
  return mergePlans(plans);
};

module.exports = {
  getActiveSubscriptions,
  getEffectiveMembershipPlan,
  mergePlans
};
