// Apartment buildings a student can pick for "Where do you live now?"
// (shown when they want to sublet their place out). Names and addresses
// from docs/research/syracuse-apartments-2026-11.csv; students can also
// type a building that isn't here.
import type { Area } from "@/lib/waitlist/options";

export type Apartment = {
  name: string;
  address: string | null;
  aliases: string[];
  // Which survey area the building is in (null: farther out). The team page
  // uses it to match a student subletting out with students who want that
  // area.
  area: Exclude<Area, "not-sure"> | null;
};

export const APARTMENTS: Apartment[] = [
  {
    name: "1000 Ackerman Ave",
    area: "euclid",
    address: "1000 Ackerman Ave, Syracuse, NY 13210",
    aliases: ["Foundation Housing"],
  },
  {
    name: "105 Comstock Ave",
    area: "university-hill",
    address: "105 Comstock Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "1124-1126 E Colvin St",
    area: "south-campus",
    address: "1124 E Colvin St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "1531-1533 E Genesee St",
    area: "westcott",
    address: "1533 E Genesee St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "201 Comstock Ave",
    area: "university-hill",
    address: "201 Comstock Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "212 Westcott St",
    area: "westcott",
    address: "212 Westcott St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "215 Cherry St",
    area: "westcott",
    address: "215 Cherry St, Syracuse, NY 13210",
    aliases: ["Syracuse Quality Living"],
  },
  {
    name: "312 Westcott St",
    area: "westcott",
    address: "312 Westcott St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "410 Westcott St",
    area: "westcott",
    address: "410 Westcott St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "423 Euclid Ave",
    area: "euclid",
    address: "423 Euclid Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "502 University Apartments",
    area: "university-hill",
    address: "502 University Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "602 Westcott St",
    area: "westcott",
    address: "602 Westcott St Apt 1, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "614 Euclid Ave",
    area: "euclid",
    address: "614 Euclid Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "737-739 Ackerman Ave",
    area: "euclid",
    address: "737 Ackerman Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "827 Euclid Ave",
    area: "euclid",
    address: "827 Euclid Ave, Syracuse, NY 13210",
    aliases: [],
  },
  { name: "Campus Prime", area: "university-hill", address: null, aliases: [] },
  {
    name: "Campus West",
    area: "university-hill",
    address: "150 Henry St, Syracuse, NY 13244",
    aliases: [],
  },
  {
    name: "Centennial Hall",
    area: "university-hill",
    address: "142 Oakland St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "Clarendon Heights",
    area: "south-campus",
    address: "508 Ivy Ridge Rd, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "Commonspace Jefferson",
    area: "downtown",
    address: "201 E Jefferson St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Commonspace Warren",
    area: "downtown",
    address: "351 S Warren St, Syracuse, NY 13202",
    aliases: ["Chamber Building"],
  },
  {
    name: "Copper Beech",
    area: "university-hill",
    address: "300 University Ave, Syracuse, NY 13210",
    aliases: ["Copper Beech Commons"],
  },
  { name: "Creekwalk Commons", area: "downtown", address: null, aliases: [] },
  {
    name: "Icon Tower",
    area: "downtown",
    address: "344 S Warren St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Jefferson Tower",
    area: "downtown",
    address: "50 Presidential Plaza, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Lark",
    area: null,
    address: "4101 Brighton Pl, Syracuse, NY 13210",
    aliases: ["Lark Syracuse"],
  },
  {
    name: "Mayflower",
    area: "university-hill",
    address: "1060 E Genesee St, Syracuse, NY 13210",
    aliases: ["Mayflower at The Coda"],
  },
  {
    name: "Merchants Commons",
    area: "downtown",
    address: "220 S Warren St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Milton Hall",
    area: "university-hill",
    address: "727 S Crouse Ave, Syracuse, NY 13210",
    aliases: ["The Marshall"],
  },
  {
    name: "Nob Hill Apartments",
    area: null,
    address: "101 Lafayette Rd, Syracuse, NY 13205",
    aliases: [],
  },
  {
    name: "Park Point",
    area: "university-hill",
    address: "417 Comstock Ave, Syracuse, NY 13210",
    aliases: ["Park Point Syracuse"],
  },
  {
    name: "Pike Block",
    area: "downtown",
    address: "300-304 S Salina St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Salt City Flats",
    area: "downtown",
    address: "420-430 E Genesee St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Skyler Commons",
    area: "university-hill",
    address: "908 Harrison St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "State Tower",
    area: "downtown",
    address: "109 S Warren St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Symphony Place",
    area: "downtown",
    address: "111 E Onondaga St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "Tallman Block",
    area: "downtown",
    address: "219 W Fayette St, Syracuse, NY 13202",
    aliases: [],
  },
  {
    name: "The 505 on Walnut",
    area: "university-hill",
    address: "505 Walnut Ave, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "The Coda",
    area: "university-hill",
    address: "399 S Crouse Ave, Syracuse, NY 13210",
    aliases: ["Coda Syracuse"],
  },
  {
    name: "The Laurel",
    area: "university-hill",
    address: "311 Forman Ave, Syracuse, NY 13210",
    aliases: ["Laurel Apartments"],
  },
  {
    name: "The Standard",
    area: "university-hill",
    address: "910 Madison St, Syracuse, NY 13210",
    aliases: ["The Standard at Syracuse", "The Standard Syracuse"],
  },
  {
    name: "The Treasury",
    area: "downtown",
    address: "101 S Salina St, Syracuse, NY 13202",
    aliases: ["M&T Building"],
  },
  {
    name: "Theory",
    area: "university-hill",
    address: "919 E Genesee St, Syracuse, NY 13210",
    aliases: ["Theory Syracuse", "Theory Apartments"],
  },
  {
    name: "Tower701",
    area: "university-hill",
    address: "701 E Genesee St, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "U Point",
    area: "university-hill",
    address: "404 University Ave, Syracuse, NY 13210",
    aliases: ["U Point Syracuse", "UPoint"],
  },
  {
    name: "UnCommon",
    area: "university-hill",
    address: "900 E Fayette St, Syracuse, NY 13210",
    aliases: ["UnCommon Syracuse"],
  },
  {
    name: "University Townhouses",
    area: "south-campus",
    address: "259 Robert Dr, Syracuse, NY 13210",
    aliases: [],
  },
  {
    name: "University Village on Colvin",
    area: "south-campus",
    address: "1700 E Colvin St / 315 Small Rd, Syracuse, NY 13210",
    aliases: ["UV on Colvin", "University Village"],
  },
  {
    name: "Victory at Olympus",
    area: "euclid",
    address: null,
    aliases: ["Victory at Syracuse"],
  },
  {
    name: "Victory on Comstock",
    area: "university-hill",
    address: "1201 Harrison St (leasing office), Syracuse, NY 13210",
    aliases: ["Campus Hill Apartments", "Victory at Syracuse"],
  },
  {
    name: "Victory on the Hill",
    area: "university-hill",
    address: "1201 Harrison St (leasing office), Syracuse, NY 13210",
    aliases: ["Victory at Syracuse"],
  },
];
