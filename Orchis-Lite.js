var express = require('express');
var errorhandler = require('express-async-handler');
var bodyParser = require('body-parser');
var compression = require('compression');
var crypto = require('crypto');
var msgpack = require('msgpackr');
var fs = require('fs-extra');
var http = require('http');
var zlib = require('zlib');
var jwt_decode = require('jwt-decode');
var Server = express();

const StaticData = require('./Library/function/StaticData.js');
const IndexTools = require('./Library/function/IndexTools.js');
const DataManager = require('./Library/function/DataManager.js');
const TutorialStatic = require('./Library/function/TutorialData.js');

const CharacterMap = require('./Library/idmaps/CharacterMap.js');
const WyrmprintMap = require('./Library/idmaps/WyrmprintMap.js');
const DragonMap = require('./Library/idmaps/DragonMap.js');
const WeaponMap = require('./Library/idmaps/WeaponMap.js');
const QuestMap = require('./Library/idmaps/QuestMap.js');
const DModeMap = require('./Library/idmaps/DModeMap.js');
const LevelMap = require('./Library/idmaps/LevelMap.js');
const ShopMap = require('./Library/idmaps/ShopMap.js');
const FortMap = require('./Library/idmaps/FortMap.js');

let MissionData = fs.readFileSync('./Library/event/get_mission_list');
let URL_List = fs.readFileSync('./Library/event/url_list.msg');
let SupportData = JSON.parse(fs.readFileSync('./Library/event/Support.json'));
let BannerList = JSON.parse(fs.readFileSync('./Library/event/BannerList.json'));
let SummonOddsList = DataManager.GenerateSummonOdds(BannerList);
const MaintenanceJSON = { 'data_headers': { 'result_code': 101 }, 'data': { 'result_code': 101 } }
const AssetList = {
	"iOS_Manifest": "b1HyoeTFegeTexC0",
	"iOS_FileList": [],
	"Android_Manifest": "y2XM6giU6zz56wCm",
	"Android_FileList": []
}

function GetDayBegin() {
	let Now = new Date();
	const BeginDay = new Date(Now.getFullYear(), Now.getMonth(), Now.getDate());
	return (BeginDay / 1000);
}
let LastServerReset = GetDayBegin();
let NextServerReset = 86400 - (Math.floor(Date.now() / 1000) - LastServerReset);
function GetCurrentDate() {
	const date = new Date();
	return date.toUTCString();
}
function ResHeaders(DataLength) {
	const Headers = { 
		'content-type': 'application/x-msgpack',
		'access-control-allow-origin': '*', 
		'expires': GlobalExpireContext, 
		'cache-control': 'max-age=0, no-cache, no-store', 
		'pragma': 'no-cache', 'date': GetCurrentDate(), 
		'content-length': DataLength
	}
	return Headers;
}

async function ReadSessionRecord() {
	const SessionData = JSON.parse(fs.readFileSync('./Library/Session.json'));
	return SessionData;
}
async function WriteSessionRecord(Data) {
	fs.writeFileSync('./Library/Session.json', JSON.stringify(Data, null, 2));
	return;
}
async function ReadIndexRecord() {
	const IndexData = JSON.parse(fs.readFileSync('./Library/Index.json'));
	return IndexData;
}
async function WriteIndexRecord(Data) {
	fs.writeFileSync('./Library/Index.json', JSON.stringify(Data, null, 2));
	return;
}
async function RecordManager (req, res, next) {
	if (req.url.endsWith("/tool/auth")) { next(); return; }
	if (req.get('sid') != undefined) {
		res.locals.UserSessionRecord = await ReadSessionRecord();
		res.locals.UserIndexRecord = await ReadIndexRecord(); 
	}
	next();
}

let MasterAccountRecord = {};
let MasterIDRecord = {};
if (fs.existsSync('./Library/accountrecord.msg.gz')) {
	msgpack.unpack(fs.readFileSync('./Library/accountrecord.msg'));
	msgpack.unpack(fs.readFileSync('./Library/idrecord.msg'));
}
let ServerConf = {}
let ServerCerts = {}
if (fs.existsSync('./conf.json')) {
	ServerConf = JSON.parse(fs.readFileSync('./conf.json'));
	if (ServerConf['ssl'] == true) {
		ServerCerts = {
			key: ServerConf['key'],
			cert: ServerConf['cert'],
			ca: ServerConf['chain']
		}
		http = require('https');
	}
}
else {
	ServerConf = {
		"ssl": false, "cert": "./cert/cert.pem", "chain": "./cert/chain.pem", "key": "./cert/privkey.pem",
		"port": 3000, "is_unified_login": true, "cdn_url": "http://127.0.0.1"
	}
	fs.writeFileSync('./conf.json', JSON.stringify(ServerConf, null, 2));
}

const iOS_Version = "/2.19.0_20220719103923"; const Android_Version = "/2.19.0_20220714193707";
const GlobalExpireContext = 'Tue, 1 Jan 2030 00:00:00 GMT';
const GlobalDeployHashContext = "OrchisLite"; const CurrentServerURL = "127.0.0.1:" + String(ServerConf['port']);
let DailyDragonItem = 20002;
let IsMaintenance = 0;
let IsSaving = 0;

Server.use(bodyParser.json({ type:['application/json'], limit: "6mb"}));
Server.use(bodyParser.raw({ type: ['application/x-msgpack', 'application/msgpack', 'application/octet-stream'], limit: "4mb" }));
Server.use(compression());
Server.use(express.static('static'));
Server.use(RecordManager);
Server.disable('x-powered-by');
var http_server = http.createServer(ServerCerts, Server).listen(ServerConf['port'], function() { console.log("Server system, clear."); } );
Server.post(["/api/v1/Session", "/api/v1/MeasurementEvent"], async (req,res) => { res.status(202); res.end(); });

function ErasePartyList() {
	let i = 0;
	let FinalPartyList = [];
	while (i <= 53) {
		var DefaultPartySettings = {
				"party_no": i + 1,
				"party_name": "",
				"party_setting_list": [
					{
						"unit_no": 1,
						"chara_id": 10140101,
						"equip_dragon_key_id": 0,
						"equip_weapon_body_id": 0,
						"equip_weapon_skin_id": 0,
						"equip_crest_slot_type_1_crest_id_1": 0,
						"equip_crest_slot_type_1_crest_id_2": 0,
						"equip_crest_slot_type_1_crest_id_3": 0,
						"equip_crest_slot_type_2_crest_id_1": 0,
						"equip_crest_slot_type_2_crest_id_2": 0,
						"equip_crest_slot_type_3_crest_id_1": 0,
						"equip_crest_slot_type_3_crest_id_2": 0,
						"equip_talisman_key_id": 0,
						"edit_skill_1_chara_id": 0,
						"edit_skill_2_chara_id": 0
					},
					{
						"unit_no": 2,
						"chara_id": 0,
						"equip_dragon_key_id": 0,
						"equip_weapon_body_id": 0,
						"equip_weapon_skin_id": 0,
						"equip_crest_slot_type_1_crest_id_1": 0,
						"equip_crest_slot_type_1_crest_id_2": 0,
						"equip_crest_slot_type_1_crest_id_3": 0,
						"equip_crest_slot_type_2_crest_id_1": 0,
						"equip_crest_slot_type_2_crest_id_2": 0,
						"equip_crest_slot_type_3_crest_id_1": 0,
						"equip_crest_slot_type_3_crest_id_2": 0,
						"equip_talisman_key_id": 0,
						"edit_skill_1_chara_id": 0,
						"edit_skill_2_chara_id": 0
					},
					{
						"unit_no": 3,
						"chara_id": 0,
						"equip_dragon_key_id": 0,
						"equip_weapon_body_id": 0,
						"equip_weapon_skin_id": 0,
						"equip_crest_slot_type_1_crest_id_1": 0,
						"equip_crest_slot_type_1_crest_id_2": 0,
						"equip_crest_slot_type_1_crest_id_3": 0,
						"equip_crest_slot_type_2_crest_id_1": 0,
						"equip_crest_slot_type_2_crest_id_2": 0,
						"equip_crest_slot_type_3_crest_id_1": 0,
						"equip_crest_slot_type_3_crest_id_2": 0,
						"equip_talisman_key_id": 0,
						"edit_skill_1_chara_id": 0,
						"edit_skill_2_chara_id": 0
					},
					{
						"unit_no": 4,
						"chara_id": 0,
						"equip_dragon_key_id": 0,
						"equip_weapon_body_id": 0,
						"equip_weapon_skin_id": 0,
						"equip_crest_slot_type_1_crest_id_1": 0,
						"equip_crest_slot_type_1_crest_id_2": 0,
						"equip_crest_slot_type_1_crest_id_3": 0,
						"equip_crest_slot_type_2_crest_id_1": 0,
						"equip_crest_slot_type_2_crest_id_2": 0,
						"equip_crest_slot_type_3_crest_id_1": 0,
						"equip_crest_slot_type_3_crest_id_2": 0,
						"equip_talisman_key_id": 0,
						"edit_skill_1_chara_id": 0,
						"edit_skill_2_chara_id": 0
					}
				]
			}
		FinalPartyList[i] = DefaultPartySettings;
		i++;
	}
	return FinalPartyList;
}
async function CreateAccountShell() {
	let UserIDRecord = {};
	const ViewerID = 1000;
	const SessionID = crypto.randomBytes(32).toString("hex");
	UserIDRecord = { 'ViewerID': ViewerID, 'SessionID': SessionID };
	const UserSessionRecord = DefaultSessionRecord(ViewerID);
	const NewUserData = {
	   	"viewer_id": ViewerID,
		"name": "Euden",
		"level": 1,
		"exp": 0,
		"crystal": 400,
		"coin": 200000,
		"max_dragon_quantity": 120,
		"max_weapon_quantity": 0,
		"max_amulet_quantity": 0,
		"quest_skip_point": 0,
		"main_party_no": 1,
		"emblem_id": 40000001,
		"active_memory_event_id": 0,
		"mana_point": 500, 
		"dew_point": 500,
		"build_time_point": 0,
		"last_login_time": Math.floor(Date.now() / 1000),
		"stamina_single": 18,
		"last_stamina_single_update_time": 0,
		"stamina_single_surplus_second": 0, 
		"stamina_multi": 12,
		"last_stamina_multi_update_time": 0,
		"stamina_multi_surplus_second": 0,
		"tutorial_status": 0,
	   	"tutorial_flag_list": [],
		"prologue_end_time": 0,
		"is_optin": 0,
		"fort_open_time": 0, 
  		"create_time": Math.floor(Date.now() / 1000)
	}
	let UserIndexRecord = {};
	UserIndexRecord['user_data'] = NewUserData;
	
	return [UserIDRecord, UserSessionRecord, UserIndexRecord];
}
function DefaultSessionRecord(ViewerID) {
	const DefaultOptions = {
		"is_enable_auto_lock_unit": 1,
		"is_auto_lock_dragon_sr": 0,
		"is_auto_lock_dragon_ssr": 1,
		"is_auto_lock_weapon_sr": 0,
		"is_auto_lock_weapon_ssr": 0,
		"is_auto_lock_weapon_sssr": 0,
		"is_auto_lock_amulet_sr": 0,
		"is_auto_lock_amulet_ssr": 0
	}
	const DefaultSmithData = {
		'max_carpenter_count': 5,
	   	'carpenter_num': 2,
	   	'working_carpenter_num': 0
	}
	const DefaultProductionData = {
		'RP_Production': {
		   	'speed': 0,
		   	'max': 0
	   	},
	   	"DF_Production": {
		   	'speed': 0,
		   	'max': 0
	   	},
	   	"ST_Production": {
		   	'speed': 0.03,
		   	'max': 144
	   	}
	}
	const DefaultMissionNotice = {
		'NormalMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 252, 'completed_mission_count': 252, 'current_mission_id': 0 },
		'DailyMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 9, 'completed_mission_count': 9, 'current_mission_id': 0 },
		'EventMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 10, 'completed_mission_count': 10, 'current_mission_id': 0 },
		'BeginnerMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 0, 'completed_mission_count': 0, 'current_mission_id': 0 },
		'SpecialMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 56, 'completed_mission_count': 56, 'current_mission_id': 0 },
		'StoryMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 0, 'completed_mission_count': 0, 'current_mission_id': 0 },
		'CompendiumMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 0, 'completed_mission_count': 0, 'current_mission_id': 0 },
		'DrillMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 0, 'completed_mission_count': 0, 'current_mission_id': 0 },
		'AlbumMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 22, 'completed_mission_count': 22, 'current_mission_id': 0 }
	}
	const DefaultSupportCharacter = {
		"last_active_time": Math.floor(Date.now() / 1000),
		"chara_id": 10140101,
		"equip_dragon_key_id": 0,
		"equip_weapon_body_id": 0,
		"equip_crest_slot_type_1_crest_id_1": 0,
		"equip_crest_slot_type_1_crest_id_2": 0,
		"equip_crest_slot_type_1_crest_id_3": 0,
		"equip_crest_slot_type_2_crest_id_1": 0,
		"equip_crest_slot_type_2_crest_id_2": 0,
		"equip_crest_slot_type_3_crest_id_1": 0,
		"equip_crest_slot_type_3_crest_id_2": 0,
		"equip_talisman_key_id": 0,
		"user_level_group": 0
	}
	const DmodeInfo = {
			'total_max_floor_num': 0,
			'recovery_count': 0,
			'recovery_time': 0,
			'floor_skip_count': 0,
			'floor_skip_time': 0,
			'dmode_point_1': 0,
			'dmode_point_2': 0,
			'is_entry': 0
	}
	const DmodeDungeonInfo = {
			'chara_id': 0,
			'floor_num': 0,
			'quest_time': 0,
			'dungeon_score': 0,
			'is_play_end': 0,
			'state': 0
	}
	const Expedition = {
			'chara_id_1': 0,
			'chara_id_2': 0,
			'chara_id_3': 0,
			'chara_id_4': 0,
			'start_time': 0,
			'target_floor_num': 0,
			'state': 0
	}
	const DefaultEnergyItems = [
		{'item_id': 100601, 'quantity': 5000},
		{'item_id': 100602, 'quantity': 5000},
		{'item_id': 100603, 'quantity': 5000},
		{'item_id': 100604, 'quantity': 5000},
		{'item_id': 100605, 'quantity': 5000},
		{'item_id': 100606, 'quantity': 5000},
		{'item_id': 100607, 'quantity': 5000},
		{'item_id': 100608, 'quantity': 5000},
		{'item_id': 100609, 'quantity': 5000},
		{'item_id': 100701, 'quantity': 5000},
		{'item_id': 100702, 'quantity': 5000}
	]	
	let UserSessionRecord = {
		'CreatedAt': Math.floor(Date.now() / 1000),
		'ViewerID': ViewerID,
		'AccountState': 0,
		'AccountMessage': { 'data_headers': { 'result_code': 0 }, 'data': { 'result_code': 0 } },
		'LoginBonus': {
			'Display': true,
			'17': { 'DayCount': 1, 'IsComplete': false }			
		},
		'LastLogin': Math.floor(Date.now() / 1000),
		'SaveUpdatedAt': 0,
		'Diamantium': 1200,
		'GiftRecord': {
			'GiftNormalList': [],
			'GiftLimitedList': [],
			'GiftHistory': []
		},
		'SummonRecord': {
			'FreeTenfoldCount': 0,
			'DailyLimitCount': 1,
			'ItemCount': 0,
			'SummonHistory': [],
			'UserSummonData': [],
			'UserLimitData': []
		},
		'Wyrmsigil': [],
		'LastAssignedDragonID': 39999,
		'FortData': {
			'Smiths': DefaultSmithData,
			'Production': DefaultProductionData,
			'BuildID': 9999,
			'Build': {},
			'DragonGiftList': [
				{
					"dragon_gift_id": 10001,
					"price": 0,
					"is_buy": 1
				},
				{
					"dragon_gift_id": 10002,
					"price": 1500,
					"is_buy": 1
				},
				{
					"dragon_gift_id": 10003,
					"price": 4000,
					"is_buy": 1
				},
				{
					"dragon_gift_id": 10004,
					"price": 8000,
					"is_buy": 1
				},
				{
					"dragon_gift_id": DailyDragonItem,
					"price": 12000,
					"is_buy": 1
				}
			]
		},
		'EnergyItems': DefaultEnergyItems,
		'DungeonRecord': {},
		'Wall': {},
		'Kaleidoscape': {
			'DmodeInfo': DmodeInfo,
			'DungeonInfo': DmodeDungeonInfo,
			'Passive': [],
			'Expedition': Expedition,
			'CharacterList': [],
			'StoryList': [],
			'RecoveryCount': 0,
			'UnitInfo': [],
			'ItemTracker': 0,
			'ItemList': [],
			'DragonList': []
		},
		'QuestNotice': DefaultMissionNotice,
		'MissionRecord': {},
		'Endeavor': {},
		'AlbumData': { 'Medals': [] },
		'WyrmprintSets': TutorialStatic.DefaultWyrmprints,
		'EquipmentSets': {},
		'Epithet': StaticData.DefaultEpithets,
		'SupportCharacter': DefaultSupportCharacter,
		'CrestTrade': [],
		'SetOptions': DefaultOptions,
		'Stickers': StaticData.DefaultStickers,
		'MyPage': {},
		'SupportCharacter': {
			'last_active_time': Math.floor(Date.now() / 1000),
			'chara_id': 10140101,
			'equip_dragon_key_id': 0,
			'equip_weapon_body_id': 0,
			'equip_crest_slot_type_1_crest_id_1': 0,
			'equip_crest_slot_type_1_crest_id_2': 0,
			'equip_crest_slot_type_1_crest_id_3': 0,
			'equip_crest_slot_type_2_crest_id_1': 0,
			'equip_crest_slot_type_2_crest_id_2': 0,
			'equip_crest_slot_type_3_crest_id_1': 0,
			'equip_crest_slot_type_3_crest_id_2': 0,
			'equip_talisman_key_id': 0,
			'user_level_group': 1
		},
		'GuildLastCheck': 0,
		'Other': {}
	}
	
	return UserSessionRecord;
}

async function ServerReset() {
	while (true) {
		await new Promise(resolve => setTimeout(resolve, (NextServerReset * 1000)));
		LastServerReset = GetDayBegin();
		NextServerReset = 86400;
		DailyDragonItem += 1; if (DailyDragonItem > 20006) { DailyDragonItem = 20001; }
	}
} 
function SaveUserDB() {
	fs.writeFileSync('./Library/accountrecord.msg', msgpack.pack(MasterAccountRecord));
	fs.writeFileSync('./Library/idrecord.msg', msgpack.pack(MasterIDRecord));
}

ServerReset();

Server.post("/core/v1/gateway/sdk/login", async (req, res) => {
	if (MasterIDRecord['SessionID'] == undefined) {
		const NewAccountData = CreateAccountShell();
		UserIDRecord = NewAccountData[0];
		MasterAccountRecord = NewAccountData[0];
		MasterIDRecord = UserIDRecord;
		WriteSessionRecord(NewAccountData[1]);
		WriteIndexRecord(NewAccountData[2]);
		SaveUserDB();
	}
	console.log(req.body);
	//const LoginData = JSON.parse(req.body);
	let AccountID = "a1000"; let AccountPass = crypto.createHash('md5').update(AccountID).digest('hex');
	/*if (LoginData['deviceAccount'] != undefined) {
		AccountID = LoginData['deviceAccount']['id'];
		AccountPass = LoginData['deviceAccount']['password'];
	}*/
	const JSONDict = {
		"idToken": "c1000",
		"accessToken": "d1000",
		"user": {
			"id": AccountID,
			"nickname": "",
			"country": "",
			"birthday": "0000-00-00",
			"gender": "unknown",
			"deviceAccounts": [{
				"id": AccountID
			}],
			"links": {},
			"permissions": {
				"personalAnalytics": true,
				"personalNotification": true,
				"personalAnalyticsUpdatedAt": 1661897705,
				"personalNotificationUpdatedAt": 1661897705
			},
			"createdAt": 1661897705,
			"updatedAt": 1661897705,
			"hasUnreadCsComment": false
		},
		"createdDeviceAccount": null,
		"sessionId": null,
		"error": null,
		"expiresIn": 900,
		"market": null,
		"capability": {
			"accountHost": "accounts.nintendo.com",
			"accountApiHost": "api.accounts.nintendo.com",
			"pointProgramHost": "my.nintendo.com",
			"sessionUpdateInterval": 180000
		},
		"behaviorSettings": {}
	}
	const Serialized = JSON.stringify(JSONDict);
	res.set({
		'content-type': 'application/json',
		'access-control-allow-origin': '*', 
		'expires': GlobalExpireContext, 
		'cache-control': 'max-age=0, no-cache, no-store', 
		'pragma': 'no-cache', 'date': GetCurrentDate(), 
		'content-length': Serialized.length
	}); res.end(Serialized);
});
Server.post("/inquiry/v1/users/a1000", async (req, res) => {
	const JSONDict = {
		"userId": "a1000",
		"hasUnreadCsComment": false,
		"updatedAt": 1636055991
	}
	const Serialized = JSON.stringify(JSONDict);
	res.set({
		'content-type': 'application/json',
		'access-control-allow-origin': '*', 
		'expires': GlobalExpireContext, 
		'cache-control': 'max-age=0, no-cache, no-store', 
		'pragma': 'no-cache', 'date': GetCurrentDate(), 
		'content-length': Serialized.length
	}); res.end(Serialized);
});

Server.post([iOS_Version + "/maintenance/get_text", Android_Version + "/maintenance/get_text"], async (req, res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 
		'maintenance_text': String(MaintXML)
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/transition/transition_by_n_account", Android_Version + "/transition/transition_by_n_account"], errorhandler(async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'transition_result_data': { 'abolished_viewer_id': 0, 'linked_viewer_id': 1000 } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);					
}));
Server.post([iOS_Version + "/tool/signup", Android_Version + "/tool/signup"], errorhandler(async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'viewer_id': 1000 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/tool/auth", Android_Version + "/tool/auth"], errorhandler(async (req,res) => {
	if (MasterIDRecord['SessionID'] == undefined) {
		const NewAccountData = await CreateAccountShell();
		MasterAccountRecord = NewAccountData[0];
		MasterIDRecord = NewAccountData[0];
		await WriteSessionRecord(NewAccountData[1]);
		await WriteIndexRecord(NewAccountData[2]);
		SaveUserDB();
	}
	let UserSessionRecord = await ReadSessionRecord();
	if (req.get('sid') != undefined && UserSessionRecord['LastLogin'] < LastServerReset) {
		UserSessionRecord['LoginBonus']['Display'] = true;
		UserSessionRecord['LastLogin'] = Math.floor(Date.now() / 1000);
		await WriteSessionRecord(UserSessionRecord);
		res.end(msgpack.pack({'data_headers':{'result_code':112},'data':{'result_code':112}}));
		return;
	}
	if (UserSessionRecord['LastLogin'] < LastServerReset) {
		UserSessionRecord['LoginBonus']['Display'] = true;
		UserSessionRecord['LastLogin'] = Math.floor(Date.now() / 1000);
	}
	UserSessionRecord['LastLogin'] = Math.floor(Date.now() / 1000);
	await WriteSessionRecord(UserSessionRecord);
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'viewer_id': MasterIDRecord['ViewerID'], 'session_id': MasterIDRecord['SessionID'], 'nonce': null } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/tool/get_service_status", Android_Version + "/tool/get_service_status"], async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'service_status': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Server.post([iOS_Version + "/eula/get_version_list", Android_Version + "/eula/get_version_list"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'version_hash_list': StaticData.VersionData, } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/eula/get_version", Android_Version + "/eula/get_version"], async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	let DeviceRegion = MsgPackData['region'];
	let DeviceLanguage = MsgPackData['lang'];
	if (DeviceRegion == undefined) { DeviceRegion = "us" } else { DeviceRegion = DeviceRegion.toLowerCase(); }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'version_hash': {
			"region": DeviceRegion,
			"lang": DeviceLanguage,
	   		"eula_version": 1,
			"privacy_policy_version": 6
		},
		'agreement_status': 0,
		'is_required_agree': false
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/eula_agree/agree", Android_Version + "/eula_agree/agree"], async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const Region = MsgPackData['region']; const Language = MsgPackData['lang'];
	const EulaVer = MsgPackData['eula_version']; const PrivVer = MsgPackData['privacy_policy_version'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'version_hash': { 'region': Region, 'language': Language, 'eula_version': EulaVer, 'privacy_policy_version': PrivVer } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Server.post([iOS_Version + "/deploy/get_deploy_version", Android_Version + "/deploy/get_deploy_version"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'deploy_hash': GlobalDeployHashContext } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/version/get_resource_version", Android_Version + "/version/get_resource_version"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const OSType = MsgPackData['platform'];
	let ResourceVersion = ""
	if (OSType == 1) { ResourceVersion = AssetList['iOS_Manifest'] } else { ResourceVersion = AssetList['Android_Manifest'] }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'resource_version': ResourceVersion } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/login/verify_jws", Android_Version + "/login/verify_jws"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result_code': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/load/index", Android_Version + "/load/index"], errorhandler(async (req,res) => {
	if (res.locals.UserSessionRecord == undefined) { res.end(msgpack.pack({'data_headers':{'result_code':117},'data':{'result_code': 117}})); return; }
	let JSONDict = {};
	if (res.locals.UserIndexRecord == undefined || res.locals.UserIndexRecord['user_data'] == undefined) { JSONDict = {'data_headers':{'result_code':117},'data':{'result_code': 117}} }
	else {
		JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': res.locals.UserIndexRecord }
		JSONDict['data']['treasure_trade_all_list'] = ShopMap.TreasureTrade;
		JSONDict['data']['mission_notice'] = DataManager.GetMissionNotice(res.locals.UserSessionRecord);
		JSONDict['data']['server_time'] = Math.floor(Date.now() / 1000);
	}
	
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/login/index", Android_Version + "/login/index"], errorhandler(async (req,res) => {
	const LoginData = DataManager.LoginBonusData(res.locals.UserIndexRecord, res.locals.UserSessionRecord, DailyDragonItem);
	let JSONDict = LoginData[0];
	res.locals.UserIndexRecord = LoginData[1];
	res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
	JSONDict['data']['update_data_list']['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
	res.locals.UserSessionRecord = LoginData[2];
	res.locals.UserSessionRecord['DungeonRecord']['IsRepeat'] = 0;
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/webview_version/url_list", Android_Version + "/webview_version/url_list"], async (req,res) => {
	const URLList = URL_List;
	res.set(ResHeaders(URLList.length));
	res.end(URLList);
});
Server.post([iOS_Version + "/mypage/info", Android_Version + "/mypage/info"], async (req,res) => {	
	const JSONDict = DataManager.MyPageInfo(res.locals.UserSessionRecord, StaticData.QuestRotation);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.get("/information/top", async (req,res) => {
	const Serialized = JSON.stringify(StaticData.NewsData);
	res.end(Serialized);
});

Server.post([iOS_Version + "/tutorial/update_step", Android_Version + "/tutorial/update_step"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	let StepID = MsgPackData['step'];
	res.locals.UserIndexRecord['user_data']['tutorial_status'] = StepID;
	var JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		"step": StepID,
		"update_data_list": { 
	  		'user_data': res.locals.UserIndexRecord['user_data']
			}
		},
		"entity_result": {
	  		"converted_entity_list": []
		}
 	}
	switch(StepID) {
		case 101:
			res.locals.UserIndexRecord['user_data']['tutorial_status'] = 101;
			break;
		case 201:
			var MaterialList = [
				{
					'material_id': 101001001,
					'quantity': 1
				},
				{
					'material_id': 103001001,
					'quantity': 1
				}
			]
			JSONDict['data']['update_data_list']['material_list'] = MaterialList;
			res.locals.UserIndexRecord['user_data']['tutorial_status'] = 201;
			res.locals.UserIndexRecord['material_list'] = MaterialList;
			break;
		case 301:
			var EmblemList = [
				{
					'emblem_id': 40000001,
					'is_new': 0,
					'gettime': Math.floor(Date.now() / 1000)
				}
			]
			JSONDict['data']['update_data_list']['emblem_list'] = EmblemList;
			res.locals.UserIndexRecord['user_data']['tutorial_status'] = 301;
			res.locals.UserIndexRecord['user_data']['emblem_id'] = 40000001;
			break;
		case 401:
			JSONDict['data']['update_data_list']['user_data']['tutorial_status'] = 401;
			res.locals.UserIndexRecord = IndexTools.GenerateDefaultSaveData(res.locals.UserIndexRecord['user_data']['name'], res.locals.UserSessionRecord['ViewerID']);
			res.locals.UserIndexRecord['party_list'] = ErasePartyList();
			res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
			res.locals.UserIndexRecord['weapon_passive_ability_list'] = IndexTools.VoidPassives;
			break;
	}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/tutorial/update_flags", Android_Version + "/tutorial/update_flags"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	res.locals.UserIndexRecord['user_data']['tutorial_flag_list'].push(MsgPackData['flag_id']);
	var JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		'update_data_list': { 'tutorial_flag_list': res.locals.UserIndexRecord['user_data']['tutorial_flag_list'] }
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/redoable_summon/get_data", Android_Version + "/redoable_summon/get_data"], async (req,res) => {
	const Serialized = msgpack.pack(TutorialStatic.RedoableSummonData);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
});
Server.post([iOS_Version + "/redoable_summon/pre_exec", Android_Version + "/redoable_summon/pre_exec"], errorhandler(async (req,res) => {
	let SummonData = [];
	let DrawData = null;
	let i = 0; while (i < 50) {
		let Result = Math.round(Math.random());
		switch(Result) {
			case 0:
				DrawData = CharacterMap.DrawCharacterCorrect(90001011, BannerList, false, false);
				break;
			case 1:
				DrawData = DragonMap.DrawDragonCorrect(90001011, BannerList, false, false);
				break;
		}
		var Template = {
			'entity_type': DrawData['entity_type'],
			'id': DrawData['id'],
			'rarity': DrawData['rarity'],
		}
		SummonData.push(Template);
		i++;
	}
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_redoable_summon_data': {
		   	'is_fixed_result': 0,
			'redoable_summon_result_unit_list': SummonData
		},
		'update_data_list': {
		   	'functional_maintenance_list': [
		   		]
		}
	}}
	res.locals.UserSessionRecord['RedoableSummonData'] = SummonData;
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/redoable_summon/fix_exec", Android_Version + "/redoable_summon/fix_exec"], errorhandler(async (req,res) => {
	let UpdateData = {};
	UpdateData['chara_list'] = [];
	UpdateData['dragon_list'] = [];
	UpdateData['unit_story_list'] = [];
	UpdateData['dragon_reliability_list'] = [];
	let EntityData = [];
	for (let y in res.locals.UserSessionRecord['RedoableSummonData']) {
		const DrawData = {
			'id': res.locals.UserSessionRecord['RedoableSummonData'][y]['id']
		}
		switch(res.locals.UserSessionRecord['RedoableSummonData'][y]['entity_type']) {
			case 1:
				if (UpdateData['chara_list'].findIndex(x => x.chara_id === DrawData['id']) == -1) {
					UpdateData['chara_list'].push(CharacterMap.CreateCharacterFromGift(DrawData['id'], 1));
					res.locals.UserIndexRecord['chara_list'].push(CharacterMap.CreateCharacterFromGift(DrawData['id'], 1));
					EntityData.push({ 'entity_type': 1, 'entity_id': DrawData['id'] });
					const CharacterElement = CharacterMap.GetCharacterInfo(DrawData['id'], 'elemental_type');
					const CharacterBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterElement);
					res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['hp'] += 0.1;
					res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['attack'] += 0.1;
					UpdateData['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
					const UnitStoryData = CharacterMap.GenerateUnitStory(DrawData['id'])
					if (UnitStoryData[0] != undefined) {
						UpdateData['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]);
						res.locals.UserIndexRecord['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]); }
				}
				break;
			case 7:
				res.locals.UserSessionRecord['LastAssignedDragonID'] += 1;
				if (UpdateData['dragon_list'].findIndex(x => x.dragon_id === DrawData['id']) == -1) {
					UpdateData['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(DrawData['id']));
					res.locals.UserIndexRecord['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(DrawData['id']));
					const DragonElement = DragonMap.GetDragonInfo(DrawData['id'], "element");
					const DragonBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'].findIndex(x => x.elemental_type == DragonElement);
					res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['hp'] += 0.1;
					res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['attack'] += 0.1;
				}
				UpdateData['dragon_list'].push(DragonMap.CreateDragonFromGift(res.locals.UserSessionRecord['LastAssignedDragonID'], DrawData['id'], 1));
				res.locals.UserIndexRecord['dragon_list'].push(DragonMap.CreateDragonFromGift(res.locals.UserSessionRecord['LastAssignedDragonID'], DrawData['id'], 1));
				EntityData.push({ 'entity_type': 7, 'entity_id': DrawData['id'] });
				break;
		}
	}
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_redoable_summon_data': {
		   	'is_fixed_result': 1,
		   	'redoable_summon_result_unit_list': res.locals.UserSessionRecord['RedoableSummonData']
		},
		'update_data_list': UpdateData,
		'entity_result': { 'new_get_entity_list': EntityData }
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/summon_exclude/get_list", Android_Version + "/summon_exclude/get_list"], async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'summon_exclude_list': [] } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/summon/get_odds_data", Android_Version + "/summon/get_odds_data"], async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const SummonID = MsgPackData['summon_id'];
	const OddsListData = SummonOddsList.find(x => x.summon_id == SummonID);
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'odds_rate_list': OddsListData['odds'],
		'summon_prize_odds_rate_list': OddsListData['prize_odds']
	}}
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
});
Server.post([iOS_Version + "/summon/get_summon_history", Android_Version + "/summon/get_summon_history"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'summon_history_list': res.locals.UserSessionRecord['SummonRecord']['SummonHistory'] } }
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Server.post([iOS_Version + "/summon/get_summon_list", Android_Version + "/summon/get_summon_list"], errorhandler(async (req,res) => {
	SummonList = [];
	SummonPointList = [];
	const RightNow = Math.floor(Date.now() / 1000);
	for (let x in BannerList) {
		const SummonID = BannerList[x]['summon_id'];
		let FreeCount = res.locals.UserSessionRecord['SummonRecord']['FreeTenfoldCount'];
		let LimitCount = res.locals.UserSessionRecord['SummonRecord']['DailyLimitCount'];
		let CrystalCost = BannerList[x]['summon_cost'];
		let StoneCost = BannerList[x]['summon_cost'];
		let LimitCost = BannerList[x]['summon_cost'] / 5;
		if (String(SummonID).slice(0,5) == "10500" || String(SummonID).slice(0,5) == "11100") { 
			FreeCount = 0; LimitCount = 0; CrystalCost = 0; LimitCost = 0; }
		if (BannerList[x]['campaign_type'] != 14) { FreeCount = 0; }
		if (BannerList[x]['start_time'] < RightNow && BannerList[x]['end_time'] > RightNow) {
			const Template = {
				'summon_id': SummonID,
				'summon_type': BannerList[x]['summon_type'],
				'single_crystal': CrystalCost,
				'single_diamond': StoneCost,
				'multi_crystal': CrystalCost * 10,
				'multi_diamond': StoneCost * 10,
				'limited_crystal': 0,
				'limited_diamond': LimitCost,
				'summon_point_id': SummonID,
				'add_summon_point': BannerList[x]['add_sigil_crystal'],
				'add_summon_point_stone': BannerList[x]['add_sigil_stone'],
				'exchange_summon_point': BannerList[x]['sigil_cost'],
				'status': 1,
				'commence_date': BannerList[x]['start_time'],
				'complete_date': BannerList[x]['end_time'],
				'daily_count': 0,
				'daily_limit': LimitCount,
				'total_limit': 0,
				'total_count': 0,
				'campaign_type': BannerList[x]['campaign_type'],
				'free_count_rest': FreeCount,
				'is_beginner_campaign': 0,
				'beginner_campaign_count_rest': 0,
				'consecution_campaign_count_rest': 0
			}
			SummonList.push(Template);
			if (BannerList[x]['sigil_cost'] != 0) {
				let SigilIndex = res.locals.UserSessionRecord['Wyrmsigil'].findIndex(x => x.summon_point_id == SummonID);
				if (SigilIndex == -1) {
					const SigilTemplate = {
						'summon_point_id': SummonID,
						'summon_point': 0,
						'cs_summon_point': 0,
						'cs_point_term_min_date': 0,
						'cs_point_term_max_date': 0
					}
					res.locals.UserSessionRecord['Wyrmsigil'].push(SigilTemplate);
					SummonPointList.push(SigilTemplate);
					await WriteSessionRecord(res.locals.UserSessionRecord);
				}
				else { SummonPointList.push(res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex]); }
			}
		}
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 
		"summon_list": SummonList,
		"summon_point_list": SummonPointList
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/summon/get_summon_point_trade", Android_Version + "/summon/get_summon_point_trade"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const SummonID = MsgPackData['summon_id'];
	let SummonPointTradeList = [];
	let SummonPointList = [];
	const SummonIndex = BannerList.findIndex(x => x.summon_id == SummonID);
	let SigilIndex = res.locals.UserSessionRecord['Wyrmsigil'].findIndex(x => x.summon_point_id == SummonID);
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'summon_point_trade_list': BannerList[SummonIndex]['sigil'],
		'summon_point_list': [ res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex] ]
	}}
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Server.post([iOS_Version + "/summon/summon_point_trade", Android_Version + "/summon/summon_point_trade"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const SummonID = MsgPackData['summon_id']; const TradeID = MsgPackData['trade_id'];
	const SummonIndex = BannerList.findIndex(x => x.summon_id == SummonID);
	const TradeData = BannerList[SummonIndex]['sigil'].find(x => x.trade_id == TradeID);
	const SigilIndex = res.locals.UserSessionRecord['Wyrmsigil'].findIndex(x => x.summon_point_id == SummonID);
	const Remainder = res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex]['summon_point'] - BannerList[SummonIndex]['sigil_cost'];
	if (Remainder <= 0) { res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex]['summon_point'] = 0; }
	else { res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex]['summon_point'] = Remainder }
	let UpdateData = {};
	UpdateData['summon_point_list'] = [ res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex] ];
	UpdateData['chara_list'] = [];
	UpdateData['dragon_list'] = [];
	UpdateData['unit_story_list'] = [];
	UpdateData['dragon_reliability_list'] = [];
	ExchangeEntityList = [];
	if (TradeData['entity_type'] == 1) {
		const CharacterData = CharacterMap.CreateCharacterFromGift(TradeData['entity_id'], 1);
		const UnitStoryData = CharacterMap.GenerateUnitStory(TradeData['entity_id']);
		res.locals.UserIndexRecord['chara_list'].push(CharacterData);
		res.locals.UserIndexRecord['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]);
		UpdateData['chara_list'].push(CharacterData);
		UpdateData['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]);
		ExchangeEntityList.push({ 'entity_type': 1, 'entity_id': TradeData['entity_id'], 'entity_quantity': 1 });
	}
	else if (TradeData['entity_type'] == 7) {
		res.locals.UserSessionRecord['LastAssignedDragonID'] += 1;
		const DragonData = DragonMap.CreateDragonFromGift(res.locals.UserSessionRecord['LastAssignedDragonID'], TradeData['entity_id'], 1);
		res.locals.UserIndexRecord['dragon_list'].push(DragonData);
		UpdateData['dragon_list'].push(DragonData);
		if (res.locals.UserIndexRecord['dragon_reliability_list'].findIndex(x => x.dragon_id === TradeData['entity_id']) == -1) {
			const DragonReliability = DragonMap.GenerateDragonReliability(TradeData['entity_id']);
			res.locals.UserIndexRecord['dragon_reliability_list'].push(DragonReliability);
			UpdateData['dragon_reliability_list'].push(DragonReliability);
		}
		ExchangeEntityList.push({ 'entity_type': 7, 'entity_id': TradeData['entity_id'], 'entity_quantity': 1 });
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'exchange_entity_list': ExchangeEntityList,
		'update_data_list': UpdateData
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/summon/request", Android_Version + "/summon/request"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const SummonID = MsgPackData['summon_id'];
	let BannerData = BannerList.find(x => x.summon_id == SummonID);
	let SigilIndex = res.locals.UserSessionRecord['Wyrmsigil'].findIndex(x => x.summon_point_id == SummonID);
	let SigilPoint = 0;
	let ExecCount = MsgPackData['exec_count'];
	if (ExecCount < 1) { ExecCount = 1; }
	if (MsgPackData['exec_type'] == 2) { ExecCount = 10; }
	const PaymentType = MsgPackData['payment_type'];
	let ReversalIndex = -1;
	let PreSageEffectList = [ 1, 1 ];
	let SummonData = []; let IsTenfold = false; let IsPlatinum = false;
	let UpdateInfo = {}; let NewEntityList = [];
	switch(PaymentType) {
		case 2:
			if (MsgPackData['exec_type'] == 3) {
				res.locals.UserSessionRecord['Diamantium'] -= (BannerData['summon_cost'] / 5);
				SigilPoint = BannerData['add_sigil_stone']; 
				res.locals.UserSessionRecord['SummonRecord']['DailyLimitCount'] = 0; }
			else {
				res.locals.UserSessionRecord['Diamantium'] -= (BannerData['summon_cost'] * ExecCount);
				SigilPoint = ExecCount * BannerData['add_sigil_stone']; }
			UpdateInfo['diamond_data'] = { 'free_diamond': 0, 'paid_diamond': res.locals.UserSessionRecord['Diamantium'] }
			break;
		case 3:
			res.locals.UserIndexRecord['user_data']['crystal'] -= (BannerData['summon_cost'] * ExecCount);
			UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data'];
			SigilPoint = ExecCount * BannerData['add_sigil_crystal'];
			break;
		case 8: // this is vouchers | exec_type 1 == single 2 == 10x
			if (MsgPackData['exec_type'] == 1) {
				const TicketIndex = res.locals.UserIndexRecord['summon_ticket_list'].findIndex(x => x.summon_ticket_id == 10101);
				res.locals.UserIndexRecord['summon_ticket_list'][TicketIndex]['quantity'] -= ExecCount;
			}
			else if (MsgPackData['exec_type'] == 2) {
				const TicketIndex = res.locals.UserIndexRecord['summon_ticket_list'].findIndex(x => x.summon_ticket_id == 10102);
				res.locals.UserIndexRecord['summon_ticket_list'][TicketIndex]['quantity'] -= 1;
			}
			SigilPoint = ExecCount * BannerData['add_sigil_crystal'];
			break;
		case 9: // free daily tenfold!
			res.locals.UserSessionRecord['SummonRecord']['FreeTenfoldCount'] -= 1;
			SigilPoint = ExecCount * BannerData['add_sigil_crystal'];
			break;
		case 10: // beginner daily tenfold!
			res.locals.UserSessionRecord['SummonRecord']['FreeTenfoldCount'] -= 1;
			SigilPoint = ExecCount * BannerData['add_sigil_crystal'];
			break;
	}
	if (SigilPoint != 0) { res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex]['summon_point'] += SigilPoint; }
	let i = 0; while (i < ExecCount) {
		let Result = 0;//Math.round(Math.random());
		const TypeDraw = Math.floor(Math.random() * 100 + 1);
		if (TypeDraw > 90) {Result = 2;} else if (TypeDraw > 45) {Result = 1;}
		if (MsgPackData['summon_id'] == 1020047) { Result = 0; }
		else if (MsgPackData['summon_id'] == 1020102) { Result = 1; }
		let DrawData = "";
		let IsNew = false;
		let DewPoints = 0;
		if (MsgPackData['exec_type'] == 2 && i == 9) { IsTenfold = true; }
		if (BannerData['summon_type'] == 5 && i == 9) { IsPlatinum = true; }
		switch(Result) {
			case 0:
				DrawData = CharacterMap.DrawCharacterCorrect(SummonID, BannerList, IsTenfold, IsPlatinum);
				if (res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === DrawData['id']) == -1) {
					IsNew = true; if (UpdateInfo['chara_list'] == undefined) { UpdateInfo['chara_list'] = []; }
					UpdateInfo['chara_list'].push(CharacterMap.CreateCharacterFromGift(DrawData['id'], 1));
					res.locals.UserIndexRecord['chara_list'].push(CharacterMap.CreateCharacterFromGift(DrawData['id'], 1));
					NewEntityList.push({ 'entity_type': 1, 'entity_id': DrawData['id'] });
					const CharacterElement = CharacterMap.GetCharacterInfo(DrawData['id'], 'elemental_type');
					const CharacterBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterElement);
					res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['hp'] += 0.1;
					res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['attack'] += 0.1;
					UpdateInfo['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
					if (UpdateInfo['unit_story_list'] == undefined) { UpdateInfo['unit_story_list'] = []; } 
					const UnitStoryData = CharacterMap.GenerateUnitStory(DrawData['id'])
					if (UnitStoryData[0] != undefined) {
						UpdateInfo['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]);
						res.locals.UserIndexRecord['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]); } }
				else {
					switch(DrawData['rarity']) {
					case 3: DewPoints = 300; break; case 4: DewPoints = 2500; break; case 5: DewPoints = 8000; break; } }
				break;
			case 1:
				DrawData = DragonMap.DrawDragonCorrect(SummonID, BannerList, IsTenfold, IsPlatinum);
				res.locals.UserSessionRecord['LastAssignedDragonID'] += 1;
				if (UpdateInfo['dragon_list'] == undefined) { UpdateInfo['dragon_list'] = []; }
				if (res.locals.UserIndexRecord['dragon_list'].length + UpdateInfo['dragon_list'].length < 1000) {
					UpdateInfo['dragon_list'].push(DragonMap.CreateDragonFromGift(res.locals.UserSessionRecord['LastAssignedDragonID'], DrawData['id'], 1));
					res.locals.UserIndexRecord['dragon_list'].push(DragonMap.CreateDragonFromGift(res.locals.UserSessionRecord['LastAssignedDragonID'], DrawData['id'], 1));
					if (res.locals.UserIndexRecord['dragon_reliability_list'].findIndex(x => x.dragon_id === DrawData['id']) == -1) {
						if (UpdateInfo['dragon_reliability_list'] == undefined) { UpdateInfo['dragon_reliability_list'] = []; }
						IsNew = true; UpdateInfo['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(DrawData['id']));
						res.locals.UserIndexRecord['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(DrawData['id'])); }
						const DragonElement = DragonMap.GetDragonInfo(DrawData['id'], "element");
						const DragonBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'].findIndex(x => x.elemental_type == DragonElement);
						res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['hp'] += 0.1;
						res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['attack'] += 0.1;
						UpdateInfo['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
					NewEntityList.push({ 'entity_type': 7, 'entity_id': DrawData['id'] }); }
				break;
			case 2:
				DrawData = WyrmprintMap.DrawWyrmprintCorrect(SummonID, BannerList, IsTenfold, IsPlatinum);
				if (UpdateInfo['ability_crest_list'] == undefined) { UpdateInfo['ability_crest_list'] = []; }
				const PrintIndex = res.locals.UserIndexRecord['ability_crest_list'].findIndex(x => x.ability_crest_id == DrawData['id']);
				if (PrintIndex == -1) {
					IsNew = true; const PrintData = WyrmprintMap.CreateWyrmprintFromGift(DrawData['id']);
					UpdateInfo['ability_crest_list'].push(PrintData); res.locals.UserIndexRecord['ability_crest_list'].push(PrintData);
					NewEntityList.push({ 'entity_type': 39, 'entity_id': DrawData['id'] }); }
				else {
					if (res.locals.UserIndexRecord['ability_crest_list'][PrintIndex]['equipable_count'] < 4) {
						res.locals.UserIndexRecord['ability_crest_list'][PrintIndex]['equipable_count'] += 1;
						UpdateInfo['ability_crest_list'].push(res.locals.UserIndexRecord['ability_crest_list'][PrintIndex]); }
					else {
						switch(DrawData['rarity']) {
						case 2: DewPoints = 150; case 3: DewPoints = 300; break; case 4: DewPoints = 2500; break; case 5: DewPoints = 8000; break; } } }
				break;
		}
		
		let Template = {
			'entity_type': DrawData['entity_type'],
			'id': DrawData['id'],
			'rarity': DrawData['rarity'],
			'is_new': IsNew
		}
		if (DewPoints != 0) {
			const NewDewTotal = res.locals.UserIndexRecord['user_data']['dew_point'] + DewPoints;
			if (NewDewTotal > 3000000000) { res.locals.UserIndexRecord['user_data']['dew_point'] = 3000000000; }
			else { res.locals.UserIndexRecord['user_data']['dew_point'] = NewDewTotal; }
			UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data'];
			Template['dew_point'] = DewPoints; }
		SummonData.push(Template);
		i++;
	}
	if (SummonData.findIndex(x => x.rarity === 4) != -1) { PreSageEffectList[0] = Math.round(Math.random() * 2 + 1); PreSageEffectList[1] = 2; }
	if (SummonData.findIndex(x => x.rarity === 5) != -1) { PreSageEffectList[0] = Math.round(Math.random() * 4 + 1); PreSageEffectList[1] = 3; }
	if (MsgPackData['exec_type'] == 2) {
		let rl = 0; rli = 0; for (let rls in SummonData) {
			if (SummonData[rls]['rarity'] == 5) { rl += 1; rli = rls; } }
		if (rl == 1) {
			RDraw2 = Math.floor(Math.random() * 100);
			if (RDraw2 >= 94) {
				ReversalIndex = parseInt(rli); PreSageEffectList[0] = Math.round(Math.random() * 2 + 1); PreSageEffectList[1] = 2; } }
	}
	if (SigilPoint != 0) { UpdateInfo['summon_point_list'] = [ res.locals.UserSessionRecord['Wyrmsigil'][SigilIndex] ]; }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'reversal_effect_index': ReversalIndex,
		'presage_effect_list': PreSageEffectList,
		'result_unit_list': SummonData,
		'result_prize_list': [],
		'result_summon_point': SigilPoint,
		'summon_ticket_list': res.locals.UserIndexRecord['summon_ticket_list'],
		'update_data_list': UpdateInfo,
		'entity_result': { 'new_get_entity_list': NewEntityList }
	}}
	const UserSummonIndex = res.locals.UserSessionRecord['SummonRecord']['UserSummonData'].findIndex(x => x.summon_id == SummonID);
	if (UserSummonIndex != -1) { res.locals.UserSessionRecord['SummonRecord']['UserSummonData']['summon_count'] += ExecCount; }
	else {
		const Template = {
			"summon_id": SummonID,
			"summon_count": ExecCount,
			"campaign_type": BannerData['campaign_type'],
			"free_count_rest": 0,
			"is_beginner_campaign": 0,
			"beginner_campaign_count_rest": 0,
			"consecution_campaign_count_rest": 0
		}
		res.locals.UserSessionRecord['SummonRecord']['UserSummonData'].push(Template);
	}
	
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));

Server.post([iOS_Version + "/ability_crest/get_ability_crest_set_list", Android_Version + "/ability_crest/get_ability_crest_set_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		"ability_crest_set_list": res.locals.UserSessionRecord['WyrmprintSets'],
		'update_data_list': {
			'functional_maintenance_list': []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/ability_crest/set_ability_crest_set", Android_Version + "/ability_crest/set_ability_crest_set"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const SetNumber = MsgPackData['ability_crest_set_no'];
	let RequestedName = MsgPackData['ability_crest_set_name'];
	if (RequestedName.length > 12) { RequestedName = RequestedName.substring(0, 12); }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'ability_crest_set_list': [
			{
				'ability_crest_set_no': SetNumber,
				'ability_crest_set_name': RequestedName,
				'crest_slot_type_1_crest_id_1': MsgPackData['request_ability_crest_set_data']['crest_slot_type_1_crest_id_1'],
				'crest_slot_type_1_crest_id_2': MsgPackData['request_ability_crest_set_data']['crest_slot_type_1_crest_id_2'],
				'crest_slot_type_1_crest_id_3': MsgPackData['request_ability_crest_set_data']['crest_slot_type_1_crest_id_3'],
				'crest_slot_type_2_crest_id_1': MsgPackData['request_ability_crest_set_data']['crest_slot_type_2_crest_id_1'],
				'crest_slot_type_2_crest_id_2': MsgPackData['request_ability_crest_set_data']['crest_slot_type_2_crest_id_2'],
				'crest_slot_type_3_crest_id_1': MsgPackData['request_ability_crest_set_data']['crest_slot_type_3_crest_id_1'],
				'crest_slot_type_3_crest_id_2': MsgPackData['request_ability_crest_set_data']['crest_slot_type_3_crest_id_2'],
				'talisman_key_id': MsgPackData['request_ability_crest_set_data']['talisman_key_id']
			}
		]
	}}}
	res.locals.UserSessionRecord['WyrmprintSets'][SetNumber - 1] = JSONDict['data']['update_data_list']['ability_crest_set_list'][0];
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/ability_crest/update_ability_crest_set_name", Android_Version + "/ability_crest/update_ability_crest_set_name"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const SetNumber = MsgPackData['ability_crest_set_no'];
	let RequestedName = MsgPackData['ability_crest_set_name'];
	if (RequestedName.length > 12) { RequestedName = RequestedName.substring(0, 12); }
	res.locals.UserSessionRecord['WyrmprintSets'][SetNumber - 1]['ability_crest_set_name'] = RequestedName;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'ability_crest_set_list': [ res.locals.UserSessionRecord['WyrmprintSets'][SetNumber - 1] ]
	}}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/ability_crest/buildup_piece", Android_Version + "/ability_crest/buildup_piece"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const PrintID = MsgPackData['ability_crest_id'];
	const PrintBuildup = MsgPackData['buildup_ability_crest_piece_list']; const Augments = MsgPackData['plus_count_parameters'];
	const PrintIndex = res.locals.UserIndexRecord['ability_crest_list'].findIndex(x => x.ability_crest_id === PrintID); const PrintData = res.locals.UserIndexRecord['ability_crest_list'][PrintIndex]; 
	const NewData = WyrmprintMap.WyrmprintBuild(PrintID, PrintBuildup, Augments, PrintData);
	res.locals.UserIndexRecord['ability_crest_list'][PrintIndex] = NewData[0];
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'ability_crest_list': [ NewData[0] ],
		'user_data': res.locals.UserIndexRecord['user_data'],
		'material_list': []
	}}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/ability_crest/buildup_plus_count", Android_Version + "/ability_crest/buildup_plus_count"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const PrintID = MsgPackData['ability_crest_id'];
	const Augments = MsgPackData['plus_count_params_list']; const PrintIndex = res.locals.UserIndexRecord['ability_crest_list'].findIndex(x => x.ability_crest_id === PrintID);
	const PrintData = res.locals.UserIndexRecord['ability_crest_list'][PrintIndex]; 
	const NewData = WyrmprintMap.WyrmprintAugment(PrintID, Augments, PrintData);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'ability_crest_list': [],
		'user_data': res.locals.UserIndexRecord['user_data'],
		'material_list': []
	}}}
	JSONDict['data']['update_data_list']['ability_crest_list'].push(NewData[0]);
	res.locals.UserIndexRecord['ability_crest_list'][PrintIndex] = NewData[0];
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/ability_crest/reset_plus_count", Android_Version + "/ability_crest/reset_plus_count"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const PrintID = MsgPackData['ability_crest_id']; let Type = MsgPackData['plus_count_type_list'][0];
	const PrintIndex = res.locals.UserIndexRecord['ability_crest_list'].findIndex(x => x.ability_crest_id === PrintID);
	if (Type == 1) { Type = "hp_plus_count"; } else if (Type == 2) { Type = "attack_plus_count"; }
	res.locals.UserIndexRecord['ability_crest_list'][PrintIndex][Type] = 0;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'ability_crest_list': [
				res.locals.UserIndexRecord['ability_crest_list'][PrintIndex]
			]
		}
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/chara/get_chara_unit_set", Android_Version + "/chara/get_chara_unit_set"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	let JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'chara_unit_set_list': [],
		'update_data_list': {}
	}}
	for (let x in MsgPackData['chara_id_list']) {
		JSONDict['data']['chara_unit_set_list'][x] = {}
		JSONDict['data']['chara_unit_set_list'][x]['chara_id'] = MsgPackData['chara_id_list'][x];
		if (res.locals.UserSessionRecord['EquipmentSets'][String(MsgPackData['chara_id_list'][x])] == undefined) {
			JSONDict['data']['chara_unit_set_list'][x]['chara_unit_set_detail_list'] = []; }
		else {
			JSONDict['data']['chara_unit_set_list'][x]['chara_unit_set_detail_list'] = res.locals.UserSessionRecord['EquipmentSets'][String(MsgPackData['chara_id_list'][x])]; }
	}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/set_chara_unit_set", Android_Version + "/chara/set_chara_unit_set"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const SetNo = MsgPackData['unit_set_no']; const SetName = MsgPackData['unit_set_name'];
	const CharaID = MsgPackData['chara_id']; const RequestData = MsgPackData['request_chara_unit_set_data'];
	if (res.locals.UserSessionRecord['EquipmentSets'][String(CharaID)] == undefined) {
		res.locals.UserSessionRecord['EquipmentSets'][String(CharaID)] = StaticData.DefaultEquipment();
	}
	res.locals.UserSessionRecord['EquipmentSets'][String(CharaID)][SetNo - 1] = {
		'unit_set_no': SetNo,
		'unit_set_name': SetName,
		'dragon_key_id': RequestData['dragon_key_id'],
		'weapon_body_id': RequestData['weapon_body_id'],
		'crest_slot_type_1_crest_id_1': RequestData['crest_slot_type_1_crest_id_1'],
		'crest_slot_type_1_crest_id_2': RequestData['crest_slot_type_1_crest_id_2'],
		'crest_slot_type_1_crest_id_3': RequestData['crest_slot_type_1_crest_id_3'],
		'crest_slot_type_2_crest_id_1': RequestData['crest_slot_type_2_crest_id_1'],
		'crest_slot_type_2_crest_id_2': RequestData['crest_slot_type_2_crest_id_2'],
		'crest_slot_type_3_crest_id_1': RequestData['crest_slot_type_3_crest_id_1'],
		'crest_slot_type_3_crest_id_2': RequestData['crest_slot_type_3_crest_id_2'],
		'talisman_key_id': RequestData['talisman_key_id']
	}
	
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'chara_unit_set_list': [
				{
					'chara_id': CharaID,
					'chara_unit_set_detail_list': res.locals.UserSessionRecord['EquipmentSets'][String(CharaID)]
				}
			]
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/awake", Android_Version + "/chara/awake"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; const Rarity = MsgPackData['next_rarity'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID);
	if (MsgPackData['next_rarity'] == 4) { res.locals.UserIndexRecord['user_data']['dew_point'] -= 2500; }
	else if (MsgPackData['next_rarity'] == 5) { res.locals.UserIndexRecord['user_data']['dew_point'] -= 25000; }
	res.locals.UserIndexRecord['chara_list'][CharacterIndex]['rarity'] = MsgPackData['next_rarity'];
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'chara_list': [ res.locals.UserIndexRecord['chara_list'][CharacterIndex] ],
		'user_data': res.locals.UserIndexRecord['user_data']
	}}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/buildup", Android_Version + "/chara/buildup"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; const GrowList = MsgPackData['material_list'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID);
	const NewData = CharacterMap.LevelUp(CharacterID, GrowList, res.locals.UserIndexRecord['chara_list'][CharacterIndex]);
	const BonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterMap.GetCharacterInfo(CharacterID, "elemental_type"));
	res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['hp'] += NewData[1];
	res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['attack'] += NewData[1];
	let JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'chara_list': []
		}
	}}
	JSONDict['data']['update_data_list']['chara_list'].push(NewData[0]); 
	JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	if (NewData[1] != 0.0) {
		JSONDict['data']['update_data_list']['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
	}
	res.locals.UserIndexRecord['chara_list'][CharacterIndex] = NewData[0];
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/buildup_mana", Android_Version + "/chara/buildup_mana"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; const MCList = MsgPackData['mana_circle_piece_id_list'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID); const CharacterData = res.locals.UserIndexRecord['chara_list'][CharacterIndex];
	const NewData = CharacterMap.RaiseManaCircle(CharacterID, MCList, 0, CharacterData);
	const BonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterMap.GetCharacterInfo(CharacterID, "elemental_type"));
	res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['hp'] += NewData[1];
	res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['attack'] += NewData[1];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'chara_list': []
		}
	}}
	JSONDict['data']['update_data_list']['chara_list'].push(NewData[0]);
	JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	res.locals.UserIndexRecord['chara_list'][CharacterIndex] = NewData[0];
	if (NewData[1] != 0.0) {
		JSONDict['data']['update_data_list']['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
	}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/limit_break", Android_Version + "/chara/limit_break"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id'];
	const LimitBreakCount = MsgPackData['next_limit_break_count'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID);
	res.locals.UserIndexRecord['chara_list'][CharacterIndex]['limit_break_count'] = LimitBreakCount;
	if (LimitBreakCount == 5) { res.locals.UserIndexRecord['chara_list'][CharacterIndex]['additional_max_level'] = 5; }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'chara_list': [ res.locals.UserIndexRecord['chara_list'][CharacterIndex] ]
		}
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/limit_break_and_buildup_mana", Android_Version + "/chara/limit_break_and_buildup_mana"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; const MCList = MsgPackData['mana_circle_piece_id_list'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID); const CharacterData = res.locals.UserIndexRecord['chara_list'][CharacterIndex];
	const LimitBreakCount = MsgPackData['next_limit_break_count']; const NewData = CharacterMap.RaiseManaCircle(CharacterID, MCList, LimitBreakCount, CharacterData);
	const BonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterMap.GetCharacterInfo(CharacterID, "elemental_type"));
	res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['hp'] += NewData[1];
	res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['attack'] += NewData[1];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'chara_list': []
	}}}
	JSONDict['data']['update_data_list']['chara_list'].push(NewData[0]); JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	res.locals.UserIndexRecord['chara_list'][CharacterIndex] = NewData[0];
	if (NewData[1] != 0.0) {
		JSONDict['data']['update_data_list']['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
	}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/unlock_edit_skill", Android_Version + "/chara/unlock_edit_skill"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; 
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id == CharacterID);
	const CharacterData = res.locals.UserIndexRecord['chara_list'][CharacterIndex];
	const NewData = CharacterMap.UnlockSharedSkill(CharacterID, CharacterData);
	res.locals.UserIndexRecord['chara_list'][CharacterIndex] = NewData;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'chara_list': [ NewData ],
		'material_list': []
	}}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/buildup_platinum", Android_Version + "/chara/buildup_platinum"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; 
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID); const CharacterData = res.locals.UserIndexRecord['chara_list'][CharacterIndex];
	const NewData = CharacterMap.RaiseOmnicite(CharacterID, CharacterData);
	const StoryData = CharacterMap.FillMissingStories(CharacterID, res.locals.UserIndexRecord);
	const BonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterMap.GetCharacterInfo(CharacterID, "elemental_type"));
	let y = 0; while (y < StoryData.length) { res.locals.UserIndexRecord['unit_story_list'].push(StoryData[y]); y++; } res.locals.UserIndexRecord['chara_list'][CharacterIndex] = NewData;
	if (CharacterData['mana_circle_piece_id_list'].length < 50 && CharacterMap.GetCharacterInfo(CharacterID, "has_spiral") == true) { 
		res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['hp'] += 0.4; res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['attack'] += 0.4; }
	else { res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['hp'] += 0.2; res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][BonusIndex]['attack'] += 0.2; }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'chara_list': [], 'unit_story_list': StoryData, 'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list']
	}}}
	JSONDict['data']['update_data_list']['chara_list'].push(NewData); JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/chara/reset_plus_count", Android_Version + "/chara/reset_plus_count"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; let Type = MsgPackData['plus_count_type'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID);
	if (Type == 1) { Type = "hp_plus_count"; } else if (Type == 2) { Type = "attack_plus_count"; }
	res.locals.UserIndexRecord['chara_list'][CharacterIndex][Type] = 0;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'chara_list': [
				res.locals.UserIndexRecord['chara_list'][CharacterIndex]
			]
		}
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/dragon/sell", Android_Version + "/dragon/sell"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const DragonList = MsgPackData['dragon_key_id_list']; let i = 0;
	let DeletedDragonList = []; while (i < DragonList.length) { 
		const DragonIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === DragonList[i]);
		const WorthCoins = DragonMap.GetDragonInfo(res.locals.UserIndexRecord['dragon_list'][DragonIndex]['dragon_id'], "sellcoin");
		const WorthWater = DragonMap.GetDragonInfo(res.locals.UserIndexRecord['dragon_list'][DragonIndex]['dragon_id'], "sellwater");
		res.locals.UserIndexRecord['dragon_list'].splice(DragonIndex, 1); 
		DeletedDragonList.push({ 'dragon_key_id': DragonList[i] }); 
		const NewCoinTotal = res.locals.UserIndexRecord['user_data']['coins'] + WorthCoins;
		if (NewCoinTotal > 3000000000) { res.locals.UserIndexRecord['user_data']['coins'] = 3000000000; }
		else { res.locals.UserIndexRecord['user_data']['coins'] += WorthCoins; }
		const NewDewTotal = res.locals.UserIndexRecord['user_data']['dew_point'] + WorthWater;
		if (NewDewTotal > 2000000000) { res.locals.UserIndexRecord['user_data']['dew_point'] = 2000000000; }
		else { res.locals.UserIndexRecord['user_data']['dew_point'] += WorthWater; } 
		i++; }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'delete_data_list': { 'delete_dragon_list': DeletedDragonList }, 
		'update_data_list': { 'user_data': res.locals.UserIndexRecord['user_data'] } } }
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Server.post([iOS_Version + "/dragon/set_lock", Android_Version + "/dragon/set_lock"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const KeyID = MsgPackData['dragon_key_id']; const IsLock = MsgPackData['is_lock'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === KeyID);
	res.locals.UserIndexRecord['dragon_list'][DragonIndex]['is_lock'] = IsLock;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': { 'dragon_list': [] } } }
	JSONDict['data']['update_data_list']['dragon_list'].push(res.locals.UserIndexRecord['dragon_list'][DragonIndex]);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Server.post([iOS_Version + "/dragon/limit_break", Android_Version + "/dragon/limit_break"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const KeyID = MsgPackData['base_dragon_key_id']; const GrowList = MsgPackData['limit_break_grow_list'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === KeyID);
	const PreviousData = res.locals.UserIndexRecord['dragon_list'][DragonIndex]; const UpdateData = DragonMap.LimitBreakDragon(res.locals.UserIndexRecord, KeyID, PreviousData, GrowList, res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album']);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'delete_data_list': {
			'delete_dragon_list': UpdateData[1]
		},
		'update_data_list': {
			'dragon_list': [],
			'album_dragon_list': UpdateData[4],
			'material_list': UpdateData[2]
		}
	}}
	JSONDict['data']['update_data_list']['dragon_list'].push(UpdateData[0]);
	res.locals.UserIndexRecord = UpdateData[3];
	const NewIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === KeyID); res.locals.UserIndexRecord['dragon_list'][NewIndex] = UpdateData[0];
	res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'] = UpdateData[5];
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Server.post([iOS_Version + "/dragon/buildup", Android_Version + "/dragon/buildup"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const KeyID = MsgPackData['base_dragon_key_id']; const GrowList = MsgPackData['grow_material_list']; 
	const DragonIndex = res.locals.UserIndexRecord['dragon_list'].find(x => x.dragon_key_id === KeyID);
	const UpdateData = DragonMap.BuildDragon(KeyID, GrowList, DragonIndex, res.locals.UserIndexRecord);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'dragon_list': [ UpdateData[0] ],
			'material_list': []
		},
		'delete_data_list': {
			'delete_dragon_list': UpdateData[1]
		}
	}}
	res.locals.UserIndexRecord = UpdateData[2];
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dragon/get_contact_data", Android_Version + "/dragon/get_contact_data"], async (req,res) => {
	const JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		"shop_gift_list": res.locals.UserSessionRecord['FortData']['DragonGiftList'],
		"update_data_list": {
			"functional_maintenance_list": []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/dragon/reset_plus_count", Android_Version + "/dragon/reset_plus_count"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const KeyID = MsgPackData['dragon_key_id']; let Type = MsgPackData['plus_count_type'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === KeyID);
	if (Type == 1) { Type = "hp_plus_count"; } else if (Type == 2) { Type = "attack_plus_count"; }
	res.locals.UserIndexRecord['dragon_list'][DragonIndex][Type] = 0;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'dragon_list': [
				res.locals.UserIndexRecord['dragon_list'][DragonIndex]
			]
		}
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dragon/buy_gift_to_send", Android_Version + "/dragon/buy_gift_to_send"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const DragonID = MsgPackData['dragon_id']; const GiftID = MsgPackData['dragon_gift_id'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_reliability_list'].findIndex(x => x.dragon_id == DragonID);
	const GiftIndex = res.locals.UserSessionRecord['FortData']['DragonGiftList'].findIndex(x => x.dragon_gift_id == GiftID);
	const GiftAddIndex = DragonMap.DragonGiftMap.findIndex(x => x.id == GiftID);
	const DragonFavorite = DragonMap.GetDragonInfo(DragonID, "favorite");
	const BondType = DragonMap.GetDragonInfo(DragonID, "bond_type");
	let AddReliability = 0;
	let IsFavorite = 0;
	let RewardBondList = [];
	let UnitStoryList = [];
	if (DragonMap.DragonGiftMap[GiftAddIndex]['favorite_type'] == DragonFavorite) {
		AddReliability = DragonMap.DragonGiftMap[GiftAddIndex]['favorite_reliability'];
		IsFavorite = 1;
	}
	else { AddReliability = DragonMap.DragonGiftMap[GiftAddIndex]['reliability']; }
	const NewBondData = LevelMap.DragonBond(BondType, res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] + AddReliability);
	if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 5) && (NewBondData[0] >= 5)) {
		res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
		UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
		RewardBondList.push({
			"levelup_entity_list": [
				{
					"entity_type": 0,
					"entity_id": 0,
					"entity_quantity": 0,
					"is_over": 0
				}
			],
			"level": 5,
			"is_release_story": 1
		});
	}
	if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 15) && (NewBondData[0] >= 15)) {
		res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
		UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
		RewardBondList.push({
			"levelup_entity_list": [
				{
					"entity_type": 0,
					"entity_id": 0,
					"entity_quantity": 0,
					"is_over": 0
				}
			],
			"level": 15,
			"is_release_story": 1
		});
	}
	res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] = NewBondData[0];
	res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] = NewBondData[1];
	res.locals.UserIndexRecord['user_data']['coin'] -= res.locals.UserSessionRecord['FortData']['DragonGiftList'][GiftIndex]['price'];
	res.locals.UserSessionRecord['FortData']['DragonGiftList'][GiftIndex]['is_buy'] = 0;
	const ReturnGift = FortMap.DragonRewards(DragonMap.GetDragonInfo(DragonID, "element"), 1);
	const Parsed = DataManager.ItemParser(ReturnGift, res.locals.UserSessionRecord, res.locals.UserIndexRecord, "entity");
	res.locals.UserSessionRecord = Parsed[0]; res.locals.UserIndexRecord = Parsed[1];
	const JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		"shop_gift_list": res.locals.UserSessionRecord['FortData']['DragonGiftList'],
		"return_gift_list": ReturnGift,
		"is_favorite": IsFavorite,
		"reward_reliability_list": RewardBondList,
		"dragon_contact_free_gift_count": res.locals.UserSessionRecord['FortData']['DragonGiftList'][0]['is_buy'],
		"update_data_list": {
			"user_data": res.locals.UserIndexRecord['user_data'],
			"dragon_reliability_list": [ res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex] ],
			"material_list": Parsed[2]['material_list']
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
}));
Server.post([iOS_Version + "/dragon/buy_gift_to_send_multiple", Android_Version + "/dragon/buy_gift_to_send_multiple"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const DragonID = MsgPackData['dragon_id']; const GiftList = MsgPackData['dragon_gift_id_list'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_reliability_list'].findIndex(x => x.dragon_id == DragonID);
	const DragonFavorite = DragonMap.GetDragonInfo(DragonID, "favorite");
	const BondType = DragonMap.GetDragonInfo(DragonID, "bond_type");
	let AddReliability = 0;
	let UnitStoryList = [];
	let RewardGiftList = [];
	let FinalMaterialList = [];
	for (let x in GiftList) {
		const GiftID = GiftList[x];
		const GiftIndex = res.locals.UserSessionRecord['FortData']['DragonGiftList'].findIndex(x => x.dragon_gift_id == GiftID);
		const GiftAddIndex = DragonMap.DragonGiftMap.findIndex(x => x.id == GiftID);
		const ReturnGift = FortMap.DragonRewards(DragonMap.GetDragonInfo(DragonID, "element"), 1);
		res.locals.UserIndexRecord['user_data']['coin'] -= res.locals.UserSessionRecord['FortData']['DragonGiftList'][GiftIndex]['price'];
		res.locals.UserSessionRecord['FortData']['DragonGiftList'][GiftIndex]['is_buy'] = 0;
		let Template = {
			'dragon_gift_id': GiftID,
			'return_gift_list': ReturnGift,
			'is_favorite': 0,
			'reward_reliability_list': []
		}
		if (DragonMap.DragonGiftMap[GiftAddIndex]['favorite_type'] == DragonFavorite) {
			AddReliability += DragonMap.DragonGiftMap[GiftAddIndex]['favorite_reliability'];
			Template['is_favorite'] = 1;
		}
		else { AddReliability += DragonMap.DragonGiftMap[GiftAddIndex]['reliability']; }
		const NewBondData = LevelMap.DragonBond(BondType, res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] + AddReliability);
		if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 5) && (NewBondData[0] >= 5)) {
			res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
			UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
			Template['reward_reliability_list'].push({
				"levelup_entity_list": [
					{
						"entity_type": 0,
						"entity_id": 0,
						"entity_quantity": 0,
						"is_over": 0
					}
				],
				"level": 5,
				"is_release_story": 1
			});
		}
		if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 15) && (NewBondData[0] >= 15)) {
			res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
			UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
			Template['reward_reliability_list'].push({
				"levelup_entity_list": [
					{
						"entity_type": 0,
						"entity_id": 0,
						"entity_quantity": 0,
						"is_over": 0
					}
				],
				"level": 15,
				"is_release_story": 1
			});
		}
		res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] = NewBondData[0];
		res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] = NewBondData[1];
		RewardGiftList.push(Template);
		const Parsed = DataManager.ItemParser(ReturnGift, res.locals.UserSessionRecord, res.locals.UserIndexRecord, "entity");
		res.locals.UserSessionRecord = Parsed[0]; res.locals.UserIndexRecord = Parsed[1];
		FinalMaterialList = Parsed[2]['material_list'];
	}
	const JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		"shop_gift_list": res.locals.UserSessionRecord['FortData']['DragonGiftList'],
		"dragon_gift_reward_list": RewardGiftList,
		"dragon_contact_free_gift_count": res.locals.UserSessionRecord['FortData']['DragonGiftList'][0]['is_buy'],
		"update_data_list": {
			"user_data": res.locals.UserIndexRecord['user_data'],
			"dragon_reliability_list": [ res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex] ],
			"material_list": FinalMaterialList
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
}));
Server.post([iOS_Version + "/dragon/send_gift", Android_Version + "/dragon/send_gift"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const DragonID = MsgPackData['dragon_id']; const GiftID = MsgPackData['dragon_gift_id'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_reliability_list'].findIndex(x => x.dragon_id == DragonID);
	const GiftIndex = res.locals.UserIndexRecord['dragon_gift_list'].findIndex(x => x.dragon_gift_id == GiftID);
	const GiftAddIndex = DragonMap.DragonGiftMap.findIndex(x => x.id == GiftID);
	const DragonFavorite = DragonMap.GetDragonInfo(DragonID, "favorite");
	const BondType = DragonMap.GetDragonInfo(DragonID, "bond_type");
	let AddReliability = DragonMap.DragonGiftMap[GiftAddIndex]['reliability'];;
	let IsFavorite = 0;
	let RewardBondList = [];
	let UnitStoryList = [];
	const NewBondData = LevelMap.DragonBond(BondType, res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] + AddReliability);
	if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 5) && (NewBondData[0] >= 5)) {
		res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
		UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
		RewardBondList.push({
			"levelup_entity_list": [
				{
					"entity_type": 0,
					"entity_id": 0,
					"entity_quantity": 0,
					"is_over": 0
				}
			],
			"level": 5,
			"is_release_story": 1
		});
	}
	if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 15) && (NewBondData[0] >= 15)) {
		res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
		UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
		RewardBondList.push({
			"levelup_entity_list": [
				{
					"entity_type": 0,
					"entity_id": 0,
					"entity_quantity": 0,
					"is_over": 0
				}
			],
			"level": 15,
			"is_release_story": 1
		});
	}
	res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] = NewBondData[0];
	res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] = NewBondData[1];
	res.locals.UserIndexRecord['dragon_gift_list'][GiftIndex]['quantity'] -= 1;
	const ReturnGift = FortMap.DragonRewards(DragonMap.GetDragonInfo(DragonID, "element"), 1);
	const Parsed = DataManager.ItemParser(ReturnGift, res.locals.UserSessionRecord, res.locals.UserIndexRecord, "entity");
	res.locals.UserSessionRecord = Parsed[0]; res.locals.UserIndexRecord = Parsed[1];
	const JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		"return_gift_list": ReturnGift,
		"is_favorite": IsFavorite,
		"reward_reliability_list": RewardBondList,
		"dragon_contact_free_gift_count": res.locals.UserSessionRecord['FortData']['DragonGiftList'][0]['is_buy'],
		"update_data_list": {
			"user_data": res.locals.UserIndexRecord['user_data'],
			"dragon_reliability_list": [ res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex] ],
			"dragon_gift_list": [ res.locals.UserIndexRecord['dragon_gift_list'][GiftIndex] ],
			"material_list": Parsed[2]['material_list']
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
}));
Server.post([iOS_Version + "/dragon/send_gift_multiple", Android_Version + "/dragon/send_gift_multiple"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const DragonID = MsgPackData['dragon_id']; const GiftID = MsgPackData['dragon_gift_id']; const Count = MsgPackData['quantity'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_reliability_list'].findIndex(x => x.dragon_id == DragonID);
	const DragonFavorite = DragonMap.GetDragonInfo(DragonID, "favorite");
	const BondType = DragonMap.GetDragonInfo(DragonID, "bond_type");
	let AddReliability = 0;
	let IsFavorite = 0;
	let RewardBondList = [];
	let UnitStoryList = [];
	const GiftIndex = res.locals.UserIndexRecord['dragon_gift_list'].findIndex(x => x.dragon_gift_id == GiftID);
	const GiftAddIndex = DragonMap.DragonGiftMap.findIndex(x => x.id == GiftID);
	res.locals.UserIndexRecord['dragon_gift_list'][GiftIndex]['quantity'] -= Count;
	AddReliability += DragonMap.DragonGiftMap[GiftAddIndex]['reliability'] * Count;
	const NewBondData = LevelMap.DragonBond(BondType, res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] + AddReliability);
	if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 5) && (NewBondData[0] >= 5)) {
		res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
		UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id"), "is_read": 0 });
		RewardBondList.push({
			"levelup_entity_list": [
				{
					"entity_type": 0,
					"entity_id": 0,
					"entity_quantity": 0,
					"is_over": 0
				}
			],
			"level": 5,
			"is_release_story": 1
		});
	}
	if ((res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] < 15) && (NewBondData[0] >= 15)) {
		res.locals.UserIndexRecord['unit_story_list'].push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
		UnitStoryList.push({ "unit_story_id": DragonMap.GetDragonInfo(DragonID, "story_id") + 1, "is_read": 0 });
		RewardBondList.push({
			"levelup_entity_list": [
				{
					"entity_type": 0,
					"entity_id": 0,
					"entity_quantity": 0,
					"is_over": 0
				}
			],
			"level": 15,
			"is_release_story": 1
		});
	}
	res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_level'] = NewBondData[0];
	res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex]['reliability_total_exp'] = NewBondData[1];
	const ReturnGift = FortMap.DragonRewards(DragonMap.GetDragonInfo(DragonID, "element"), Count);
	const Parsed = DataManager.ItemParser(ReturnGift, res.locals.UserSessionRecord, res.locals.UserIndexRecord, "entity");
	res.locals.UserSessionRecord = Parsed[0]; res.locals.UserIndexRecord = Parsed[1];
	const JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		"return_gift_list": ReturnGift,
		"is_favorite": IsFavorite,
		"reward_reliability_list": RewardBondList,
		"dragon_contact_free_gift_count": res.locals.UserSessionRecord['FortData']['DragonGiftList'][0]['is_buy'],
		"update_data_list": {
			"user_data": res.locals.UserIndexRecord['user_data'],
			"dragon_reliability_list": [ res.locals.UserIndexRecord['dragon_reliability_list'][DragonIndex] ],
			"dragon_gift_list": [ res.locals.UserIndexRecord['dragon_gift_list'][GiftIndex] ],
			"material_list": Parsed[2]['material_list']
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
}));

Server.post([iOS_Version + "/update/namechange", Android_Version + "/update/namechange"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	let RequestedName = MsgPackData['name'];
	if (RequestedName.length > 12) { RequestedName = RequestedName.substring(0, 12); }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'checked_name': String(RequestedName),
		'update_data_list': {
			'functional_maintenance_list': []
		}
	}}
	res.locals.UserIndexRecord['user_data']['name'] = String(RequestedName);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/emblem/get_list", Android_Version + "/emblem/get_list"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'emblem_list': res.locals.UserSessionRecord['Epithet']
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/emblem/set", Android_Version + "/emblem/set"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const RequestedEpithet = MsgPackData['emblem_id'];
	if (typeof RequestedEpithet != "number") { const Serialized = msgpack.pack({'data_headers':{'result_code':114},'data':{'result':114}}); res.set(ResHeaders(Serialized.length)); res.end(Serialized); }
	else {
		res.locals.UserIndexRecord['user_data']['emblem_id'] = RequestedEpithet;
		const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 
			'result': 1,
			'update_data_list': { 'user_data': res.locals.UserIndexRecord['user_data'] } 
		}}
		const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
	}
}));
Server.post([iOS_Version + "/option/get_option", Android_Version + "/option/get_option"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'option_data': res.locals.UserSessionRecord['SetOptions'],
		'update_data_list': {
			'functional_maintenance_list': []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/option/set_option", Android_Version + "/option/set_option"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const UserOptions = MsgPackData['option_setting'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'option_data': UserOptions,
		'update_data_list': { 'functional_maintenance_list': [] }
	}}
	res.locals.UserSessionRecord['SetOptions'] = UserOptions;
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/push_notification/update_setting", Android_Version + "/push_notification/update_setting"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/party/index", Android_Version + "/party/index"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': { 'functional_maintenance_list': [] } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/party/set_main_party_no", Android_Version + "/party/set_main_party_no"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const RequestedPartyNumber = MsgPackData['main_party_no'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
			'main_party_no': RequestedPartyNumber,
			'update_data_list': {
				'functional_maintenance_list': []
			}
		}}
	res.locals.UserIndexRecord['user_data']['main_party_no'] = RequestedPartyNumber;
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/party/set_party_setting", Android_Version + "/party/set_party_setting"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const PartyNumber = MsgPackData['party_no'];
	if (PartyNumber <= 0 || PartyNumber >= 55 || typeof PartyNumber === "string") { res.end(msgpack.pack({'data_headers':{'result_code':117},'data':{'result_code':117}})); return; }
	const PartyName = MsgPackData['party_name'];
	if (PartyName.length > 12) { PartyName == PartyName.substring(0, 12); }
	const PartyData = MsgPackData['request_party_setting_list'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'party_list': [
				{
				'party_no': PartyNumber,
				'party_name': PartyName,
				'party_setting_list': PartyData
				}
			],},
		'functional_maintenance_list': []
		}}
	res.locals.UserIndexRecord['party_list'][PartyNumber - 1]['party_name'] = PartyName;
	res.locals.UserIndexRecord['party_list'][PartyNumber - 1]['party_setting_list'] = PartyData;
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/party/update_party_name", Android_Version + "/party/update_party_name"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const PartyNumber = MsgPackData['party_no'];
	const PartyName = MsgPackData['party_name'];
	if (PartyNumber <= 0 || PartyNumber >= 54 || typeof PartyNumber === "string") { res.end(msgpack.pack({'data_headers':{'result_code':117},'data':{'result_code':117}})); return; }
	if (PartyName.length > 12) { PartyName == PartyName.substring(0, 12); }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'party_no': PartyNumber,
			'party_name': PartyName,
			'party_setting_list': res.locals.UserIndexRecord['party_list'][PartyNumber - 1]
		},
		'functional_maintenance_list': []
		}}
	res.locals.UserIndexRecord['party_list'][PartyNumber - 1]['party_name'] = PartyName;
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/friend/get_support_chara", Android_Version + "/friend/get_support_chara"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'setting_support': res.locals.UserSessionRecord['SupportCharacter'],
		'update_data_list': { 'functional_maintenance_list': [] }
		}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Server.post([iOS_Version + "/quest/read_story", Android_Version + "/quest/read_story"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const ReadStory = MsgPackData['quest_story_id'];
	let JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'quest_story_reward_list': [],
		'update_data_list': {
			'quest_story_list': [
				{
					'quest_story_id': ReadStory,
					'state': 1
				}
			],
			'user_data': res.locals.UserIndexRecord['user_data'],
		},
		'entity_result': {
			'new_get_entity_list': []
		}
	}}
	const StoryIndex = res.locals.UserIndexRecord['quest_story_list'].findIndex(x => x.quest_story_id == ReadStory);
	if (StoryIndex == -1 || res.locals.UserIndexRecord['quest_story_list'][StoryIndex]['state'] != 1) {
		res.locals.UserIndexRecord['quest_story_list'].push({'quest_story_id': ReadStory, 'state': 1});
		if (QuestMap.HasRewardCharacter(ReadStory) == true) {
			const RewardData = QuestMap.RewardCharacter(ReadStory);
			const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id == RewardData['entity_id']);
			if (CharacterIndex == -1) {
				JSONDict['data']['entity_result']['new_get_entity_list'].push(RewardData);
				res.locals.UserIndexRecord['chara_list'].push(CharacterMap.CreateCharacterFromGift(RewardData['entity_id'], 1));
				const NewIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id == RewardData['entity_id']);
				res.locals.UserIndexRecord['chara_list'][NewIndex]['is_unlock_edit_skill'] = 1;
				JSONDict['data']['update_data_list']['chara_list'] = [];
				JSONDict['data']['update_data_list']['chara_list'].push(res.locals.UserIndexRecord['chara_list'][NewIndex]);
				JSONDict['data']['quest_story_reward_list'].push({'entity_type': RewardData['entity_type'], 'entity_id': RewardData['entity_id'],
																  'entity_level': 1, 'entity_limit_break_count': 0, 'entity_quantity': 1});
				const UnitStoryData = CharacterMap.GenerateUnitStory(RewardData['entity_id']);
				if (UnitStoryData[0] != undefined) {
					JSONDict['data']['update_data_list']['unit_story_list'] = [];
					JSONDict['data']['update_data_list']['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]);
					res.locals.UserIndexRecord['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]); }
				const CharacterElement = CharacterMap.GetCharacterInfo(RewardData['entity_id'], 'elemental_type');
				const CharacterBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterElement);
				res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['hp'] += 0.1;
				res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['attack'] += 0.1;
			}
		}
		if (QuestMap.HasRewardDragon(ReadStory) == true) {
			const RewardData = QuestMap.RewardDragon(ReadStory);
			JSONDict['data']['entity_result']['new_get_entity_list'].push(RewardData);
			res.locals.UserSessionRecord['LastAssignedDragonID'] += 1;
			await WriteSessionRecord(res.locals.UserSessionRecord);
			res.locals.UserIndexRecord['dragon_list'].push(DragonMap.CreateDragonFromGift(res.locals.UserSessionRecord['LastAssignedDragonID'], RewardData['entity_id'], 1));
			const NewIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id == res.locals.UserSessionRecord['LastAssignedDragonID']);
			JSONDict['data']['update_data_list']['dragon_list'] = [];
			JSONDict['data']['update_data_list']['dragon_list'].push(res.locals.UserIndexRecord['dragon_list'][NewIndex]);
			JSONDict['data']['quest_story_reward_list'].push({'entity_type': RewardData['entity_type'], 'entity_id': RewardData['entity_id'],
															  'entity_level': 1, 'entity_limit_break_count': 0, 'entity_quantity': 1});
			JSONDict['data']['update_data_list']['dragon_reliability_list'] = [];
			JSONDict['data']['update_data_list']['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(RewardData['entity_id']));
			res.locals.UserIndexRecord['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(RewardData['entity_id']));
			const DragonElement = DragonMap.GetDragonInfo(RewardData['entity_id'], "element");
			const DragonBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'].findIndex(x => x.elemental_type == DragonElement);
			res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['hp'] += 0.1;
			res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['attack'] += 0.1;
		}
		if (QuestMap.HasRewardFacility(ReadStory) == true) {
			JSONDict['data']['update_data_list']['build_list'] = [];
			const RewardData = QuestMap.RewardFacility(ReadStory);
			for (let z in RewardData) {
				const BuildID = res.locals.UserIndexRecord['build_list'][res.locals.UserIndexRecord['build_list'].length - 1]['build_id'] + 1;
				const Template = {
					"build_id": BuildID,
					"fort_plant_detail_id": parseInt(String(RewardData[z]) + "01"),
					"position_x": -1,
					"position_z": -1,
					"build_status": 0,
					"build_start_date": 0,
					"build_end_date": 0,
					"level": 1,
					"plant_id": RewardData[z],
					"is_new": 0,
					"remain_time": 0,
					"last_income_date": -1
				}
				res.locals.UserIndexRecord['build_list'].push(Template);
				JSONDict['data']['update_data_list']['build_list'].push(Template);
			}
		}
		
		const QuestBase = String(ReadStory).slice(0, 3);
		if (QuestBase == 204 || QuestBase == 214) {
			let EventType = "Raid"; if (QuestBase == 214) { EventType = "CLB01"; }
			const EventID = String(ReadStory).slice(0, 5);
			if (EventMap.EventFriendStory(EventID) == ReadStory) {
				const CharacterID = EventMap.EventInfoMap[EventID]['event_character'];
				if (res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id == CharacterID) == -1) {
					res.locals.UserSessionRecord['Event'][EventType][EventID]['Friendship'] = [
						{
							'chara_id': CharacterID,
							'total_point': 0,
							'is_temporary': 1
						}
					]
					if (JSONDict['data']['update_data_list']['chara_list'] == undefined) { JSONDict['data']['update_data_list']['chara_list'] = []; }
					if (JSONDict['data']['update_data_list']['unit_story_list'] == undefined) { JSONDict['data']['update_data_list']['unit_story_list'] = []; }
					const CharacterData = CharacterMap.CreateCharacterFromGift(CharacterID, 1);
					const CharacterStoryData = CharacterMap.GenerateUnitStory(CharacterID);
					res.locals.UserIndexRecord['chara_list'].push(CharacterData);
					res.locals.UserIndexRecord['unit_story_list'].push(CharacterStoryData[0], CharacterStoryData[1], CharacterStoryData[2], CharacterStoryData[3], CharacterStoryData[4]);
					JSONDict['data']['update_data_list']['chara_list'].push(CharacterData);
					JSONDict['data']['update_data_list']['unit_story_list'].push(CharacterStoryData[0], CharacterStoryData[1], CharacterStoryData[2], CharacterStoryData[3], CharacterStoryData[4]);
					JSONDict['data']['entity_result']['new_get_entity_list'].push({ 'entity_type': 1, 'entity_id': CharacterID });
					await WriteIndexRecord(res.locals.UserIndexRecord);
				}
				else {
					res.locals.UserSessionRecord['Event'][EventType][EventID]['Friendship'] = [
						{
							'chara_id': CharacterID,
							'total_point': 500,
							'is_temporary': 0
						}
					]
				}
				await WriteSessionRecord(res.locals.UserSessionRecord);
			}
		}
		
		res.locals.UserIndexRecord['user_data']['crystal'] += 25;
		JSONDict['data']['quest_story_reward_list'].push({"entity_type": 23, "entity_id": 0, "entity_quantity": 25});
		JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/story/read", Android_Version + "/story/read"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const ReadStory = MsgPackData['unit_story_id'];
	const StoryIndex = res.locals.UserIndexRecord['unit_story_list'].findIndex(x => x.unit_story_id == ReadStory);
	let RewardList = [];
	if (StoryIndex == -1) {
		res.locals.UserIndexRecord['unit_story_list'].push({'unit_story_id': ReadStory, 'is_read': 1});
		RewardList.push({ "entity_type": 23, "entity_id": 0, "entity_quantity": 25 });
		res.locals.UserIndexRecord['user_data']['crystal'] += 25; }
	else if (res.locals.UserIndexRecord['unit_story_list'][StoryIndex]['is_read'] == 0) {
		res.locals.UserIndexRecord['unit_story_list'][StoryIndex]['is_read'] = 1;
		RewardList.push({ "entity_type": 23, "entity_id": 0, "entity_quantity": 25 });
		res.locals.UserIndexRecord['user_data']['crystal'] += 25; }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'unit_story_reward_list': RewardList,
		'update_data_list': {
			'unit_story_list': [{'unit_story_id': ReadStory, 'is_read': 1}],
			'user_data': res.locals.UserIndexRecord['user_data']
		}
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/castle_story/read", Android_Version + "/castle_story/read"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const ReadStory = MsgPackData['castle_story_id'];
	let RewardList = [];
	const StoryIndex = res.locals.UserIndexRecord.castle_story_list.findIndex(x => x.castle_story_id == ReadStory);
	if (StoryIndex == -1) {
		res.locals.UserIndexRecord['user_data']['crystal'] += 50;
		res.locals.UserIndexRecord['castle_story_list'].push({'castle_story_id': ReadStory, 'is_read': 1}); 
		RewardList.push({'entity_type': 23, 'entity_id': 0, 'entity_quantity': 50}); }
	else if (res.locals.UserIndexRecord['castle_story_list'][StoryIndex]['is_read'] = 0) {
		res.locals.UserIndexRecord['castle_story_list'][StoryIndex]['is_read'] = 1;
		res.locals.UserIndexRecord['user_data']['crystal'] += 50;
		RewardList.push({'entity_type': 23, 'entity_id': 0, 'entity_quantity': 50}); }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'castle_story_reward_list': RewardList,
		'update_data_list': {
			'castle_story_list': [
				{
					'castle_story_id': ReadStory,
					'is_read': 1
				}
			],
			'user_data': res.locals.UserIndexRecord['user_data'],
			'functional_maintenance_list': []
		}
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/fort/get_data", Android_Version + "/fort/get_data"], errorhandler(async (req,res) => {
	if (res.locals.UserIndexRecord['build_list'] == undefined) { res.locals.UserIndexRecord['build_list'] = IndexTools.MinimalFortData; }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'build_list': res.locals.UserIndexRecord['build_list'],
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'dragon_contact_free_gift_count': 0,
		'current_server_time': Math.floor(Date.now() / 1000)
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/get_multi_income", Android_Version + "/fort/get_multi_income"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); BuildIDList = MsgPackData['build_id_list'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1, 'harvest_build_list': [], 'add_coin_list': [],
		'add_stamina_list': [], 'is_over_coin': 0, 'is_over_material': 0,
		'update_data_list': {} } }
	let UpdateDataList = {};
	UpdateDataList['build_list'] = [];
	let i = 0; while (i < BuildIDList.length) {
		const BuildID = BuildIDList[i];
		const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
		switch(res.locals.UserIndexRecord['build_list'][BuildIndex]['plant_id']) {
			case 100101:
				res.locals.UserIndexRecord['build_list'][BuildIndex]['last_income_date'] = Math.floor(Date.now() / 1000);
				res.locals.UserIndexRecord['build_list'][BuildIndex]['last_income_time'] = 0;
				break;
			case 100201:
				let RupieGain = 100;
				res.locals.UserIndexRecord['build_list'][BuildIndex]['last_income_date'] = Math.floor(Date.now() / 1000);
				res.locals.UserIndexRecord['build_list'][BuildIndex]['last_income_time'] = 0;
				if (res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] < 10 && res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] > 0) { RupieGain = 1000; }
				if (res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] < 20 && res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] > 10) { RupieGain = 2500; }
				if (res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] < 30 && res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] > 20) { RupieGain = 3000; }
				if (res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] < 40 && res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] > 30) { RupieGain = 4500; }
				if (res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] > 40) { RupieGain = 6000; }
				JSONDict['data']['add_coin_list'].push({'build_id': BuildID, 'add_coin': RupieGain});
				const NewCoinTotal = res.locals.UserIndexRecord['user_data']['coin'] + RupieGain;
				if (NewCoinTotal > 3000000000) { res.locals.UserIndexRecord['user_data']['coin'] = 3000000000 }
				else { res.locals.UserIndexRecord['user_data']['coin'] += RupieGain; }
				UpdateDataList['user_data'] = res.locals.UserIndexRecord['user_data'];
				UpdateDataList['build_list'].push(res.locals.UserIndexRecord['build_list'][BuildIndex]);
				break;
			case 100301:
				if (UpdateDataList['material_list'] == undefined) { UpdateDataList['material_list'] = []; }
				let HarvestList = [];
				res.locals.UserIndexRecord['build_list'][BuildIndex]['last_income_date'] = Math.floor(Date.now() / 1000);
				res.locals.UserIndexRecord['build_list'][BuildIndex]['last_income_time'] = 0;
				const Tier1 = Math.floor(Math.random() * 15 + 5);
				HarvestList.push({'material_id': 102001001, 'add_num': Tier1});
				const Tier1Index = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == 102001001);
				if (Tier1Index != -1) { res.locals.UserIndexRecord['material_list'][Tier1Index]['quantity'] += Tier1; 
										UpdateDataList['material_list'].push(res.locals.UserIndexRecord['material_list'][Tier1Index]); }
				else { res.locals.UserIndexRecord['material_list'].push({'material_id': 102001001, 'quantity': Tier1}); 
					   UpdateDataList['material_list'].push({'material_id': 102001001, 'quantity': Tier1}); }
				if (res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] > 9) {
					const Tier2 = Math.floor(Math.random() * 19 + 1);
					HarvestList.push({'material_id': 102001002, 'add_num': Tier2});
					const Tier2Index = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == 102001002);
					if (Tier2Index != -1) { res.locals.UserIndexRecord['material_list'][Tier2Index]['quantity'] += Tier2;
											UpdateDataList['material_list'].push(res.locals.UserIndexRecord['material_list'][Tier2Index]); }
					else { res.locals.UserIndexRecord['material_list'].push({'material_id': 102001002, 'quantity': Tier2}); 
						   UpdateDataList['material_list'].push({'material_id': 102001002, 'quantity': Tier2}); }
				}
				if (res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] > 19) {
					const Tier3 = Math.floor(Math.random() * 19 + 1);
					HarvestList.push({'material_id': 102001003, 'add_num': Tier3});
					const Tier3Index = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == 102001003);
					if (Tier3Index != -1) { res.locals.UserIndexRecord['material_list'][Tier3Index]['quantity'] += Tier3; 
											UpdateDataList['material_list'].push(res.locals.UserIndexRecord['material_list'][Tier3Index]); }
					else { res.locals.UserIndexRecord['material_list'].push({'material_id': 102001003, 'quantity': Tier3});
						   UpdateDataList['material_list'].push({'material_id': 102001003, 'quantity': Tier3}); }
				}
				JSONDict['data']['harvest_build_list']['build_id'] = BuildID;
				JSONDict['data']['harvest_build_list']['add_harvest_list'] = HarvestList;
				UpdateDataList['build_list'].push(res.locals.UserIndexRecord['build_list'][BuildIndex]);
				break;
		}
		i++;
	}
	JSONDict['data']['update_data_list'] = UpdateDataList;
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/move", Android_Version + "/fort/move"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); BuildID = MsgPackData['build_id'];
	NewX = MsgPackData['after_position_x']; NewZ = MsgPackData['after_position_z'];
	BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	res.locals.UserIndexRecord['build_list'][BuildIndex]['position_x'] = NewX; res.locals.UserIndexRecord['build_list'][BuildIndex]['position_z'] = NewZ;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1, 'build_id': BuildID, 'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': { 'build_list': [ res.locals.UserIndexRecord['build_list'][BuildIndex] ] }
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/build_start", Android_Version + "/fort/build_start"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const FacilityID = MsgPackData['fort_plant_id'];
	let DetailID = parseInt(String(FacilityID) + "01");
	if (String(FacilityID).slice(0, 5) == "10070") { DetailID = parseInt(String(FacilityID) + "00"); }
	const UpgradeTime = FortMap.GetFacilityData(DetailID, "level_up_time"); 
	const UpgradeCostCoin = FortMap.GetFacilityData(DetailID, "level_up_rupies");
	const UpgradeCostMaterial = FortMap.GetFacilityData(DetailID, "level_up_materials");
	let UpdateInfo = {}; UpdateInfo['build_list'] = [];
	const BuildID = res.locals.UserIndexRecord['build_list'][res.locals.UserIndexRecord['build_list'].length - 1]['build_id'] + 1;
	const BuildTemplate = {
		'build_id': BuildID,
		'fort_plant_detail_id': DetailID,
		'position_x': MsgPackData['position_x'],
		'position_z': MsgPackData['position_z'],
		'build_status': 1,
		'build_start_date': Math.floor(Date.now() / 1000),
		'build_end_date': Math.floor(Date.now() / 1000) + UpgradeTime,
		'level': 0,
		'plant_id': FacilityID,
		'is_new': 0,
		'remain_time': UpgradeTime,
		'last_income_date': Math.floor(Date.now() / 1000) + UpgradeTime,
		'last_income_time': 0
	}
	UpdateInfo['build_list'].push(BuildTemplate);
	res.locals.UserIndexRecord['build_list'].push(BuildTemplate);
	res.locals.UserIndexRecord['user_data']['coin'] -= UpgradeCostCoin;
	UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data'];
	if (UpgradeCostMaterial != undefined) {
		UpdateInfo['material_list'] = [];
		for (let y in UpgradeCostMaterial) {
			const MaterialIndex = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == UpgradeCostMaterial[y]['entity_id']);
			res.locals.UserIndexRecord['material_list'][MaterialIndex]['quantity'] -= UpgradeCostMaterial[y]['quantity'];
			UpdateInfo['material_list'].push(res.locals.UserIndexRecord['material_list'][MaterialIndex]);
		}
	}
	if (FortMap.GetFacilityData(DetailID, "cost_max_time") != 0) { res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] += 1; }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'levelup_start_date': Math.floor(Date.now() / 1000),
		'levelup_end_date': Math.floor(Date.now() / 1000) + UpgradeTime,
		'remain_time': UpgradeTime,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': UpdateInfo
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/build_end", Android_Version + "/fort/build_end"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] += 1;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_status'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_start_date'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_end_date'] = 0;
	res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
	let UpdateInfo = {}; UpdateInfo['build_list'] = []; 
	UpdateInfo['build_list'].push(res.locals.UserIndexRecord['build_list'][BuildIndex]);
	if (res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] > 0) {
		res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] -= 1;
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/build_at_once", Android_Version + "/fort/build_at_once"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const PaymentType = MsgPackData['payment_type'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] += 1;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_status'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_start_date'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_end_date'] = 0;
	res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
	let UpdateInfo = {}; UpdateInfo['build_list'] = []; UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data'];
	UpdateInfo['build_list'].push(res.locals.UserIndexRecord['build_list'][BuildIndex]);
	if (res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] > 0) {
		res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] -= 1;
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/build_cancel", Android_Version + "/fort/build_cancel"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	const FacilityID = res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'];
	const UpgradeCostCoin = FortMap.GetFacilityData(FacilityID, "level_up_rupies");
	const UpgradeCostMaterial = FortMap.GetFacilityData(FacilityID, "level_up_materials");
	res.locals.UserIndexRecord['user_data']['coin'] += UpgradeCostCoin;
	if (UpgradeCostMaterial != undefined) {
		for (let y in UpgradeCostMaterial) {
			const MaterialIndex = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == UpgradeCostMaterial[y]['entity_id']);
			res.locals.UserIndexRecord['material_list'][MaterialIndex]['quantity'] += UpgradeCostMaterial[y]['quantity'];
		}
	}
	res.locals.UserIndexRecord['build_list'].splice(BuildIndex);
	res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] -= 1;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': {
			'build_list': []
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/levelup_start", Android_Version + "/fort/levelup_start"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	const FacilityID = res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'];
	const NextFacilityID = FortMap.GetFacilityData(FacilityID, "next_level_id");
	const UpgradeTime = FortMap.GetFacilityData(NextFacilityID, "level_up_time");
	const UpgradeCostCoin = FortMap.GetFacilityData(NextFacilityID, "level_up_rupies");
	const UpgradeCostMaterial = FortMap.GetFacilityData(NextFacilityID, "level_up_materials");
	let UpdateInfo = {};
	res.locals.UserIndexRecord['user_data']['coin'] -= UpgradeCostCoin;
	UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data'];
	if (UpgradeCostMaterial != undefined) {
		UpdateInfo['material_list'] = [];
		for (let y in UpgradeCostMaterial) {
			const MaterialIndex = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == UpgradeCostMaterial[y]['entity_id']);
			res.locals.UserIndexRecord['material_list'][MaterialIndex]['quantity'] -= UpgradeCostMaterial[y]['quantity'];
			UpdateInfo['material_list'].push(res.locals.UserIndexRecord['material_list'][MaterialIndex]);
		}
	}
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_status'] = 2;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_start_date'] = Math.floor(Date.now() / 1000);
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_end_date'] = Math.floor(Date.now() / 1000) + UpgradeTime;
	res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] += 1;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'levelup_start_date': Math.floor(Date.now() / 1000),
		'levelup_end_date': Math.floor(Date.now() / 1000) + UpgradeTime,
		'remain_time': UpgradeTime,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': UpdateInfo
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/levelup_end", Android_Version + "/fort/levelup_end"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	const FacilityID = res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'];
	const NextFacilityID = FortMap.GetFacilityData(FacilityID, "next_level_id");
	res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'] = NextFacilityID;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] += 1;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_status'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_start_date'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_end_date'] = 0;
	res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
	let UpdateInfo = {}; UpdateInfo['build_list'] = []; 
	UpdateInfo['build_list'].push(res.locals.UserIndexRecord['build_list'][BuildIndex]);
	if (res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] > 0) {
		res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] -= 1;
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/levelup_at_once", Android_Version + "/fort/levelup_at_once"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const PaymentType = MsgPackData['payment_type'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	const FacilityID = res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'];
	const NextFacilityID = FortMap.GetFacilityData(FacilityID, "next_level_id");
	res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'] = NextFacilityID;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] += 1;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_status'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_start_date'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_end_date'] = 0;
	res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
	let UpdateInfo = {}; UpdateInfo['build_list'] = []; UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data'];
	UpdateInfo['build_list'].push(res.locals.UserIndexRecord['build_list'][BuildIndex]);
	if (res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] > 0) {
		res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] -= 1;
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/fort/levelup_cancel", Android_Version + "/fort/levelup_cancel"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	const FacilityID = res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'];
	const NextFacilityID = FortMap.GetFacilityData(FacilityID, "next_level_id");
	const UpgradeCostCoin = FortMap.GetFacilityData(NextFacilityID, "level_up_rupies");
	const UpgradeCostMaterial = FortMap.GetFacilityData(NextFacilityID, "level_up_materials");
	res.locals.UserIndexRecord['user_data']['coin'] += UpgradeCostCoin;
	if (UpgradeCostMaterial != undefined) {
		for (let y in UpgradeCostMaterial) {
			const MaterialIndex = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == UpgradeCostMaterial[y]['entity_id']);
			res.locals.UserIndexRecord['material_list'][MaterialIndex]['quantity'] += UpgradeCostMaterial[y]['quantity'];
		}
	}
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_status'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_start_date'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_end_date'] = 0;
	res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] -= 1;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': {
			'build_list': [ res.locals.UserIndexRecord['build_list'][BuildIndex] ]
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/present/get_present_list", Android_Version + "/present/get_present_list"], errorhandler(async (req,res) => {
	const MsgPackData = req.body;
	const IsLimit = MsgPackData['is_limit'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
			'present_notice': {
				'present_count': res.locals.UserSessionRecord['GiftRecord']['GiftNormalList'].length,
				'present_limit_count': res.locals.UserSessionRecord['GiftRecord']['GiftLimitedList'].length
			},
			'functional_maintenance_list': []
		},
		'entity_result': {
			'converted_entity_list': []
		}
	}}
	if (IsLimit) { JSONDict['data']['present_limit_list'] = res.locals.UserSessionRecord['GiftRecord']['GiftLimitedList']; }
	else { JSONDict['data']['present_list'] = res.locals.UserSessionRecord['GiftRecord']['GiftNormalList']; }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/present/receive", Android_Version + "/present/receive"], errorhandler(async (req,res) => {
	/*const MsgPackData = msgpack.unpack(req.body); const IDList = MsgPackData['present_id_list']; const IsLimit = MsgPackData['is_limit'];
	let UpdateData = {};
	let AcceptedGifts = [];
	for (let Entry in IDList)
	if (IsLimit) { AcceptedGifts[i] = res.locals.UserSessionRecord['GiftRecord']['GiftLimitedList'].shift(); }
	else { AcceptedGifts[i] = res.locals.UserSessionRecord['GiftRecord']['GiftNormalList'].shift(); }
	AcceptedGifts[i]['viewer_id'] = res.locals.UserSessionRecord['ViewerID'];
	res.locals.UserSessionRecord['GiftRecord']['GiftHistory'] = AcceptedGifts;
	UpdateData['present_notice'] = { 'present_count': res.locals.UserSessionRecord['GiftRecord']['GiftNormalList'].length, 'present_limit_count': res.locals.UserSessionRecord['GiftRecord']['GiftLimitedList'].length };
	UpdateData['not_receive_present_id_list'] = [];
	UpdateData['delete_present_id_list'] = [];
	UpdateData['limit_over_present_id_list'] = [];
	UpdateData['converted_entity_list'] = [];
	UpdateData['functional_maintenance_list'] = [];
	
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'present_limit_list': [],
		'receive_present_id_list': IDList,
		'update_data_list': UpdateData,
		"entity_result": { "converted_entity_list": [] }
		}
	}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	*/
	JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {} } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/present/get_history_list", Android_Version + "/present/get_history_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'present_history_list': res.locals.UserSessionRecord['GiftRecord']['GiftHistory'],
		'update_data_list': {
			'functional_maintenance_list': []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/friend/friend_index", Android_Version + "/friend/friend_index"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'friend_count': SupportData['data']['support_user_list'].length
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/friend/friend_list", Android_Version + "/friend/friend_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'friend_list': SupportData['data']['support_user_list'],
		'new_friend_viewer_id_list': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/weapon_body/craft", Android_Version + "/weapon_body/craft"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const WeaponID = MsgPackData['weapon_body_id'];
	const CraftCost = WeaponMap.GetWeaponInfo(WeaponID, "craft_cost");
	let UpdateMaterialList = [];
	if (CraftCost != undefined) {
		for (let y in CraftCost) {
			switch(CraftCost[y]['entity_type']) {
				case 4:
					res.locals.UserIndexRecord['user_data']['coin'] -= CraftCost[y]['quantity'];
					break;
				case 8:
					const MaterialIndex = res.locals.UserIndexRecord['material_list'].findIndex(x => x.material_id == CraftCost[y]['entity_id']);
					res.locals.UserIndexRecord['material_list'][MaterialIndex]['quantity'] -= CraftCost[y]['quantity'];
					UpdateMaterialList.push(res.locals.UserIndexRecord['material_list'][MaterialIndex]);
					break;
			}
		}
	}
	const NewData = WeaponMap.CreateWeaponFromGift(WeaponID);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'weapon_body_list': [NewData[0]],
		'weapon_skin_list': [NewData[1]],
		'user_data': res.locals.UserIndexRecord['user_data'],
		'material_list': UpdateMaterialList
	}}}
	res.locals.UserIndexRecord['weapon_body_list'].push(NewData[0]); res.locals.UserIndexRecord['weapon_skin_list'].push(NewData[1]);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/weapon_body/buildup_piece", Android_Version + "/weapon_body/buildup_piece"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const WeaponID = MsgPackData['weapon_body_id']; const WeaponBuildup = MsgPackData['buildup_weapon_body_piece_list'];
	const WeaponIndex = res.locals.UserIndexRecord['weapon_body_list'].findIndex(x => x.weapon_body_id === WeaponID);
	const WeaponData = res.locals.UserIndexRecord['weapon_body_list'][WeaponIndex];
	let UpdateMaterialList = [];
	let UpdateSkinList = [];
	const CostData = WeaponMap.WeaponCost(WeaponID, WeaponBuildup, res.locals.UserIndexRecord);
	res.locals.UserIndexRecord = CostData[0];
	const UpgradeData = WeaponMap.WeaponBuild(WeaponID, WeaponBuildup, WeaponData, res.locals.UserIndexRecord['weapon_passive_ability_list']);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'weapon_body_list': [UpgradeData[0]],
		'material_list': CostData[1],
		'weapon_skin_list': CostData[2],
		'user_data': res.locals.UserIndexRecord['user_data']
	}}}
	res.locals.UserIndexRecord['weapon_body_list'][WeaponIndex] = UpgradeData[0];
	if (UpgradeData[2] == true) {
		res.locals.UserIndexRecord['weapon_passive_ability_list'] = UpgradeData[1];
		JSONDict['data']['update_data_list']['weapon_passive_ability_list'] = UpgradeData[1];
	}
	if (WeaponData['fort_passive_chara_weapon_buildup_count'] == 0 && UpgradeData[0]['fort_passive_chara_weapon_buildup_count'] == 1) {
		const WeaponType = WeaponMap.GetWeaponInfo(WeaponID, "weapon_type");
		const WeaponBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['param_bonus_by_weapon'].findIndex(x => x.weapon_type == WeaponType);
		if (WeaponMap.GetWeaponInfo(WeaponID, "rarity") == 6) {
			res.locals.UserIndexRecord['fort_bonus_list']['param_bonus_by_weapon'][WeaponBonusIndex]['hp'] += 1.5;
			res.locals.UserIndexRecord['fort_bonus_list']['param_bonus_by_weapon'][WeaponBonusIndex]['attack'] += 1.5;
		}
		else {
			res.locals.UserIndexRecord['fort_bonus_list']['param_bonus_by_weapon'][WeaponBonusIndex]['hp'] += 0.5;
			res.locals.UserIndexRecord['fort_bonus_list']['param_bonus_by_weapon'][WeaponBonusIndex]['attack'] += 0.5;
		}
	}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/story_skip/skip", Android_Version + "/story_skip/skip"], errorhandler(async (req, res) => {
	const QuestList = IndexTools.CampaignQuestList;
	const StoryList = IndexTools.CampaignStoryList;
	const TimeNow = Math.floor(Date.now() / 1000);
	let CharacterList = [];
	let DragonList = [];
	let EntityList = [];
	let UnitStoryList = [];
	let DragonBond = [];
	for (let y in QuestList) {
		const QuestTemplate = {
			"quest_id": QuestList[y],
			"state": 3,
			"is_mission_clear_1": 1,
			"is_mission_clear_2": 1,
			"is_mission_clear_3": 1,
			"play_count": 1,
			"daily_play_count": 1,
			"weekly_play_count": 1,
			"last_daily_reset_time": TimeNow,
			"last_weekly_reset_time": TimeNow,
			"is_appear": 1,
			"best_clear_time": 0.0
		}
		const QuestIndex = res.locals.UserIndexRecord['quest_list'].findIndex(x => x.quest_id == QuestList[y]);
		if (QuestIndex == -1) {
			res.locals.UserIndexRecord['quest_list'].push(QuestTemplate);
			res.locals.UserIndexRecord['user_data']['crystal'] += 40;
		}
	}
	for (let v in StoryList) {
		const StoryTemplate = {
			"quest_story_id": StoryList[v],
			"state": 1
		}
		const StoryID = res.locals.UserIndexRecord['quest_story_list'].findIndex(x => x.quest_story_id == StoryList[v]);
		if (StoryID == -1) {
			if (QuestMap.HasRewardCharacter(StoryList[v]) == true) {
				const RewardData = QuestMap.RewardCharacter(StoryList[v]);
				const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id == RewardData['entity_id']);
				if (CharacterIndex == -1) {
					EntityList.push(RewardData);
					res.locals.UserIndexRecord['chara_list'].push(CharacterMap.CreateCharacterFromGift(RewardData['entity_id'], 1));
					const NewIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id == RewardData['entity_id']);
					res.locals.UserIndexRecord['chara_list'][NewIndex]['is_unlock_edit_skill'] = 1;
					CharacterList.push(res.locals.UserIndexRecord['chara_list'][NewIndex]);
					const UnitStoryData = CharacterMap.GenerateUnitStory(RewardData['entity_id']);
					if (UnitStoryData[0] != undefined) {
						UnitStoryList.push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]);
						res.locals.UserIndexRecord['unit_story_list'].push(UnitStoryData[0], UnitStoryData[1], UnitStoryData[2], UnitStoryData[3], UnitStoryData[4]); }
					const CharacterElement = CharacterMap.GetCharacterInfo(RewardData['entity_id'], 'elemental_type');
					const CharacterBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'].findIndex(x => x.elemental_type == CharacterElement);
					res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['hp'] += 0.1;
					res.locals.UserIndexRecord['fort_bonus_list']['chara_bonus_by_album'][CharacterBonusIndex]['attack'] += 0.1;
				}
			}
			if (QuestMap.HasRewardDragon(StoryList[v]) == true) {
				const RewardData = QuestMap.RewardDragon(StoryList[v]);
				EntityList.push(RewardData);
				res.locals.UserSessionRecord['LastAssignedDragonID'] += 1;
				res.locals.UserIndexRecord['dragon_list'].push(DragonMap.CreateDragonFromGift(res.locals.UserSessionRecord['LastAssignedDragonID'], RewardData['entity_id'], 1));
				const NewIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id == res.locals.UserSessionRecord['LastAssignedDragonID']);
				DragonList.push(res.locals.UserIndexRecord['dragon_list'][NewIndex]);
				DragonBond.push(DragonMap.GenerateDragonReliability(RewardData['entity_id']));
				res.locals.UserIndexRecord['dragon_reliability_list'].push(DragonMap.GenerateDragonReliability(RewardData['entity_id']));
				const DragonElement = DragonMap.GetDragonInfo(RewardData['entity_id'], "element");
				const DragonBonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'].findIndex(x => x.elemental_type == DragonElement);
				res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['hp'] += 0.1;
				res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][DragonBonusIndex]['attack'] += 0.1;
			}
			res.locals.UserIndexRecord['user_data']['crystal'] += 25;
			res.locals.UserIndexRecord['quest_story_list'].push(StoryTemplate);
		}
	}
	res.locals.UserIndexRecord['user_data']['tutorial_status'] = 60999;
	res.locals.UserIndexRecord['user_data']['tutorial_flag_list'] = IndexTools.TutorialFlagsList;
	res.locals.UserIndexRecord['current_main_story_mission']['main_story_mission_group_id'] = 11
	res.locals.UserIndexRecord['current_main_story_mission']['main_story_mission_state_list'] = [
		{'main_story_mission_id': 10110101,'state': 2},
		{'main_story_mission_id': 10110201,'state': 2},
		{'main_story_mission_id': 10110301,'state': 2},
		{'main_story_mission_id': 10110401,'state': 2},
		{'main_story_mission_id': 10110501,'state': 2}
	]
	let NewFaciList = []; const DoubleFacilityID = [ 100401, 100402, 100403, 100404, 100405, 100501, 100502, 100503,
													 100504, 100505, 100506, 100507, 100508, 100509 ];
						  const DracolithFacilID = [ 100601, 100602, 100603, 100604, 100605 ];
	let LastBuildID = res.locals.UserIndexRecord['build_list'][res.locals.UserIndexRecord['build_list'].length - 1]['build_id'];
	for (let entry in res.locals.UserIndexRecord['build_list']) {
		const CurrentPlantID = res.locals.UserIndexRecord['build_list'][entry]['plant_id'];
		if (CurrentPlantID == 100201 || CurrentPlantID == 100301) { //lv 15
			if (res.locals.UserIndexRecord['build_list'][entry]['level'] < 15) {
				const NewDetail = parseInt(String(CurrentPlantID) + "15");
				res.locals.UserIndexRecord['build_list'][entry]['fort_plant_detail_id'] = NewDetail;
				res.locals.UserIndexRecord['build_list'][entry]['level'] = 15;
				NewFaciList.push(res.locals.UserIndexRecord['build_list'][entry]);
			}
			else { NewFaciList.push(res.locals.UserIndexRecord['build_list'][entry]); }
		}
		else if (CurrentPlantID > 100400 && CurrentPlantID < 100510) { //lv 10
			if (res.locals.UserIndexRecord['build_list'][entry]['level'] < 10) {
				const NewDetail = parseInt(String(CurrentPlantID) + "10");
				res.locals.UserIndexRecord['build_list'][entry]['fort_plant_detail_id'] = NewDetail;
				res.locals.UserIndexRecord['build_list'][entry]['level'] = 10;
				NewFaciList.push(res.locals.UserIndexRecord['build_list'][entry]);
			}
			else { NewFaciList.push(res.locals.UserIndexRecord['build_list'][entry]); }
		}
		else {
			NewFaciList.push(res.locals.UserIndexRecord['build_list'][entry]);
		}
	}
	for (let id in DoubleFacilityID) {
		let FacilityCount = 0;
		const NewDetailID = parseInt(String(DoubleFacilityID[id]) + "10");
		for (let build in res.locals.UserIndexRecord['build_list']) {
			if (res.locals.UserIndexRecord['build_list'][build]['plant_id'] == DoubleFacilityID[id]) {
				FacilityCount += 1;
			}
		}
		while (FacilityCount < 2) {
			LastBuildID += 1
			const Template = {
				"build_id": LastBuildID,
				"fort_plant_detail_id": NewDetailID,
				"position_x": -1,
				"position_z": -1,
				"build_status": 0,
				"build_start_date": 0,
				"build_end_date": 0,
				"level": 10,
				"plant_id": DoubleFacilityID[id],
				"is_new": 0,
				"remain_time": 0,
				"last_income_date": -1
			}
			NewFaciList.push(Template);
			FacilityCount += 1;
		}
	}
	for (let id in DracolithFacilID) {
		if (res.locals.UserIndexRecord['build_list'].findIndex(x => x.plant_id == DracolithFacilID) == -1) {
			LastBuildID += 1;
			const NewDetailID = parseInt(String(DracolithFacilID[id]) + "01");
			const Template = {
				"build_id": LastBuildID,
				"fort_plant_detail_id": NewDetailID,
				"position_x": -1,
				"position_z": -1,
				"build_status": 0,
				"build_start_date": 0,
				"build_end_date": 0,
				"level": 1,
				"plant_id": DracolithFacilID[id],
				"is_new": 0,
				"remain_time": 0,
				"last_income_date": -1
			}
			NewFaciList.push(Template);
		}
	}
	res.locals.UserIndexRecord['build_list'] = NewFaciList;
	const LevelUp = 60 - res.locals.UserIndexRecord['user_data']['level'];
	if (LevelUp > 0) {
		const WyrmiteReward = LevelUp * 50; res.locals.UserIndexRecord['user_data']['crystal'] += WyrmiteReward; 
		res.locals.UserIndexRecord['user_data']['level'] = 60;
		res.locals.UserIndexRecord['user_data']['exp'] = 69990;
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result_state': 1,
		'update_data_list': {
			'user_data': res.locals.UserIndexRecord['user_data'],
			'chara_list': CharacterList,
			'dragon_list': DragonList,
			'unit_story_list': UnitStoryList,
			'dragon_reliability_list': DragonBond,
			'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
			'build_list': res.locals.UserIndexRecord['build_list']
		},
		'entity_result': { 'new_entity_get_list': EntityList }
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/mission/unlock_main_story_group", Android_Version + "/mission/unlock_main_story_group"], errorhandler(async (req, res) => {
	res.locals.UserIndexRecord['user_data']['tutorial_status'] = 60999;
	res.locals.UserIndexRecord['user_data']['tutorial_flag_list'] = IndexTools.TutorialFlagsList;
	res.locals.UserIndexRecord['current_main_story_mission']['main_story_mission_group_id'] = 11
	res.locals.UserIndexRecord['current_main_story_mission']['main_story_mission_state_list'] = [
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
	res.locals.UserIndexRecord['quest_entry_condition_list'] = [
		{ "quest_entry_condition_id": 1 },
		{ "quest_entry_condition_id": 2 },
		{ "quest_entry_condition_id": 3 },
		{ "quest_entry_condition_id": 8 },
		{ "quest_entry_condition_id": 9 },
		{ "quest_entry_condition_id": 10 },
		{ "quest_entry_condition_id": 11 }
	]
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'main_story_mission_list': [], 
		'update_data_list': { 
			'user_data': res.locals.UserIndexRecord['user_data'], 
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
			'quest_entry_condition_list': [
				{
					"quest_entry_condition_id": 1
				},
				{
					"quest_entry_condition_id": 2
				},
				{
					"quest_entry_condition_id": 3
				},
				{
					"quest_entry_condition_id": 8
				},
				{
					"quest_entry_condition_id": 9
				},
				{
					"quest_entry_condition_id": 10
				},
				{
					"quest_entry_condition_id": 11
				}
			]
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/mission/get_mission_list", Android_Version + "/mission/get_mission_list"], errorhandler(async (req,res) => {
	const JSONDict = DataManager.MissionList(res.locals.UserSessionRecord, StaticData.DefaultMissionList);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/mission/get_drill_mission_list", Android_Version + "/mission/get_drill_mission_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'drill_mission_list': [],
		'current_main_story_mission': [],
		'drill_mission_group_list': [],
		'update_data_list': {
			'functional_maintenance_list': []
		},
		'mission_notice': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/mission/unlock_drill_mission_group", Android_Version + "/mission/unlock_drill_mission_group"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'drill_mission_list': [],
		'update_data_list': {
			'functional_maintenance_list': []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/item/get_list", Android_Version + "/item/get_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'item_list': res.locals.UserIndexRecord['material_list'] } }
	let i = 0; while (i < res.locals.UserSessionRecord['EnergyItems'].length) { JSONDict['data']['item_list'].push(res.locals.UserSessionRecord['EnergyItems'][i]); i++; }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/item/use_recovery_stamina", Android_Version + "/item/use_recovery_stamina"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const UseList = MsgPackData['use_item_list'];
	let RecoverType = 0; let RecoverAmount = 0; RecoverIndex = 0; let UpdateItemList = [];
	let i = 0; while (i < UseList.length) {
		ItemCount = UseList[i]['item_quantity'];
		switch(UseList[i]['item_id']) {
			case 100601: RecoverType = 1006; RecoverAmount += 10 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100602: RecoverType = 1006; RecoverAmount += 20 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100603: RecoverType = 1006; RecoverAmount += 30 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100604: RecoverType = 1006; RecoverAmount += 100 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100605: RecoverType = 1006; RecoverAmount += 100 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100606: RecoverType = 1006; RecoverAmount += 100 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100607: RecoverType = 1006; RecoverAmount += 100 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100608: RecoverType = 1006; RecoverAmount += 99 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100609: RecoverType = 1006; RecoverAmount += 100 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100701: RecoverType = 1007; RecoverAmount += 1 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
			case 100702: RecoverType = 1007; RecoverAmount += 6 * ItemCount;
				RecoverIndex = res.locals.UserSessionRecord['EnergyItems'].findIndex(x => x.item_id == UseList[i]['item_id']); 
				res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]['quantity'] -= ItemCount; UpdateItemList.push(res.locals.UserSessionRecord['EnergyItems'][RecoverIndex]); break;
		}
		i++;
	}
	let TypeString = ""; if (RecoverType == 1006) { TypeString = "stamina_single"; } else if (RecoverType == 1007) { TypeString = "stamina_multi"; }
	const NewTotal = res.locals.UserIndexRecord['user_data'][TypeString] + RecoverAmount;
	if (RecoverType == 1006 && NewTotal > 999) { res.locals.UserIndexRecord['user_data'][TypeString] = 999; }
	else if (RecoverType == 1007 && NewTotal > 99) { res.locals.UserIndexRecord['user_data'][TypeString] = 99; }
	else { res.locals.UserIndexRecord['user_data'][TypeString] += RecoverAmount; }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'recover_data': { 'recover_stamina_type': RecoverType, 'recover_stamina_point': RecoverAmount },
		'update_data_list': {
			'user_data': res.locals.UserIndexRecord['user_data'],
			'item_list': UpdateItemList
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/album/index", Android_Version + "/album/index"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'album_dragon_list': res.locals.UserIndexRecord['album_dragon_list'],
		'album_quest_play_record_list': [],
		'chara_honor_list': res.locals.UserSessionRecord['AlbumData']['Medals'],
		'album_passive_update_list': { 'is_update_chara': 0, 'is_update_dragon': 0 } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/shop/get_list", Android_Version + "/shop/get_list"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'is_quest_bonus': 0, 'is_stone_bonus': 0, 'is_stamina_bonus': 0, 'stone_bonus': [], 'stamina_bonus': [], 'quest_bonus': [],
		'material_shop_purchase': [], 'normal_shop_purchase': [], 'special_shop_purchase': [], 'product_lock_list': [],
		'user_item_summon': { 'daily_summon_count': res.locals.UserSessionRecord['SummonRecord']['ItemCount'], 'last_summon_time': LastServerReset },
		'product_list': [], 'infancy_paid_diamond_limit': 0
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/shop/item_summon_odd", Android_Version + "/shop/item_summon_odd"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'item_summon_rate_list': [
			{ 'entity_type': 23, 'entity_id': 0, 'entity_quantity': 10000, 'entity_rate': "0.001%" },
			{ 'entity_type': 17, 'entity_id': 10102, 'entity_quantity': 10, 'entity_rate': "0.005%" },
			{ 'entity_type': 14, 'entity_id': 0, 'entity_quantity': 100000, 'entity_rate': "0.10%" },
			{ 'entity_type': 8, 'entity_id': 125001001, 'entity_quantity': 1, 'entity_rate': "1.00%" },
			{ 'entity_type': 8, 'entity_id': 111002001, 'entity_quantity': 4, 'entity_rate': "1.00%" },
			{ 'entity_type': 8, 'entity_id': 112003001, 'entity_quantity': 1, 'entity_rate': "1.00%" },
			{ 'entity_type': 8, 'entity_id': 114002001, 'entity_quantity': 4, 'entity_rate': "1.00%" },
			{ 'entity_type': 8, 'entity_id': 111001001, 'entity_quantity': 4, 'entity_rate': "5.00%" },
			{ 'entity_type': 8, 'entity_id': 112002001, 'entity_quantity': 1, 'entity_rate': "5.00%" },
			{ 'entity_type': 8, 'entity_id': 114001001, 'entity_quantity': 4, 'entity_rate': "5.00%" },
			{ 'entity_type': 8, 'entity_id': 104003002, 'entity_quantity': 1, 'entity_rate': "5.00%" }
		]
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/shop/item_summon_exec", Android_Version + "/shop/item_summon_exec"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body);
	if (res.locals.UserSessionRecord['SummonRecord']['ItemCount'] == undefined) {res.locals.UserSessionRecord['SummonRecord']['ItemCount'] = 0;}
	let SummonList = [];
	let i = 0; while (i < 10) {
		let DrawData = "";
		if (i > 4) { DrawData = ShopMap.DrawShopItemSpecial(); }
		else { DrawData = ShopMap.DrawShopItem(); }
		SummonList.push(DrawData);
		i++;
	}
	const ParsedData = DataManager.ItemParser(SummonList, res.locals.UserSessionRecord, res.locals.UserIndexRecord, "entity");
	res.locals.UserSessionRecord = ParsedData[0]; res.locals.UserIndexRecord = ParsedData[1];
	let UpdateData = ParsedData[2]; let EntityList = ParsedData[3];
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_item_summon': { 'daily_summon_count': res.locals.UserSessionRecord['SummonRecord']['ItemCount'],
							  'last_summon_time': Math.floor(Date.now() / 1000) },
		'item_summon_reward_list': SummonList,
		'update_data_list': UpdateData
	}}
	res.locals.UserSessionRecord['SummonRecord']['ItemCount'] += 1;
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/ability_crest_trade/get_list", Android_Version + "/ability_crest_trade/get_list"], async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_ability_crest_trade_list': res.locals.UserSessionRecord['CrestTrade'],
		'ability_crest_trade_list': ShopMap.WyrmprintTrade
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/ability_crest_trade/trade", Android_Version + "/ability_crest_trade/trade"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const TradeID = MsgPackData['ability_crest_trade_id'];
	const NewPrintData = WyrmprintMap.CreateWyrmprintFromGift(ShopMap.GetTradePrintID(TradeID));
	res.locals.UserIndexRecord['user_data']['dew_point'] -= ShopMap.GetPrintTradeCost(TradeID);
	res.locals.UserIndexRecord['ability_crest_list'].push(NewPrintData);
	res.locals.UserSessionRecord['CrestTrade'].push({"ability_crest_trade_id": TradeID, "trade_count": 1});
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_ability_crest_trade_list': res.locals.UserSessionRecord['CrestTrade'],
		'ability_crest_trade_list': ShopMap.WyrmprintTrade,
		'update_data_list': {
			'ability_crest_list': [ NewPrintData ],
			'user_data': res.locals.UserIndexRecord['user_data']
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/treasure_trade/get_list_all", Android_Version + "/treasure_trade/get_list_all"], async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_treasure_trade_list': res.locals.UserIndexRecord['user_treasure_trade_list'],
		'treasure_trade_all_list': ShopMap.TreasureTrade,
		'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/treasure_trade/trade", Android_Version + "/treasure_trade/trade"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const TradeID = MsgPackData['treasure_trade_id']; const TradeCount = MsgPackData['trade_count'];
	const FinalizedTrade = ShopMap.TradeTreasure(TradeID, TradeCount, res.locals.UserIndexRecord, res.locals.UserSessionRecord);
	await WriteSessionRecord(FinalizedTrade[2]);
	await WriteIndexRecord(FinalizedTrade[1]);
	const Serialized = msgpack.pack(FinalizedTrade[0]); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/quest/get_support_user_list", Android_Version + "/quest/get_support_user_list"], async (req,res) => {
	const Serialized = msgpack.pack(SupportData); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/quest/get_quest_clear_party", Android_Version + "/quest/get_quest_clear_party"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'quest_clear_party_setting_list': [],
		'lost_unit_list': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/quest/get_quest_clear_party_multi", Android_Version + "/quest/get_quest_clear_party_multi"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'quest_clear_party_setting_list': [],
		'lost_unit_list': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/quest/drop_list", Android_Version + "/quest/drop_list"], async (req,res) => {
	var JSONDict = {
		'data_headers': { 'result_code': 1 }, 'data': { 'quest_drop_info': { 'drop_info_list': [], 'host_drop_info_list': [], 'fever_drop_info_list': [], 'quest_bonus_info_list': [], 'quest_reborn_bonus_info_list': [], 'campaign_extra_reward_info_list': [] }, 'update_data_list': { 'functional_maintenance_list': [] }  }
	}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/quest/set_quest_clear_party", Android_Version + "/quest/set_quest_clear_party"], errorhandler(async (req,res) => {
	let JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/dungeon_start/start", Android_Version + "/dungeon_start/start"], errorhandler(async (req,res) => {
	const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const DungeonKey = crypto.randomBytes(16).toString("hex");
	const MsgPackData = msgpack.unpack(req.body); const QuestID = MsgPackData['quest_id']; if (typeof QuestID === 'string') { res.end(); return; }
	const PartyNo_List = MsgPackData['party_no_list'];
	if (MsgPackData['repeat_setting'] != null) {
		res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = MsgPackData['repeat_setting'];
	} else if (MsgPackData['repeat_state'] != 1) { res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = {}; }
	const SupportViewerID = MsgPackData['support_viewer_id']; let SupportSessionRecord = {}; let SupportIndexRecord = {};
	let PartyNumberList = []; let PartyListData = [];
	PartyListData = DataManager.PopulateUnitData(PartyNo_List, ViewerID, res.locals.UserIndexRecord, res.locals.UserSessionRecord, QuestID);
	let AreaInfo = QuestMap.GetQuestInfo(QuestID, "area_info");
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedTeam'] == 1) { PartyListData[0]['party_unit_list'] = res.locals.UserSessionRecord['DungeonRecord']['FixedTeamData']; }
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedArea'] == 1) { AreaInfo = res.locals.UserSessionRecord['DungeonRecord']['FixedAreaData']; }
	res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'] = QuestID;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] = 0;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPlayType'] = 1;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'] = Math.floor(Date.now() / 1000);
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyNumber'] = PartyNumberList;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][1] = [];
	res.locals.UserSessionRecord['DungeonRecord']['DropTable'] = QuestMap.GetQuestDrops(QuestID);
	if (SupportViewerID != 0) {
		SupportSessionRecord = JSON.parse(fs.readFileSync('./Library/support/help_' + SupportViewerID));
		SupportIndexRecord = JSON.parse(fs.readFileSync('./Library/support/save_' + SupportViewerID));
		res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'].push({'viewer_id': SupportViewerID, 'get_mana_point': 25, 'is_friend': 1, 'apply_send_status': 0});
		res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = DataManager.PopulateSupportData(SupportSessionRecord, SupportIndexRecord);
		PartyListData[0]['support_data'] = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0]; }
	let ReviveLimit = QuestMap.GetQuestInfo(QuestID, "revives"); if (ReviveLimit == undefined) { ReviveLimit = 0; }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'ingame_data': {
			'viewer_id': ViewerID, 'dungeon_key': DungeonKey,
			'dungeon_type': QuestMap.GetQuestInfo(QuestID, "type"),
		   	'play_type': 1, 'quest_id': QuestID, 'is_host': 1,
		   	'continue_limit': QuestMap.GetQuestInfo(QuestID, "continues"),
		   	'reborn_limit': ReviveLimit,
		   	'start_time': Math.floor(Date.now() / 1000),
		   	'party_info': PartyListData[0], 'area_info_list': AreaInfo,
			'use_stone': 50, 'is_fever_time': 0, 'repeat_state': MsgPackData['repeat_state'],
		   	'is_use_event_chara_ability': 0, 'event_ability_chara_list': [],
		   	'is_bot_tutorial': 0, 'is_receivable_carry_bonus': 0,
			'first_clear_viewer_id_list': [], 'multi_disconnect_type': 0,
		},
		'ingame_quest_data': DataManager.GetPlayerQuestDataShort(QuestID, res.locals.UserIndexRecord),
		'odds_info': QuestMap.GenerateOddsList(QuestID, res.locals.UserSessionRecord, res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep']),
		'update_data_list': {
			'quest_list': DataManager.GetPlayerQuestData(QuestID, res.locals.UserIndexRecord)
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dungeon_start/start_assign_unit", Android_Version + "/dungeon_start/start_assign_unit"], errorhandler(async (req,res) => {
	const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const DungeonKey = crypto.randomBytes(16).toString("hex");
	const MsgPackData = msgpack.unpack(req.body); const QuestID = MsgPackData['quest_id']; if (typeof QuestID === 'string') { res.end(); }
	const PartyList = MsgPackData['request_party_setting_list'];
	if (MsgPackData['repeat_setting'] != null) {
		res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = MsgPackData['repeat_setting'];
	} else if (MsgPackData['repeat_state'] != 1) { res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = {}; }
	const SupportViewerID = MsgPackData['support_viewer_id']; let SupportSessionRecord = {}; let SupportIndexRecord = {};
	let PartyListData = []; let DungeonTypeID = 1; if (PartyList.length > 4) { DungeonTypeID = 15; }
	PartyListData = DataManager.PopulateAssignedUnitData(PartyList, ViewerID, res.locals.UserIndexRecord, res.locals.UserSessionRecord, QuestID);
	let AreaInfo = QuestMap.GetQuestInfo(QuestID, "area_info");
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedTeam'] == 1) { PartyListData[0]['party_unit_list'] = res.locals.UserSessionRecord['DungeonRecord']['FixedTeamData']; }
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedArea'] == 1) { AreaInfo = res.locals.UserSessionRecord['DungeonRecord']['FixedAreaData']; }
	res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'] = QuestID;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] = 0;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPlayType'] = 1;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'] = Math.floor(Date.now() / 1000);
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][1] = [];
	res.locals.UserSessionRecord['DungeonRecord']['DropTable'] = QuestMap.GetQuestDrops(QuestID);
	if (SupportViewerID != 0) {
		SupportSessionRecord = JSON.parse(fs.readFileSync('./Library/support/help_' + SupportViewerID));
		SupportIndexRecord = JSON.parse(fs.readFileSync('./Library/support/save_' + SupportViewerID));
		res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'].push({'viewer_id': SupportViewerID, 'get_mana_point': 25, 'is_friend': 1, 'apply_send_status': 0});
		res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = DataManager.PopulateSupportData(SupportSessionRecord, SupportIndexRecord);
		PartyListData[0]['support_data'] = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0]; }
	let ReviveLimit = QuestMap.GetQuestInfo(QuestID, "revives"); if (ReviveLimit == undefined) { ReviveLimit = 0; }
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'ingame_data': {
			'viewer_id': ViewerID, 'dungeon_key': DungeonKey, 'dungeon_type': DungeonTypeID,
		   	'play_type': 1, 'quest_id': QuestID, 'is_host': 1,
		   	'continue_limit': QuestMap.GetQuestInfo(QuestID, "continues"),
		   	'reborn_limit': ReviveLimit,
		   	'start_time': Math.floor(Date.now() / 1000),
		   	'party_info': PartyListData[0], 'area_info_list': AreaInfo,
			'use_stone': 50, 'is_fever_time': 0, 'repeat_state': MsgPackData['repeat_state'],
		   	'is_use_event_chara_ability': 0, 'event_ability_chara_list': [],
		   	'is_bot_tutorial': 0, 'is_receivable_carry_bonus': 0,
			'first_clear_viewer_id_list': [], 'multi_disconnect_type': 0,
		},
		'ingame_quest_data': DataManager.GetPlayerQuestDataShort(QuestID, res.locals.UserIndexRecord),
		'odds_info': QuestMap.GenerateOddsList(QuestID, res.locals.UserSessionRecord, res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep']),
		'update_data_list': {
			'quest_list': DataManager.GetPlayerQuestData(QuestID, res.locals.UserIndexRecord)
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dungeon_record/record", Android_Version + "/dungeon_record/record"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const PlayData = MsgPackData['play_record'];
	const DungeonKey = MsgPackData['dungeon_key'];
	let ResultData = DataManager.DungeonRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, DungeonKey, PlayData);
	JSONDict = ResultData[0];
	res.locals.UserIndexRecord = ResultData[1];
	res.locals.UserSessionRecord = ResultData[2];
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dungeon/get_area_odds", Android_Version + "/dungeon/get_area_odds"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const DungeonKey = MsgPackData['dungeon_key'];
	let QuestID = res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] += 1;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'odds_info': QuestMap.GenerateOddsList(QuestID, res.locals.UserSessionRecord, res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'])
		}
	}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dungeon/fail", Android_Version + "/dungeon/fail"], errorhandler(async (req,res) => {
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = 0;
	// request sends dungeon_key
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'fail_helper_list': res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][1],
		'fail_helper_detail_list': res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'],
		'fail_quest_detail': {
			'quest_id': res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'],
			'wall_id': 0,
			'wall_level': 0,
			'is_host': res.locals.UserSessionRecord['DungeonRecord']['LastDungeonIsHost']
		},
		'update_data_list': { 'functional_maintenance_list': [] }
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dungeon/retry", Android_Version + "/dungeon/retry"], async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'continue_count': 1
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/dungeon_skip/start", Android_Version + "/dungeon_skip/start"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const QuestID = MsgPackData['quest_id']; const PartyNo = [MsgPackData['party_no']];
	const PlayCount = MsgPackData['play_count']; const DungeonKey = crypto.randomBytes(16).toString("hex");
	let PartyListData = []; let DungeonTypeID = 1; if (PartyNo.length > 1) { DungeonTypeID = 15; }
	PartyListData = DataManager.PopulateUnitData(PartyNo, ViewerID, res.locals.UserIndexRecord);
	res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'] = QuestID;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] = 0;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'] = Math.floor(Date.now() / 1000);
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = [];
	const ResultData = DataManager.DungeonSkipRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, DungeonKey, PlayCount);
	JSONDict = ResultData[0];
	res.locals.UserIndexRecord = ResultData[1];
	res.locals.UserSessionRecord = ResultData[2];
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dungeon_skip/start_assign_unit", Android_Version + "/dungeon_skip/start_assign_unit"], errorhandler(async (req,res) => {
	const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const DungeonKey = crypto.randomBytes(16).toString("hex");
	const MsgPackData = msgpack.unpack(req.body); const QuestID = MsgPackData['quest_id']; if (typeof QuestID === 'string') { res.end(); }
	const PartyList = MsgPackData['request_party_setting_list']; const PlayCount = MsgPackData['play_count'];
	const RepeatState = MsgPackData['repeat_state']; const RepeatSettings = MsgPackData['repeat_setting'];
	const SupportViewerID = MsgPackData['support_viewer_id']; let SupportSessionRecord = {}; let SupportIndexRecord = {};
	let PartyListData = []; let DungeonTypeID = 1; if (PartyList.length > 4) { DungeonTypeID = 15; }
	PartyListData = DataManager.PopulateAssignedUnitData(PartyList, ViewerID, res.locals.UserIndexRecord);
	res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'] = QuestID;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] = 0;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'] = Math.floor(Date.now() / 1000);
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = [];
	const ResultData = DataManager.DungeonSkipRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, DungeonKey, PlayCount);
	JSONDict = ResultData[0];
	res.locals.UserIndexRecord = ResultData[1];
	res.locals.UserSessionRecord = ResultData[2];
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/repeat/end", Android_Version + "/repeat/end"], errorhandler(async (req, res) => {
	const DungeonKey = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'];
	res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = {};
	res.locals.UserSessionRecord['DungeonRecord']['RepeatCount'] = 0;
	const ResultData = DataManager.DungeonRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, DungeonKey);
	JSONDict = ResultData[0];
	res.locals.UserIndexRecord = JSONDict[1];
	res.locals.UserSessionRecord = JSONDict[2];
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/wall/get_wall_clear_party", Android_Version + "/wall/get_wall_clear_party"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const QuestID = MsgPackData['wall_id'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'wall_clear_party_setting_list': [],
		'lost_unit_list': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/wall/set_wall_clear_party", Android_Version + "/wall/set_wall_clear_party"], errorhandler(async (req,res) => {
	// const MsgPackData = msgpack.unpack(req.body); # This is the wall id and party data to be set
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/wall_start/start", Android_Version + "/wall_start/start"], errorhandler(async (req,res) => {
	const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const DungeonKey = crypto.randomBytes(16).toString("hex");
	const MsgPackData = msgpack.unpack(req.body); const WallID = MsgPackData['wall_id']; if (typeof WallID === 'string') { res.end(); return; }
	const WallLevel = MsgPackData['wall_level']; const PartyNo = MsgPackData['party_no'];
	const RepeatState = MsgPackData['repeat_state']; const RepeatSettings = MsgPackData['repeat_setting'];
	const SupportViewerID = MsgPackData['support_viewer_id']; let SupportSessionRecord = {}; let SupportIndexRecord = {};
	let PartyListData = []; let DungeonTypeID = 1;
	PartyListData = DataManager.PopulateUnitData([PartyNo], ViewerID, res.locals.UserIndexRecord);
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedTeam'] == 1) { 
		PartyListData[0]['party_unit_list'] = res.locals.UserSessionRecord['DungeonRecord']['FixedTeamData']; }
	res.locals.UserSessionRecord['Wall']['DungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['Wall']['LastID'] = WallID;
	res.locals.UserSessionRecord['Wall']['LastPartyNumber'] = [PartyNo];
	res.locals.UserSessionRecord['Wall']['LastPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['Wall']['LastPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['Wall']['LastLevel'] = MsgPackData['wall_level'];
	res.locals.UserSessionRecord['Wall']['RewardList'] = DataManager.GetWallDrop();
	res.locals.UserSessionRecord['Wall']['LastSupportPlayer'] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][1] = [];
	if (SupportViewerID != 0) {
		SupportSessionRecord = JSON.parse(fs.readFileSync('./Library/support/help_' + SupportViewerID));
		SupportIndexRecord = JSON.parse(fs.readFileSync('./Library/support/save_' + SupportViewerID));
		res.locals.UserSessionRecord['Wall']['LastSupportPlayer'].push({'viewer_id': SupportViewerID, 'get_mana_point': 25, 'is_friend': 1, 'apply_send_status': 0});
		res.locals.UserSessionRecord['Wall']['LastSupportCharacter'] = DataManager.PopulateSupportData(SupportSessionRecord, SupportIndexRecord); 
		PartyListData[0]['support_data'] = res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][0]; }
	let SceneVar = 0; let ElementNumber = 0;
	switch(WallID) {
		case 216010001: SceneVar = 0; ElementNumber = 1; break;
		case 216010002: SceneVar = 1; ElementNumber = 2; break;
		case 216010003: SceneVar = 2; ElementNumber = 3; break;
		case 216010004: SceneVar = 3; ElementNumber = 4; break;
		case 216010005: SceneVar = 4; ElementNumber = 5; break;
	}
	const SceneData = "Boss/BG034_5001_00/BG034_5001_00_0" + SceneVar;
	const AreaData = "WALL_01_010" + ElementNumber + "_01";
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'ingame_data': {
			'viewer_id': ViewerID,
		   	'dungeon_key': DungeonKey,
		   	'dungeon_type': DungeonTypeID,
		   	'play_type': 1,
		   	'is_host': 1,
		   	'continue_limit': -1,
		   	'reborn_limit': 0,
		   	'start_time': Math.floor(Date.now() / 1000),
		   	'party_info': PartyListData[0],
			'area_info_list': [ { 'scene_path': SceneData, 'area_name': AreaData } ],
			'use_stone': -1,
			'is_fever_time': 0,
		   	'repeat_state': 0,
		   	'is_bot_tutorial': 0,
		   	'is_receivable_carry_bonus': 0,
			'first_clear_viewer_id_list': [],
			'multi_disconnect_type': 0
		},
		'ingame_wall_data': { 'wall_id': WallID, 'wall_level': WallLevel },
		'odds_info': res.locals.UserSessionRecord['Wall']['RewardList']
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/wall_start/start_assign_unit", Android_Version + "/wall_start/start_assign_unit"], errorhandler(async (req,res) => {
	const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const DungeonKey = crypto.randomBytes(16).toString("hex");
	const MsgPackData = msgpack.unpack(req.body); const WallID = MsgPackData['wall_id']; if (typeof WallID === 'string') { res.end(); return; }
	const WallLevel = MsgPackData['wall_level']; const PartyList = MsgPackData['request_party_setting_list'];
	const RepeatState = MsgPackData['repeat_state']; const RepeatSettings = MsgPackData['repeat_setting'];
	const SupportViewerID = MsgPackData['support_viewer_id']; let SupportSessionRecord = {}; let SupportIndexRecord = {};
	let PartyNumberList = []; let PartyListData = []; let DungeonTypeID = 1;
	PartyListData = DataManager.PopulateAssignedUnitData(PartyList, ViewerID, res.locals.UserIndexRecord);
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedTeam'] == 1) { 
		PartyListData[0]['party_unit_list'] = res.locals.UserSessionRecord['DungeonRecord']['FixedTeamData']; }
	res.locals.UserSessionRecord['Wall']['DungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['Wall']['LastID'] = WallID;
	res.locals.UserSessionRecord['Wall']['LastPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['Wall']['LastPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['Wall']['LastLevel'] = MsgPackData['wall_level'];
	res.locals.UserSessionRecord['Wall']['RewardList'] = DataManager.GetWallDrop();
	res.locals.UserSessionRecord['Wall']['LastSupportPlayer'] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][1] = [];
	if (SupportViewerID != 0) {
		SupportSessionRecord = JSON.parse(fs.readFileSync('./Library/support/help_' + SupportViewerID));
		SupportIndexRecord = JSON.parse(fs.readFileSync('./Library/support/save_' + SupportViewerID));
		res.locals.UserSessionRecord['Wall']['LastSupportPlayer'].push({'viewer_id': SupportViewerID, 'get_mana_point': 25, 'is_friend': 1, 'apply_send_status': 0});
		res.locals.UserSessionRecord['Wall']['LastSupportCharacter'] = DataManager.PopulateSupportData(SupportSessionRecord, SupportIndexRecord); 
		PartyListData[0]['support_data'] = res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][0]; }
	let SceneVar = 0; let ElementNumber = 0;
	switch(WallID) {
		case 216010001: SceneVar = 0; ElementNumber = 1; break;
		case 216010002: SceneVar = 1; ElementNumber = 2; break;
		case 216010003: SceneVar = 2; ElementNumber = 3; break;
		case 216010004: SceneVar = 3; ElementNumber = 4; break;
		case 216010005: SceneVar = 4; ElementNumber = 5; break;
	}
	const SceneData = "Boss/BG034_5001_00/BG034_5001_00_0" + SceneVar;
	const AreaData = "WALL_01_010" + ElementNumber + "_01";
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'ingame_data': {
			'viewer_id': ViewerID,
		   	'dungeon_key': DungeonKey,
		   	'dungeon_type': DungeonTypeID,
		   	'play_type': 1,
		   	'is_host': 1,
		   	'continue_limit': -1,
		   	'reborn_limit': 0,
		   	'start_time': Math.floor(Date.now() / 1000),
		   	'party_info': PartyListData[0],
			'area_info_list': [ { 'scene_path': SceneData, 'area_name': AreaData } ],
			'use_stone': -1,
			'is_fever_time': 0,
		   	'repeat_state': 0,
		   	'is_bot_tutorial': 0,
		   	'is_receivable_carry_bonus': 0,
			'first_clear_viewer_id_list': [],
			'multi_disconnect_type': 0
		},
		'ingame_wall_data': { 'wall_id': WallID, 'wall_level': WallLevel },
		'odds_info': res.locals.UserSessionRecord['Wall']['RewardList']
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/wall_record/record", Android_Version + "/wall_record/record"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const WallID = MsgPackData['wall_id']
	const ResultData = DataManager.WallRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, WallID);
	const JSONDict = ResultData[0];
	res.locals.UserIndexRecord = ResultData[1];
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/wall/fail", Android_Version + "/wall/fail"], errorhandler(async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'fail_helper_list': res.locals.UserSessionRecord['Wall']['LastSupportPlayer'],
		'fail_helper_detail_list': res.locals.UserSessionRecord['Wall']['LastSupportCharacter'],
		'fail_quest_detail': {
			'quest_id': 0,
			'wall_id': res.locals.UserSessionRecord['Wall']['LastID'],
			'wall_level': res.locals.UserSessionRecord['Wall']['LastLevel'],
			'is_host': 1
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/dmode/entry", Android_Version + "/dmode/entry"], errorhandler(async (req,res) => {
	res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo'] = {
		"total_max_floor_num": 0,
		"recovery_count": 0,
		"recovery_time": 0,
		"floor_skip_count": 0,
		"floor_skip_time": 0,
		"dmode_point_1": 0,
		"dmode_point_2": 0,
		"is_entry": 1
	}
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo'] = {
		"chara_id": 0,
		"floor_num": 0,
		"quest_time": 0,
		"dungeon_score": 0,
		"is_play_end": 0,
		"state": 1
	}
	res.locals.UserSessionRecord['Kaleidoscape']['Passive'] = [
		{ "passive_no": 1, "passive_level": 0 },
		{ "passive_no": 2, "passive_level": 0 },
		{ "passive_no": 3, "passive_level": 0 },
		{ "passive_no": 4, "passive_level": 0 },
		{ "passive_no": 5, "passive_level": 0 },
		{ "passive_no": 6, "passive_level": 0 },
		{ "passive_no": 7, "passive_level": 0 },
		{ "passive_no": 8, "passive_level": 0 },
		{ "passive_no": 9, "passive_level": 0 },
		{ "passive_no": 10, "passive_level": 0 },
		{ "passive_no": 11, "passive_level": 0 },
		{ "passive_no": 12, "passive_level": 0 },
		{ "passive_no": 13, "passive_level": 0 },
		{ "passive_no": 14, "passive_level": 0 },
		{ "passive_no": 15, "passive_level": 0 },
		{ "passive_no": 16, "passive_level": 0 },
		{ "passive_no": 17, "passive_level": 0 }
	]
	
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo'],
		'dmode_chara_list': [],
		'dmode_servitor_passive_list': res.locals.UserSessionRecord['Kaleidoscape']['Passive'],
		'dmode_dungeon_info': res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo'],
		'update_data_list': {}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode/get_data", Android_Version + "/dmode/get_data"], errorhandler(async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo'],
		'dmode_chara_list': res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'],
		'dmode_servitor_passive_list': res.locals.UserSessionRecord['Kaleidoscape']['Passive'],
		'dmode_dungeon_info': res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo'],
		'dmode_story_list': res.locals.UserSessionRecord['Kaleidoscape']['StoryList'],
		'dmode_expedition': res.locals.UserSessionRecord['Kaleidoscape']['Expedition'],
		'update_data_list': {},
		'current_server_time': Math.floor(Date.now() / 1000)
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode/read_story", Android_Version + "/dmode/read_story"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); StoryID = MsgPackData['dmode_story_id'];
	const UpdateData = { 'dmode_story_id': StoryID, 'is_read': 1 };
	var JSONDict = {};
	const StoryIndex = res.locals.UserSessionRecord['Kaleidoscape']['StoryList'].findIndex(x => x.dmode_story_id == StoryID);
	if (StoryIndex == -1) {
		res.locals.UserIndexRecord['user_data']['crystal'] += 25;
		res.locals.UserSessionRecord['Kaleidoscape']['StoryList'].push(UpdateData);
		await WriteSessionRecord(res.locals.UserSessionRecord);
		await WriteIndexRecord(res.locals.UserIndexRecord);
		JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
			'dmode_story_reward_list': [ { 'entity_type': 23, 'entity_id': 0, 'entity_quantity': 25 } ],
			'update_data_list': { 'dmode_story_list': [ UpdateData ], 'user_data': res.locals.UserIndexRecord['user_data'] }
		}}
	}
	else { JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': { 'functional_maintenance_list': [] } } }; }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode/expedition_start", Android_Version + "/dmode/expedition_start"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	res.locals.UserSessionRecord['Kaleidoscape']['Expedition'] = {
		'chara_id_1': MsgPackData['chara_id_list'][0],
		'chara_id_2': MsgPackData['chara_id_list'][1],
		'chara_id_3': MsgPackData['chara_id_list'][2],
		'chara_id_4': MsgPackData['chara_id_list'][3],
		'start_time': Math.floor(Date.now() / 1000),
		'target_floor_num': MsgPackData['target_floor_num'],
		'state': 2
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_expedition': res.locals.UserSessionRecord['Kaleidoscape']['Expedition']
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode/expedition_finish", Android_Version + "/dmode/expedition_finish"], errorhandler(async (req,res) => {
	const DuskAmber = DModeMap.ExpeditionDuskAmber(res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['target_floor_num']);
	const DawnAmber = DModeMap.ExpeditionDawnAmber(res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['target_floor_num']);
	const Talismans = DModeMap.CreateExpeditionTalismans(res.locals.UserSessionRecord, res.locals.UserIndexRecord);
	
	res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['state'] = 1;
	res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']['dmode_point_1'] += DuskAmber;
	res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']['dmode_point_2'] += DawnAmber;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_ingame_result': { 
			'floor_num': res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['target_floor_num'],
			'is_record_floor_num': 0,
			'chara_id_list': [ res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_1'],
							   res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_2'],
							   res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_3'],
							   res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_4'] ],
			'reward_talisman_list': Talismans[0],
			'take_dmode_point_1': DuskAmber,
			'take_dmode_point_2': DawnAmber,
			'take_player_exp': 0,
			'player_level_up_fstone': 0,
			'quest_time': 0,
			'is_view_quest_time': 0,
			'dmode_score': 0,
			'clear_state': 0
		},
		'dmode_expedition': res.locals.UserSessionRecord['Kaleidoscape']['Expedition'],
		'update_data_list': { 'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo'], 'talisman_list': Talismans[1] }
	}}
	await WriteSessionRecord(Talismans[2]);
	await WriteIndexRecord(Talismans[3]);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode/expedition_force_finish", Android_Version + "/dmode/expedition_force_finish"], errorhandler(async (req,res) => {
	const DuskAmber = 0;
	const DawnAmber = 0;
	const Talismans = [];
	res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['state'] = 1;
	res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']['dmode_point_1'] += DuskAmber;
	res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']['dmode_point_2'] += DawnAmber;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_ingame_result': { 
			'floor_num': res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['target_floor_num'],
			'is_record_floor_num': 0,
			'chara_id_list': [ res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_1'],
							   res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_2'],
							   res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_3'],
							   res.locals.UserSessionRecord['Kaleidoscape']['Expedition']['chara_id_4'] ],
			'reward_talisman_list': Talismans,
			'take_dmode_point_1': DuskAmber,
			'take_dmode_point_2': DawnAmber,
			'take_player_exp': 0,
			'player_level_up_fstone': 0,
			'quest_time': 0,
			'is_view_quest_time': 0,
			'dmode_score': 0,
			'clear_state': 0
		},
		'dmode_expedition': res.locals.UserSessionRecord['Kaleidoscape']['Expedition'],
		'update_data_list': { 'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo'] }
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode_dungeon/start", Android_Version + "/dmode_dungeon/start"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id'];
	const StartFloor = MsgPackData['start_floor_num']; const ServitorID = MsgPackData['servitor_id'];
	const SkillList = MsgPackData['bring_edit_skill_chara_id_list'];
	const DModeKey = String((Math.random() * 2).toFixed(15)).slice(2, 13) + "_" + Math.floor(Date.now() / 1000);
	res.locals.UserSessionRecord['Kaleidoscape']['IsStart'] = true;
	res.locals.UserSessionRecord['Kaleidoscape']['IsRestart'] = false;
	res.locals.UserSessionRecord['Kaleidoscape']['Complete'] = false;
	res.locals.UserSessionRecord['Kaleidoscape']['FloorNumber'] = StartFloor;
	res.locals.UserSessionRecord['Kaleidoscape']['UniqueKey'] = DModeKey;
	res.locals.UserSessionRecord['Kaleidoscape']['UnitInfo'] = {
		'level': 1,
		'exp': 0,
		'dmode_hold_dragon_list': [],
		'equip_crest_item_no_sort_list': [0, 0, 0],
		'bag_item_no_sort_list': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		'skill_bag_item_no_sort_list': [0, 0, 0, 0, 0, 0, 0, 0],
		'take_dmode_point_1': 0,
		'take_dmode_point_2': 0
	}
	res.locals.UserSessionRecord['Kaleidoscape']['ItemTracker'] = 0;
	res.locals.UserSessionRecord['Kaleidoscape']['ItemList'] = [];
	for (let s in SkillList) {
		res.locals.UserSessionRecord['Kaleidoscape']['ItemTracker'] += 1;
		let NewSkillID = parseInt(String(SkillList[s]) + CharacterMap.GetCharacterInfo(SkillList[s], "shared_skill_number"));
		if (SkillList[s] == 10350304 || SkillList[s] == 10950503 || SkillList[s] == 10550204) { NewSkillID = parseInt(String(SkillList[s]) + "2"); }
		else if (SkillList[s] == 10250104 || SkillList[s] == 10750104 || SkillList[s] == 10350303) { NewSkillID = parseInt(String(SkillList[s]) + "3"); }
		else if (SkillList[s] == 10250503 || SkillList[s] == 10250504 || SkillList[s] == 10550205 || SkillList[s] == 10750102) { NewSkillID = parseInt(String(SkillList[s]) + "4"); }
		else if (SkillList[s] == 10250203 || SkillList[s] == 10350405 || SkillList[s] == 10850203 || SkillList[s] == 10350505 || SkillList[s] == 10950303) { NewSkillID = parseInt(String(SkillList[s]) + "5"); }
		else if (SkillList[s] == 10450104) { NewSkillID = parseInt(String(SkillList[s]) + "7"); }
		const SkillBase = {
			"item_no": res.locals.UserSessionRecord['Kaleidoscape']['ItemTracker'],
			"item_id": NewSkillID,
			"item_state": 14,
			'option': []
		}
		res.locals.UserSessionRecord['Kaleidoscape']['ItemList'].push(SkillBase);
		res.locals.UserSessionRecord['Kaleidoscape']['UnitInfo']['skill_bag_item_no_sort_list'][s] = res.locals.UserSessionRecord['Kaleidoscape']['ItemTracker'];
	}
	const CharacterListIndex = res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'].findIndex(x => x.chara_id == CharacterID);
	if (CharacterListIndex == -1) { res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'].push({
		"chara_id": CharacterID,
		"max_floor_num": 0,
		"select_servitor_id": ServitorID,
		"select_edit_skill_chara_id_1": SkillList[0],
		"select_edit_skill_chara_id_2": SkillList[1],
		"select_edit_skill_chara_id_3": 0,
		"max_dmode_score": 0
    }); }
	else {
		res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'][CharacterListIndex]['select_servitor_id'] = ServitorID;
		res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'][CharacterListIndex]['select_edit_skill_chara_id_1'] = SkillList[0];
		res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'][CharacterListIndex]['select_edit_skill_chara_id_2'] = SkillList[1];
	}
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo'] = {
		"chara_id": CharacterID,
		"floor_num": 0,
		"quest_time": 0,
		"dungeon_score": 0,
		"is_play_end": 0,
		"state": 2
    }
	res.locals.UserSessionRecord['Kaleidoscape']['Agito'] = Math.floor(Math.random() * 4);
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_dungeon_state': 2,
		'dmode_ingame_data': {
			'recovery_count': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']['recovery_count'],
			'recovery_time': LastServerReset,
			'unique_key': DModeKey,
			'start_floor_num': StartFloor,
			'target_floor_num': 60,
			'dmode_level_group_id': 1,
			'unit_data': CharacterMap.KaleidoStats(CharacterID),
			'servitor_id': ServitorID,
			'dmode_servitor_passive_list': res.locals.UserSessionRecord['Kaleidoscape']['Passive']
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode_dungeon/floor", Android_Version + "/dmode_dungeon/floor"], errorhandler(async (req,res) => {
	res.locals.UserSessionRecord['Kaleidoscape']['FloorKey'] = crypto.randomBytes(20).toString("hex");
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['state'] = 5;
	const AreaInfo = DModeMap.GenerateKaleidoData(res.locals.UserSessionRecord, msgpack.unpack(req.body)['dmode_play_record']);
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_dungeon_state': 5,
		'dmode_floor_data': AreaInfo[0]
	}}
	await WriteSessionRecord(AreaInfo[1]);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode_dungeon/floor_skip", Android_Version + "/dmode_dungeon/floor_skip"], errorhandler(async (req, res) => {
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['state'] = 4;
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_dungeon_state': 4,
		'update_data_list': {
			'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode_dungeon/restart", Android_Version + "/dmode_dungeon/restart"], errorhandler(async (req,res) => {
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['state'] = 7;
	const CharacterListIndex = res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'].findIndex(x => x.chara_id == res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['chara_id']);
	const Servitor = res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'][CharacterListIndex]['select_servitor_id'];
	res.locals.UserSessionRecord['Kaleidoscape']['IsRestart'] = true;
	res.locals.UserSessionRecord['Kaleidoscape']['FloorNumber'] = res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['floor_num'];
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_dungeon_state': 7,
		'dmode_dungeon_info': res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo'],
		'dmode_ingame_data': {
			'recovery_count': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']['recovery_count'],
			'recovery_time': LastServerReset,
			'unique_key': res.locals.UserSessionRecord['Kaleidoscape']['UniqueKey'],
			'start_floor_num': res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['floor_num'],
			'target_floor_num': 60,
			'dmode_level_group_id': 1,
			'unit_data': CharacterMap.KaleidoStats(res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['chara_id']),
			'servitor_id': Servitor,
			'dmode_servitor_passive_list': res.locals.UserSessionRecord['Kaleidoscape']['Passive']
		},
		'update_data_list': {
			'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode_dungeon/finish", Android_Version + "/dmode_dungeon/finish"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	let Floor = res.locals.UserSessionRecord['Kaleidoscape']['FloorNumber'];
	if (res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['state'] == 6) { Floor -= 1;}
	else if (res.locals.UserSessionRecord['Kaleidoscape']['Complete'] != true) { Floor -= 2; }
	const CharacterID = res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['chara_id'];
	const CharacterListIndex = res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'].findIndex(x=>x.chara_id == CharacterID);
	let IsBest = 0;
	if (CharacterListIndex == -1) { res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'].push({
		"chara_id": CharacterID,
		"max_floor_num": 0,
		"select_servitor_id": 1,
		"select_edit_skill_chara_id_1": 10440102,
		"select_edit_skill_chara_id_2": 10850502,
		"select_edit_skill_chara_id_3": 0,
		"max_dmode_score": 0
    }); }
	if (res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['floor_num'] > res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'][CharacterListIndex]['max_floor_num']) {
		IsBest = 1;
		res.locals.UserSessionRecord['Kaleidoscape']['CharacterList'][CharacterListIndex]['max_floor_num'] = Floor;
	}
	const DModePoint = DModeMap.GetAmber(Floor);
	let TalismanData = DModeMap.CreateTalismans(Floor, res.locals.UserSessionRecord, res.locals.UserIndexRecord);
	if (Floor > res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']['total_max_floor_num']) {
		TalismanData[2]['Kaleidoscape']['DmodeInfo']['total_max_floor_num'] = Floor;
	}
	TalismanData[2]['Kaleidoscape']['DmodeInfo']['dmode_point_1'] += DModePoint[0] + res.locals.UserSessionRecord['Kaleidoscape']['UnitInfo']['take_dmode_point_1'];
	TalismanData[2]['Kaleidoscape']['DmodeInfo']['dmode_point_2'] += DModePoint[1] + res.locals.UserSessionRecord['Kaleidoscape']['UnitInfo']['take_dmode_point_2'];
	
	TalismanData[2]['Kaleidoscape']['DungeonInfo'] = {
		'chara_id': CharacterID,
		'floor_num': 0,
		'quest_time': 0,
		'dungeon_score': 0,
		'is_play_end': 0,
		'state': 1
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 
		'dmode_dungeon_state': 1,
		'dmode_ingame_result': {
			'floor_num': Floor,
			'is_record_floor_num': IsBest,
			'chara_id_list': [ CharacterID ],
			'reward_talisman_list': TalismanData[1],
			'take_dmode_point_1': DModePoint[0],
			'take_dmode_point_2': DModePoint[1],
			'take_player_exp': 0,
			'player_level_up_fstone': 0,
			'quest_time': res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['quest_time'],
			'is_view_quest_time': 0,
			'dmode_score': 0,
			'clear_state': 1
		},
		'dmode_dungeon_info': TalismanData[2]['Kaleidoscape']['DungeonInfo'],
		'update_data_list': {
			'dmode_info': TalismanData[2]['Kaleidoscape']['DmodeInfo'],
			'talisman_list': TalismanData[0]
		}
	}}
	
	await WriteSessionRecord(TalismanData[2]);
	await WriteIndexRecord(TalismanData[3]);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode_dungeon/user_halt", Android_Version + "/dmode_dungeon/user_halt"], errorhandler(async (req, res) => {
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['state'] = 6;
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['floor_num'] = res.locals.UserSessionRecord['Kaleidoscape']['FloorNumber'];
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_dungeon_state': 6,
		'dmode_dungeon_info': res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode_dungeon/system_halt", Android_Version + "/dmode_dungeon/system_halt"], errorhandler(async (req, res) => {
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['state'] = 6;
	res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']['floor_num'] = res.locals.UserSessionRecord['Kaleidoscape']['FloorNumber'];
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_dungeon_state': 6,
		'dmode_dungeon_info': res.locals.UserSessionRecord['Kaleidoscape']['DungeonInfo']
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/dmode/buildup_servitor_passive", Android_Version + "/dmode/buildup_servitor_passive"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const RequestBuild = MsgPackData['request_buildup_passive_list'];
	res.locals.UserSessionRecord = DModeMap.BuildPassive(RequestBuild, res.locals.UserSessionRecord);
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'dmode_servitor_passive_list': res.locals.UserSessionRecord['Kaleidoscape']['Passive'],
		'update_data_list': {
			'dmode_info': res.locals.UserSessionRecord['Kaleidoscape']['DmodeInfo']
		}
	}}
	await WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/talisman/sell", Android_Version + "/talisman/sell"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const SellList = MsgPackData['talisman_key_id_list'];
	let DeleteList = [];
	for (let x in SellList) {
		const KeyID = SellList[x];
		const TalismanIndex = res.locals.UserIndexRecord['talisman_list'].findIndex(x => x.talisman_key_id == KeyID);
		res.locals.UserIndexRecord['talisman_list'].splice(TalismanIndex, 1);
		DeleteList.push({'talisman_key_id': KeyID});
		const SellCoin = 10000; if ((res.locals.UserIndexRecord['user_data']['coin'] + SellCoin) > 3000000000) {res.locals.UserIndexRecord['user_data']['coin'] = 3000000000;}
		else { res.locals.UserIndexRecord['user_data']['coin'] += SellCoin; }
	}
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': { 'user_data': res.locals.UserIndexRecord['user_data'] },
		'delete_data_list': { 'delete_talisman_list': DeleteList }
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/stamp/get_stamp", Android_Version + "/stamp/get_stamp"], errorhandler(async (req, res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'stamp_list': res.locals.UserSessionRecord['Stickers']
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/stamp/set_equip_stamp", Android_Version + "/stamp/set_equip_stamp"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const StampList = MsgPackData['stamp_list']
	res.locals.UserIndexRecord['equip_stamp_list'] = StampList;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'equip_stamp_list': StampList
	}}
	await WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.post([iOS_Version + "/suggestion/get_category_list", Android_Version + "/suggestion/get_category_list"], errorhandler(async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'category_list': [
			{
				'category_id': 1,
				'name': "General Requests"
			},
			{
				'category_id': 2,
				'name': "General Suggestions"
			},
			{
				'category_id': 3,
				'name': "Save Modifications"
			}
		]
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/suggestion/set", Android_Version + "/suggestion/set"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const Category = MsgPackData['category_id'];
	const Message = MsgPackData['message']; let SuggestType = ""; let JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result_code': 1 } }
	if (Category == 1) { SuggestType = "Request"; } else if (Category == 2) { SuggestType = "Suggestion"; }
		else if (Category == 3) {
			SuggestType = "SaveMod";
			switch(Message) {
				case "Weapons":
					const WeaponTemplate = WeaponMap.GenerateWeaponMaxSaveTemplate();
					res.locals.UserIndexRecord['weapon_body_list'] = WeaponTemplate[0];
					res.locals.UserIndexRecord['weapon_skin_list'] = WeaponTemplate[1];
					break;
				case "Characters":
					const CharacterTemplate = CharacterMap.GenerateCharacterMaxSaveTemplate();
					const DragonTemplate = DragonMap.GenerateDragonMaxSaveTemplate(res.locals.UserSessionRecord['LastAssignedDragonID']);
					let CharacterBondTemplate = CharacterMap.GenerateCharacterStoryTemplate();
					CharacterBondTemplate = DragonMap.GenerateDragonMaxStoryTemplate(CharacterBondTemplate);
					const DragonBondTemplate = DragonMap.GenerateDragonMaxReliabilityTemplate();
					res.locals.UserIndexRecord['chara_list'] = CharacterTemplate;
					res.locals.UserIndexRecord['unit_story_list'] = CharacterBondTemplate;
					res.locals.UserIndexRecord['dragon_list'] = DragonTemplate[0];
					res.locals.UserIndexRecord['user_data']['max_dragon_quantity'] = Object.keys(DragonTemplate[0]).length;
					res.locals.UserIndexRecord['dragon_reliability_list'] = DragonBondTemplate;
					res.locals.UserSessionRecord['LastAssignedDragonID'] = DragonTemplate[1];
					res.locals.UserIndexRecord['party_list'] = ErasePartyList();
					await WriteSessionRecord(res.locals.UserSessionRecord);
					break;
				case "Wyrmprints":
					const PrintTemplate = WyrmprintMap.GenerateWyrmprintMaxTemplate();
					res.locals.UserIndexRecord['ability_crest_list'] = PrintTemplate;
					break;
				case "Guild":
					res.locals.UserIndexRecord = AssignGuildData(1, res.locals.UserIndexRecord);
					break;
			}
			await WriteIndexRecord(res.locals.UserIndexRecord);
			JSONDict = { 'data_headers': { 'result_code': 101 }, 'data': { 'result_code': 101 } }
		}
		else { res.end("Invalid"); return; }
	const FileName = String(res.locals.UserSessionRecord['ViewerID']) + "_" + String(Math.floor(Date.now() / 1000)) + "-" + SuggestType;
	await fs.writeFile(__dirname + '/Library/feedback/' + FileName, String(Message) + "\n");
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/user/get_n_account_info", Android_Version + "/user/get_n_account_info"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'n_account_info': { 'email': "ceryphim@Server.cherrymint.live", 'nickname': res.locals.UserIndexRecord['user_data']['name'] } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Server.post([iOS_Version + "/user/linked_n_account", Android_Version + "/user/linked_n_account"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result_code': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Server.get("/cartoon/top", async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		"top": {
			"id_1st": 9,
			"id": 1916,
			"episode": 468,
			"title": "That's a Wrap!",
			"image": "https://dragalialost.akamaized.net/attached/cartoon/images/bafb6a3cd4b9207ae60e67ee5b4d2801.png"
		},
		"text_list": [
			{
				"message_id": "back_to_comic_list",
				"text": "View All",
				"function_name": "comic"
			},
			{
				"message_id": "comic_banner",
				"text": "https://dragalialost.akamaized.net/static/image/comic/localized/en_us/banner_top_comic_01_webview.png",
				"function_name": "comic"
			},
			{
				"message_id": "comic_episode_format",
				"text": "#%s",
				"function_name": "comic"
			},
			{
				"message_id": "comic_help_link_image",
				"text": "https://dragalialost.akamaized.net/static/image/comic/localized/en_us/btn_helpcomic_01.png\t",
				"function_name": "comic"
			},
			{
				"message_id": "comic_link_image_plotsynopsis",
				"text": "https://dragalialost.akamaized.net/static/image/comic/localized/en_us/btn_comic_01.png",
				"function_name": "comic"
			},
			{
				"message_id": "comic_update_info",
				"text": "#%s added!",
				"function_name": "comic"
			},
			{
				"message_id": "comic_update_info_accent",
				"text": "#%s added!",
				"function_name": "comic"
			},
			{
				"message_id": "plotsynopsis_banner",
				"text": "https://dragalialost.akamaized.net/static/image/comic/localized/en_us/banner_top_plotsynopsis_01_webview.png\t",
				"function_name": "comic"
			},
			{
				"message_id": "read_from_first_episode",
				"text": "Start from #1",
				"function_name": "comic"
			},
			{
				"message_id": "to_comic_help",
				"text": "Need help? Start here!",
				"function_name": "comic"
			}
		]
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.post([iOS_Version + "/cartoon/latest", Android_Version + "/cartoon/latest"], async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		"latest": {
			"episode": 468
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Server.get("/dragalipatch/config", async (req,res) => {
	res.end(JSON.stringify({ 'mode': 'RAW', 'cdnUrl': ServerConf['cdn_url'], 'coneshellKey': null, 'useUnifiedLogin': ServerConf['is_unified_login'] }));
});

Server.post("*", async (req,res) => {
	console.log('POST on URL ' + req.url);
	var JSONDict = { 'data_headers': { 'result_code': 151 }, 'data': { 'result_code': 151 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Server.get("*", async (req,res) => {
	console.log('GET on URL ' + req.url);
	res.status(404);
	res.end('<p>But nobody came.</p>');
});

module.exports = Server;