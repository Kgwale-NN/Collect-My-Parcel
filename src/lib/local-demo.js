import { appParams } from '@/lib/app-params';

export const isLocalDemo = () => {
  if (typeof window === 'undefined') return false;
  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return isLocalHost && !appParams.appBaseUrl;
};

export const demoUser = {
  id: 'demo-customer',
  full_name: 'Demo Customer',
  email: 'customer@collectmyparcel.demo',
  phone: '+27 82 000 0000',
  role: 'customer',
};

export const demoDriver = {
  id: 'demo-driver',
  full_name: 'Demo Driver',
  email: 'driver@collectmyparcel.demo',
  phone: '+27 82 111 1111',
  role: 'driver',
  driver_status: 'approved',
  is_available: true,
  rating: 4.9,
};

const PARCELS_KEY = 'cmp_demo_parcels';
const USER_KEY = 'cmp_demo_user';

const seedParcels = [
  {
    id: 'CMP-DEMO-1001',
    store_name: 'Takealot Pickup Point',
    tracking_number: 'TKL-DEMO-1001',
    pickup_address: 'Sandton City, Johannesburg',
    pickup_lat: -26.1087,
    pickup_lng: 28.0567,
    delivery_address: 'Rosebank, Johannesburg',
    delivery_lat: -26.1467,
    delivery_lng: 28.0436,
    customer_name: demoUser.full_name,
    customer_email: demoUser.email,
    customer_phone: demoUser.phone,
    driver_name: demoDriver.full_name,
    driver_email: demoDriver.email,
    driver_phone: demoDriver.phone,
    status: 'in_transit',
    price: 156,
    currency: 'ZAR',
    payment_method: 'cash',
    payment_status: 'pending',
    distance_km: 6,
    driver_lat: -26.128,
    driver_lng: 28.0505,
    driver_last_seen: new Date().toISOString(),
    created_date: new Date().toISOString(),
  },
  {
    id: 'CMP-DEMO-1002',
    store_name: 'Courier Depot',
    tracking_number: 'DEPOT-2048',
    pickup_address: 'Midrand Depot',
    delivery_address: 'Fourways, Johannesburg',
    customer_name: demoUser.full_name,
    customer_email: demoUser.email,
    status: 'requested',
    price: 112,
    currency: 'ZAR',
    payment_method: 'card',
    payment_status: 'paid',
    created_date: new Date(Date.now() - 3600000).toISOString(),
  }
];

export function getDemoUser() {
  const saved = window.localStorage.getItem(USER_KEY);
  return saved ? JSON.parse(saved) : demoUser;
}

export function setDemoUser(user) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getDemoParcels() {
  const saved = window.localStorage.getItem(PARCELS_KEY);
  if (saved) return JSON.parse(saved);
  window.localStorage.setItem(PARCELS_KEY, JSON.stringify(seedParcels));
  return seedParcels;
}

export function saveDemoParcel(parcel) {
  const parcels = getDemoParcels();
  const next = [{ ...parcel, id: `CMP-DEMO-${Date.now()}`, created_date: new Date().toISOString() }, ...parcels];
  window.localStorage.setItem(PARCELS_KEY, JSON.stringify(next));
  return next[0];
}

export function updateDemoParcel(id, changes) {
  const parcels = getDemoParcels().map(parcel => (
    parcel.id === id ? { ...parcel, ...changes } : parcel
  ));
  window.localStorage.setItem(PARCELS_KEY, JSON.stringify(parcels));
  return parcels.find(parcel => parcel.id === id);
}
