export type ShipmentStatus = 'In Transit' | 'Delivered' | 'Pending' | 'Delayed' | 'Cancelled' | 'Out for Delivery';

export interface Shipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  lastUpdatedLocation: string;
  remarks: string;
  lastUpdatedDate: string;
  estimatedDeliveryDate: string;
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  status: ShipmentStatus;
  location: string;
  remarks: string;
  timestamp: string;
}
