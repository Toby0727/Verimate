// Sample data — delete when real uploads exist. Files live in public/sample/.
const people = [
  "u-chloe.jpg",
  "u-ethan.jpg",
  "u-jason.jpg",
  "u-kevin.jpg",
  "u-layla.jpg",
  "u-mia.jpg",
  "u-priya.jpg",
  "p-1463453091.jpg",
  "p-1494790108.jpg",
  "p-1500648767.jpg",
  "p-1506794778.jpg",
  "p-1517841905.jpg",
];

const rooms = [
  "r-1484154218.jpg",
  "r-1493809842.jpg",
  "r-1502005229.jpg",
  "r-1513694203.jpg",
  "r-1522708323.jpg",
  "r-1556020685.jpg",
  "r-1567767292.jpg",
  "u-kitchen.jpg",
  "u-living.jpg",
  "u-room-sofa.jpg",
];

export const PEOPLE_PHOTOS = people.map((f) => `/sample/people/${f}`);
export const ROOM_PHOTOS = rooms.map((f) => `/sample/rooms/${f}`);
