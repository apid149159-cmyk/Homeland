import { Vendor, Venue, Ticket, Zone, Booth } from './types';

export const THEMES = ['Vintage', 'Luxury', 'Party', 'Modern', 'Minimal', 'Industrial'];

// Map Month Index (0-11) to Themes
export const SEASONAL_THEMES: Record<number, string[]> = {
  0: ['New Year Party', 'Children Day'], // January
  1: ['Valentine Romance', 'Chinese New Year'], // February
  2: ['Summer Beach'], // March
  3: ['Songkran Festival'], // April
  5: ['Pride Celebration'], // June
  9: ['Halloween Spook'], // October
  10: ['Loy Krathong'], // November
  11: ['Christmas', 'New Year Countdown'] // December
};

export const MOCK_VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'The Grand Ballroom',
    name_th: 'เดอะ แกรนด์ บอลรูม',
    type: 'INDOOR',
    areaSqm: 400,
    capacityMax: 300,
    price: 50000,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
    tags: ['Luxury', 'Modern', 'New Year Countdown', 'Valentine Romance']
  },
  {
    id: 'v2',
    name: 'Sunset Rooftop',
    name_th: 'ซันเซ็ต รูฟท็อป',
    type: 'OUTDOOR',
    areaSqm: 150,
    capacityMax: 100,
    price: 35000,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=800',
    tags: ['Party', 'Modern', 'Christmas', 'New Year Party']
  },
  {
    id: 'v3',
    name: 'Rustic Barn Garden',
    name_th: 'รัสติค บาร์น การ์เด้น',
    type: 'OUTDOOR',
    areaSqm: 600,
    capacityMax: 400,
    price: 25000,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
    tags: ['Vintage', 'Chill', 'Songkran Festival', 'Loy Krathong']
  },
  {
    id: 'v4',
    name: 'Cozy Studio Hall',
    name_th: 'โคซี่ สตูดิโอ ฮอลล์',
    type: 'INDOOR',
    areaSqm: 80,
    capacityMax: 50,
    price: 15000,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    tags: ['Modern', 'Vintage', 'Minimal', 'Halloween Spook']
  }
];

export const MOCK_VENDORS: Vendor[] = [
  { 
    id: 1, 
    type: 'BAND', 
    name: 'The Classic Jazz Duo', 
    name_th: 'เดอะ คลาสสิค แจ๊ส ดูโอ้',
    tags: ['Luxury', 'Vintage', 'Chill', 'Valentine Romance', 'Christmas'], 
    price: 15000, 
    specs: { type: 'ACOUSTIC', members: 2, min_watt: 1000, area: 6 },
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=400',
    description: 'Smooth saxophone and piano duo perfect for cocktail hours.',
    description_th: 'คู่หูแซกโซโฟนและเปียโน บรรยากาศนุ่มนวล เหมาะสำหรับช่วงค็อกเทล'
  },
  { 
    id: 2, 
    type: 'BAND', 
    name: 'Thunder Rock Band', 
    name_th: 'ธันเดอร์ ร็อค แบนด์',
    tags: ['Party', 'Street', 'Modern', 'Songkran Festival', 'New Year Countdown'], 
    price: 25000, 
    specs: { type: 'FULL_BAND', members: 5, min_watt: 5000, area: 15 }, 
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400',
    description: 'High energy rock band that gets everyone dancing.',
    description_th: 'วงร็อคพลังสูง ที่จะทำให้ทุกคนลุกขึ้นเต้น'
  },
  { 
    id: 3, 
    type: 'SOUND', 
    name: 'Basic Speech Set', 
    name_th: 'ชุดเครื่องเสียงงานพูด',
    tags: ['Luxury', 'Vintage', 'Chill', 'Children Day'], 
    price: 5000, 
    specs: { watt: 2000, support: ['ACOUSTIC', 'SPEECH'], area: 2 }, 
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=400',
    description: 'Perfect for speeches and background music.',
    description_th: 'เหมาะสำหรับการกล่าวสุนทรพจน์และเปิดเพลงคลอเบาๆ'
  },
  { 
    id: 4, 
    type: 'SOUND', 
    name: 'Concert Pro System', 
    name_th: 'ชุดระบบเสียงคอนเสิร์ตโปร',
    tags: ['Party', 'Street', 'Modern', 'Songkran Festival', 'New Year Countdown'], 
    price: 12000, 
    specs: { watt: 10000, support: ['ACOUSTIC', 'FULL_BAND', 'SPEECH'], area: 10 },
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
    description: 'Full range audio system with subwoofers for live bands.',
    description_th: 'ระบบเสียงเต็มรูปแบบพร้อมซับวูฟเฟอร์สำหรับวงดนตรีสด'
  },
  { 
    id: 5, 
    type: 'FOOD', 
    name: 'Grandma Burger Truck', 
    name_th: 'เบอร์เกอร์คุณยาย (รถบรรทุก)',
    tags: ['Street', 'Vintage', 'Songkran Festival', 'Halloween Spook'], 
    price: 8000, 
    specs: { area: 12, power: 1500 }, // Truck needs space
    image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80&w=400',
    description: 'Classic homemade burgers from a vintage truck.',
    description_th: 'เบอร์เกอร์โฮมเมดสไตล์คลาสสิก เสิร์ฟจากรถบรรทุกวินเทจ'
  },
  { 
    id: 6, 
    type: 'FOOD', 
    name: 'Elegant Canapés', 
    name_th: 'คานาเป้สุดหรู',
    tags: ['Luxury', 'Modern', 'Valentine Romance', 'New Year Party'], 
    price: 12000, 
    specs: { area: 5, power: 500 },
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400',
    description: 'Premium bite-sized appetizers served on silver platters.',
    description_th: 'อาหารเรียกน้ำย่อยคำเล็กระดับพรีเมียม เสิร์ฟบนถาดเงิน'
  },
  {
    id: 7,
    type: 'STAFF',
    name: 'Pro Event Stewards', 
    name_th: 'ทีมสจ๊วตมืออาชีพ',
    tags: ['Luxury', 'Party', 'Modern', 'Vintage'],
    price: 3500,
    specs: { members: 5, area: 0 }, // Staff move around
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=400',
    description: 'Experienced staff to manage crowd flow and assistance.',
    description_th: 'พนักงานที่มีประสบการณ์เพื่อดูแลความเรียบร้อยและช่วยเหลือแขก'
  },
  {
    id: 8,
    type: 'FASHION',
    name: 'Retro Chic Costumes',
    name_th: 'ชุดย้อนยุควินเทจ',
    tags: ['Vintage', 'Party', 'Halloween Spook', 'Children Day'],
    price: 5000,
    specs: { area: 3 }, // Rack space
    image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&q=80&w=400',
    description: 'Authentic 70s and 80s costume rentals for themed parties.',
    description_th: 'บริการเช่าชุดย้อนยุค 70s และ 80s สำหรับปาร์ตี้ธีม'
  },
  {
    id: 9,
    type: 'FASHION',
    name: 'Luxe Gala Wear',
    name_th: 'ชุดราตรีหรูหรา',
    tags: ['Luxury', 'Modern', 'Valentine Romance'],
    price: 15000,
    specs: { area: 4 }, // Fitting area
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=400',
    description: 'High-end tuxedos and evening gowns for formal events.',
    description_th: 'ทักซิโด้และชุดราตรีระดับไฮเอนด์สำหรับงานที่เป็นทางการ'
  }
];

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 't1',
        eventName: 'Neon Music Festival 2024',
        originalPrice: 2500,
        resalePrice: 1800,
        date: '2024-12-15',
        location: 'Thunder Dome',
        zone: 'Standing A',
        seatNumber: 'N/A',
        sellerName: 'Alice W.',
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1459749411177-0473ef7161a8?auto=format&fit=crop&q=80&w=400',
        status: 'AVAILABLE'
    },
    {
        id: 't2',
        eventName: 'Jazz in the Park',
        originalPrice: 1200,
        resalePrice: 1000,
        date: '2024-11-20',
        location: 'Benjakitti Park',
        zone: 'Picnic B',
        seatNumber: 'B-12',
        sellerName: 'Bob S.',
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&q=80&w=400',
        status: 'AVAILABLE'
    },
    {
        id: 't3',
        eventName: 'Tech Conference 2025',
        originalPrice: 5000,
        resalePrice: 4500,
        date: '2025-01-10',
        location: 'BITEC Bangna',
        zone: 'VIP',
        seatNumber: 'A-01',
        sellerName: 'Charlie Tech',
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400',
        status: 'AVAILABLE'
    }
];

export const MOCK_ZONES: Zone[] = [
  { id: 'z1', name: 'Food Paradise', color: '#fb923c', capacity: 12 }, // Orange
  { id: 'z2', name: 'Fashion Street', color: '#c084fc', capacity: 10 }, // Purple
  { id: 'z3', name: 'Main Stage', color: '#f43f5e', capacity: 4 }, // Rose
];

export const MOCK_BOOTHS: Booth[] = [
  // Zone 1: Food
  { id: 'b1', zoneId: 'z1', code: 'F01', status: 'OCCUPIED', vendorId: 5, size: '2x2' },
  { id: 'b2', zoneId: 'z1', code: 'F02', status: 'AVAILABLE', size: '2x2' },
  { id: 'b3', zoneId: 'z1', code: 'F03', status: 'AVAILABLE', size: '2x2' },
  { id: 'b4', zoneId: 'z1', code: 'F04', status: 'LOCKED', size: '2x2' },
  { id: 'b5', zoneId: 'z1', code: 'F05', status: 'AVAILABLE', size: '2x2' },
  { id: 'b6', zoneId: 'z1', code: 'F06', status: 'OCCUPIED', vendorId: 6, size: '2x2' },
  // Zone 2: Fashion
  { id: 'b7', zoneId: 'z2', code: 'S01', status: 'OCCUPIED', vendorId: 8, size: '2x2' },
  { id: 'b8', zoneId: 'z2', code: 'S02', status: 'AVAILABLE', size: '2x2' },
  { id: 'b9', zoneId: 'z2', code: 'S03', status: 'AVAILABLE', size: '2x2' },
  // Zone 3: Stage
  { id: 'b10', zoneId: 'z3', code: 'M01', status: 'OCCUPIED', vendorId: 2, size: '4x4' },
];