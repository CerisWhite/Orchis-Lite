// Quest Map
var fs = require('fs');
const path = require('path');

function GetQuestInfo(QuestID, Attribute) {
	try {
		var QuestInfoMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'Quest', String(QuestID) + ".json")));
		return QuestInfoMap[Attribute];
	}
	catch {
		console.log("Faulty Quest ID " + QuestID);
	}
}

function GetMultiplier(QuestID) {
	return 1;
}

function GetQuestDrops(QuestID) {
	let CoinCount = 0;
	let ManaCount = 0;
	let WyrmiteCount = 5;
	let DropTable = [];
	var QuestInfoMap = JSON.parse(fs.readFileSync('./Library/idmaps/Quest/' + String(QuestID) + ".json"));
	
	if (QuestID >= 210010101 && QuestID <= 210051104) { CoinCount += 150000; }
	if (QuestID >= 219010101 && QuestID <= 219051103) { CoinCount += 150000; }
	if (QuestID >= 228010101 && QuestID <= 228051103) { CoinCount += 150000; }
	if (QuestID >= 232010101 && QuestID <= 233051103) { CoinCount += 150000; }
	
	const DropMultiplier = GetMultiplier(QuestID);
	
	if (QuestInfoMap['ChestDropInfo'] != undefined) {
	for (let i in QuestInfoMap['ChestDropInfo']) {
		const DropData = QuestInfoMap['ChestDropInfo'][i];
		switch(DropData['type']) {
			case 4: CoinCount += DropData['max']; break;
			// case 1: case 5: case 6: case 7: 
			case 8:
				const Roll = Math.floor(Math.random() * 20) + 1;
				if (DropData['special'] == true) {
					if (Roll >= 15) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); } }
				}
				else if (DropData['promise'] == true || Roll >= 8) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); }
				}
				break;
			//case 13: WyrmiteCount += DropData['max']; break;
			//case 15: break;
			case 18: ManaCount += DropData['max']; break;
		}
	}}
	
	if (QuestInfoMap['EnemyDropInfo'] != undefined) {
	for (let y in QuestInfoMap['EnemyDropInfo']) {
		const DropData = QuestInfoMap['EnemyDropInfo'][y];
		switch(DropData['type']) {
			case 4: CoinCount += DropData['max']; break;
			// case 1: case 5: case 6: case 7: 
			case 8:
				const Roll = Math.floor(Math.random() * 20) + 1;
				if (DropData['special'] == true) {
					if (Roll >= 15) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); } }
				}
				else if (DropData['promise'] == true || Roll >= 4) {
					const Difference = DropData['max'] - DropData['min'];
					const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
					const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
					if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
					else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); }
				}
				break;
			//case 13: WyrmiteCount += DropData['max']; break;
			//case 15: break;
			case 18: ManaCount += DropData['max']; break;
		}
	}}
	
	DropTable.push({ "type": 23, "id": 0, "quantity": WyrmiteCount, "place": 0 });
	return [DropTable, CoinCount, ManaCount, WyrmiteCount];
}
function GetQuestDropsSkip(QuestID, PlayCount) {
	let CoinCount = 0;
	let ManaCount = 0;
	let WyrmiteCount = 5 * PlayCount;
	let DropTable = [];
	var QuestInfoMap = JSON.parse(fs.readFileSync('./Library/idmaps/Quest/' + String(QuestID) + ".json"));
	
	if (QuestID >= 210010101 && QuestID <= 210051104) { CoinCount += 150000; }
	if (QuestID >= 219010101 && QuestID <= 219051103) { CoinCount += 150000; }
	if (QuestID >= 228010101 && QuestID <= 228051103) { CoinCount += 150000; }
	if (QuestID >= 232010101 && QuestID <= 233051103) { CoinCount += 150000; }
	
	const DropMultiplier = GetMultiplier(QuestID);
	
	let w = 0; while (w < PlayCount) {
		if (QuestInfoMap['ChestDropInfo'] != undefined) {
		for (let i in QuestInfoMap['ChestDropInfo']) {
			const DropData = QuestInfoMap['ChestDropInfo'][i];
			switch(DropData['type']) {
				case 4: CoinCount += DropData['max']; break;
				// case 1: case 5: case 6: case 7: 
				case 8:
					const Roll = Math.floor(Math.random() * 20) + 1;
					if (DropData['special'] == true) {
						if (Roll >= 18) {
							const Difference = DropData['max'] - DropData['min'];
							const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
							const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
							if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
							else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); } }
					}
					else if (DropData['promise'] == true || Roll >= 4) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); }
					}
					break;
				//case 13: WyrmiteCount += DropData['max']; break;
				//case 15: break;
				case 18: ManaCount += DropData['max']; break;
			}
		}}
		if (QuestInfoMap['EnemyDropInfo'] != undefined) {
		for (let y in QuestInfoMap['EnemyDropInfo']) {
			const DropData = QuestInfoMap['EnemyDropInfo'][y];
			switch(DropData['type']) {
				case 4: CoinCount += DropData['max']; break;
				// case 1: case 5: case 6: case 7: 
				case 8:
					const Roll = Math.floor(Math.random() * 20) + 1;
					if (DropData['special'] == true) {
						if (Roll >= 15) {
							const Difference = DropData['max'] - DropData['min'];
							const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
							const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
							if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
							else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); } }
					}
					else if (DropData['promise'] == true || Roll >= 4) {
						const Difference = DropData['max'] - DropData['min'];
						const Amount = Math.floor(Math.random() * Difference + DropData['min']) * DropMultiplier;
						const ExistID = DropTable.findIndex(x => x.id == DropData['id']);
						if (ExistID != -1) { DropTable[ExistID]['quantity'] += Amount; }
						else { DropTable.push({'type': DropData['type'], 'id': DropData['id'], 'quantity': Amount, 'place': 0, 'factor': 0}); }
					}
					break;
				//case 13: WyrmiteCount += DropData['max']; break;
				//case 15: break;
				case 18: ManaCount += DropData['max']; break;
			}
		}}
		w++;
	}
	let z = 0; while(z < DropTable.length) { if (DropTable[z]['quantity'] > 999000) { DropTable[z]['quantity'] = 999000; } z++; }
	DropTable.push({ "type": 23, "id": 0, "quantity": WyrmiteCount, "place": 0 });
	return [DropTable, CoinCount, ManaCount, WyrmiteCount];
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


module.exports = { GetQuestInfo, GetQuestDrops, GetQuestDropsSkip, FormatWallDrops, HasRewardCharacter, RewardCharacter, HasRewardDragon, RewardDragon }