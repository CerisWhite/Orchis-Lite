// Dragon Map
var LevelMap = require('./LevelMap.js');

var DragonInfoMap = {
  "20030101": {
    "id": 20030101,
    "story_id": 210021011,
    "name": "Homura",
    "element": 1,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 184,
    "max_atk": 63
  },
  "20030102": {
    "id": 20030102,
    "story_id": 210022011,
    "name": "Cinder Drake",
    "element": 1,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 19,
    "base_atk": 5,
    "max_hp": 190,
    "max_atk": 57
  },
  "20030103": {
    "id": 20030103,
    "story_id": 210023011,
    "name": "Kindling Imp",
    "element": 1,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 187,
    "max_atk": 60
  },
  "20030201": {
    "id": 20030201,
    "story_id": 210059011,
    "name": "Fubuki",
    "element": 2,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 185,
    "max_atk": 63
  },
  "20030202": {
    "id": 20030202,
    "story_id": 210063011,
    "name": "Snow Drake",
    "element": 2,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 19,
    "base_atk": 5,
    "max_hp": 191,
    "max_atk": 57
  },
  "20030203": {
    "id": 20030203,
    "story_id": 210067011,
    "name": "Wellspring Imp",
    "element": 2,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 187,
    "max_atk": 60
  },
  "20030301": {
    "id": 20030301,
    "story_id": 210060011,
    "name": "Tsumuji",
    "element": 3,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 184,
    "max_atk": 63
  },
  "20030302": {
    "id": 20030302,
    "story_id": 210064011,
    "name": "Gust Drake",
    "element": 3,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 19,
    "base_atk": 5,
    "max_hp": 191,
    "max_atk": 57
  },
  "20030303": {
    "id": 20030303,
    "story_id": 210068011,
    "name": "Zephyr Imp",
    "element": 3,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 187,
    "max_atk": 60
  },
  "20030401": {
    "id": 20030401,
    "story_id": 210061011,
    "name": "Hinata",
    "element": 4,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 185,
    "max_atk": 62
  },
  "20030402": {
    "id": 20030402,
    "story_id": 210065011,
    "name": "Moon Drake",
    "element": 4,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 19,
    "base_atk": 5,
    "max_hp": 192,
    "max_atk": 56
  },
  "20030403": {
    "id": 20030403,
    "story_id": 210069011,
    "name": "Astral Imp",
    "element": 4,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 5,
    "max_hp": 188,
    "max_atk": 59
  },
  "20030501": {
    "id": 20030501,
    "story_id": 210062011,
    "name": "Hikage",
    "element": 5,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 183,
    "max_atk": 64
  },
  "20030502": {
    "id": 20030502,
    "story_id": 210066011,
    "name": "Gloom Drake",
    "element": 5,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 19,
    "base_atk": 5,
    "max_hp": 190,
    "max_atk": 58
  },
  "20030503": {
    "id": 20030503,
    "story_id": 210070011,
    "name": "Pallid Imp",
    "element": 5,
    "rarity": 3,
    "has_spiral": false,
    "sellcoin": 300,
    "sellwater": 150,
    "base_hp": 18,
    "base_atk": 6,
    "max_hp": 186,
    "max_atk": 61
  },
  "20040101": {
    "id": 20040101,
    "story_id": 210002011,
    "name": "Brunhilda",
    "element": 1,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 100,
    "base_hp": 20,
    "base_atk": 7,
    "max_hp": 203,
    "max_atk": 70
  },
  "20040102": {
    "id": 20040102,
    "story_id": 210006011,
    "name": "Phoenix",
    "element": 1,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 29,
    "base_atk": 9,
    "max_hp": 299,
    "max_atk": 97
  },
  "20040103": {
    "id": 20040103,
    "story_id": 210007011,
    "name": "Ifrit",
    "element": 1,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 29,
    "base_atk": 10,
    "max_hp": 295,
    "max_atk": 101
  },
  "20040201": {
    "id": 20040201,
    "story_id": 210003011,
    "name": "Mercury",
    "element": 2,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 100,
    "base_hp": 21,
    "base_atk": 6,
    "max_hp": 211,
    "max_atk": 62
  },
  "20040202": {
    "id": 20040202,
    "story_id": 210008011,
    "name": "Poliʻahu",
    "element": 2,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 30,
    "base_atk": 9,
    "max_hp": 301,
    "max_atk": 95
  },
  "20040203": {
    "id": 20040203,
    "story_id": 210058011,
    "name": "Vodyanoy",
    "element": 2,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 29,
    "base_atk": 10,
    "max_hp": 296,
    "max_atk": 100
  },
  "20040301": {
    "id": 20040301,
    "story_id": 210001011,
    "name": "Midgardsormr",
    "element": 3,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 100,
    "base_hp": 20,
    "base_atk": 6,
    "max_hp": 206,
    "max_atk": 66
  },
  "20040302": {
    "id": 20040302,
    "story_id": 210050011,
    "name": "Roc",
    "element": 3,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 29,
    "base_atk": 10,
    "max_hp": 296,
    "max_atk": 101
  },
  "20040303": {
    "id": 20040303,
    "story_id": 210011011,
    "name": "Stribog",
    "element": 3,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 30,
    "base_atk": 9,
    "max_hp": 306,
    "max_atk": 91
  },
  "20040401": {
    "id": 20040401,
    "story_id": 210004011,
    "name": "Jupiter",
    "element": 4,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 100,
    "base_hp": 20,
    "base_atk": 6,
    "max_hp": 207,
    "max_atk": 65
  },
  "20040402": {
    "id": 20040402,
    "story_id": 210012011,
    "name": "Unicorn",
    "element": 4,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 30,
    "base_atk": 9,
    "max_hp": 301,
    "max_atk": 95
  },
  "20040403": {
    "id": 20040403,
    "story_id": 210013011,
    "name": "Lindworm",
    "element": 4,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 29,
    "base_atk": 10,
    "max_hp": 297,
    "max_atk": 100
  },
  "20040405": {
    "id": 20040405,
    "story_id": 210075011,
    "name": "Halloween Silke",
    "element": 4,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 30,
    "base_atk": 9,
    "max_hp": 301,
    "max_atk": 95
  },
  "20040501": {
    "id": 20040501,
    "story_id": 210005011,
    "name": "Zodiark",
    "element": 5,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 100,
    "base_hp": 20,
    "base_atk": 7,
    "max_hp": 202,
    "max_atk": 70
  },
  "20040502": {
    "id": 20040502,
    "story_id": 210014011,
    "name": "Juggernaut",
    "element": 5,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 29,
    "base_atk": 10,
    "max_hp": 294,
    "max_atk": 102
  },
  "20040503": {
    "id": 20040503,
    "story_id": 210015011,
    "name": "Silke",
    "element": 5,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 2200,
    "base_hp": 29,
    "base_atk": 9,
    "max_hp": 299,
    "max_atk": 97
  },
  "20040504": {
    "id": 20040504,
    "story_id": 210089011,
    "name": "Bronze Fafnir",
    "element": 5,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 100,
    "base_hp": 20,
    "base_atk": 6,
    "max_hp": 209,
    "max_atk": 63
  },
  "20040505": {
    "id": 20040505,
    "story_id": 210090011,
    "name": "Silver Fafnir",
    "element": 5,
    "rarity": 4,
    "has_spiral": false,
    "sellcoin": 2000,
    "sellwater": 100,
    "base_hp": 20,
    "base_atk": 6,
    "max_hp": 209,
    "max_atk": 63
  },
  "20050101": {
    "id": 20050101,
    "story_id": 210016011,
    "name": "Agni",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050102": {
    "id": 20050102,
    "story_id": 210039011,
    "name": "High Brunhilda",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 35,
    "base_atk": 12,
    "max_hp": 350,
    "max_atk": 120
  },
  "20050103": {
    "id": 20050103,
    "story_id": 210057011,
    "name": "Pele",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 221,
    "max_atk": 76
  },
  "20050104": {
    "id": 20050104,
    "story_id": 210024011,
    "name": "Cerberus",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050105": {
    "id": 20050105,
    "story_id": 210055011,
    "name": "Erasmus",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 221,
    "max_atk": 76
  },
  "20050106": {
    "id": 20050106,
    "story_id": 210052011,
    "name": "Prometheus",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 374,
    "max_atk": 121
  },
  "20050107": {
    "id": 20050107,
    "story_id": 210082011,
    "name": "Konohana Sakuya",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 374,
    "max_atk": 121
  },
  "20050108": {
    "id": 20050108,
    "story_id": 210030011,
    "name": "Arctos",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 374,
    "max_atk": 121
  },
  "20050109": {
    "id": 20050109,
    "story_id": 210103011,
    "name": "Apollo",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050110": {
    "id": 20050110,
    "story_id": 210107011,
    "name": "Kagutsuchi",
    "element": 1,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050111": {
    "id": 20050111,
    "story_id": 210121011,
    "name": "Rathalos",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 221,
    "max_atk": 76
  },
  "20050112": {
    "id": 20050112,
    "story_id": 210122011,
    "name": "Dreadking Rathalos",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050113": {
    "id": 20050113,
    "story_id": 200009011,
    "name": "Gala Mars",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050114": {
    "id": 20050114,
    "story_id": 210124011,
    "name": "Horus",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050115": {
    "id": 20050115,
    "story_id": 210133011,
    "name": "Mini Hildy",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 221,
    "max_atk": 76
  },
  "20050116": {
    "id": 20050116,
    "story_id": 210136011,
    "name": "Gozu Tenno",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050117": {
    "id": 20050117,
    "story_id": 210147011,
    "name": "Gala Reborn Agni",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050118": {
    "id": 20050118,
    "story_id": 210163011,
    "name": "Uriel",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050119": {
    "id": 20050119,
    "story_id": 210177011,
    "name": "Primal Brunhilda",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "20050201": {
    "id": 20050201,
    "story_id": 210025011,
    "name": "Poseidon",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 11,
    "max_hp": 376,
    "max_atk": 119
  },
  "20050202": {
    "id": 20050202,
    "story_id": 210040011,
    "name": "High Mercury",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 35,
    "base_atk": 11,
    "max_hp": 357,
    "max_atk": 113
  },
  "20050203": {
    "id": 20050203,
    "story_id": 210017011,
    "name": "Leviathan",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050204": {
    "id": 20050204,
    "story_id": 210054011,
    "name": "Siren",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050205": {
    "id": 20050205,
    "story_id": 210076011,
    "name": "Dragonyule Jeanne",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050206": {
    "id": 20050206,
    "story_id": 210079011,
    "name": "Peng Lai",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 222,
    "max_atk": 75
  },
  "20050207": {
    "id": 20050207,
    "story_id": 210081011,
    "name": "Simurgh",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 38,
    "base_atk": 11,
    "max_hp": 383,
    "max_atk": 113
  },
  "20050208": {
    "id": 20050208,
    "story_id": 210097011,
    "name": "Halloween Maritimus",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 11,
    "max_hp": 376,
    "max_atk": 119
  },
  "20050209": {
    "id": 20050209,
    "story_id": 210109011,
    "name": "Kamuy",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050210": {
    "id": 20050210,
    "story_id": 210053011,
    "name": "Nimis",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050211": {
    "id": 20050211,
    "story_id": 210120011,
    "name": "Gaibhne &amp; Creidhne",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050212": {
    "id": 20050212,
    "story_id": 210130011,
    "name": "Styx",
    "element": 2,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050213": {
    "id": 20050213,
    "story_id": 210134011,
    "name": "Gala Reborn Poseidon",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050214": {
    "id": 20050214,
    "story_id": 210145011,
    "name": "Gabriel",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050215": {
    "id": 20050215,
    "story_id": 210146011,
    "name": "Mini Mercs",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 222,
    "max_atk": 75
  },
  "20050216": {
    "id": 20050216,
    "story_id": 210156011,
    "name": "Summer Marishiten",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050217": {
    "id": 20050217,
    "story_id": 210167011,
    "name": "Gala Beast Ciella",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "20050301": {
    "id": 20050301,
    "story_id": 210018011,
    "name": "Zephyr",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050302": {
    "id": 20050302,
    "story_id": 210038011,
    "name": "High Midgardsormr",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 35,
    "base_atk": 11,
    "max_hp": 356,
    "max_atk": 114
  },
  "20050303": {
    "id": 20050303,
    "story_id": 210010011,
    "name": "Sylvia",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 225,
    "max_atk": 72
  },
  "20050304": {
    "id": 20050304,
    "story_id": 210036011,
    "name": "Garuda",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 38,
    "base_atk": 11,
    "max_hp": 383,
    "max_atk": 114
  },
  "20050305": {
    "id": 20050305,
    "story_id": 210080011,
    "name": "Long Long",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050306": {
    "id": 20050306,
    "story_id": 210026011,
    "name": "Pazuzu",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050307": {
    "id": 20050307,
    "story_id": 210074011,
    "name": "Yulong",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 225,
    "max_atk": 72
  },
  "20050308": {
    "id": 20050308,
    "story_id": 210084011,
    "name": "Freyja",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 375,
    "max_atk": 120
  },
  "20050309": {
    "id": 20050309,
    "story_id": 210098011,
    "name": "Vayu",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050310": {
    "id": 20050310,
    "story_id": 210111011,
    "name": "Mini Mids",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 225,
    "max_atk": 72
  },
  "20050311": {
    "id": 20050311,
    "story_id": 210105011,
    "name": "Hastur",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050312": {
    "id": 20050312,
    "story_id": 210117011,
    "name": "AC-011 Garland",
    "element": 3,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050313": {
    "id": 20050313,
    "story_id": 210116011,
    "name": "Ariel",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050314": {
    "id": 20050314,
    "story_id": 210125011,
    "name": "Summer Konohana Sakuya",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050315": {
    "id": 20050315,
    "story_id": 210131011,
    "name": "Midgardsormr Zero",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050316": {
    "id": 20050316,
    "story_id": 210143011,
    "name": "Gala Reborn Zephyr",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050317": {
    "id": 20050317,
    "story_id": 210137011,
    "name": "Menoetius",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050318": {
    "id": 20050318,
    "story_id": 210152011,
    "name": "Rose Queen",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050319": {
    "id": 20050319,
    "story_id": 210161011,
    "name": "Gala Beast Volk",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050320": {
    "id": 20050320,
    "story_id": 210169011,
    "name": "Fudo Myo-o",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050321": {
    "id": 20050321,
    "story_id": 210168011,
    "name": "Michael",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "20050401": {
    "id": 20050401,
    "story_id": 210020011,
    "name": "Jeanne d'Arc",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 38,
    "base_atk": 11,
    "max_hp": 384,
    "max_atk": 113
  },
  "20050402": {
    "id": 20050402,
    "story_id": 210041011,
    "name": "High Jupiter",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 35,
    "base_atk": 11,
    "max_hp": 352,
    "max_atk": 118
  },
  "20050403": {
    "id": 20050403,
    "story_id": 210056011,
    "name": "Corsaint Phoenix",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050404": {
    "id": 20050404,
    "story_id": 210048011,
    "name": "Gilgamesh",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050405": {
    "id": 20050405,
    "story_id": 210049011,
    "name": "Cupid",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 11,
    "max_hp": 377,
    "max_atk": 119
  },
  "20050406": {
    "id": 20050406,
    "story_id": 210078011,
    "name": "Shishimai",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 223,
    "max_atk": 75
  },
  "20050407": {
    "id": 20050407,
    "story_id": 210043011,
    "name": "Liger",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 11,
    "max_hp": 377,
    "max_atk": 119
  },
  "20050408": {
    "id": 20050408,
    "story_id": 210051011,
    "name": "Takemikazuchi",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050409": {
    "id": 20050409,
    "story_id": 210094011,
    "name": "Pop-Star Siren",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050410": {
    "id": 20050410,
    "story_id": 210110011,
    "name": "Daikokuten",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050411": {
    "id": 20050411,
    "story_id": 210085011,
    "name": "Tie Shan Gongzhu",
    "element": 4,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050412": {
    "id": 20050412,
    "story_id": 200018011,
    "name": "Gala Thor",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050413": {
    "id": 20050413,
    "story_id": 210142011,
    "name": "Lumière Pandora",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050414": {
    "id": 20050414,
    "story_id": 210144011,
    "name": "Gala Reborn Jeanne",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050415": {
    "id": 20050415,
    "story_id": 210154011,
    "name": "Raphael",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050416": {
    "id": 20050416,
    "story_id": 210158011,
    "name": "Summer Cat Sìth",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050417": {
    "id": 20050417,
    "story_id": 210166011,
    "name": "Mini Jupi",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 223,
    "max_atk": 75
  },
  "20050418": {
    "id": 20050418,
    "story_id": 210164011,
    "name": "Gala Chronos Nyx",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050419": {
    "id": 20050419,
    "story_id": 210173011,
    "name": "Gala Elysium",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "20050501": {
    "id": 20050501,
    "story_id": 210019011,
    "name": "Nidhogg",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 374,
    "max_atk": 121
  },
  "20050502": {
    "id": 20050502,
    "story_id": 210042011,
    "name": "High Zodiark",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 35,
    "base_atk": 12,
    "max_hp": 350,
    "max_atk": 120
  },
  "20050504": {
    "id": 20050504,
    "story_id": 210045011,
    "name": "Phantom",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 224,
    "max_atk": 73
  },
  "20050505": {
    "id": 20050505,
    "story_id": 210072011,
    "name": "Maritimus",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 224,
    "max_atk": 73
  },
  "20050506": {
    "id": 20050506,
    "story_id": 210077011,
    "name": "Marishiten",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 374,
    "max_atk": 121
  },
  "20050507": {
    "id": 20050507,
    "story_id": 210091011,
    "name": "Gold Fafnir",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 6,
    "max_hp": 229,
    "max_atk": 69
  },
  "20050508": {
    "id": 20050508,
    "story_id": 210046011,
    "name": "Nyarlathotep",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050509": {
    "id": 20050509,
    "story_id": 210087011,
    "name": "Shinobi",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050510": {
    "id": 20050510,
    "story_id": 200010011,
    "name": "Chthonius",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050511": {
    "id": 20050511,
    "story_id": 210095011,
    "name": "Parallel Zodiark",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 221,
    "max_atk": 77
  },
  "20050512": {
    "id": 20050512,
    "story_id": 210114011,
    "name": "Ebisu",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 221,
    "max_atk": 77
  },
  "20050513": {
    "id": 20050513,
    "story_id": 210123011,
    "name": "Fatalis",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050514": {
    "id": 20050514,
    "story_id": 210112011,
    "name": "Epimetheus",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050515": {
    "id": 20050515,
    "story_id": 210127011,
    "name": "Mini Zodi",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 22,
    "base_atk": 7,
    "max_hp": 221,
    "max_atk": 77
  },
  "20050516": {
    "id": 20050516,
    "story_id": 210115011,
    "name": "Andromeda",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050517": {
    "id": 20050517,
    "story_id": 210083011,
    "name": "Barbatos",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 33,
    "base_atk": 11,
    "max_hp": 331,
    "max_atk": 115
  },
  "20050518": {
    "id": 20050518,
    "story_id": 210126011,
    "name": "Azazel",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050519": {
    "id": 20050519,
    "story_id": 200017011,
    "name": "Gala Cat Sìth",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050520": {
    "id": 20050520,
    "story_id": 210132011,
    "name": "Ramiel",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050521": {
    "id": 20050521,
    "story_id": 210135011,
    "name": "Giovanni",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050522": {
    "id": 20050522,
    "story_id": 210138011,
    "name": "Arsène",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050523": {
    "id": 20050523,
    "story_id": 210148011,
    "name": "High Chthonius",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050524": {
    "id": 20050524,
    "story_id": 210155011,
    "name": "Gala Reborn Nidhogg",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "20050525": {
    "id": 20050525,
    "story_id": 210162011,
    "name": "Gala Bahamut",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 8500,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "29900001": {
    "id": 29900001,
    "story_id": "N/A",
    "name": "Brunhilda",
    "element": 1,
    "rarity": 0,
    "has_spiral": false,
    "sellcoin": 0,
    "sellwater": 0,
    "base_hp": 0,
    "base_atk": 0,
    "max_hp": 0,
    "max_atk": 0
  },
  "29900002": {
    "id": 29900002,
    "story_id": "N/A",
    "name": "Brunhilda",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 0,
    "sellwater": 0,
    "base_hp": 20,
    "base_atk": 7,
    "max_hp": 203,
    "max_atk": 70
  },
  "29900003": {
    "id": 29900003,
    "story_id": "N/A",
    "name": "Rush",
    "element": 1,
    "rarity": 0,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 20,
    "base_atk": 7,
    "max_hp": 203,
    "max_atk": 70
  },
  "29900004": {
    "id": 29900004,
    "story_id": "N/A",
    "name": "Nyarlathotep",
    "element": 5,
    "rarity": 0,
    "has_spiral": false,
    "sellcoin": 0,
    "sellwater": 0,
    "base_hp": 0,
    "base_atk": 0,
    "max_hp": 0,
    "max_atk": 0
  },
  "29900005": {
    "id": 29900005,
    "story_id": "N/A",
    "name": "Puppy",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "29900006": {
    "id": 29900006,
    "story_id": "N/A",
    "name": "Divine Dragon",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "29900007": {
    "id": 29900007,
    "story_id": "N/A",
    "name": "Cat Sìth",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "29900008": {
    "id": 29900008,
    "story_id": "N/A",
    "name": "Mars",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "29900009": {
    "id": 29900009,
    "story_id": "N/A",
    "name": "Cat Sìth",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "29900010": {
    "id": 29900010,
    "story_id": "N/A",
    "name": "Arsène",
    "element": 5,
    "rarity": 5,
    "has_spiral": true,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "29900011": {
    "id": 29900011,
    "story_id": "N/A",
    "name": "Carmen",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "29900012": {
    "id": 29900012,
    "story_id": "N/A",
    "name": "Zorro",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "29900013": {
    "id": 29900013,
    "story_id": "N/A",
    "name": "Pithos",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "29900014": {
    "id": 29900014,
    "story_id": "N/A",
    "name": "Metamorphosis",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "29900015": {
    "id": 29900015,
    "story_id": "N/A",
    "name": "Midgardsormr",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  },
  "29900016": {
    "id": 29900016,
    "story_id": "N/A",
    "name": "Mercury",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "29900017": {
    "id": 29900017,
    "story_id": "N/A",
    "name": "Heavenly Wings",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "29900018": {
    "id": 29900018,
    "story_id": "N/A",
    "name": "Metamorphosis",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "29900019": {
    "id": 29900019,
    "story_id": "N/A",
    "name": "Summer Cat Sìth",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "29900020": {
    "id": 29900020,
    "story_id": "N/A",
    "name": "Bahamut",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "29900021": {
    "id": 29900021,
    "story_id": "N/A",
    "name": "Jupiter",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "29900022": {
    "id": 29900022,
    "story_id": "N/A",
    "name": "Zodiark",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "29900023": {
    "id": 29900023,
    "story_id": "N/A",
    "name": "Beast Form",
    "element": 1,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 127
  },
  "29900024": {
    "id": 29900024,
    "story_id": "N/A",
    "name": "Mercury",
    "element": 2,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 370,
    "max_atk": 125
  },
  "29900025": {
    "id": 29900025,
    "story_id": "N/A",
    "name": "Thor",
    "element": 4,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 37,
    "base_atk": 12,
    "max_hp": 371,
    "max_atk": 124
  },
  "29900026": {
    "id": 29900026,
    "story_id": "N/A",
    "name": "Bahamut",
    "element": 5,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 368,
    "max_atk": 128
  },
  "29900027": {
    "id": 29900027,
    "story_id": "N/A",
    "name": "Primal Midgardsormr",
    "element": 3,
    "rarity": 5,
    "has_spiral": false,
    "sellcoin": 5000,
    "sellwater": 300,
    "base_hp": 36,
    "base_atk": 12,
    "max_hp": 369,
    "max_atk": 126
  } /*,
	"29800001": {
        "id": 29800001,
        "story_id": "N/A",
        "name": "Fafnir",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29800002": {
        "id": 29800002,
        "story_id": "N/A",
        "name": "Fafnir",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29800003": {
        "id": 29800003,
        "story_id": "N/A",
        "name": "Fafnir",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"21000001": {
        "id": 21000001,
        "story_id": "N/A",
        "name": "Elysium",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"21000002": {
        "id": 21000002,
        "story_id": "N/A",
        "name": "Cthonius",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"21000003": {
        "id": 21000003,
        "story_id": "N/A",
        "name": "Notte",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"21000004": {
        "id": 21000004,
        "story_id": "N/A",
        "name": "Tsukiyomi",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"21000005": {
        "id": 21000005,
        "story_id": "N/A",
        "name": "PriMids",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"21000006": {
        "id": 21000006,
        "story_id": "N/A",
        "name": "Midgardsormr",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29940301": {
        "id": 29940301,
        "story_id": "N/A",
        "name": "Midgardsormr",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950116": {
        "id": 29950116,
        "story_id": "N/A",
        "name": "Gozu Tenno",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950121": {
        "id": 29950121,
        "story_id": "N/A",
        "name": "Uriel",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950317": {
        "id": 29950317,
        "story_id": "N/A",
        "name": "Menoetius",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950320": {
        "id": 29950320,
        "story_id": "N/A",
        "name": "Fudo Myo-o",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950405": {
        "id": 29950405,
        "story_id": "N/A",
        "name": "Cupid",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950415": {
        "id": 29950415,
        "story_id": "N/A",
        "name": "Raphael",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950416": {
        "id": 29950416,
        "story_id": "N/A",
        "name": "Cat Sith",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950518": {
        "id": 29950518,
        "story_id": "N/A",
        "name": "Azazel",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950522": {
        "id": 29950522,
        "story_id": "N/A",
        "name": "Arsene",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950523": {
        "id": 29950523,
        "story_id": "N/A",
        "name": "High Chthonius",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950524": {
        "id": 29950524,
        "story_id": "N/A",
        "name": "Reborn Nidhogg",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    },
	"29950525": {
        "id": 29950525,
        "story_id": "N/A",
        "name": "Bahamut",
        "rarity": 5,
        "has_spiral": false,
        "sellcoin": 5000,
        "sellwater": 300,
        "base_hp": 36,
        "base_atk": 12,
        "max_hp": 368,
        "max_atk": 128
    } */
}
function GetDragonInfo(DragonID, Attribute) {
	return DragonInfoMap[String(DragonID)][Attribute];
}

function GenerateDragonReliability(ID) {
		var Template = {
		'dragon_id': DragonInfoMap[String(ID)]['id'],
        'get_time': Math.floor(Date.now() / 1000),
        'reliability_level': 1,
        'reliability_total_exp': 0,
        'last_contact_time': 0
	}
	return Template;
}

function CreateDragonFromGift(KeyID, ID, Level) {
	var DragonTemplate = {
		"dragon_key_id": KeyID,
        "dragon_id": ID,
		"rarity": DragonInfoMap[String(ID)]['rarity'],
        "level": Level,
        "hp_plus_count": 0,
        "attack_plus_count": 0,
        "exp": 0,
        "is_lock": 0,
        "is_new": 1,
        "get_time": Math.floor(Date.now() / 1000),
        "skill_1_level": 1,
        "ability_1_level": 1,
        "ability_2_level": 0,
        "limit_break_count": 0
	}
	return DragonTemplate;
}

function LimitBreakDragon(UserIndexRecord, KeyID, PreviousData, GrowList, AlbumBonus) {
	let DeleteList = [];
	let MaterialList = [];
	let AlbumList = [];
	const Rarity = GetDragonInfo(PreviousData['dragon_id'], "rarity");
	const Element = GetDragonInfo(PreviousData['dragon_id'], "element");
	var DragonTemplate = {
		"dragon_key_id": KeyID,
        "dragon_id": PreviousData['dragon_id'],
        "level": PreviousData['level'],
        "hp_plus_count": PreviousData['hp_plus_count'],
        "attack_plus_count": PreviousData['attack_plus_count'],
        "exp": PreviousData['exp'],
        "is_lock": PreviousData['is_lock'],
        "is_new": 0,
        "get_time": PreviousData['get_time'],
        "skill_1_level": PreviousData['skill_1_level'],
        "ability_1_level": PreviousData['ability_1_level'],
        "ability_2_level": PreviousData['ability_2_level'],
        "limit_break_count": PreviousData['limit_break_count']
	}
	for (let i in GrowList) {
		switch(GrowList[i]['limit_break_item_type']) {
			case 1:
				DragonTemplate['limit_break_count'] = GrowList[i]['limit_break_count'];
				DragonTemplate['ability_1_level'] = GrowList[i]['limit_break_count'] + 1;
				if (GrowList[i]['limit_break_count'] <= 4) { DragonTemplate['ability_2_level'] = GrowList[i]['limit_break_count'] + 1; }
				if (DragonTemplate['limit_break_count'] >= 4) { DragonTemplate['skill_1_level'] == 2; }
				const DragonIndex = UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === GrowList[i]['target_id']);
				UserIndexRecord['dragon_list'].splice(DragonIndex, 1);
				DeleteList.push({ 'dragon_key_id': GrowList[i]['target_id'] });
				break;
			case 2:
				DragonTemplate['limit_break_count'] = GrowList[i]['limit_break_count'];
				DragonTemplate['ability_1_level'] = GrowList[i]['limit_break_count'] + 1;
				if (GrowList[i]['limit_break_count'] <= 4) { DragonTemplate['ability_2_level'] = GrowList[i]['limit_break_count'] + 1; }
				if (DragonTemplate['limit_break_count'] >= 4) { DragonTemplate['skill_1_level'] == 2; }
				// const ItemIndex = UserIndexRecord['material_list'].findIndex(x => x.material_id === GrowList[i]['target_id']);
				// UserIndexRecord['material_list'][ItemIndex]['quantity'] -= 1;
				// MaterialList.push({ 'material_id': GrowList[i]['target_id'], 'quantity': UserIndexRecord['material_list'][ItemIndex]['quantity'] });
				break;
			case 3:
				DragonTemplate['limit_break_count'] = GrowList[i]['limit_break_count'];
				DragonTemplate['ability_1_level'] = GrowList[i]['limit_break_count'] + 1;
				if (GrowList[i]['limit_break_count'] <= 4) { DragonTemplate['ability_2_level'] = GrowList[i]['limit_break_count'] + 1; }
				if (DragonTemplate['limit_break_count'] >= 4) { DragonTemplate['skill_1_level'] == 2; }
				// uses essense... Is that a material?
				break;
			case 4:
				DragonTemplate['limit_break_count'] = GrowList[i]['limit_break_count'];
				DragonTemplate['ability_1_level'] = GrowList[i]['limit_break_count'] + 1;
				if (GrowList[i]['limit_break_count'] <= 4) { DragonTemplate['ability_2_level'] = GrowList[i]['limit_break_count'] + 1; }
				if (DragonTemplate['limit_break_count'] >= 4) { DragonTemplate['skill_1_level'] == 2; }
				// uses essense... Is that a material? specifically for 5th unbind
				break;
		}
	}
	var AlbumTemplate = {
		"dragon_id": PreviousData['dragon_id'],
        "max_level": DragonTemplate['level'],
		"max_limit_break_count": DragonTemplate['limit_break_count']
	}
	AlbumBonusIndex = AlbumBonus.findIndex(x => x.elemental_type == Element);
	const AlbumIndex = UserIndexRecord['album_dragon_list'].findIndex(x => x.dragon_id == PreviousData['dragon_id']);
	if (AlbumIndex == -1) {
		AlbumList.push(AlbumTemplate);
		if (DragonTemplate['limit_break_count'] >= 4) { AlbumBonus[AlbumBonusIndex]['hp'] += 0.1; AlbumBonus[AlbumBonusIndex]['attack'] += 0.1; }
		if (DragonTemplate['limit_break_count'] == 5) { AlbumBonus[AlbumBonusIndex]['hp'] += 0.1; AlbumBonus[AlbumBonusIndex]['attack'] += 0.1; }
	}
	else {
		if (UserIndexRecord['album_dragon_list'][AlbumIndex]['max_level'] < DragonTemplate['level']) {
			UserIndexRecord['album_dragon_list'][AlbumIndex]['max_level'] = DragonTemplate['level'] }
		if (UserIndexRecord['album_dragon_list'][AlbumIndex]['max_limit_break_count'] < DragonTemplate['limit_break_count']) {
			if (DragonTemplate['limit_break_count'] >= 4) { AlbumBonus[AlbumBonusIndex]['hp'] += 0.1; AlbumBonus[AlbumBonusIndex]['attack'] += 0.1; }
			if (DragonTemplate['limit_break_count'] == 5) { AlbumBonus[AlbumBonusIndex]['hp'] += 0.1; AlbumBonus[AlbumBonusIndex]['attack'] += 0.1; }
			UserIndexRecord['album_dragon_list'][AlbumIndex]['max_limit_break_count'] = DragonTemplate['limit_break_count'] }
	}
	return [DragonTemplate, DeleteList, MaterialList, UserIndexRecord, AlbumList, AlbumBonus];
}

function BuildDragon(KeyID, Buildup, PreviousData) {
	const Rarity = GetDragonInfo(PreviousData['dragon_id'], "rarity");
	var DragonTemplate = {
		"dragon_key_id": KeyID,
        "dragon_id": PreviousData['dragon_id'],
        "level": PreviousData['level'],
        "hp_plus_count": PreviousData['hp_plus_count'],
        "attack_plus_count": PreviousData['attack_plus_count'],
        "exp": PreviousData['exp'],
        "is_lock": PreviousData['is_lock'],
        "is_new": 0,
        "get_time": PreviousData['get_time'],
        "skill_1_level": PreviousData['skill_1_level'],
        "ability_1_level": PreviousData['ability_1_level'],
        "ability_2_level": PreviousData['ability_2_level'],
        "limit_break_count": PreviousData['limit_break_count']
	}
	for (let i in Buildup) {
		let NewData = [];
		switch(Buildup[i]['id']) {
			case 102001001: //150
				NewData = LevelMap.Dragon(Rarity, DragonTemplate['limit_break_count'], DragonTemplate['exp'] + Buildup[i]['quantity'] * 150);
				DragonTemplate['level'] = NewData[0], DragonTemplate['exp'] = NewData[1];
				break;
			case 102001002: //1000
				NewData = LevelMap.Dragon(Rarity, DragonTemplate['limit_break_count'], DragonTemplate['exp'] + Buildup[i]['quantity'] * 1000);
				DragonTemplate['level'] = NewData[0], DragonTemplate['exp'] = NewData[1];
				break;
			case 102001003: //3500
				NewData = LevelMap.Dragon(Rarity, DragonTemplate['limit_break_count'], DragonTemplate['exp'] + Buildup[i]['quantity'] * 3500);
				DragonTemplate['level'] = NewData[0], DragonTemplate['exp'] = NewData[1];
				break;
			case 118001001: //hp
				DragonTemplate['hp_plus_count'] += Buildup[i]['quantity'];
				break;
			case 119001001: //atk
				DragonTemplate['attack_plus_count'] += Buildup[i]['quantity'];
				break;
		}
	}
	let AlbumBonus = 0.0;
	switch(Rarity) {
		case 3:
			if (PreviousData['level'] < 60 && DragonTemplate['level'] >= 60) { AlbumBonus += 0.1; }
			break;
		case 4:
			if (PreviousData['level'] < 80 && DragonTemplate['level'] >= 80) { AlbumBonus += 0.1; }
			break;
		case 5:
			const HasSpiral = GetDragonInfo(PreviousData['dragon_id'], "has_spiral");
			if (HasSpiral == true) {
				if (PreviousData['level'] < 100 && DragonTemplate['level'] >= 100) { AlbumBonus += 0.1; }
				if (PreviousData['level'] < 120 && DragonTemplate['level'] >= 120) { AlbumBonus += 0.1; }
			}
			else {
				if (PreviousData['level'] < 100 && DragonTemplate['level'] >= 100) { AlbumBonus += 0.1; }
			}
			break;
	}
	return [DragonTemplate, AlbumBonus];
}

function DragonIDByName(DragonName) {
	let i = 0;
	while (i < Object.keys(DragonInfoMap).length) {
		const DragonID = Object.keys(DragonInfoMap)[i];
		if (DragonInfoMap[DragonID]['name'] == DragonName) {
			return parseInt(Object.keys(DragonInfoMap)[i]);
		}
		else {
			i++;
		}
	}
	return 1;
}

function GetRarityMap(Rarity) {
	let i = 0;
	let RarityMap = [];
	while (i < Object.keys(DragonInfoMap).length) {
		const DragonID = Object.keys(DragonInfoMap)[i];
		if (DragonInfoMap[DragonID]['rarity'] == Rarity) {
			RarityMap.push(DragonID);
			i++;
		}
		else { i++; }
	}
	return RarityMap;
}

function DrawDragon() {
	let RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
	let RandomDragonID = Object.keys(DragonInfoMap)[RandomNumber];
	var DragonData = {
		'entity_type': 7,
		'id': parseInt(RandomDragonID),
		'rarity': DragonInfoMap[String(RandomDragonID)]['rarity']
	}
	return DragonData;
}
function DrawDragonCorrect() {
	const Blacklist = [ 20040101, 20050102, 20040301, 20050302, 20040201, 20050202,
					    20040401, 20050402, 20040501, 20050502, 20050511, 20040504,
					    20040505, 20050103, 20050105, 20050111, 20050115, 20050206,
						20050215, 20050303, 20050307, 20050310, 20050417, 20050504,
						20050505, 20050507, 20050512, 20050515, 20050517, 
					    29900001, 29900002, 29900003, 29900004, 29900005, 29900006,
					    29900007, 29900008, 29900009, 29900010, 29900011, 29900012,
					    29900013, 29900014, 29900015, 29900016, 29900017, 29900018,
					    29900019, 29900020, 29900021, 29900022, 29900023, 29900024,
					    29900025, 29900026, 29900027,								
						29800001, 29800002, 29800003,
						21000001, 21000002, 21000003, 21000004, 21000005, 21000006,
						29950116, 29950121, 29950317, 29950320, 29950405, 29950415,
						29950416, 29950518, 29950522, 29950523, 29950524, 29950525,
						20050513 ]
	let AssignedDragonID = "";
	let RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
	let RandomDragonID = Object.keys(DragonInfoMap)[RandomNumber];
	let RandomDragonID2 = "";
	let RandomDragonID3 = "";
	let RandomDragonID4 = "";
	let RandomDragonID5 = "";
	let RandomDragonID6 = "";
	while (Blacklist.includes(parseInt(RandomDragonID)) == true) {
		RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
		RandomDragonID = Object.keys(DragonInfoMap)[RandomNumber];
	}
	if (DragonInfoMap[String(RandomDragonID)]['rarity'] == 5) {
		RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
		RandomDragonID2 = Object.keys(DragonInfoMap)[RandomNumber];
		while (Blacklist.includes(parseInt(RandomDragonID2)) == true) {
			RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
			RandomDragonID2 = Object.keys(DragonInfoMap)[RandomNumber];
		}
		RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
		RandomDragonID3 = Object.keys(DragonInfoMap)[RandomNumber];
		while (Blacklist.includes(parseInt(RandomDragonID3)) == true) {
			RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
			RandomDragonID3 = Object.keys(DragonInfoMap)[RandomNumber];
		}
		RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
		RandomDragonID4 = Object.keys(DragonInfoMap)[RandomNumber];
		while (Blacklist.includes(parseInt(RandomDragonID4)) == true) {
			RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
			RandomDragonID4 = Object.keys(DragonInfoMap)[RandomNumber];
		}
		RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
		RandomDragonID5 = Object.keys(DragonInfoMap)[RandomNumber];
		while (Blacklist.includes(parseInt(RandomDragonID5)) == true) {
			RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
			RandomDragonID5 = Object.keys(DragonInfoMap)[RandomNumber];
		}
		RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
		RandomDragonID6 = Object.keys(DragonInfoMap)[RandomNumber];
		while (Blacklist.includes(parseInt(RandomDragonID6)) == true) {
			RandomNumber = Math.floor(Math.random() * Object.keys(DragonInfoMap).length);
			RandomDragonID6 = Object.keys(DragonInfoMap)[RandomNumber];
		}
		if (DragonInfoMap[String(RandomDragonID2)]['rarity'] == 3 || DragonInfoMap[String(RandomDragonID2)]['rarity'] == 4) {
			AssignedDragonID = RandomDragonID2; }
		else if (DragonInfoMap[String(RandomDragonID3)]['rarity'] == 3 || DragonInfoMap[String(RandomDragonID3)]['rarity'] == 4) {
			AssignedDragonID = RandomDragonID3; }
		else if (DragonInfoMap[String(RandomDragonID4)]['rarity'] == 3 || DragonInfoMap[String(RandomDragonID4)]['rarity'] == 4) {
			AssignedDragonID = RandomDragonID4; }
		else if (DragonInfoMap[String(RandomDragonID5)]['rarity'] == 3 || DragonInfoMap[String(RandomDragonID4)]['rarity'] == 4) {
			AssignedDragonID = RandomDragonID5; }
		else if (DragonInfoMap[String(RandomDragonID6)]['rarity'] == 3 || DragonInfoMap[String(RandomDragonID4)]['rarity'] == 4) {
			AssignedDragonID = RandomDragonID6; }
		else { AssignedDragonID = RandomDragonID; }
	}
	else { AssignedDragonID = RandomDragonID; }
	var DragonData = {
		'entity_type': 7,
		'id': parseInt(AssignedDragonID),
		'rarity': DragonInfoMap[String(AssignedDragonID)]['rarity']
	}
	return DragonData;
}

module.exports = { DragonInfoMap, GetDragonInfo, GenerateDragonReliability, CreateDragonFromGift, DragonIDByName, GetRarityMap, DrawDragon, DrawDragonCorrect, BuildDragon, LimitBreakDragon }