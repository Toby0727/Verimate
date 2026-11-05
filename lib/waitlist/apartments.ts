// Apartment buildings a student can pick for "Where do you live now?"
// (shown when they want to sublet their place out). Names and addresses
// from docs/research/syracuse-apartments-2026-11.csv; students can also
// type a building that isn't here.
export type Apartment = {
  name: string;
  address: string | null;
  aliases: string[];
};

export const APARTMENTS: Apartment[] = [
  {
    name: "1000 Ackerman Ave",
    address: "1000 Ackerman Ave, Syracuse, NY 13210",
    aliases: ["Foundation Housing"],
  },
  {
    name: "105 Comstock Ave",
    address: "105 Comstock Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "1124-1126 E Colvin St",
    address: "1124 E Colvin St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "1531-1533 E Genesee St",
    address: "1533 E Genesee St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "201 Comstock Ave",
    address: "201 Comstock Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "212 Westcott St",
    address: "212 Westcott St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "215 Cherry St",
    address: "215 Cherry St, Syracuse, NY 13210",
    aliases: ["Syracuse Quality Living"],
  },
  {
    name: "312 Westcott St",
    address: "312 Westcott St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "410 Westcott St",
    address: "410 Westcott St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "423 Euclid Ave",
    address: "423 Euclid Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "502 University Apartments",
    address: "502 University Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "602 Westcott St",
    address: "602 Westcott St Apt 1, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "614 Euclid Ave",
    address: "614 Euclid Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "737-739 Ackerman Ave",
    address: "737 Ackerman Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "827 Euclid Ave",
    address: "827 Euclid Ave, Syracuse, NY 13210",
    aliases: [],
  },
  { name: "Campus Prime", address: null, aliases: [] },
  {
    name: "Campus West",
    address: "150 Henry St, Syracuse, NY 13244",
    aliases: [],
  },
  {
    name: "Centennial Hall",
    address: "142 Oakland St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "Clarendon Heights",
    address: "508 Ivy Ridge Rd, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "Commonspace Jefferson",
    address: "201 E Jefferson St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Commonspace Warren",
    address: "351 S Warren St, Syracuse, NY 13202",
    aliases: ["Chamber Building"],
  },
  {
    name: "Copper Beech",
    address: "300 University Ave, Syracuse, NY 13210",
    aliases: ["Copper Beech Commons"],
  },
  { name: "Creekwalk Commons", address: null, aliases: [] },
  {
    name: "Icon Tower",
    address: "344 S Warren St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Jefferson Tower",
    address: "50 Presidential Plaza, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Lark",
    address: "4101 Brighton Pl, Syracuse, NY 13210",
    aliases: ["Lark Syracuse"],
  },
  {
    name: "Mayflower",
    address: "1060 E Genesee St, Syracuse, NY 13210",
    aliases: ["Mayflower at The Coda"],
  },
  {
    name: "Merchants Commons",
    address: "220 S Warren St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Milton Hall",
    address: "727 S Crouse Ave, Syracuse, NY 13210",
    aliases: ["The Marshall"],
  },
  {
    name: "Nob Hill Apartments",
    address: "101 Lafayette Rd, Syracuse, NY 13205",
    aliases: [],
  },
  {
    name: "Park Point",
    address: "417 Comstock Ave, Syracuse, NY 13210",
    aliases: ["Park Point Syracuse"],
  },
  {
    name: "Pike Block",
    address: "300-304 S Salina St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Salt City Flats",
    address: "420-430 E Genesee St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Skyler Commons",
    address: "908 Harrison St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "State Tower",
    address: "109 S Warren St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Symphony Place",
    address: "111 E Onondaga St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Tallman Block",
    address: "219 W Fayette St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "The 505 on Walnut",
    address: "505 Walnut Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "The Coda",
    address: "399 S Crouse Ave, Syracuse, NY 13210",
    aliases: ["Coda Syracuse"],
  },
  {
    name: "The Laurel",
    address: "311 Forman Ave, Syracuse, NY 13210",
    aliases: ["Laurel Apartments"],
  },
  {
    name: "The Standard",
    address: "910 Madison St, Syracuse, NY 13210",
    aliases: ["The Standard at Syracuse", "The Standard Syracuse"],
  },
  {
    name: "The Treasury",
    address: "101 S Salina St, Syracuse, NY 13202",
    aliases: ["M&T Building"],
  },
  {
    name: "Theory",
    address: "919 E Genesee St, Syracuse, NY 13210",
    aliases: ["Theory Syracuse", "Theory Apartments"],
  },
  {
    name: "Tower701",
    address: "701 E Genesee St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "U Point",
    address: "404 University Ave, Syracuse, NY 13210",
    aliases: ["U Point Syracuse", "UPoint"],
  },
  {
    name: "UnCommon",
    address: "900 E Fayette St, Syracuse, NY 13210",
    aliases: ["UnCommon Syracuse"],
  },
  {
    name: "University Townhouses",
    address: "259 Robert Dr, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "University Village on Colvin",
    address: "1700 E Colvin St / 315 Small Rd, Syracuse, NY 13210",
    aliases: ["UV on Colvin", "University Village"],
  },
  {
    name: "Victory at Olympus",
    address: null,
    aliases: ["Victory at Syracuse"],
  },
  {
    name: "Victory on Comstock",
    address: "1201 Harrison St (leasing office), Syracuse, NY 13210",
    aliases: ["Campus Hill Apartments", "Victory at Syracuse"],
  },
  {
    name: "Victory on the Hill",
    address: "1201 Harrison St (leasing office), Syracuse, NY 13210",
    aliases: ["Victory at Syracuse"],
  },
];
