export const ROLE_LABELS_AR = {
  SUPERVISOR: "مشرف",
  CONFIRMER: "مؤكد",
  DRIVER: "سائق",
};

// Define this in your constants file
export type OrderStatusKey = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'POSTPONED' 
  | 'CANCELLED' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'RETURNED' 
  | 'EXCHANGED';

export const ORDER_STATUS_LABELS_AR: Record<OrderStatusKey, string> = {
  PENDING: "معلقة",
  CONFIRMED: "مؤكدة",
  POSTPONED: "مؤجلة",
  CANCELLED: "ملغية",
  OUT_FOR_DELIVERY: "في الطريق للتسليم",
  DELIVERED: "تم التسليم",
  RETURNED: "تم الاسترجاع",
  EXCHANGED: "تم التبديل",
};