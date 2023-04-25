// DataManager.js
const QuestMap = require('../idmaps/QuestMap.js');
const CharacterMap = require('../idmaps/CharacterMap.js');
const DragonMap = require('../idmaps/DragonMap.js');
const ItemMap = require('../idmaps/ItemMap.js');
const WyrmprintMap = require('../idmaps/WyrmprintMap.js');
const LevelMap = require('../idmaps/LevelMap.js');

function IsSkillOneOrTwo(CharacterID) {
	const SkillNumber = CharacterMap.GetCharacterInfo(CharacterID, "shared_skill_number");
	let Value = ""
	switch(SkillNumber) {
		case 1:
			Value = "skill_1_level";
			break;
		case 2:
			Value = "skill_2_level";
			break;
	}
	return Value;
}

function GetPlayerQuestDataShort(Quest_ID, UserIndexRecord) {
	var QuestIndex = UserIndexRecord.quest_list.findIndex(x => x.quest_id == Quest_ID);
	var QuestData = {}
	if (QuestIndex == -1) {
		QuestData = {
			'quest_id': Quest_ID,
			'play_count': 0,
			'is_mission_clear_1': 0,
			'is_mission_clear_2': 0,
			'is_mission_clear_3': 0
		}
	}
	else {
		QuestData = {
			'quest_id': Quest_ID,
			'play_count': UserIndexRecord['quest_list'][QuestIndex]['play_count'],
			'is_mission_clear_1': UserIndexRecord['quest_list'][QuestIndex]['is_mission_clear_1'],
			'is_mission_clear_2': UserIndexRecord['quest_list'][QuestIndex]['is_mission_clear_2'],
			'is_mission_clear_3': UserIndexRecord['quest_list'][QuestIndex]['is_mission_clear_3']
		}
	}
	return QuestData;
}
function GetPlayerQuestData(Quest_ID, UserIndexRecord) {
	var QuestIndex = UserIndexRecord.quest_list.findIndex(x => x.quest_id == Quest_ID);
	var QuestData = [];
	if (QuestIndex == -1) {
		QuestData.push({
			"quest_id": 100010101,
			"state": 1,
			"is_mission_clear_1": 0,
			"is_mission_clear_2": 0,
			"is_mission_clear_3": 0,
			"play_count": 0,
			"daily_play_count": 0,
			"weekly_play_count": 0,
			"last_daily_reset_time": 0,
			"last_weekly_reset_time": 0,
			"is_appear": 1,
			"best_clear_time": -1.0
		});
	}
	else {
		QuestData.push(UserIndexRecord['quest_list'][QuestIndex]);
	}
	return QuestData;
}
function GetPlayerQuestPlayCount(Quest_ID, UserIndexRecord) {
	var QuestIndex = UserIndexRecord.quest_list.findIndex(x => x.quest_id == Quest_ID);
	var QuestData = {}
	if (QuestIndex == -1) {
		QuestData = 0;
	}
	else {
		QuestData = UserIndexRecord['quest_list'][QuestIndex]['play_count'];
	}
	return QuestData;
}

function GetMissionNotice(UserSessionRecord) {
	var Data = {
		'normal_mission_notice': UserSessionRecord['QuestNotice']['NormalMission'],
		'daily_mission_notice': UserSessionRecord['QuestNotice']['DailyMission'],
		'period_mission_notice': UserSessionRecord['QuestNotice']['EventMission'],
		'beginner_mission_notice': UserSessionRecord['QuestNotice']['BeginnerMission'],
		'special_mission_notice': UserSessionRecord['QuestNotice']['SpecialMission'],
		'main_story_mission_notice': UserSessionRecord['QuestNotice']['StoryMission'],
		'memory_event_mission_notice': UserSessionRecord['QuestNotice']['CompendiumMission'],
		'drill_mission_notice': UserSessionRecord['QuestNotice']['DrillMission'],
		'album_mission_notice': UserSessionRecord['QuestNotice']['AlbumMission']
	}
	return Data;
}

function KeyIDByTicket(ID) {
	let TicketKeyID = 0;
	switch(ID) {
		case 10101: TicketKeyID = 1; break;
		case 10102: TicketKeyID = 2; break;
		case 10202: TicketKeyID = 3; break;
		case 10301: TicketKeyID = 4; break;
		case 10302: TicketKeyID = 5; break;
		case 10401: TicketKeyID = 6; break;
		case 10402: TicketKeyID = 7; break;
		case 10403: TicketKeyID = 8; break;
		case 10501: TicketKeyID = 9; break;
		case 10502: TicketKeyID = 10; break;
	}
	return TicketKeyID;
}

function DungeonRecord(UserSessionRecord, UserIndexRecord, DungeonKey) {
	var GrowthTable = [];
	var FullGrowthTable = [];
	let PlayerEXP = 250;
	let DungeonEXP = 240;
	for (let i in Object.keys(UserSessionRecord['DungeonRecord']['LastDungeonPartyData'])) {
		if (UserSessionRecord['DungeonRecord']['LastDungeonPartyData'][i]['chara_data']['chara_id'] != undefined) {
			const CharacterData = UserSessionRecord['DungeonRecord']['LastDungeonPartyData'][i]['chara_data'];
			const MaxLevel = 80 + CharacterData['additional_max_level'];
			if (CharacterData['level'] != MaxLevel) {
				var GrowthRecord = {
					'chara_id': CharacterData['chara_id'],
					'take_exp': DungeonEXP
				}
				GrowthTable.push(GrowthRecord);
				const CharacterIndex = UserIndexRecord.chara_list.findIndex(x => x.chara_id == CharacterData['chara_id']);
				const NewData = LevelMap.Character(CharacterData['additional_max_level'], UserIndexRecord['chara_list'][CharacterIndex]['exp'] + DungeonEXP);
				UserIndexRecord['chara_list'][CharacterIndex]['level'] = NewData[0];
				UserIndexRecord['chara_list'][CharacterIndex]['exp'] = NewData[1];
				FullGrowthTable.push(UserIndexRecord['chara_list'][CharacterIndex]);
			} else { GrowthTable.push({'chara_id': CharacterData['chara_id'], 'take_exp': 0}); }
		}
	}
	const DropTable = QuestMap.GetQuestDrops(String(UserSessionRecord['DungeonRecord']['LastQuestID']));
	const ParsedDrops = ItemParser(DropTable[0], UserSessionRecord, UserIndexRecord, "plain");
	UserSessionRecord = ParsedDrops[0]; UserIndexRecord = ParsedDrops[1];
	let UpdateData = ParsedDrops[2]; let NewEntityList = ParsedDrops[3];
	UserIndexRecord['user_data']['coin'] += DropTable[1];
	UserIndexRecord['user_data']['mana_point'] += DropTable[2];
	UserIndexRecord['user_data']['crystal'] += DropTable[3];
	if (UserIndexRecord['user_data']['coin'] > 3000000000) { UserIndexRecord['user_data']['coin'] = 3000000000 }
	if (UserIndexRecord['user_data']['mana_point'] > 3000000000) { UserIndexRecord['user_data']['mana_point'] = 3000000000; }
	if (UserIndexRecord['user_data']['crystal'] > 3000000000) { UserIndexRecord['user_data']['crystal'] = 3000000000 }
	UpdateData['diamond_data'] = { 'free_diamond': 0, 'paid_diamond': UserSessionRecord['Diamantium'] }
	var JSONDict = {
		'data_headers': {
			'result_code': 1
		},
		'data': {
			'time_attack_ranking_data': [],
			'ingame_result_data': {
				'dungeon_key': DungeonKey, // Also stored in SessionRecord. Check if match and only give rewards then?
				'play_type': 1, // QuestMap.GetQuestTypeID(QuestID)
				'quest_id': UserSessionRecord['DungeonRecord']['LastQuestID'],
				'reward_record': {
					'drop_all':	DropTable[0],
					'first_clear_set': [],
					'quest_bonus_list': [],
					'reborn_bonus': [],
					'weekly_limit_reward_list': [],
					'challenge_quest_bonus_list': [],
					'campaign_extra_reward_list': [],
					'shop_quest_bonus_factor': 0,
					'mission_complete': [],
					'missions_clear_set': [],
					'enemy_piece': [],
					'take_coin': DropTable[1],
					'take_accumulate_point': 0,
					'take_boost_accumulate_point': 0,
					'player_level_up_fstone':  0,
					'first_meeting': [],
					'take_astral_item_quantity': 0,
					'carry_bonus': []
				},
				'grow_record': {
					'take_player_exp': PlayerEXP,
					'take_chara_exp': DungeonEXP,
					'take_mana': DropTable[2],
					'bonus_factor': 1.0,
					'mana_bonus_factor': 1.0,
					'chara_grow_record': GrowthTable,
					'chara_friendship_list': []
				},
				'start_time': UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'],
				'end_time': 0,
				'current_play_count': GetPlayerQuestPlayCount(UserSessionRecord['DungeonRecord']['LastQuestID'], UserIndexRecord),
				'is_clear': 1,
				'state': 1,
				'is_host': 1,
				'is_fever_time': 0,
				'wave_count': 0,
				'reborn_count': 0,
				'helper_list': UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][1],
				'helper_detail_list': UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'],
				'quest_party_setting_list': UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'],
				'bonus_factor_list': [],
				'scoring_enemy_point_list': [],
				'score_mission_success_list': [],
				'event_passive_up_list': [],
				'clear_time': Math.floor(Date.now() / 1000) - UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'],
				'is_best_clear_time': 0,
				'converted_entity_list': [],
				'dungeon_skip_type': 0,
				'total_play_damage': 0
			},
			'event_damage_ranking': [],
			'repeat_data': [],
			'update_data_list': UpdateData,
			'entity_result': {
				'converted_entity_list': []
			}
		}
	}
	const PlayerLevel = LevelMap.Player(UserIndexRecord['user_data']['exp'] + PlayerEXP);
	const CurrentLevel = UserIndexRecord['user_data']['level'];
	UserIndexRecord['user_data']['level'] = PlayerLevel[0];
	UserIndexRecord['user_data']['exp'] = PlayerLevel[1];
	if (PlayerLevel[0] > CurrentLevel) {
		UserIndexRecord['user_data']['stamina_single'] = PlayerLevel[2];
		// Wyrmite Reward (entity get)??
	}
	JSONDict['data']['update_data_list']['user_data'] = UserIndexRecord['user_data'];
	JSONDict['data']['update_data_list']['chara_list'] = FullGrowthTable;
	var FinalQuestData = [{
		'quest_id': UserSessionRecord['DungeonRecord']['LastQuestID'],
		'state': 3,
		'is_mission_clear_1': 1,
		'is_mission_clear_2': 1,
		'is_mission_clear_3': 1,
		'play_count': GetPlayerQuestPlayCount(UserSessionRecord['DungeonRecord']['LastQuestID'], UserIndexRecord),
		'daily_play_count': 1,
		'weekly_play_count': 1,
		'last_daily_reset_time': Math.floor(Date.now() / 1000),	
		'last_weekly_reset_time': Math.floor(Date.now() / 1000),
		'is_appear': 1,
		'best_clear_time': Math.floor(Date.now() / 1000) - UserSessionRecord['DungeonRecord']['LastDungeonStartedAt']
	}]
	JSONDict['data']['update_data_list']['quest_list'] = FinalQuestData;
	var QuestIndex = UserIndexRecord.quest_list.findIndex(x => x.quest_id == UserSessionRecord['DungeonRecord']['LastQuestID']);
	if (QuestIndex != -1) { UserIndexRecord['quest_list'][QuestIndex] = FinalQuestData[0]; }
	else { UserIndexRecord['quest_list'].push(FinalQuestData[0]); }
	// Include mission updates sometime
	return [JSONDict, UserIndexRecord, UserSessionRecord];
}
function DungeonSkipRecord(UserSessionRecord, UserIndexRecord, DungeonKey, PlayCount) {
	var GrowthTable = [];
	var FullGrowthTable = [];
	let PlayerEXP = 200 * PlayCount;
	let DungeonEXP = 240 * PlayCount;
	for (let i in Object.keys(UserSessionRecord['DungeonRecord']['LastDungeonPartyData'])) {
		if (UserSessionRecord['DungeonRecord']['LastDungeonPartyData'][i]['chara_data']['chara_id'] != undefined) {
			const CharacterData = UserSessionRecord['DungeonRecord']['LastDungeonPartyData'][i]['chara_data'];
			const MaxLevel = 80 + CharacterData['additional_max_level'];
			if (CharacterData['level'] != MaxLevel) {
				var GrowthRecord = {
					'chara_id': CharacterData['chara_id'],
					'take_exp': DungeonEXP
				}
				GrowthTable.push(GrowthRecord);
				const CharacterIndex = UserIndexRecord.chara_list.findIndex(x => x.chara_id == CharacterData['chara_id']);
				const NewData = LevelMap.Character(CharacterData['additional_max_level'], UserIndexRecord['chara_list'][CharacterIndex]['exp'] + DungeonEXP);
				UserIndexRecord['chara_list'][CharacterIndex]['level'] = NewData[0];
				UserIndexRecord['chara_list'][CharacterIndex]['exp'] = NewData[1];
				FullGrowthTable.push(UserIndexRecord['chara_list'][CharacterIndex]);
			} else { GrowthTable.push({'chara_id': CharacterData['chara_id'], 'take_exp': 0}); }
		}
	}
	const DropTable = QuestMap.GetQuestDropsSkip(String(UserSessionRecord['DungeonRecord']['LastQuestID']), PlayCount);
	const ParsedDrops = ItemParser(DropTable[0], UserSessionRecord, UserIndexRecord, "plain");
	UserSessionRecord = ParsedDrops[0]; UserIndexRecord = ParsedDrops[1];
	let UpdateData = ParsedDrops[2]; let NewEntityList = ParsedDrops[3];
	UserIndexRecord['user_data']['coin'] += DropTable[1];
	UserIndexRecord['user_data']['mana_point'] += DropTable[2];
	UserIndexRecord['user_data']['crystal'] += DropTable[3];
	if (UserIndexRecord['user_data']['coin'] > 3000000000) { UserIndexRecord['user_data']['coin'] = 3000000000 }
	if (UserIndexRecord['user_data']['mana_point'] > 3000000000) { UserIndexRecord['user_data']['mana_point'] = 3000000000; }
	if (UserIndexRecord['user_data']['crystal'] > 3000000000) { UserIndexRecord['user_data']['crystal'] = 3000000000 }
	UpdateData['diamond_data'] = { 'free_diamond': 0, 'paid_diamond': UserSessionRecord['Diamantium'] }
	var JSONDict = {
		'data_headers': {
			'result_code': 1
		},
		'data': {
			'time_attack_ranking_data': [],
			'ingame_result_data': {
				'dungeon_key': DungeonKey, // Also stored in SessionRecord. Check if match and only give rewards then?
				'play_type': 1, // QuestMap.GetQuestTypeID(QuestID)
				'quest_id': UserSessionRecord['DungeonRecord']['LastQuestID'],
				'reward_record': {
					'drop_all':	DropTable[0],
					'first_clear_set': [],
					'quest_bonus_list': [],
					'reborn_bonus': [],
					'weekly_limit_reward_list': [],
					'challenge_quest_bonus_list': [],
					'campaign_extra_reward_list': [],
					'shop_quest_bonus_factor': 0,
					'mission_complete': [],
					'missions_clear_set': [],
					'enemy_piece': [],
					'take_coin': DropTable[1],
					'take_accumulate_point': 0,
					'take_boost_accumulate_point': 0,
					'player_level_up_fstone':  0,
					'first_meeting': [],
					'take_astral_item_quantity': 0,
					'carry_bonus': []
				},
				'grow_record': {
					'take_player_exp': PlayerEXP,
					'take_chara_exp': DungeonEXP,
					'take_mana': DropTable[2],
					'bonus_factor': 1.0,
					'mana_bonus_factor': 1.0,
					'chara_grow_record': GrowthTable,
					'chara_friendship_list': []
				},
				'start_time': UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'],
				'end_time': 0,
				'current_play_count': GetPlayerQuestPlayCount(UserSessionRecord['DungeonRecord']['LastQuestID'], UserIndexRecord),
				'is_clear': 1,
				'state': 1,
				'is_host': 1,
				'is_fever_time': 0,
				'wave_count': 0,
				'reborn_count': 0,
				'helper_list': UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'],
				'helper_detail_list': UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'],
				'quest_party_setting_list': UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'],
				'bonus_factor_list': [],
				'scoring_enemy_point_list': [],
				'score_mission_success_list': [],
				'event_passive_up_list': [],
				'clear_time': Math.floor(Date.now() / 1000) - UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'],
				'is_best_clear_time': 0,
				'converted_entity_list': [],
				'dungeon_skip_type': 0,
				'total_play_damage': 0
			},
			'event_damage_ranking': [],
			'repeat_data': [],
			'update_data_list': UpdateData,
			'entity_result': {
				'converted_entity_list': []
			}
		}
	}
	const PlayerLevel = LevelMap.Player(UserIndexRecord['user_data']['exp'] + PlayerEXP);
	const CurrentLevel = UserIndexRecord['user_data']['level'];
	UserIndexRecord['user_data']['level'] = PlayerLevel[0];
	UserIndexRecord['user_data']['exp'] = PlayerLevel[1];
	if (PlayerLevel[0] > CurrentLevel) {
		UserIndexRecord['user_data']['stamina_single'] = PlayerLevel[2];
		// Wyrmite Reward??
	}
	JSONDict['data']['update_data_list']['user_data'] = UserIndexRecord['user_data'];
	JSONDict['data']['update_data_list']['chara_list'] = FullGrowthTable;
	var FinalQuestData = [{
		'quest_id': UserSessionRecord['DungeonRecord']['LastQuestID'],
		'state': 3,
		'is_mission_clear_1': 1,
		'is_mission_clear_2': 1,
		'is_mission_clear_3': 1,
		'play_count': GetPlayerQuestPlayCount(UserSessionRecord['DungeonRecord']['LastQuestID'], UserIndexRecord),
		'daily_play_count': 1,
		'weekly_play_count': 1,
		'last_daily_reset_time': Math.floor(Date.now() / 1000),	
		'last_weekly_reset_time': Math.floor(Date.now() / 1000),
		'is_appear': 1,
		'best_clear_time': Math.floor(Date.now() / 1000) - UserSessionRecord['DungeonRecord']['LastDungeonStartedAt']
	}]
	JSONDict['data']['update_data_list']['quest_list'] = FinalQuestData;
	var QuestIndex = UserIndexRecord.quest_list.findIndex(x => x.quest_id == UserSessionRecord['DungeonRecord']['LastQuestID']);
	if (QuestIndex != -1) { UserIndexRecord['quest_list'][QuestIndex] = FinalQuestData[0]; }
	else { UserIndexRecord['quest_list'].push(FinalQuestData[0]); }
	// Include mission updates sometime
	return [JSONDict, UserIndexRecord, UserSessionRecord];
}
function QuestStep(QuestID) {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'odds_info': QuestMap.GetQuestInfo(QuestID, "odds_info")
		},
		"update_data_list": {  "functional_maintenance_list": [] }
	}
	return JSONDict;
}

function SetClearParty(UserSessionRecord) {
	var JSONDict = {
		"data_headers": {
			"result_code": 1
		},
		"data": {
			"quest_clear_party_setting_list": UserSessionRecord['DungeonRecord']['LastDungeonPartyData'],
			"lost_unit_list": [],
			"update_data_list": { "functional_maintenance_list": [] }
		}
	}
	return JSONDict;
}

function GetWallDrop() {
	let GeneratedDropData = [];
	const DropNumber = Math.round(Math.random() * 4) + 1;
	const PromisedDropList = [ { 'entity_type': 8, 'entity_id': 201021001, 'entity_quantity': 1 } ]
	const SecondaryDropList = [
		{ 'entity_type': 8, 'entity_id': 202005011, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005021, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005031, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005041, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005051, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005061, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005071, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005081, 'entity_quantity': 5 },
		{ 'entity_type': 8, 'entity_id': 202005091, 'entity_quantity': 5 }
	]
	const TertiaryDropList = [
		{ 'entity_type': 8, 'entity_id': 201019011, 'entity_quantity': 1 },
		{ 'entity_type': 8, 'entity_id': 201019021, 'entity_quantity': 1 },
		{ 'entity_type': 8, 'entity_id': 201019031, 'entity_quantity': 1 },
		{ 'entity_type': 8, 'entity_id': 201019041, 'entity_quantity': 1 },
		{ 'entity_type': 8, 'entity_id': 201019051, 'entity_quantity': 1 }
	]
	let i = 0; while (i < DropNumber) {
		switch(i) {
			case 0: for ( let v in PromisedDropList ) { GeneratedDropData.push(PromisedDropList[v]); } break;
			case 1:
				const ElementalValue = Math.floor(Math.random() * 4 + 1); const ElementalID = "20600" + String(ElementalValue) + "001";
				const EssenceValue = parseInt(ElementalID) + Math.floor(Math.random() * 7);
				GeneratedDropData.push({'entity_type': 8, 'entity_id': parseInt(EssenceValue), 'entity_quantity': 5}); break;
			case 2: for ( let v in SecondaryDropList ) { GeneratedDropData.push(SecondaryDropList[v]); } break;
			case 3: for ( let v in TertiaryDropList ) { GeneratedDropData.push(TertiaryDropList[v]); } break;
			case 4: GeneratedDropData.push(DrawRareItem()); break;
		}
		i++;
	}
	var Template = {
		'area_index': 0,
		'reaction_object_count': 0,
		'drop_obj': [],
		'enemy': [
			{
				'param_id': 216011001,
				'is_pop': 1,
				'is_rare': 0,
				'piece': 0,
				'enemy_idx': 0,
				'enemy_drop_list': [
					{
						'coin': 500,
						'mana': 120,
						'drop_list': GeneratedDropData
					}
				]
			}
		],
		'grade': []
	}
	return Template;
}
function DrawRareItem() {
	const EntityType = [8, 17];
	const RareMaterialIDs = [ 125001001, 111002001, 112003001, 114002001 ];
	const RareTicketIDs = [ 10101, 10102, 10202, 10301, 10302,
						10401, 10402, 10403, 10501, 10502 ];
	const DrawType = Math.round(Math.random());
	let DrawID = 0;
	switch(DrawType) { 
		case 0: DrawID = RareMaterialIDs[Math.round(Math.random() * (RareMaterialIDs.length) )]; break;
		case 1: DrawID = RareTicketIDs[Math.round(Math.random() * (RareTicketIDs.length) )]; break; 
	}
	var DrawData = { 'entity_type': EntityType[DrawType], 'entity_id': DrawID, 'entity_quantity': 1 };
	return DrawData;
}
function WallRecord(UserSessionRecord, UserIndexRecord, WallID) {
	const DropTable = QuestMap.FormatWallDrops(UserSessionRecord['Wall']['RewardList']);
	const UpdateData = {}
	for (let y in DropTable) {
		switch(DropTable[y]['entity_type']) {
			case 4:
				UserIndexRecord['user_data']['coin'] += DropTable[y]['entity_quantity'];
				break;
			// case 5: break; case 6: break; case 28: break; case 33: break; case 34: break; case 39: break;
			case 8:
				let NewMaterialData = { 'material_id': DropTable[y]['entity_id'], 'quantity': DropTable[y]['entity_quantity'] }
				const ItemIndex = UserIndexRecord['material_list'].findIndex(x => x.material_id == DropTable[y]['entity_id']);
				if (UpdateData['material_list'] == undefined) { UpdateData['material_list'] = []; }
				if (ItemIndex == -1) { UserIndexRecord['material_list'].push(NewMaterialData); UpdateData['material_list'].push(NewMaterialData); }
				else { UserIndexRecord['material_list'][ItemIndex]['quantity'] += NewMaterialData['quantity']; UpdateData['material_list'].push(UserIndexRecord['material_list'][ItemIndex]); }				
				break;
			case 13:
				UserSessionRecord['Diamantium'] += DropTable[y]['entity_quantity'];
				break;
			case 14:
				UserIndexRecord['user_data']['dew_point'] += DropTable[y]['entity_quantity'];
				break;
			case 15:
				const TicketIndex = UserIndexRecord['summon_ticket_list'].findIndex(x => x.summon_ticket_id === DropTable[y]['entity_id']);
				if (TicketIndex != -1) { UserIndexRecord['summon_ticket_list'][TicketIndex]['quantity'] += DropTable[y]['entity_quantity']; }
				else { UserIndexRecord['summon_ticket_list'].push({'key_id': KeyIDByTicket(DropTable[0][y]['entity_id']), 'summon_ticket_id': DropTable[y]['entity_id'], 'quantity': DropTable[y]['entity_quantity'], 'use_limit_time': 0}); }
				if (UpdateData['summon_ticket_list'] == undefined) { UpdateData['summon_ticket_list'] = []; }
				UpdateData['summon_ticket_list'].push({'key_id': KeyIDByTicket(DropTable[y]['entity_id']), 'summon_ticket_id': DropTable[y]['entity_id'], 'quantity': DropTable[y]['entity_quantity'], 'use_limit_time': 0});
				break;
			case 16:
				UserIndexRecord['user_data']['quest_skip_point'] += DropTable[y]['entity_quantity'];
				break;
			case 18:
				UserIndexRecord['user_data']['mana_point'] += DropTable[y]['entity_quantity'];
				break;
			case 23:
				UserIndexRecord['user_data']['crystal'] += DropTable[y]['entity_quantity'];
				break;
			case 28:
				UserIndexRecord['user_data']['build_time_point'] += DropTable[y]['entity_quantity'];
				break;
			case 39:
				break;
		}
	}
	UserIndexRecord['user_data']['coin'] += UserSessionRecord['Wall']['RewardList']['enemy'][0]['enemy_drop_list'][0]['coin'];
	UserIndexRecord['user_data']['mana_point'] += UserSessionRecord['Wall']['RewardList']['enemy'][0]['enemy_drop_list'][0]['mana'];
	let NextLevel = 0; if (UserSessionRecord['Wall']['LastLevel'] >= 80) { NextLevel = 80; } else { NextLevel = UserSessionRecord['Wall']['LastLevel'] + 1; }
	var PlayDetail = { 'wall_id': WallID, 'before_wall_id': UserSessionRecord['Wall']['LastLevel'], 'after_wall_id': NextLevel };
	var JSONDict = {
		'data_headers': {
			'result_code': 1
		},
		'data': {
			'wall_clear_reward_list': [
				{
					'entity_type': 23,
					'entity_id': 0,
					'entity_quantity': 25
				}
			],
			'wall_drop_reward': {
				'reward_entity_list': DropTable,
				'take_coin': UserSessionRecord['Wall']['RewardList']['enemy'][0]['enemy_drop_list'][0]['coin'],
				'take_mana': UserSessionRecord['Wall']['RewardList']['enemy'][0]['enemy_drop_list'][0]['mana']
			},
			'wall_unit_info': {
				'helper_list': UserSessionRecord['Wall']['LastSupportCharacter'][1],
				'helper_detail_list': UserSessionRecord['Wall']['LastSupportPlayer'],
				'quest_party_setting_list': UserSessionRecord['Wall']['LastPartySettings']
			},
			'play_wall_detail': PlayDetail,
			'update_data_list': UpdateData
		}
	}
	var FinalizeWallLevel = { 'quest_group_id': 21601, 'wall_id': WallID, 'wall_level': NextLevel, 'is_start_next_level': 0 }
	const WallIndex = UserIndexRecord['quest_wall_list'].findIndex(x => x.wall_id === WallID);
	UserIndexRecord['quest_wall_list'][WallIndex] = FinalizeWallLevel;
	JSONDict['data']['update_data_list']['quest_wall_list'] = [];
	JSONDict['data']['update_data_list']['quest_wall_list'].push(FinalizeWallLevel);
	JSONDict['data']['update_data_list']['user_data'] = UserIndexRecord['user_data'];
	return [JSONDict, UserIndexRecord];
}

function LoginBonusData(UserIndexRecord, UserSessionRecord) {
	UserIndexRecord['user_data']['crystal'] += 50;
	UserIndexRecord['user_data']['last_login_time'] = Math.floor(Date.now() / 1000);
	UserSessionRecord['SummonRecord']['ItemCount'] = 0;
	UserSessionRecord['SummonRecord']['FreeTenfoldCount'] = 1;
	UserSessionRecord['SummonRecord']['DailyLimitCount'] = 1;
	var JSONDict = {
		'data_headers': {
			'result_code': 1
		},
		'data': {
			/*
				'support_reward': {
				'serve_count': 50,
				'mana_point': 520
			},
			'login_bonus_list': [
				{
					'reward_code': 0,
					'login_bonus_id': 17,
					'total_login_day': 545,
					'reward_day': 5,
					'entity_type': 4,
					'entity_id': 0,
					'entity_quantity': 30000,
					'entity_level': 0,
					'entity_limit_break_count': 0
				},
				{
					'reward_code': 0,
					'login_bonus_id': 74,
					'total_login_day': 7,
					'reward_day': 7,
					'entity_type': 8,
					'entity_id': 112002001,
					'entity_quantity': 1,
					'entity_level': 0,
					'entity_limit_break_count': 0
				}
			],
			'login_lottery_reward_list': [
				{
					'login_lottery_id': 1000003,
					'entity_type': 14,
					'entity_id': 0,
					'entity_quantity': 1000,
					'is_pickup': 0,
					'is_guaranteed': 0
				}
			],
			'dragon_contact_free_gift_count': 1,
			'monthly_wall_receive_list': [
				{
					'quest_group_id': 21601,
					'is_receive_reward': 2
				}
			],
			'penalty_data': [
			],
			'exchange_summom_point_list': [
			],
			'before_exchange_summon_item_quantity': 0,
			'server_time': Math.floor(Date.now() / 1000),
			*/
			'support_reward': {},
			'login_bonus_list': [],
			'login_lottery_reward_list': [],
			'dragon_contact_free_gift_count': 0,
			'monthly_wall_receive_list': [],
			'penalty_data': [
			],
			'exchange_summom_point_list': [
			],
			'before_exchange_summon_item_quantity': 0,
			'server_time': Math.floor(Date.now() / 1000),
			'update_data_list': {
				'user_data': UserIndexRecord['user_data'],
				'diamond_data': { 'free_diamond': 0, 'paid_diamond': UserSessionRecord['Diamantium'] },
				'present_notice': { 'present_count': UserSessionRecord['GiftRecord']['GiftNormalList'].length, 'present_limit_count': UserSessionRecord['GiftRecord']['GiftLimitedList'].length }
			}
		}
	}
	return [JSONDict, UserIndexRecord, UserSessionRecord];
}
			
function MissionList(UserSessionRecord) {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'normal_mission_list': [],
		'daily_mission_list': [],
		'period_mission_list': [],
		'beginner_mission_list': [],
		'special_mission_list': [],
		'main_story_mission_list': [],
		'memory_event_mission_list': [],
		'album_mission_list': [],
		'mission_notice': {
			'normal_mission_notice': UserSessionRecord['QuestNotice']['NormalMission'],
			'daily_mission_notice': UserSessionRecord['QuestNotice']['DailyMission'],
			'period_mission_notice': UserSessionRecord['QuestNotice']['EventMission'],
			'beginner_mission_notice': UserSessionRecord['QuestNotice']['BeginnerMission'],
			'special_mission_notice': UserSessionRecord['QuestNotice']['SpecialMission'],
			'main_story_mission_notice': UserSessionRecord['QuestNotice']['StoryMission'],
			'memory_event_mission_notice': UserSessionRecord['QuestNotice']['CompendiumMission'],
			'drill_mission_notice': UserSessionRecord['QuestNotice']['DrillMission'],
			'album_mission_notice': UserSessionRecord['QuestNotice']['AlbumMission']
		},
		/*
		'current_main_story_mission': {
			'main_story_mission_group_id': 11,
			'main_story_mission_state_list': [
				{
					'main_story_mission_id': 10110101,
					'state': 2
				},
				{
					'main_story_mission_id': 10110201,
					'state': 2
				},
				{
					'main_story_mission_id': 10110301,
					'state': 2
				},
				{
					'main_story_mission_id': 10110401,
					'state': 2
				},
				{
					'main_story_mission_id': 10110501,
					'state': 2
				}
			]
		},
		*/
		'current_main_story_mission': [],
		'special_mission_purchased_group_id_list': []	
	}}
	return JSONDict;
}
function MyPageInfo(UserSessionRecord, QuestRotation) { 
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_summon_list': [{
				"summon_id": 1010001,
				"summon_count": 0,
				"campaign_type": 0,
				"free_count_rest": 0,
				"is_beginner_campaign": 0,
				"beginner_campaign_count_rest": 0,
				"consecution_campaign_count_rest": 0
			}],
		'is_shop_notification': 0,
		'is_view_start_dash': 0,
		'is_view_dream_select': 0,
		'quest_event_schedule_list': [],
		'quest_schedule_detail_list': QuestRotation,
		'repeat_data': [],
		'is_receive_event_damage_reward': 0
	}}
	return JSONDict;
}

function ItemParser(ItemTable, UserSessionRecord, UserIndexRecord, TableType) {
	let UpdateData = {};
	let NewEntityList = [];
	TypeName = "type"; IDName = "id"; AmountName = "quantity";
	switch(TableType) {
		case "destination":
			TypeName = "destination_entity_type"; IDName = "destination_entity_id"; AmountName = "destination_entity_quantity"; break;
		case "entity":
			TypeName = "entity_type"; IDName = "entity_id"; AmountName = "entity_quantity"; break;
		case "plain":
			TypeName = "type"; IDName = "id"; AmountName = "quantity"; break;
		default:
			TypeName = "type"; IDName = "id"; AmountName = "quantity"; break;
	}
	
	for (let y in ItemTable) {
		switch(ItemTable[y][TypeName]) {
			case 1:
				if (UserIndexRecord['chara_list'].findIndex(x => x.chara_id === ItemTable[IDName]) == -1) {
					if (UpdateData['chara_list'] == undefined) { UpdateData['chara_list'] = []; }
					UpdateData['chara_list'].push(CharacterMap.CreateCharacterFromGift(ItemTable[IDName], 1));
					UserIndexRecord['chara_list'].push(CharacterMap.CreateCharacterFromGift(ItemTable[IDName], 1));
					NewEntityList.push({ 'entity_type': 1, 'entity_id': ItemTable[IDName] });
					const CharacterElement = CharacterMap.GetCharacterInfo(ItemTable[IDName], 'elemental_type');
					const CharacterBonusIndex = UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterElement);
					UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['hp'] += 0.1;
					UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['attack'] += 0.1;
					UpdateData['fort_bonus_list'] = UserIndexRecord['fort_bonus_list'];
					if (UpdateData['unit_story_list'] == undefined) { UpdateData['unit_story_list'] = []; } 
					const UnitStoryData = CharacterMap.GenerateUnitStory(ItemTable[IDName])
					if (UnitStoryData[0] != undefined) {
						UpdateData['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]);
						UserIndexRecord['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]); } }
				break;
			case 2:
				const NewStamItemData = {'item_id': ItemTable[y][IDName], 'quantity': ItemTable[y][AmountName]}
				if (UpdateData['item_list'] == undefined) { UpdateData['item_list'] = []; }
				const StamItemIndex = UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == NewStamItemData['item_id']);
				if (StamItemIndex == -1) {
					UserSessionRecord['EnergyItems'].push(NewStamItemData);
					UpdateData['item_list'].push(NewStamItemData); }
				else {
					UserSessionRecord['EnergyItems'][StamItemIndex]['quantity'] += NewStamItemData['quantity'];
					if (UpdateData['EnergyItems'] == undefined) { UpdateData['EnergyItems'] = []; }
					UpdateData['EnergyItems'].push(UserSessionRecord['EnergyItems'][StamItemIndex]); } 
				break;
			case 4:
				UserIndexRecord['user_data']['coin'] += ItemTable[y][AmountName];
				if (UserIndexRecord['user_data']['coin'] > 3000000000) { UserIndexRecord['user_data']['coin'] = 3000000000; }
				break;
			case 7:
				UserSessionRecord['LastAssignedDragonID'] += 1;
				if (UpdateData['dragon_list'] == undefined) { UpdateData['dragon_list'] = []; }
				if (UserIndexRecord['dragon_list'].length < 1000) {
					const DragonData = { 'id': ItemTable[y][IDName] }
					UpdateData['dragon_list'].push(DragonMap.CreateDragonFromGift(UserSessionRecord['LastAssignedDragonID'], DragonData['id'], 1));
					UserIndexRecord['dragon_list'].push(DragonMap.CreateDragonFromGift(UserSessionRecord['LastAssignedDragonID'], DragonData['id'], 1));
					if (UserIndexRecord['dragon_reliability_list'].findIndex(x => x.dragon_id === DragonData['id']) == -1) {
						if (UpdateData['dragon_reliability_list'] == undefined) { UpdateData['dragon_reliability_list'] = []; }
						UpdateData['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(DragonData['id']));
						UserIndexRecord['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(DragonData['id'])); }
						const DragonElement = DragonMap.GetDragonInfo(DragonData['id'], "element");
						const DragonBonusIndex = UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'].findIndex(x => x.elemental_type == DragonElement);
						UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['hp'] += 0.1;
						UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['attack'] += 0.1;
						UpdateData['fort_bonus_list'] = UserIndexRecord['fort_bonus_list'];
					NewEntityList.push({ 'entity_type': 7, 'entity_id': DragonData['id'] }); }
				break;
			case 8:
				let NewMaterialData = { 'material_id': ItemTable[y][IDName], 'quantity': ItemTable[y][AmountName] }
				const ItemIndex = UserIndexRecord['material_list'].findIndex(x => x.material_id == ItemTable[y][IDName]);
				if (UpdateData['material_list'] == undefined) { UpdateData['material_list'] = []; }
				if (ItemIndex == -1) { UserIndexRecord['material_list'].push(NewMaterialData); UpdateData['material_list'].push(NewMaterialData); }
				else {
					const NewTotal = UserIndexRecord['material_list'][ItemIndex][AmountName] + NewMaterialData['quantity'];
					if (NewTotal > 999000) { UserIndexRecord['material_list'][ItemIndex]['quantity'] = 999000; }
					else { UserIndexRecord['material_list'][ItemIndex]['quantity'] += NewMaterialData['quantity']; }
					UpdateData['material_list'].push(UserIndexRecord['material_list'][ItemIndex]);
				}
				break;
			case 9:
				UserSessionRecord['FortData']['BuildID'] += 1;
				const BuildTemplate = {
					'build_id': UserSessionRecord['FortData']['BuildID'],
					'fort_plant_detail_id': parseInt(String(ItemTable[y][IDName] + "01")),
					'position_x': -1,
					'position_z': -1,
					'build_status': 0,
					'build_start_date': 0,
					'build_end_date': 0,
					'level': 1,
					'plant_id': ItemTable[y][IDName],
					'is_new': 0,
					'remain_time': 0,
					'last_income_date': 0,
					'last_income_time': 0
				}
				if (UpdateData['build_list'] == undefined) { UpdateData['build_list'] = []; }
				UpdateData['build_list'].push(BuildTemplate);
				UserIndexRecord['build_list'].push(BuildTemplate);
				break;
			case 13:
				UserSessionRecord['Diamantium'] += ItemTable[y][AmountName];
				if (UserSessionRecord['Diamantium'] > 3000000000) { UserSessionRecord['Diamantium'] = 3000000000; } 
				break;
			case 14:
				UserIndexRecord['user_data']['dew_point'] += ItemTable[y][AmountName];
				if (UserIndexRecord['user_data']['dew_point'] > 3000000000) { UserIndexRecord['user_data']['dew_point'] = 3000000000; }
				break;
			/*case 15:
				const TicketIndex = UserIndexRecord['summon_ticket_list'].findIndex(x => x.summon_ticket_id === ItemTable[y][IDName]);
				if (TicketIndex != -1) { UserIndexRecord['summon_ticket_list'][TicketIndex][AmountName] += ItemTable[y][AmountName]; }
				else { UserIndexRecord['summon_ticket_list'].push({'key_id': KeyIDByTicket(ItemTable[y][IDName]), 'summon_ticket_id': ItemTable[y][IDName], AmountName: ItemTable[y][AmountName], 'use_limit_time': 0}); }
				if (UpdateData['summon_ticket_list'] == undefined) { UpdateData['summon_ticket_list'] = []; }
				UpdateData['summon_ticket_list'].push({'key_id': KeyIDByTicket(ItemTable[y][IDName]), 'summon_ticket_id': ItemTable[y][IDName], AmountName: ItemTable[y][AmountName], 'use_limit_time': 0});
				break;
			*/
			case 16:
				UserIndexRecord['user_data']['quest_skip_point'] += ItemTable[y][AmountName];
				if (UserIndexRecord['user_data']['quest_skip_point'] > 400) { UserIndexRecord['user_data']['quest_skip_point'] = 400; }
				break;
			case 17:
				const TicketData = { 'entity_id': ItemTable[y][IDName], 'entity_quantity': ItemTable[y][AmountName] }
				if (UpdateData['summon_ticket_list'] == undefined) { UpdateData['summon_ticket_list'] = []; }
					const TicketIndex = UserIndexRecord['summon_ticket_list'].findIndex(x => x.summon_ticket_id == TicketData['entity_id']);
					if (TicketIndex != -1) {
						const TickTotal = UserIndexRecord['summon_ticket_list'][TicketIndex]['quantity'] + TicketData['entity_quantity'];
						if (TickTotal > 999) {
							UserIndexRecord['summon_ticket_list'][TicketIndex]['quantity'] = 999;
							UpdateData['summon_ticket_list'] = UserIndexRecord['summon_ticket_list']; }
						else { UserIndexRecord['summon_ticket_list'][TicketIndex]['summon_ticket_id'] += TicketData['entity_quantity'];
							   UpdateData['summon_ticket_list'] = UserIndexRecord['summon_ticket_list']; } }
					else { const GivenKeyID = KeyIDByTicket(TicketData['entity_id']);
						   UserIndexRecord['summon_ticket_list'].push({'key_id': GivenKeyID, 'summon_ticket_id': TicketData['entity_id'], 'quantity': TicketData['entity_quantity'], 'use_time_limit': 0});
						   UpdateData['summon_ticket_list'] = UserIndexRecord['summon_ticket_list']; }
				break;
			case 18:
				UserIndexRecord['user_data']['mana_point'] += ItemTable[y][AmountName];
				if (UserIndexRecord['user_data']['mana_point'] > 3000000000) { UserIndexRecord['user_data']['mana_point'] = 3000000000; }
				break;
			case 23:
				UserIndexRecord['user_data']['crystal'] += ItemTable[y][AmountName];
				if (UserIndexRecord['user_data']['crystal'] > 3000000000) { UserIndexRecord['user_data']['crystal'] = 3000000000; }
				break;
			case 28:
				UserIndexRecord['user_data']['build_time_point'] += ItemTable[y][AmountName];
				if (UserIndexRecord['user_data']['build_time_point'] > 999) { UserIndexRecord['user_data']['build_time_point'] = 999; }
				break;
			case 39:
				const NewPrintData = WyrmprintMap.CreateWyrmprintFromGift(ItemTable[y][IDName]);
				if (UpdateData['ability_crest_list'] == undefined) { UpdateData['ability_crest_list'] = []; }
				UserIndexRecord['ability_crest_list'].push(NewPrintData);
				UpdateData['ability_crest_list'].push(NewPrintData);
				break;
		}
	}
	return [UserSessionRecord, UserIndexRecord, UpdateData, NewEntityList];
}

function CharacterDataReturn(UserIndexRecord, Character_ID) {
	const CharacterData = UserIndexRecord.chara_list.find(x => x.chara_id === Character_ID);
	if (Character_ID == 0 || CharacterData == undefined) { return undefined; }
	var Template = {
		'viewer_id': UserIndexRecord['user_data']['viewer_id'],
		'chara_id': Character_ID,
		'rarity': CharacterData['rarity'],
		'exp': CharacterData['exp'],
		'is_new': CharacterData['is_new'],
		'limit_break_count': CharacterData['limit_break_count'],
		'status_plus_count': 0,
		'hp_plus_count': CharacterData['hp_plus_count'],
		'attack_plus_count': CharacterData['attack_plus_count'],
		'gettime': CharacterData['gettime'],
		'level': CharacterData['level'],
		'additional_max_level': CharacterData['additional_max_level'],
		'hp': CharacterData['hp'],
		'attack': CharacterData['attack'],
		'skill_1_level': CharacterData['skill_1_level'],
		'skill_2_level': CharacterData['skill_2_level'],
		'ability_1_level': CharacterData['ability_1_level'],
		'ability_2_level': CharacterData['ability_2_level'],
		'ability_3_level': CharacterData['ability_3_level'],
		'ex_ability_level': CharacterData['ex_ability_level'],
		'ex_ability_2_level': CharacterData['ex_ability_2_level'],
		'burst_attack_level': CharacterData['burst_attack_level'],
		'combo_buildup_count': CharacterData['combo_buildup_count'],
		'is_temporary': CharacterData['is_temporary'],
		'is_unlock_edit_skill': CharacterData['is_unlock_edit_skill']
	}
	return Template;
}
function WyrmprintDataReturn(UserIndexRecord, WyrmprintID) {
	const WyrmprintData = UserIndexRecord.ability_crest_list.find(x => x.ability_crest_id == WyrmprintID);
	let AbilityLevel = 1;
	if (WyrmprintData == undefined) { return {}; }
	if (WyrmprintData['limit_break_count'] >= 2 && WyrmprintData['limit_break_count'] < 4) { AbilityLevel = 2; }
	if (WyrmprintData['limit_break_count'] == 4) { AbilityLevel = 3; }
	var Template = {
		'ability_crest_id': WyrmprintData['ability_crest_id'],
		'buildup_count': WyrmprintData['buildup_count'],
		'equipable_count': WyrmprintData['equipable_count'],
		'limit_break_count': WyrmprintData['limit_break_count'],
		'hp_plus_count': WyrmprintData['hp_plus_count'],
		'attack_plus_count': WyrmprintData['attack_plus_count'],
		'ability_1_level': AbilityLevel,
		'ability_2_level': AbilityLevel
	}
	return Template;
}
function WeaponDataReturn(UserIndexRecord, WeaponID) {
	const WeaponData = UserIndexRecord.weapon_body_list.find(x => x.weapon_body_id == WeaponID);
	if (WeaponData == undefined) { return {}; }
	let AbilityLevel = 1;
	if (WeaponData['limit_break_count'] >= 2 && WeaponData['limit_break_count'] < 5) { AbilityLevel = 1; }
	if (WeaponData['limit_break_count'] >= 5) { AbilityLevel = 2; }
	var Template = {
		'weapon_body_id': WeaponID,
		'buildup_count': WeaponData['buildup_count'],
		'limit_break_count': WeaponData['limit_break_count'],
		'limit_over_count': WeaponData['limit_over_count'],
		'equipable_count': WeaponData['equipable_count'],
		'additional_crest_slot_type_1_count': WeaponData['additional_crest_slot_type_1_count'],
		'additional_crest_slot_type_2_count': WeaponData['additional_crest_slot_type_2_count'],
		'additional_crest_slot_type_3_count': WeaponData['additional_crest_slot_type_3_count'],
		'addition_effect_count': WeaponData['additional_effect_count'],
		'skill_no': 1,
		'skill_level': AbilityLevel,
		'ability_1_level': AbilityLevel,
		'ability_2_level': AbilityLevel
	}
	return Template
}

function PopulateUnitData(PartyNo_List, ViewerID, UserIndexRecord) {
	let PartyUnitList = [];
	let PartyListSettings = [];
	for (let i in PartyNo_List) {
		let CompletedCharacters = 0;
		while (CompletedCharacters <= 3) {
			const Character_ID = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['chara_id']
			const Dragon_Key_ID = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_dragon_key_id']
			const Weapon_Body_ID = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_weapon_body_id']
			const Weapon_Skin_ID = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_weapon_skin_id']
			const Wyrmprint_Slot_one = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_crest_slot_type_1_crest_id_1']
			const Wyrmprint_Slot_two = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_crest_slot_type_1_crest_id_2']
			const Wyrmprint_Slot_three = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_crest_slot_type_1_crest_id_3']
			const Wyrmprint_Slot_four = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_crest_slot_type_2_crest_id_1']
			const Wyrmprint_Slot_five = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_crest_slot_type_2_crest_id_2']
			const Wyrmprint_Slot_six = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_crest_slot_type_3_crest_id_1']
			const Wyrmprint_Slot_seven = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_crest_slot_type_3_crest_id_2']
			const Talisman_ID = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['equip_talisman_key_id']
			const Shared_Skill_one = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['edit_skill_1_chara_id']
			const Shared_Skill_two = UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][CompletedCharacters]['edit_skill_2_chara_id']

			let Crest_Slot_Type_One = []
			let Crest_Slot_Type_Two = []
			let Crest_Slot_Type_Thr = []
			
			Crest_Slot_Type_One[0] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_one);
			Crest_Slot_Type_One[1] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_two);
			Crest_Slot_Type_One[2] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_three);
			Crest_Slot_Type_Two[0] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_four);
			Crest_Slot_Type_Two[1] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_five);
			Crest_Slot_Type_Thr[0] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_six);
			Crest_Slot_Type_Thr[1] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_seven);

			let Skill_Level_One = 0; 
			let SharedSkill_One_Data = {}
			let Skill_Level_Two = 0;
			let SharedSkill_Two_Data = {}
			if (Shared_Skill_one != 0) {
				const Character_One = UserIndexRecord.chara_list.findIndex(x => x.chara_id === Shared_Skill_one)
				if (Character_One == -1) { Skill_Level_One = 1; }
				else { Skill_Level_One = UserIndexRecord['chara_list'][Character_One][IsSkillOneOrTwo(Shared_Skill_one)] }
				SharedSkill_One_Data = {
					'chara_id': Shared_Skill_one,
					'edit_skill_level': Skill_Level_One
				}
			}
			else { SharedSkill_One_Data = null; }
			if (Shared_Skill_two != 0) {
				const Character_Two = UserIndexRecord.chara_list.findIndex(x => x.chara_id === Shared_Skill_two)
				if (Character_Two == -1) { Skill_Level_Two = 1; }
				else { Skill_Level_Two = UserIndexRecord['chara_list'][Character_Two][IsSkillOneOrTwo(Shared_Skill_two)] }
				SharedSkill_Two_Data = {
					'chara_id': Shared_Skill_two,
					'edit_skill_level': Skill_Level_Two
				}
			}
			const DragonIndex = UserIndexRecord.dragon_list.findIndex(x => x.dragon_key_id === Dragon_Key_ID)
			let DragonBond = 0;
			if (DragonIndex != -1) {
				const DragonID = UserIndexRecord['dragon_list'][DragonIndex]['dragon_id']
				if (DragonID == 20050522) { DragonBond = 30; }
				else { const DragonBondIndex = UserIndexRecord.dragon_reliability_list.findIndex(x => x.dragon_id === DragonID)
					 DragonBond = UserIndexRecord['dragon_reliability_list'][DragonBondIndex]['reliability_level'] }
			}

			// SANITIZE DATA.
			let CharacterData = CharacterDataReturn(UserIndexRecord, Character_ID);
			let WeaponSkinData = UserIndexRecord.weapon_skin_list.find(x => x.weapon_skin_id === Weapon_Skin_ID)
			let DragonData = UserIndexRecord.dragon_list.find(x => x.dragon_key_id === Dragon_Key_ID)
			let TalismanData = UserIndexRecord.talisman_list.find(x => x.talisman_key_id === Talisman_ID)
			if (CharacterData == undefined) { CharacterData = {}; } if (WeaponSkinData == undefined) { WeaponSkinData = {}; }
			if (DragonData == undefined) { DragonData = {}; } if (TalismanData == undefined) { TalismanData = {}; }
			if (Crest_Slot_Type_One[0] == undefined) { Crest_Slot_Type_One[0] = {}; } if (Crest_Slot_Type_One[1] == undefined) { Crest_Slot_Type_One[1] = {}; } if (Crest_Slot_Type_One[2] == undefined) { Crest_Slot_Type_One[2] = {}; }
			if (Crest_Slot_Type_Two[0] == undefined) { Crest_Slot_Type_Two[0] = {}; } if (Crest_Slot_Type_Two[1] == undefined) { Crest_Slot_Type_Two[1] = {}; }
			if (Crest_Slot_Type_Thr[0] == undefined) { Crest_Slot_Type_Thr[0] = {}; } if (Crest_Slot_Type_Thr[1] == undefined) { Crest_Slot_Type_Thr[1] = {}; }

			let FinalCharaData = {
				'position': CompletedCharacters + 1,
				'chara_data': CharacterData,
				'dragon_data': DragonData,
				'weapon_skin_data': WeaponSkinData,
				'weapon_body_data': WeaponDataReturn(UserIndexRecord, Weapon_Body_ID),
				'crest_slot_type_1_crest_list': Crest_Slot_Type_One,
				'crest_slot_type_2_crest_list': Crest_Slot_Type_Two,
				'crest_slot_type_3_crest_list': Crest_Slot_Type_Thr,
				'talisman_data': TalismanData,
				'edit_skill_1_chara_data': SharedSkill_One_Data,
				'edit_skill_2_chara_data': SharedSkill_Two_Data,
				'dragon_reliability_level': DragonBond,
				'game_weapon_passive_ability_list': []
			}
			if (PartyNo_List[i] != undefined) { const PositionCalc = i * 4; FinalCharaData['position'] += PositionCalc; PartyUnitList.push(FinalCharaData); }
			CompletedCharacters++;
		}
		if (PartyNo_List[i] != undefined) {
			let y = 0; while (y < UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'].length) {
				PartyListSettings.push(UserIndexRecord['party_list'][PartyNo_List[i] - 1]['party_setting_list'][y]); y++; } }
	}

	const QuestUnitData = {
		'party_unit_list': PartyUnitList,
		'fort_bonus_list': UserIndexRecord['fort_bonus_list'],
		'event_boost': [],
		'event_passive_grow_list': []
	}

	return [QuestUnitData, PartyListSettings];
}

function PopulateSupportData(SupportSessionRecord, SupportIndexRecord) {
	let Crest_Slot_Type_One = [];
	let Crest_Slot_Type_Two = [];
	let Crest_Slot_Type_Thr = [];
	Crest_Slot_Type_One[0] = WyrmprintDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_crest_slot_type_1_crest_id_1']);
	Crest_Slot_Type_One[1] = WyrmprintDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_crest_slot_type_1_crest_id_2']);
	Crest_Slot_Type_One[2] = WyrmprintDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_crest_slot_type_1_crest_id_3']);
	Crest_Slot_Type_Two[0] = WyrmprintDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_crest_slot_type_2_crest_id_1']);
	Crest_Slot_Type_Two[1] = WyrmprintDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_crest_slot_type_2_crest_id_2']);
	Crest_Slot_Type_Thr[0] = WyrmprintDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_crest_slot_type_3_crest_id_1']);
	Crest_Slot_Type_Thr[1] = WyrmprintDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_crest_slot_type_3_crest_id_2']);
	const DragonIndex = SupportIndexRecord.dragon_list.findIndex(x => x.dragon_key_id === SupportSessionRecord['SupportCharacter']['equip_dragon_key_id'])
	let DragonBond = 0;
	if (DragonIndex != -1) {
		const DragonID = SupportIndexRecord['dragon_list'][DragonIndex]['dragon_id']
		if (DragonID == 20050522) { DragonBond = 30; }
		else { const DragonBondIndex = SupportIndexRecord.dragon_reliability_list.findIndex(x => x.dragon_id === DragonID)
			DragonBond = SupportIndexRecord['dragon_reliability_list'][DragonBondIndex]['reliability_level'] }
	}
	let CharacterData = CharacterDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['chara_id']);
	let DragonData = SupportIndexRecord.dragon_list.find(x => x.dragon_key_id === SupportSessionRecord['SupportCharacter']['equip_dragon_key_id']);
	let TalismanData = SupportIndexRecord.dragon_list.find(x => x.talisman_key_id === SupportSessionRecord['SupportCharacter']['equip_talisman_key_id']);
	if (DragonData == undefined) { DragonData = {}; } if (TalismanData == undefined) { TalismanData = {}; }
	if (Crest_Slot_Type_One[0] == undefined) { Crest_Slot_Type_One[0] = {}; } if (Crest_Slot_Type_One[1] == undefined) { Crest_Slot_Type_One[1] = {}; } if (Crest_Slot_Type_One[2] == undefined) { Crest_Slot_Type_One[2] = {}; }
	if (Crest_Slot_Type_Two[0] == undefined) { Crest_Slot_Type_Two[0] = {}; } if (Crest_Slot_Type_Two[1] == undefined) { Crest_Slot_Type_Two[1] = {}; }
	if (Crest_Slot_Type_Thr[0] == undefined) { Crest_Slot_Type_Thr[0] = {}; } if (Crest_Slot_Type_Thr[1] == undefined) { Crest_Slot_Type_Thr[1] = {}; }
	const FinalSupportData = {
		'viewer_id': SupportIndexRecord['user_data']['viewer_id'],
		'name': SupportIndexRecord['user_data']['name'],
		'level': SupportIndexRecord['user_data']['level'],
		'last_login_date': SupportIndexRecord['user_data']['last_login_time'],
		'emblem_id': SupportIndexRecord['user_data']['emblem_id'],
		'max_party_power': SupportIndexRecord['party_power_data']['max_party_power'],
		'chara_data': CharacterData,
		'dragon_data': DragonData,
		'weapon_body_data': WeaponDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_weapon_body_id']),
		'crest_slot_type_1_crest_list': Crest_Slot_Type_One,
		'crest_slot_type_2_crest_list': Crest_Slot_Type_Two,
		'crest_slot_type_3_crest_list': Crest_Slot_Type_Thr,
		'talisman_data': TalismanData
	}
	const FinalSupportDataRecord = [{
		'viewer_id': SupportIndexRecord['user_data']['viewer_id'],
		'name': SupportIndexRecord['user_data']['name'],
		'level': SupportIndexRecord['user_data']['level'],
		'last_login_date': SupportIndexRecord['user_data']['last_login_time'],
		'emblem_id': SupportIndexRecord['user_data']['emblem_id'],
		'max_party_power': SupportIndexRecord['party_power_data']['max_party_power'],
		'support_chara': CharacterData,
		'support_dragon': DragonData,
		'support_weapon_body': WeaponDataReturn(SupportIndexRecord, SupportSessionRecord['SupportCharacter']['equip_weapon_body_id']),
		'support_crest_slot_type_1_list': Crest_Slot_Type_One,
		'support_crest_slot_type_2_list': Crest_Slot_Type_Two,
		'support_crest_slot_type_3_list': Crest_Slot_Type_Thr,
		'support_talisman': TalismanData,
		'guild': { 'guild_id': 0 }
	}]
	return [FinalSupportData, FinalSupportDataRecord];
}

function PopulateAssignedUnitData(PartySettings, ViewerID, UserIndexRecord) {
	let PartyUnitList = [];
	let PartyListSettings = [];
	for (let CompletedCharacters in PartySettings) {
		const Character_ID = PartySettings[CompletedCharacters]['chara_id']
		const Dragon_Key_ID = PartySettings[CompletedCharacters]['equip_dragon_key_id']
		const Weapon_Body_ID = PartySettings[CompletedCharacters]['equip_weapon_body_id']
		const Weapon_Skin_ID = PartySettings[CompletedCharacters]['equip_weapon_skin_id']
		const Wyrmprint_Slot_one = PartySettings[CompletedCharacters]['equip_crest_slot_type_1_crest_id_1']
		const Wyrmprint_Slot_two = PartySettings[CompletedCharacters]['equip_crest_slot_type_1_crest_id_2']
		const Wyrmprint_Slot_three = PartySettings[CompletedCharacters]['equip_crest_slot_type_1_crest_id_3']
		const Wyrmprint_Slot_four = PartySettings[CompletedCharacters]['equip_crest_slot_type_2_crest_id_1']
		const Wyrmprint_Slot_five = PartySettings[CompletedCharacters]['equip_crest_slot_type_2_crest_id_2']
		const Wyrmprint_Slot_six = PartySettings[CompletedCharacters]['equip_crest_slot_type_3_crest_id_1']
		const Wyrmprint_Slot_seven = PartySettings[CompletedCharacters]['equip_crest_slot_type_3_crest_id_2']
		const Talisman_ID = PartySettings[CompletedCharacters]['equip_talisman_key_id']
		const Shared_Skill_one = PartySettings[CompletedCharacters]['edit_skill_1_chara_id']
		const Shared_Skill_two = PartySettings[CompletedCharacters]['edit_skill_2_chara_id']

		let Crest_Slot_Type_One = []
		let Crest_Slot_Type_Two = []
		let Crest_Slot_Type_Thr = []
			
		Crest_Slot_Type_One[0] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_one);
		Crest_Slot_Type_One[1] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_two);
		Crest_Slot_Type_One[2] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_three);
		Crest_Slot_Type_Two[0] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_four);
		Crest_Slot_Type_Two[1] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_five);
		Crest_Slot_Type_Thr[0] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_six);
		Crest_Slot_Type_Thr[1] = WyrmprintDataReturn(UserIndexRecord, Wyrmprint_Slot_seven);

		let Skill_Level_One = 0; 
		let SharedSkill_One_Data = {}
		let Skill_Level_Two = 0;
		let SharedSkill_Two_Data = {}
		if (Shared_Skill_one != 0) {
			const Character_One = UserIndexRecord.chara_list.findIndex(x => x.chara_id === Shared_Skill_one)
			if (Character_One == -1) { Skill_Level_One = 1; }
			else { Skill_Level_One = UserIndexRecord['chara_list'][Character_One][IsSkillOneOrTwo(Shared_Skill_one)] }
			SharedSkill_One_Data = {
				'chara_id': Shared_Skill_one,
				'edit_skill_level': Skill_Level_One
			}
		}
		else { SharedSkill_One_Data = null; }
		if (Shared_Skill_two != 0) {
			const Character_Two = UserIndexRecord.chara_list.findIndex(x => x.chara_id === Shared_Skill_two)
			if (Character_Two == -1) { Skill_Level_Two = 1; }
			else { Skill_Level_Two = UserIndexRecord['chara_list'][Character_Two][IsSkillOneOrTwo(Shared_Skill_two)] }
			SharedSkill_Two_Data = {
				'chara_id': Shared_Skill_two,
				'edit_skill_level': Skill_Level_Two
			}
		}
		const DragonIndex = UserIndexRecord.dragon_list.findIndex(x => x.dragon_key_id === Dragon_Key_ID)
		let DragonBond = 0;
		if (DragonIndex != -1) {
			const DragonID = UserIndexRecord['dragon_list'][DragonIndex]['dragon_id']
			if (DragonID == 20050522) { DragonBond = 30; }
			else { const DragonBondIndex = UserIndexRecord.dragon_reliability_list.findIndex(x => x.dragon_id === DragonID)
				 DragonBond = UserIndexRecord['dragon_reliability_list'][DragonBondIndex]['reliability_level'] }
		}

		// SANITIZE DATA.
		let CharacterData = CharacterDataReturn(UserIndexRecord, Character_ID);
		let WeaponSkinData = UserIndexRecord.weapon_skin_list.find(x => x.weapon_skin_id === Weapon_Skin_ID)
		let DragonData = UserIndexRecord.dragon_list.find(x => x.dragon_key_id === Dragon_Key_ID)
		let TalismanData = UserIndexRecord.talisman_list.find(x => x.talisman_key_id === Talisman_ID)
		if (CharacterData == undefined) { CharacterData = {}; } if (WeaponSkinData == undefined) { WeaponSkinData = {}; }
		if (DragonData == undefined) { DragonData = {}; } if (TalismanData == undefined) { TalismanData = {}; }
		if (Crest_Slot_Type_One[0] == undefined) { Crest_Slot_Type_One[0] = {}; } if (Crest_Slot_Type_One[1] == undefined) { Crest_Slot_Type_One[1] = {}; } if (Crest_Slot_Type_One[2] == undefined) { Crest_Slot_Type_One[2] = {}; }
		if (Crest_Slot_Type_Two[0] == undefined) { Crest_Slot_Type_Two[0] = {}; } if (Crest_Slot_Type_Two[1] == undefined) { Crest_Slot_Type_Two[1] = {}; }
		if (Crest_Slot_Type_Thr[0] == undefined) { Crest_Slot_Type_Thr[0] = {}; } if (Crest_Slot_Type_Thr[1] == undefined) { Crest_Slot_Type_Thr[1] = {}; }

		const FinalCharaData = {
			'position': parseInt(CompletedCharacters) + 1,
			'chara_data': CharacterData,
			'dragon_data': DragonData,
			'weapon_skin_data': WeaponSkinData,
			'weapon_body_data': WeaponDataReturn(UserIndexRecord, Weapon_Body_ID),
			'crest_slot_type_1_crest_list': Crest_Slot_Type_One,
			'crest_slot_type_2_crest_list': Crest_Slot_Type_Two,
			'crest_slot_type_3_crest_list': Crest_Slot_Type_Thr,
			'talisman_data': TalismanData,
			'edit_skill_1_chara_data': SharedSkill_One_Data,
			'edit_skill_2_chara_data': SharedSkill_Two_Data,
			'dragon_reliability_level': DragonBond,
			'game_weapon_passive_ability_list': []
		}
		PartyUnitList.push(FinalCharaData);
	}	

	const QuestUnitData = {
		'party_unit_list': PartyUnitList,
		'fort_bonus_list': UserIndexRecord['fort_bonus_list'],
		'event_boost': [],
		'event_passive_grow_list': []
	}

	return [QuestUnitData, PartySettings];
}

module.exports = { GetPlayerQuestData, GetPlayerQuestDataShort, GetPlayerQuestPlayCount, GetMissionNotice, LoginBonusData, MyPageInfo, MissionList, DungeonRecord, DungeonSkipRecord, SetClearParty, ItemParser, PopulateUnitData, PopulateSupportData, PopulateAssignedUnitData, WallRecord, GetWallDrop, KeyIDByTicket }
