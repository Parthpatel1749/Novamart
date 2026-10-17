export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ORDER_STATUS_FLOW = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const getOrderStatusInfo = (status) => {
  switch (status) {
    case 'PLACED':
      return { label: 'Order Placed', badgeClass: 'badge-info', step: 0 };
    case 'CONFIRMED':
      return { label: 'Order Confirmed', badgeClass: 'badge-info', step: 1 };
    case 'PROCESSING':
      return { label: 'Processing at Hub', badgeClass: 'badge-purple', step: 2 };
    case 'PACKED':
      return { label: 'Order Packed', badgeClass: 'badge-purple', step: 3 };
    case 'ASSIGNED':
      return { label: 'Delivery Partner Assigned', badgeClass: 'badge-warning', step: 4 };
    case 'PICKED_UP':
      return { label: 'Picked Up by Rider', badgeClass: 'badge-warning', step: 5 };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', badgeClass: 'badge-warning', step: 6 };
    case 'DELIVERED':
      return { label: 'Delivered', badgeClass: 'badge-success', step: 7 };
    case 'CANCELLED':
      return { label: 'Cancelled', badgeClass: 'badge-danger', step: -1 };
    case 'RETURN_REQUESTED':
      return { label: 'Return Requested', badgeClass: 'badge-warning', step: -1 };
    case 'RETURNED':
      return { label: 'Returned', badgeClass: 'badge-purple', step: -1 };
    case 'REFUND_INITIATED':
      return { label: 'Refund Initiated', badgeClass: 'badge-info', step: -1 };
    case 'REFUNDED':
      return { label: 'Refund Completed', badgeClass: 'badge-success', step: -1 };
    case 'DELIVERY_FAILED':
      return { label: 'Delivery Attempt Failed', badgeClass: 'badge-danger', step: -1 };
    default:
      return { label: status || 'Pending', badgeClass: 'badge-info', step: 0 };
  }
};
