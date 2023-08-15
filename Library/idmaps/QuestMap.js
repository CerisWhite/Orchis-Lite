// Quest Map
var fs = require('fs');
const Rotations = JSON.parse(fs.readFileSync('./Library/event/QuestMainRotationBonusDrops.json'));
const QuestEnemyList = JSON.parse(fs.readFileSync('./Library/event/QuestEnemyList.json'));

function GetQuestInfo(QuestID, Attribute) {
	try {
		var QuestInfoMap = JSON.parse(fs.readFileSync('./Library/idmaps/Quest/' + String(QuestID) + ".json"));
		return QuestInfoMap[Attribute];
	}
	catch {
		console.log("Faulty Quest ID " + QuestID);
	}
}

const IntervalTypes = [
	{'id': 0,'match': []}, //None
	{'id': 1,'match': [0,1,2,3,4,5,6]}, //Daily
	{'id': 2,'match': [0,6]}, //Weekend
	{'id': 3,'match': [0]}, //Sunday
	{'id': 4,'match': [1]}, //Monday
	{'id': 5,'match': [2]}, //Tuesday
	{'id': 6,'match': [3]}, //Wednesday
	{'id': 7,'match': [4]}, //Thursday
	{'id': 8,'match': [5]}, //Friday
	{'id': 9,'match': [6]}, //Saturday
	{'id': 10,'match': [0,1]}, //Sunday/Monday
	{'id': 11,'match': [1,2]}, //Monday/Tuesday
	{'id': 12,'match': [1,3]}, //Monday/Wednesday
	{'id': 13,'match': [1,4]}, //Monday/Thursday
	{'id': 14,'match': [1,5]}, //Monday/Friday
	{'id': 15,'match': [1,6]}, //Monday/Saturday
	{'id': 17,'match': [0,1,6]}, //Sunday/Monday/Saturday
	{'id': 18,'match': [0,2,6]}, //Sunday/Tuesday/Saturday
	{'id': 19,'match': [0,3,6]}, //Sunday/Wednesday/Saturday
	{'id': 20,'match': [0,4,6]}, //Sunday/Thursday/Saturday
	{'id': 21,'match': [0,5,6]}, //Sunday/Friday/Saturday
	{'id': 22,'match': [0,6]}, //Sunday/Saturday
	{'id': 23,'match': []}, //Event
	{'id': 24,'match': [0,1,4,6]}, //Sunday/Monday/Thursday/Saturday
	{'id': 25,'match': [0,2,5,6]}, //Sunday/Tuesday/Friday/Saturday
	{'id': 26,'match': [0,1,3,6]}, //Sunday/Monday/Wednesday/Saturday
	{'id': 27,'match': [0,3,5,6]}, //Sunday/Wednesday/Friday/Saturday
	{'id': 28,'match': [0,2,4,6]}, //Sunday/Tuesday/Thursday/Saturday
	{'id': 29,'match': [0,6]}, //Sunday/Saturday
]
function GetMultiplier(QuestID) {
	let Value = 1;
	const RotationIndex = Rotations.findIndex(x => x.group_id == QuestID);
	if (RotationIndex != -1) {
		const RotationsData = Rotations[RotationIndex];
		const IntervalIndex = IntervalTypes.findIndex(x => x.id == RotationsData['interval']);
		if (IntervalTypes[IntervalIndex]['match'].includes(new Date().getDay())) {
			Value = RotationsData['drop_multiplier'] + 1;
		}
	}
	return Value;
}

function GetQuestDrops(QuestID) {
	let CoinCount = 0;
	let ManaCount = 0;
	let WyrmiteCount = 10;
	let DropTable = [];
	var QuestInfoMap = JSON.parse(fs.readFileSync('./Library/idmaps/Quest/' + String(QuestID) + ".json"));
	
	if (QuestID >= 210010101 && QuestID <= 210051104) { CoinCount += 150000; }
	if (QuestID >= 219010101 && QuestID <= 219051103) { CoinCount += 150000; }
	if (QuestID >= 228010101 && QuestID <= 228051103) { CoinCount += 150000; }
	if (QuestID >= 232010101 && QuestID <= 233051103) { CoinCount += 150000; }
	
	const RightNow = Math.floor(Date.now() / 1000);
	const DropMultiplier = GetMultiplier(QuestID);
	const Factor = parseFloat((DropMultiplier - 1).toFixed(1));
	
	if (QuestInfoMap['ChestDropInfo'] != undefined) {
	for (let i in QuestInfoMap['ChestDropInfo']) {
		const DropData = QuestInfoMap['ChestDropInfo'][i];
		if (DropData['type'] == 4) { CoinCount += DropData['max']; }
		else if (DropData['type'] == 8 || DropData['type'] == 12 || DropData['type'] == 17 || DropData['type'] == 20 ||
				DropData['type'] == 22 || DropData['type'] == 25 || DropData['type'] == 39) {
			let Roll = Math.floor(Math.random() * 100) + 1;
			if (DropData['extra'] == true) {
				if (Roll >= 95) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
			}
			else if (DropData['special'] == true) {
				if (Roll >= 75) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
			}
			else if (DropData['promise'] == true || Roll >= 30) {
				const Difference = DropData['max'] - DropData['min'];
				const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
				const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
				if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
				else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); }
			}
		}
		else if (DropData['type'] == 18) { ManaCount += DropData['max']; }
		// case 1: case 5: case 6: case 7: 
		//case 13: WyrmiteCount += DropData['max']; break;
		//case 15: break;
	}}
	
	if (QuestInfoMap['EnemyDropInfo'] != undefined) {
	for (let y in QuestInfoMap['EnemyDropInfo']) {
		const DropData = QuestInfoMap['EnemyDropInfo'][y];
		if (DropData['type'] == 4) { CoinCount += DropData['max']; }
		else if (DropData['type'] == 8 || DropData['type'] == 12 || DropData['type'] == 17 || DropData['type'] == 20 ||
				DropData['type'] == 22 || DropData['type'] == 25 || DropData['type'] == 39) {
			let Roll = Math.floor(Math.random() * 100) + 1;
			if (DropData['extra'] == true) {
				if (Roll >= 95) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
			}
			else if (DropData['special'] == true) {
				if (Roll >= 75) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
			}
			else if (DropData['promise'] == true || Roll >= 30) {
				const Difference = DropData['max'] - DropData['min'];
				const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
				const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
				if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
				else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); }
			}
		}
		else if (DropData['type'] == 18) { ManaCount += DropData['max']; }
		// case 1: case 5: case 6: case 7: 
		//case 13: WyrmiteCount += DropData['max']; break;
		//case 15: break;
	}}
	
	DropTable.push({ "type": 23, "id": 0, "quantity": WyrmiteCount, "place": 0, "factor": 0	});
	return [DropTable, CoinCount, ManaCount, WyrmiteCount];
}
function GetQuestDropsSkip(QuestID, PlayCount) {
	let CoinCount = 0;
	let ManaCount = 0;
	let WyrmiteCount = 10 * PlayCount;
	let DropTable = [];
	var QuestInfoMap = JSON.parse(fs.readFileSync('./Library/idmaps/Quest/' + String(QuestID) + ".json"));
	
	if (QuestID >= 210010101 && QuestID <= 210051104) { CoinCount += 150000; }
	if (QuestID >= 219010101 && QuestID <= 219051103) { CoinCount += 150000; }
	if (QuestID >= 228010101 && QuestID <= 228051103) { CoinCount += 150000; }
	if (QuestID >= 232010101 && QuestID <= 233051103) { CoinCount += 150000; }
	
	const RightNow = Math.floor(Date.now() / 1000);
	const DropMultiplier = GetMultiplier(QuestID);
	const Factor = parseFloat((DropMultiplier - 1).toFixed(1));
	
	let w = 0; while (w < PlayCount) {
		if (QuestInfoMap['ChestDropInfo'] != undefined) {
		for (let i in QuestInfoMap['ChestDropInfo']) {
			const DropData = QuestInfoMap['ChestDropInfo'][i];
			if (DropData['type'] == 4) { CoinCount += DropData['max']; }
			else if (DropData['type'] == 8 || DropData['type'] == 12 || DropData['type'] == 17 || DropData['type'] == 20 ||
				DropData['type'] == 22 || DropData['type'] == 25 || DropData['type'] == 39) {
				let Roll = Math.floor(Math.random() * 100) + 1;
				if (DropData['extra'] == true) {
					if (Roll >= 95) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
				}
				else if (DropData['special'] == true) {
					if (Roll >= 75) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
				}
				else if (DropData['promise'] == true || Roll >= 30) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); }
				}
			}
			else if (DropData['type'] == 18) { ManaCount += DropData['max']; }
		}}
		if (QuestInfoMap['EnemyDropInfo'] != undefined) {
		for (let y in QuestInfoMap['EnemyDropInfo']) {
			const DropData = QuestInfoMap['EnemyDropInfo'][y];
			if (DropData['type'] == 4) { CoinCount += DropData['max']; }
			else if (DropData['type'] == 8 || DropData['type'] == 12 || DropData['type'] == 17 || DropData['type'] == 20 ||
				DropData['type'] == 22 || DropData['type'] == 25 || DropData['type'] == 39) {
				let Roll = Math.floor(Math.random() * 100) + 1;
				if (DropData['extra'] == true) {
					if (Roll >= 95) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
				}
				else if (DropData['special'] == true) {
					if (Roll >= 75) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); } }
				}
				else if (DropData['promise'] == true || Roll >= 30) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': Factor}); }
				}
			}
			else if (DropData['type'] == 18) { ManaCount += DropData['max']; }
		}}
		w++;
	}
	let z = 0; while(z < DropTable.length) { if (DropTable[z]['quantity'] > 999000) { DropTable[z]['quantity'] = 999000; } z++; }
	DropTable.push({ "type": 23, "id": 0, "quantity": WyrmiteCount, "place": 0, "factor": 0	});
	return [DropTable, CoinCount, ManaCount, WyrmiteCount];
}

function GenerateOddsList(QuestID, UserSessionRecord, Step) {
	var QuestInfoMap = JSON.parse(fs.readFileSync('./Library/idmaps/Quest/' + String(QuestID) + ".json"));
	const VariationID = String(QuestInfoMap['variation']);
	const EnemyList = QuestEnemyList[QuestInfoMap['area_info'][Step]['scene_path']][QuestInfoMap['area_info'][Step]['area_name']][VariationID];
	
	let AreaOddsTemplate = {
		'area_index': Step,
		'reaction_obj_count': 0,
		'drop_obj': [],
		'enemy': EnemyList,
		'grade': []
	}
	if (EnemyList.length == 0) { AreaOddsTemplate['enemy'] = []; }
	else if (QuestInfoMap['area_info'].length == 1) {
		if (String(QuestID).slice(0,3) == "204") {
			for (let x in EnemyList) {
				let Divider = 2; if (x > 0) {Divider = (EnemyList.length - 1) * 2;}
				if (EnemyList.length == 1) { Divider = 1; }
				for (let y in UserSessionRecord['DungeonRecord']['DropTable'][0]) {
					const DividedDrop = {
						"type": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['type'],
						"id": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['id'],
						"quantity": Math.round(UserSessionRecord['DungeonRecord']['DropTable'][0][y]['quantity'] / Divider),
						"place": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['place'],
						"factor": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['factor']
					}
					AreaOddsTemplate['enemy'][x]['enemy_drop_list'][0]['drop_list'].push(DividedDrop);
				}
				AreaOddsTemplate['enemy'][x]['enemy_drop_list'][0]['coin'] = Math.round(UserSessionRecord['DungeonRecord']['DropTable'][1] / Divider);
				AreaOddsTemplate['enemy'][x]['enemy_drop_list'][0]['mana'] = Math.round(UserSessionRecord['DungeonRecord']['DropTable'][2] / Divider);
			}
		}
		else {
			AreaOddsTemplate['enemy'][0]['enemy_drop_list'][0]['drop_list'] = UserSessionRecord['DungeonRecord']['DropTable'][0];
			AreaOddsTemplate['enemy'][0]['enemy_drop_list'][0]['coin'] = UserSessionRecord['DungeonRecord']['DropTable'][1];
			AreaOddsTemplate['enemy'][0]['enemy_drop_list'][0]['mana'] = UserSessionRecord['DungeonRecord']['DropTable'][2];
		}
	}
	else {
		for (let x in EnemyList) {
			let Divider = EnemyList.length * QuestInfoMap['area_info'].length;
			for (let y in UserSessionRecord['DungeonRecord']['DropTable'][0]) {
				const DividedDrop = {
					"type": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['type'],
					"id": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['id'],
					"quantity": Math.round(UserSessionRecord['DungeonRecord']['DropTable'][0][y]['quantity'] / Divider),
					"place": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['place'],
					"factor": UserSessionRecord['DungeonRecord']['DropTable'][0][y]['factor']
				}
				AreaOddsTemplate['enemy'][x]['enemy_drop_list'][0]['drop_list'].push(DividedDrop);
			}
			AreaOddsTemplate['enemy'][x]['enemy_drop_list'][0]['coin'] = Math.round(UserSessionRecord['DungeonRecord']['DropTable'][1] / Divider);
			AreaOddsTemplate['enemy'][x]['enemy_drop_list'][0]['mana'] = Math.round(UserSessionRecord['DungeonRecord']['DropTable'][2] / Divider);
		}
	}
	return AreaOddsTemplate;
}

function FormatWallDrops(RewardList) {
	let i = 0;
	let y = 0;
	let DropTable = [];
	
	while (i < RewardList['drop_obj'].length) {
		if (RewardList['drop_obj'][i]['drop_list'][0] != undefined) {
			const DropData = RewardList['drop_obj'][i]['drop_list'][0];
			switch(DropData['entity_type']) {
				// case 1: case 5: case 6: case 7: 
				case 8: 
					if (DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])] != undefined) { DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])]['entity_quantity'] += DropData['entity_quantity']; }
					else { DropTable.push(DropData); } break;
				case 15: 
					if (DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])] != undefined) { DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])]['entity_quantity'] += DropData['entity_quantity']; }
					else { DropTable.push(DropData); } break;
			}
		}
		i++;
	}
	while (y < RewardList['enemy'].length) {
		let v = 0;
		if (RewardList['enemy'][y]['enemy_drop_list'][0] != undefined) {
			if (RewardList['enemy'][y]['enemy_drop_list'][0]['drop_list'][0] != undefined) { 
				while (v < RewardList['enemy'][y]['enemy_drop_list'][0]['drop_list'].length) {
					const DropData = RewardList['enemy'][y]['enemy_drop_list'][0]['drop_list'][v];
					switch(DropData['entity_type']) {
						// case 1: case 5: case 6: case 7: 
						case 8: 
							if (DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])] != undefined) { DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])]['entity_quantity'] += DropData['entity_quantity']; }
							else { DropTable.push(DropData); } break;
						case 15:
							if (DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])] != undefined) { DropTable[DropTable.findIndex(x => x.id == DropData['entity_id'])]['entity_quantity'] += DropData['entity_quantity']; }
							else { DropTable.push(DropData); } break;
					}
					v++;
				}
			}
		}
		y++;
	}
	return DropTable;
}

function HasRewardCharacter(StoryID) {
	const HasRewardList = [ 1000103, 1000106, 1000111, 1000202,
							1000808, 1001108, 1001410, 1001610,
							
							1000311 ];
	if (HasRewardList.includes(StoryID)) { return true; }
	return false;
}

function RewardCharacter(StoryID) {
	let EntityList = {};
	switch(StoryID) {
		case 1000103:
			EntityList = {'entity_type': 1, 'entity_id': 10540201};
			break;
		case 1000106:
			EntityList = {'entity_type': 1, 'entity_id': 10440301};
			break;
		case 1000111:
			EntityList = {'entity_type': 1, 'entity_id': 10840501};
			break;
		case 1000202:
			EntityList = {'entity_type': 1, 'entity_id': 10640401};
			break;
		case 1000808:
			EntityList = {'entity_type': 1, 'entity_id': 10340502};
			break;
		case 1001108:
			EntityList = {'entity_type': 1, 'entity_id': 10240101};
			break;
		case 1001410:
			EntityList = {'entity_type': 1, 'entity_id': 10750504};
			break;
		case 1001610:
			EntityList = {'entity_type': 1, 'entity_id': 10650503};
			break;
		case 1000311:
			EntityList = {'entity_type': 1, 'entity_id': 10550101};
			break;
	}
	return EntityList;
}

function HasRewardDragon(StoryID) {
	const HasRewardList = [ 1000109, 1000210, 1000311, 1000412, 1000509 ]
	if (HasRewardList.includes(StoryID)) { return true; }
	return false;
}

function RewardDragon(StoryID) {
	let EntityList = {};
	switch(StoryID) {
		case 1000109:
			EntityList = {'entity_type': 7, 'entity_id': 20040301};
			break;
		case 1000210:
			EntityList = {'entity_type': 7, 'entity_id': 20040201};
			break;
		case 1000311:
			EntityList = {'entity_type': 7, 'entity_id': 20040101};
			break;
		case 1000412:
			EntityList = {'entity_type': 7, 'entity_id': 20040401};
			break;
		case 1000509:
			EntityList = {'entity_type': 7, 'entity_id': 20040501};
			break;
	}
	return EntityList;
}

function HasRewardFacility(StoryID) {
	const HasRewardList = [ 1000607 ];
	if (HasRewardList.includes(StoryID)) { return true; }
	return false;
}

function RewardFacility(StoryID) {
	let EntityList = [];
	switch(StoryID) {
		case 1000607:
			EntityList = [ 100501, 100502, 100503, 100504, 100505,
						   100506, 100507, 100508, 100509, 100501,
						   100502, 100503, 100504, 100505, 100506,
						   100507, 100508, 100509, 100603 ];
			break;
		case 1000709:
			EntityList = [ 100602 ];
			break;
		case 1000808:
			EntityList = [ 100601 ];
			break;
		case 1000909:
			EntityList = [ 100604 ];
			break;
		case 1001009:
			EntityList = [ 100605 ];
			break;
	}
	return EntityList;
}

/*
function QuestIDByName(QuestName) {
	let i = 0;
	var QuestInfoMap = JSON.parse(fs.fileReadSync('./Quest/' + String(QuestID) + ".json"));
	while (i < Object.keys(QuestInfoMap).length) {
		const QuestID = Object.keys(QuestInfoMap)[i];
		if (QuestInfoMap[QuestID]['name'] == QuestName) {
			return parseInt(Object.keys(QuestInfoMap)[i]);
		}
		else {
			i++;
		}
	}
	return 1;
}
*/

module.exports = { GetQuestInfo, GetQuestDrops, GetQuestDropsSkip, FormatWallDrops, HasRewardCharacter, RewardCharacter, HasRewardDragon, RewardDragon, HasRewardFacility, RewardFacility, GenerateOddsList }