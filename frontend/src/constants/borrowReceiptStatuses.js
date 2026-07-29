export const BORROW_RECEIPT_STATUSES = [
  { label: 'Sẵn sàng', value: 'SAN_SANG', className: 'bg-amber-100 text-amber-700' },
  { label: 'Đang mượn', value: 'DANG_MUON', className: 'bg-primary-light text-primary-dark' },
  { label: 'Đã trả sách', value: 'DA_TRA', className: 'bg-green-100 text-green-700' },
  { label: 'Quá hạn', value: 'QUA_HAN', className: 'bg-red-100 text-red-700' },
  { label: 'Đã hủy', value: 'HUY', className: 'bg-red-50 text-red-400' },
];

export const BORROW_RECEIPT_STATUS_FILTERS = [
  { label: 'Tất cả', value: '' },
  ...BORROW_RECEIPT_STATUSES.map(({ label, value }) => ({ label, value })),
];

export const getBorrowReceiptStatus = (status) => {
  return BORROW_RECEIPT_STATUSES.find(item => item.value === status);
};

export const getBorrowReceiptStatusLabel = (status) => {
  return getBorrowReceiptStatus(status)?.label || status;
};

export const getBorrowReceiptStatusClass = (status) => {
  return getBorrowReceiptStatus(status)?.className || 'bg-slate-100 text-slate-700';
};
