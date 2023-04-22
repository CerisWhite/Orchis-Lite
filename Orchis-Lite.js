let https = require('http');
const path = require('path');
const express = require('express');
const errorhandler = require('express-async-handler');
const bodyParser = require('body-parser');
const compression = require('compression')
const crypto = require('crypto');
const msgpack = require('msgpackr');
const fs = require('fs-extra');
const zlib = require('zlib');
const Orchis = express();

const StaticData = require('./Library/function/StaticData.js');
const IndexTools = require('./Library/function/IndexTools.js');
const DataManager = require('./Library/function/DataManager.js');
const TutorialStatic = require('./Library/function/TutorialData.js');

const CharacterMap = require('./Library/idmaps/CharacterMap.js');
const WyrmprintMap = require('./Library/idmaps/WyrmprintMap.js');
const DragonMap = require('./Library/idmaps/DragonMap.js');
const WeaponMap = require('./Library/idmaps/WeaponMap.js');
const QuestMap = require('./Library/idmaps/QuestMap.js');
const ShopMap = require('./Library/idmaps/ShopMap.js');
const FortMap = require('./Library/idmaps/FortMap.js');

const iOS_Version = "/2.19.0_20220719103923"; const Android_Version = "/2.19.0_20220714193707";
const GlobalExpireContext = 'Tue, 1 Jan 2030 00:00:00 GMT';
const GlobalDeployHashContext = "Orchis-Lite"; const CurrentServerURL = "localhost";
const LastServerReset = Math.floor(Date.now() / 1000);

let MasterAccountRecord = {};
let MasterIDRecord = {};
if (fs.existsSync('./Library/database/accountrecord.msg.gz')) {
	zlib.gunzip(fs.readFileSync('./Library/database/accountrecord.msg.gz'), (err, buffer) => {
		MasterAccountRecord = msgpack.unpack(buffer);
	});
	zlib.gunzip(fs.readFileSync('./Library/database/idrecord.msg.gz'), (err, buffer) => {
		MasterIDRecord = msgpack.unpack(buffer);
	});
}
if (!fs.existsSync('./Library')) { fs.mkdirSync('./Library'); }
if (!fs.existsSync('./Library/database')) { fs.mkdirSync('./Library/database'); }
let ServerConf = {}
if (fs.existsSync('./conf.json')) {
	ServerConf = JSON.parse(fs.readFileSync('./conf.json'));
}
else {
	ServerConf = {
		"ssl": false, "cert": "./cert/cert.pem", "chain": "./cert/chain.pem", "key": "./cert/privkey.pem",
		"port": 80, "is_unified_login": false, "summon_cost": 100, "banner_id": 1020166
	}
	fs.writeFileSync('./conf.json', JSON.stringify(ServerConf, null, 2));
}
const AssetList = {
	"iOS_Manifest": "b1HyoeTFegeTexC0",
	"iOS_FileList": [],
	"Android_Manifest": "y2XM6giU6zz56wCm",
	"Android_FileList": []
}
let Certs = {};
if (ServerConf['ssl'] == true) {
	Certs = {
		cert: fs.readFileSync(ServerConf['cert']),
		ca: fs.readFileSync(ServerConf['chain']),
		key: fs.readFileSync(ServerConf['key'])
	}
	https = require('https');
}

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

function ReadSessionRecord() {
	if (!fs.existsSync('./Library/database/usersession.msg.gz')) { return {}; }
	const SessionData = msgpack.unpack(zlib.gunzipSync(fs.readFileSync('./Library/database/usersession.msg.gz')));
	return SessionData;
}
function WriteSessionRecord(Data) {
	fs.writeFileSync('./Library/database/usersession.msg.gz', zlib.gzipSync(msgpack.pack(Data)));
}
function ReadIndexRecord() {
	const IndexData = msgpack.unpack(zlib.gunzipSync(fs.readFileSync('./Library/database/userindex.msg.gz')));
	return IndexData;
}
function WriteIndexRecord(Data) {
	fs.writeFileSync('./Library/database/userindex.msg.gz', zlib.gzipSync(msgpack.pack(Data)));
}

function RecordManager (req, res, next) {
	if (req.url.endsWith("/tool/auth")) { next(); return; }
	if (req.get('sid') != undefined) {
		res.locals.UserSessionRecord = ReadSessionRecord();
		res.locals.UserIndexRecord = ReadIndexRecord(); 
	}
	next();
}

Orchis.use(bodyParser.raw({ type: ['application/x-msgpack', 'application/msgpack', 'application/octet-stream'], limit: "4mb" }));
Orchis.use(compression());
Orchis.use(RecordManager);
Orchis.disable('x-powered-by');
const server = https.createServer(Certs, Orchis).listen(ServerConf['port'], function() { console.log("Orchis Lite has bloomed!"); });

Orchis.post(["/api/v1/Session", "/api/v1/MeasurementEvent"], async (req,res) => { res.status(202); res.end(); });

Orchis.post("/core/v1/gateway/sdk/login", async (req, res) => {
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
Orchis.post("/inquiry/v1/users/a1000", async (req, res) => {
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

Orchis.post([iOS_Version + "/transition/transition_by_n_account", Android_Version + "/transition/transition_by_n_account"], errorhandler(async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'transition_result_data': { 'abolished_viewer_id': 0, 'linked_viewer_id': 1000 } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);					
}));
Orchis.post([iOS_Version + "/tool/signup", Android_Version + "/tool/signup"], errorhandler(async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'viewer_id': 1000 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/tool/auth", Android_Version + "/tool/auth"], errorhandler(async (req,res) => {
	if (MasterIDRecord['SessionID'] == undefined) {
		const NewAccountData = CreateAccountShell();
		UserIDRecord = NewAccountData[0];
		MasterAccountRecord = NewAccountData[0];
		MasterIDRecord = UserIDRecord;
		WriteSessionRecord(NewAccountData[1]);
		WriteIndexRecord(NewAccountData[2]);
		SaveUserDB();
	}
	let UserSessionRecord = ReadSessionRecord();
	UserSessionRecord['LastLogin'] = Math.floor(Date.now() / 1000);
	WriteSessionRecord(UserSessionRecord);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'viewer_id': 1000, 'session_id': "a1000", 'nonce': null } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/tool/get_service_status", Android_Version + "/tool/get_service_status"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'service_status': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Orchis.post([iOS_Version + "/eula/get_version_list", Android_Version + "/eula/get_version_list"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'version_hash_list': StaticData.VersionData, } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/eula/get_version", Android_Version + "/eula/get_version"], async (req,res) => {
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
Orchis.post([iOS_Version + "/eula_agree/agree", Android_Version + "/eula_agree/agree"], async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const Region = MsgPackData['region']; const Language = MsgPackData['lang'];
	const EulaVer = MsgPackData['eula_version']; const PrivVer = MsgPackData['privacy_policy_version'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'version_hash': { 'region': Region, 'language': Language, 'eula_version': EulaVer, 'privacy_policy_version': PrivVer } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Orchis.post([iOS_Version + "/deploy/get_deploy_version", Android_Version + "/deploy/get_deploy_version"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'deploy_hash': GlobalDeployHashContext } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/version/get_resource_version", Android_Version + "/version/get_resource_version"], async (req,res) => {
	let OSType = req.get('os-version').split("\ ", 1)[0];
	let ResourceVersion = ""
	if (OSType == "iOS") { ResourceVersion = AssetList['iOS_Manifest'] } else { ResourceVersion = AssetList['Android_Manifest'] }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'resource_version': ResourceVersion } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Orchis.post([iOS_Version + "/login/verify_jws", Android_Version + "/login/verify_jws"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result_code': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/load/index", Android_Version + "/load/index"], errorhandler(async (req,res) => {
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
Orchis.post([iOS_Version + "/login/index", Android_Version + "/login/index"], errorhandler(async (req,res) => {
	const LoginData = DataManager.LoginBonusData(res.locals.UserIndexRecord, res.locals.UserSessionRecord, LastServerReset);
	let JSONDict = LoginData[0];
	res.locals.UserIndexRecord = LoginData[1];
	res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
	JSONDict['data']['update_data_list']['fort_bonus_list'] = res.locals.UserIndexRecord['fort_bonus_list'];
	res.locals.UserSessionRecord = LoginData[2];
	res.locals.UserSessionRecord['DungeonRecord']['IsRepeat'] = 0;
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/webview_version/url_list", Android_Version + "/webview_version/url_list"], async (req,res) => {
	const URLList = fs.readFile(path.join(__dirname, "Library", "function", "url_list.msg"));
	res.set(ResHeaders(URLList.length));
    res.end(URLList);
});
Orchis.post([iOS_Version + "/mypage/info", Android_Version + "/mypage/info"], async (req,res) => {	
	const JSONDict = DataManager.MyPageInfo(res.locals.UserSessionRecord, StaticData.QuestRotation);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.get("/information/top", async (req,res) => {
	const Serialized = JSON.stringify(StaticData.NewsData);
    res.end(Serialized);
});

Orchis.post([iOS_Version + "/tutorial/update_step", Android_Version + "/tutorial/update_step"], errorhandler(async (req,res) => {
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/tutorial/update_flags", Android_Version + "/tutorial/update_flags"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	res.locals.UserIndexRecord['user_data']['tutorial_flag_list'].push(MsgPackData['flag_id']);
	var JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		'update_data_list': { 'tutorial_flag_list': res.locals.UserIndexRecord['user_data']['tutorial_flag_list'] }
	}}
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/redoable_summon/get_data", Android_Version + "/redoable_summon/get_data"], async (req,res) => {
	const Serialized = msgpack.pack(TutorialStatic.RedoableSummonData);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
});
Orchis.post([iOS_Version + "/redoable_summon/pre_exec", Android_Version + "/redoable_summon/pre_exec"], errorhandler(async (req,res) => {
	let SummonData = [];
	let DrawData = null;
	let i = 0; while (i < 50) {
		let Result = Math.round(Math.random());
		switch(Result) {
			case 0:
				DrawData = CharacterMap.DrawCharacterCorrect();
				break;
			case 1:
				DrawData = DragonMap.DrawDragonCorrect();
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/redoable_summon/fix_exec", Android_Version + "/redoable_summon/fix_exec"], errorhandler(async (req,res) => {
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/summon_exclude/get_list", Android_Version + "/summon_exclude/get_list"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'summon_exclude_list': [] } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/summon/get_odds_data", Android_Version + "/summon/get_odds_data"], async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'odds_rate_list': {}
	}}
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
});
Orchis.post([iOS_Version + "/summon/get_summon_history", Android_Version + "/summon/get_summon_history"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'summon_history_list': res.locals.UserSessionRecord['SummonRecord']['SummonHistory'] } }
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Orchis.post([iOS_Version + "/summon/get_summon_list", Android_Version + "/summon/get_summon_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 
		"summon_list": [
			{
                "summon_id": ServerConf['banner_id'],
                "summon_type": 2,
                "single_crystal": ServerConf['summon_cost'],
                "single_diamond": ServerConf['summon_cost'],
                "multi_crystal": ServerConf['summon_cost'] * 10,
                "multi_diamond": ServerConf['summon_cost'] * 10,
                "limited_crystal": 0,
                "limited_diamond": 0,
                "summon_point_id": 0,
                "add_summon_point": 0,
                "add_summon_point_stone": 0,
                "exchange_summon_point": 0,
                "status": 1,
                "commence_date": 1661752800,
                "complete_date": 1702166400,
                "daily_count": 0,
                "daily_limit": 0,
                "total_limit": 0,
                "total_count": 0,
                "campaign_type": 0,
                "free_count_rest": 0,
                "is_beginner_campaign": 0,
                "beginner_campaign_count_rest": 0,
                "consecution_campaign_count_rest": 0
            },
            {
                "summon_id": 1020047,
                "summon_type": 2,
                "single_crystal": ServerConf['summon_cost'],
                "single_diamond": ServerConf['summon_cost'],
                "multi_crystal": ServerConf['summon_cost'] * 10,
                "multi_diamond": ServerConf['summon_cost'] * 10,
                "limited_crystal": 0,
                "limited_diamond": 0,
                "summon_point_id": 0,
                "add_summon_point": 0,
                "add_summon_point_stone": 0,
                "exchange_summon_point": 0,
                "status": 1,
                "commence_date": 1661752800,
                "complete_date": 1702166400,
                "daily_count": 0,
                "daily_limit": 0,
                "total_limit": 0,
                "total_count": 0,
                "campaign_type": 0,
                "free_count_rest": 0,
                "is_beginner_campaign": 0,
                "beginner_campaign_count_rest": 0,
                "consecution_campaign_count_rest": 0
            },
			{
                "summon_id": 1020102,
                "summon_type": 2,
                "single_crystal": ServerConf['summon_cost'],
                "single_diamond": ServerConf['summon_cost'],
                "multi_crystal": ServerConf['summon_cost'] * 10,
                "multi_diamond": ServerConf['summon_cost'] * 10,
                "limited_crystal": 0,
                "limited_diamond": 0,
                "summon_point_id": 0,
                "add_summon_point": 0,
                "add_summon_point_stone": 0,
                "exchange_summon_point": 0,
                "status": 1,
                "commence_date": 1661752800,
                "complete_date": 1702166400,
                "daily_count": 0,
                "daily_limit": 0,
                "total_limit": 0,
                "total_count": 0,
                "campaign_type": 0,
                "free_count_rest": 0,
                "is_beginner_campaign": 0,
                "beginner_campaign_count_rest": 0,
                "consecution_campaign_count_rest": 0
            }
        ],
		"summon_point_list": []
	}}
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Orchis.post([iOS_Version + "/summon/get_summon_point_trade", Android_Version + "/summon/get_summon_point_trade"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'summon_point_trade_list': [], 'summon_point_list': [] } }
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
});
Orchis.post([iOS_Version + "/summon/request", Android_Version + "/summon/request"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	let ExecCount = MsgPackData['exec_count'];
	if (ExecCount < 1) { ExecCount = 1; }
	if (MsgPackData['exec_type'] == 2) { ExecCount = 10; }
	const PaymentType = MsgPackData['payment_type'];
	const PreSageEffectList = [ 1, 1 ];
	let SummonData = []; let i = 0;
	let UpdateInfo = {};
	let NewEntityList = [];
	switch(PaymentType) {
		case 2:
			res.locals.UserSessionRecord['Diamantium'] -= ServerConf['summon_cost'] * ExecCount;
			UpdateInfo['diamond_data'] = { 'free_diamond': 0, 'paid_diamond': res.locals.UserSessionRecord['Diamantium'] }
			break;
		case 3:
			res.locals.UserIndexRecord['user_data']['crystal'] -= ServerConf['summon_cost'] * ExecCount;
			UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data'];
		case 8: // this is vouchers but we don't cover it yet
			break;
		case 9: // Is this even used?
			break;
		case 10: // free daily tenfold!
			res.locals.UserSessionRecord['SummonRecord']['FreeTenfoldCount'] -= 1;
			break;
	}
	while (i < ExecCount) {
		let Result = Math.round(Math.random());
		if (MsgPackData['summon_id'] == 1020047) { Result = 0; }
		else if (MsgPackData['summon_id'] == 1020102) { Result = 1; }
		let DrawData = null;
		let IsNew = false;
		switch(Result) {
			case 0:
				DrawData = CharacterMap.DrawCharacterCorrect();
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
				break;
			case 1:
				DrawData = DragonMap.DrawDragonCorrect();
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
		}
		var Template = {
			'entity_type': DrawData['entity_type'],
			'id': DrawData['id'],
			'rarity': DrawData['rarity'],
			'is_new': false
		}
		if (IsNew == true) { Template['is_new'] = true; }
		else { if (DrawData['entity_type'] == 1) { switch(DrawData['rarity']) { 
			case 3: Template['dew_point'] = 300; break; case 4: Template['dew_point'] = 2500; break; case 5: Template['dew_point'] = 8000; break; }
			const NewDewTotal = res.locals.UserIndexRecord['user_data']['dew_point'] += Template['dew_point'];
			if (NewDewTotal > 3000000000) { UpdateInfo['user_data']['dew_point'] = 3000000000; res.locals.UserIndexRecord['user_data']['dew_point'] = 3000000000; }
			else { UpdateInfo['user_data']['dew_point'] += Template['dew_point']; res.locals.UserIndexRecord['user_data']['dew_point'] += Template['dew_point']; } }
			UpdateInfo['user_data'] = res.locals.UserIndexRecord['user_data']; }
		SummonData.push(Template);
		i++;
	}
	if (SummonData.findIndex(x => x.rarity === 4) != -1) { PreSageEffectList[0] = Math.round(Math.random() * 2 + 1); PreSageEffectList[1] = 2; }
	if (SummonData.findIndex(x => x.rarity === 5) != -1) { PreSageEffectList[0] = Math.round(Math.random() * 4 + 1); PreSageEffectList[1] = 3; }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'reversal_effect_index': -1,
		'presage_effect_list': PreSageEffectList,
		'result_unit_list': SummonData,
		'result_prize_list': [],
		'result_summon_point': 0,
		'update_data_list': UpdateInfo,
		'entity_result': { 'new_get_entity_list': NewEntityList }
	}}
	res.locals.UserSessionRecord['Analytics']['SummonCount'] += ExecCount;
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));

Orchis.post([iOS_Version + "/ability_crest/get_ability_crest_set_list", Android_Version + "/ability_crest/get_ability_crest_set_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		"ability_crest_set_list": res.locals.UserSessionRecord['WyrmprintSets'],
		'update_data_list': {
			'functional_maintenance_list': []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/ability_crest/set_ability_crest_set", Android_Version + "/ability_crest/set_ability_crest_set"], errorhandler(async (req,res) => {
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/ability_crest/update_ability_crest_set_name", Android_Version + "/ability_crest/update_ability_crest_set_name"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const SetNumber = MsgPackData['ability_crest_set_no'];
	let RequestedName = MsgPackData['ability_crest_set_name'];
	if (RequestedName.length > 12) { RequestedName = RequestedName.substring(0, 12); }
	res.locals.UserSessionRecord['WyrmprintSets'][SetNumber - 1]['ability_crest_set_name'] = RequestedName;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'ability_crest_set_list': [ res.locals.UserSessionRecord['WyrmprintSets'][SetNumber - 1] ]
	}}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/ability_crest/buildup_piece", Android_Version + "/ability_crest/buildup_piece"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const PrintID = MsgPackData['ability_crest_id'];
	const PrintBuildup = MsgPackData['buildup_ability_crest_piece_list']; const Augments = MsgPackData['plus_count_parameters'];
	const PrintIndex = res.locals.UserIndexRecord['ability_crest_list'].findIndex(x => x.ability_crest_id === PrintID); const PrintData = res.locals.UserIndexRecord['ability_crest_list'][PrintIndex]; 
	const NewData = WyrmprintMap.WyrmprintBuild(PrintID, PrintBuildup, Augments, PrintData);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'ability_crest_list': [],
		'user_data': res.locals.UserIndexRecord['user_data'],
		'material_list': []
	}}}
	JSONDict['data']['update_data_list']['ability_crest_list'].push(NewData[0]);
	res.locals.UserIndexRecord['ability_crest_list'][PrintIndex] = NewData[0];
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/ability_crest/buildup_plus_count", Android_Version + "/ability_crest/buildup_plus_count"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/ability_crest/reset_plus_count", Android_Version + "/ability_crest/reset_plus_count"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/chara/get_chara_unit_set", Android_Version + "/chara/get_chara_unit_set"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 
		'update_data_list': {}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/set_chara_unit_set", Android_Version + "/chara/set_chara_unit_set"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 
		'update_data_list': {}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/awake", Android_Version + "/chara/awake"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; const Rarity = MsgPackData['next_rarity'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID); const CharacterData = res.locals.UserIndexRecord['chara_list'][CharacterIndex];
	let DewCost = 0;
	if (MsgPackData['next_rarity'] == 4) { DewCost = 2500; }
	else if (MsgPackData['next_rarity'] == 5) { DewCost = 25000; }
	const NewData = CharacterMap.RaiseRarity(CharacterID, Rarity, CharacterData);
	res.locals.UserIndexRecord['user_data']['dew_point'] -= DewCost;
	res.locals.UserIndexRecord['chara_list'][CharacterIndex] = NewData;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'chara_list': []
	}}}
	JSONDict['data']['update_data_list']['chara_list'].push(NewData); JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/buildup", Android_Version + "/chara/buildup"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/buildup_mana", Android_Version + "/chara/buildup_mana"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; const MCList = MsgPackData['mana_circle_piece_id_list'];
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID); const CharacterData = res.locals.UserIndexRecord['chara_list'][CharacterIndex];
	const LimitBreakCount = 0; const NewData = CharacterMap.RaiseManaCircle(CharacterID, MCList, LimitBreakCount, CharacterData);
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/limit_break_and_buildup_mana", Android_Version + "/chara/limit_break_and_buildup_mana"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/unlock_edit_skill", Android_Version + "/chara/unlock_edit_skill"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const CharacterID = MsgPackData['chara_id']; 
	const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id === CharacterID); const CharacterData = res.locals.UserIndexRecord['chara_list'][CharacterIndex];
	const NewData = CharacterMap.UnlockSharedSkill(CharacterID, CharacterData);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': {
		'chara_list': []
	}}}
	JSONDict['data']['update_data_list']['chara_list'].push(NewData); JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	res.locals.UserIndexRecord['chara_list'][CharacterIndex] = NewData;
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/buildup_platinum", Android_Version + "/chara/buildup_platinum"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/chara/reset_plus_count", Android_Version + "/chara/reset_plus_count"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/dragon/sell", Android_Version + "/dragon/sell"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dragon/set_lock", Android_Version + "/dragon/set_lock"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const KeyID = MsgPackData['dragon_key_id']; const IsLock = MsgPackData['is_lock'];
	const DragonIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === KeyID);
	res.locals.UserIndexRecord['dragon_list'][DragonIndex]['is_lock'] = IsLock;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': { 'dragon_list': [] } } }
	JSONDict['data']['update_data_list']['dragon_list'].push(res.locals.UserIndexRecord['dragon_list'][DragonIndex]);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dragon/limit_break", Android_Version + "/dragon/limit_break"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dragon/buildup", Android_Version + "/dragon/buildup"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const KeyID = MsgPackData['base_dragon_key_id']; const GrowList = MsgPackData['grow_material_list']; 
	const DragonIndex = res.locals.UserIndexRecord['dragon_list'].findIndex(x => x.dragon_key_id === KeyID);
	const UpdateData = DragonMap.BuildDragon(KeyID, GrowList, res.locals.UserIndexRecord['dragon_list'][DragonIndex]);
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'update_data_list': {
			'dragon_list': [],
			'material_list': []
		}
	}}
	JSONDict['data']['update_data_list']['dragon_list'].push(UpdateData[0]);
	res.locals.UserIndexRecord['dragon_list'][DragonIndex] = UpdateData[0];
	const BonusIndex = res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'].findIndex(x => x.elemental_type == DragonMap.GetDragonInfo(UpdateData[0]['dragon_id'], "element"));
	res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][BonusIndex]['hp'] += UpdateData[1];
	res.locals.UserIndexRecord['fort_bonus_list']['dragon_bonus_by_album'][BonusIndex]['attack'] += UpdateData[1];
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict);
	res.set(ResHeaders(Serialized.length));
	res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dragon/get_contact_data", Android_Version + "/dragon/get_contact_data"], async (req,res) => {
	var JSONDict = { "data_headers": { "result_code": 1 }, "data": {
		"shop_gift_list": [
			{
				"dragon_gift_id": 10001,
				"price": 0,
				"is_buy": 0
			},
			{
				"dragon_gift_id": 10002,
				"price": 1500,
				"is_buy": 0
			},
			{
				"dragon_gift_id": 10003,
				"price": 4000,
				"is_buy": 0
			},
			{
				"dragon_gift_id": 10004,
				"price": 8000,
				"is_buy": 0
			},
			{
				"dragon_gift_id": 20005,
				"price": 12000,
				"is_buy": 0
			}
		],
		"update_data_list": {
			"functional_maintenance_list": []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/dragon/reset_plus_count", Android_Version + "/dragon/reset_plus_count"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/update/namechange", Android_Version + "/update/namechange"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/emblem/get_list", Android_Version + "/emblem/get_list"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'emblem_list': res.locals.UserSessionRecord['Epithet']
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/emblem/set", Android_Version + "/emblem/set"], errorhandler(async (req,res) => {
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
Orchis.post([iOS_Version + "/option/get_option", Android_Version + "/option/get_option"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'option_data': res.locals.UserSessionRecord['SetOptions'],
		'update_data_list': {
			'functional_maintenance_list': []
		}
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
	
}));
Orchis.post([iOS_Version + "/option/set_option", Android_Version + "/option/set_option"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const UserOptions = MsgPackData['option_setting'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'option_data': UserOptions,
		'update_data_list': { 'functional_maintenance_list': [] }
	}}
	res.locals.UserSessionRecord['SetOptions'] = UserOptions;
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/party/index", Android_Version + "/party/index"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'update_data_list': { 'functional_maintenance_list': [] } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/party/set_main_party_no", Android_Version + "/party/set_main_party_no"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const RequestedPartyNumber = MsgPackData['main_party_no'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
			'main_party_no': RequestedPartyNumber,
			'update_data_list': {
				'functional_maintenance_list': []
			}
		}}
	res.locals.UserIndexRecord['user_data']['main_party_no'] = RequestedPartyNumber;
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/party/set_party_setting", Android_Version + "/party/set_party_setting"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/party/update_party_name", Android_Version + "/party/update_party_name"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/friend/get_support_chara", Android_Version + "/friend/get_support_chara"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
        'setting_support': {
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
        'update_data_list': { 'functional_maintenance_list': [] }
    	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});

Orchis.post([iOS_Version + "/quest/read_story", Android_Version + "/quest/read_story"], errorhandler(async (req,res) => {
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
		'entity_result': {}
	}}
	const StoryIndex = res.locals.UserIndexRecord['quest_story_list'].findIndex(x => x.quest_story_id == ReadStory);
	if (StoryIndex == -1 || res.locals.UserIndexRecord['quest_story_list'][StoryIndex]['state'] != 1) {
		res.locals.UserIndexRecord['quest_story_list'].push({'quest_story_id': ReadStory, 'state': 1});
		if (QuestMap.HasRewardCharacter(ReadStory) == true) {
			const RewardData = QuestMap.RewardCharacter(ReadStory);
			const CharacterIndex = res.locals.UserIndexRecord['chara_list'].findIndex(x => x.chara_id == RewardData['entity_id']);
			if (CharacterIndex == -1) {
				if (JSONDict['data']['entity_result']['new_get_entity_list'] == undefined) {  JSONDict['data']['entity_result']['new_get_entity_list'] = []; }
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
			if (JSONDict['data']['entity_result']['new_get_entity_list'] == undefined) {  JSONDict['data']['entity_result']['new_get_entity_list'] = []; }
			JSONDict['data']['entity_result']['new_get_entity_list'].push(RewardData);
			res.locals.UserSessionRecord['LastAssignedDragonID'] += 1;
			WriteSessionRecord(res.locals.UserSessionRecord);
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
		res.locals.UserIndexRecord['user_data']['crystal'] += 25;
		JSONDict['data']['quest_story_reward_list'].push({"entity_type": 23, "entity_id": 0, "entity_quantity": 25});
		JSONDict['data']['update_data_list']['user_data'] = res.locals.UserIndexRecord['user_data'];
	}
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/story/read", Android_Version + "/story/read"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const ReadStory = MsgPackData['unit_story_id'];
	res.locals.UserIndexRecord['user_data']['crystal'] += 25;
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/castle_story/read", Android_Version + "/castle_story/read"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/fort/get_data", Android_Version + "/fort/get_data"], errorhandler(async (req,res) => {
	if (res.locals.UserIndexRecord['build_list'] == undefined) { res.locals.UserIndexRecord['build_list'] = IndexTools.MinimalFortData; }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
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
Orchis.post([iOS_Version + "/fort/get_multi_income", Android_Version + "/fort/get_multi_income"], errorhandler(async (req, res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/move", Android_Version + "/fort/move"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); BuildID = MsgPackData['build_id'];
	NewX = MsgPackData['after_position_x']; NewZ = MsgPackData['after_position_z'];
	BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	res.locals.UserIndexRecord['build_list'][BuildIndex]['position_x'] = NewX; res.locals.UserIndexRecord['build_list'][BuildIndex]['position_z'] = NewZ;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1, 'build_id': BuildID, 'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': { 'build_list': [ res.locals.UserIndexRecord['build_list'][BuildIndex] ] }
	}}
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/build_start", Android_Version + "/fort/build_start"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const FacilityID = MsgPackData['fort_plant_id'];
	let DetailID = parseInt(String(FacilityID) + "01");
	if (String(FacilityID).slice(0, 5) == "10070") { DetailID = parseInt(String(FacilityID) + "00"); }
	const UpgradeTime = FortMap.GetFacilityData(DetailID, "level_up_time"); 
	const UpgradeCostCoin = FortMap.GetFacilityData(DetailID, "level_up_rupies");
	const UpgradeCostMaterial = FortMap.GetFacilityData(DetailID, "level_up_materials");
	let UpdateInfo = {}; UpdateInfo['build_list'] = [];
	res.locals.UserSessionRecord['FortData']['BuildID'] += 1;
	const BuildTemplate = {
		'build_id': res.locals.UserSessionRecord['FortData']['BuildID'],
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
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'levelup_start_date': Math.floor(Date.now() / 1000),
		'levelup_end_date': Math.floor(Date.now() / 1000) + UpgradeTime,
		'remain_time': UpgradeTime,
		'build_id': res.locals.UserSessionRecord['FortData']['BuildID'],
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': UpdateInfo
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/build_end", Android_Version + "/fort/build_end"], errorhandler(async (req, res) => {
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
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/build_at_once", Android_Version + "/fort/build_at_once"], errorhandler(async (req, res) => {
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
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/build_cancel", Android_Version + "/fort/build_cancel"], errorhandler(async (req, res) => {
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
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': {
			'build_list': []
		}
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/levelup_start", Android_Version + "/fort/levelup_start"], errorhandler(async (req, res) => {
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
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'levelup_start_date': Math.floor(Date.now() / 1000),
		'levelup_end_date': Math.floor(Date.now() / 1000) + UpgradeTime,
		'remain_time': UpgradeTime,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': UpdateInfo
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/levelup_end", Android_Version + "/fort/levelup_end"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	if (FortMap.FacilityInfoMap[String(res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'] + 1)] != undefined) {
		res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'] += 1;
	}
	res.locals.UserIndexRecord['build_list'][BuildIndex]['level'] = parseInt(String(res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id']).slice(6, 8));
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_status'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_start_date'] = 0;
	res.locals.UserIndexRecord['build_list'][BuildIndex]['build_end_date'] = 0;
	res.locals.UserIndexRecord['fort_bonus_list'] = FortMap.GenerateBonuses(res.locals.UserIndexRecord);
	let UpdateInfo = {}; UpdateInfo['build_list'] = []; 
	UpdateInfo['build_list'].push(res.locals.UserIndexRecord['build_list'][BuildIndex]);
	if (res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] > 0) {
		res.locals.UserSessionRecord['FortData']['Smiths']['working_carpenter_num'] -= 1;
	}
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/levelup_at_once", Android_Version + "/fort/levelup_at_once"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const BuildID = MsgPackData['build_id'];
	const PaymentType = MsgPackData['payment_type'];
	const BuildIndex = res.locals.UserIndexRecord['build_list'].findIndex(x => x.build_id == BuildID);
	res.locals.UserIndexRecord['build_list'][BuildIndex]['fort_plant_detail_id'] += 1;
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
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'production_rp': res.locals.UserSessionRecord['FortData']['Production']['RP_Production'],
		'production_df': res.locals.UserSessionRecord['FortData']['Production']['DF_Production'],
		'production_st': res.locals.UserSessionRecord['FortData']['Production']['ST_Production'],
		'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list'],
		'update_data_list': UpdateInfo
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/fort/levelup_cancel", Android_Version + "/fort/levelup_cancel"], errorhandler(async (req, res) => {
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
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'build_id': BuildID,
		'fort_detail': res.locals.UserSessionRecord['FortData']['Smiths'],
		'update_data_list': {
			'build_list': [ res.locals.UserIndexRecord['build_list'][BuildIndex] ]
		}
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/weapon_body/craft", Android_Version + "/weapon_body/craft"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/weapon_body/buildup_piece", Android_Version + "/weapon_body/buildup_piece"], errorhandler(async (req,res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/story_skip/skip", Android_Version + "/story_skip/skip"], async (req, res) => {
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
	const LevelUp = 60 - res.locals.UserIndexRecord['user_data']['level'];
	if (LevelUp > 0) {
		const WyrmiteReward = LevelUp * 25; res.locals.UserIndexRecord['user_data']['crystal'] += WyrmiteReward; 
		res.locals.UserIndexRecord['user_data']['level'] = 60; 
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
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result_state': 1,
		'update_data_list': {
			'user_data': res.locals.UserIndexRecord['user_data'],
			'chara_list': CharacterList,
			'dragon_list': DragonList,
			'unit_story_list': UnitStoryList,
			'dragon_reliability_list': DragonBond,
			'fort_bonus_list': res.locals.UserIndexRecord['fort_bonus_list']
		},
		'entity_result': { 'new_entity_get_list': EntityList }
	}}
	WriteIndexRecord(res.locals.UserIndexRecord);
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/mission/unlock_main_story_group", Android_Version + "/mission/unlock_main_story_group"], errorhandler(async (req, res) => {
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
	WriteIndexRecord(res.locals.UserIndexRecord);
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
Orchis.post([iOS_Version + "/mission/get_mission_list", Android_Version + "/mission/get_mission_list"], errorhandler(async (req,res) => {
	const JSONDict = DataManager.MissionList(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/mission/get_drill_mission_list", Android_Version + "/mission/get_drill_mission_list"], errorhandler(async (req,res) => {
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

Orchis.post([iOS_Version + "/item/get_list", Android_Version + "/item/get_list"], errorhandler(async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'item_list': res.locals.UserIndexRecord['material_list'] } }
	let i = 0; while (i < res.locals.UserSessionRecord['EnergyItems'].length) { JSONDict['data']['item_list'].push(res.locals.UserSessionRecord['EnergyItems'][i]); i++; }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/item/use_recovery_stamina", Android_Version + "/item/use_recovery_stamina"], errorhandler(async (req, res) => {
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/album/index", Android_Version + "/album/index"], errorhandler(async (req, res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'album_dragon_list': res.locals.UserIndexRecord['album_dragon_list'], 'album_quest_play_record_list': [], 'chara_honor_list': [], 'album_passive_update_list': { 'is_update_chara': 0, 'is_update_dragon': 0 } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/shop/get_list", Android_Version + "/shop/get_list"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'is_quest_bonus': 0, 'is_stone_bonus': 0, 'is_stamina_bonus': 0, 'stone_bonus': [], 'stamina_bonus': [], 'quest_bonus': [],
		'material_shop_purchase': [], 'normal_shop_purchase': [], 'special_shop_purchase': [], 'product_lock_list': [],
		'user_item_summon': { 'daily_summon_count': res.locals.UserSessionRecord['SummonRecord']['ItemCount'], 'last_summon_time': LastServerReset },
		'product_list': [], 'infancy_paid_diamond_limit': 0
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/shop/item_summon_odd", Android_Version + "/shop/item_summon_odd"], errorhandler(async (req, res) => {
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
Orchis.post([iOS_Version + "/shop/item_summon_exec", Android_Version + "/shop/item_summon_exec"], errorhandler(async (req, res) => {
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/ability_crest_trade/get_list", Android_Version + "/ability_crest_trade/get_list"], async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_ability_crest_trade_list': res.locals.UserSessionRecord['CrestTrade'],
		'ability_crest_trade_list': ShopMap.WyrmprintTrade
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/ability_crest_trade/trade", Android_Version + "/ability_crest_trade/trade"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const TradeID = MsgPackData['ability_crest_trade_id'];
	const NewPrintData = WyrmprintMap.CreateWyrmprintFromGift(ShopMap.GetTradePrintID(TradeID));
	res.locals.UserIndexRecord['user_data']['dew_point'] -= ShopMap.GetPrintTradeCost(TradeID);
	res.locals.UserIndexRecord['ability_crest_list'].push(NewPrintData);
	res.locals.UserSessionRecord['CrestTrade'].push({"ability_crest_trade_id": 161, "trade_count": 1});
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_ability_crest_trade_list': res.locals.UserSessionRecord['CrestTrade'],
		'ability_crest_trade_list': ShopMap.WyrmprintTrade,
		'update_data_list': {
			'ability_crest_list': [ NewPrintData ],
			'user_data': res.locals.UserIndexRecord['user_data']
		}
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/treasure_trade/get_list_all", Android_Version + "/treasure_trade/get_list_all"], async (req,res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'user_treasure_trade_list': res.locals.UserIndexRecord['user_treasure_trade_list'],
		'treasure_trade_all_list': ShopMap.TreasureTrade,
		'dmode_info': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/treasure_trade/trade", Android_Version + "/treasure_trade/trade"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const TradeID = MsgPackData['treasure_trade_id']; const TradeCount = MsgPackData['trade_count'];
	const FinalizedTrade = ShopMap.TradeTreasure(TradeID, TradeCount, res.locals.UserIndexRecord, res.locals.UserSessionRecord);
	res.locals.UserIndexRecord = FinalizedTrade[1];
	res.locals.UserSessionRecord = FinalizedTrade[2];
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(FinalizedTrade[0]); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/quest/get_support_user_list", Android_Version + "/quest/get_support_user_list"], async (req,res) => {
	const SupportData = await fs.readFile(path.join(__dirname, 'Library', 'function', 'Support.msg'));
	res.set(ResHeaders(SupportData.length));
	res.end(SupportData);
});
Orchis.post([iOS_Version + "/quest/get_quest_clear_party", Android_Version + "/quest/get_quest_clear_party"], async (req,res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'quest_clear_party_setting_list': [],
		'lost_unit_list': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/quest/drop_list", Android_Version + "/quest/drop_list"], async (req,res) => {
	var JSONDict = {
		'data_headers': { 'result_code': 1 }, 'data': { 'quest_drop_info': { 'drop_info_list': [], 'host_drop_info_list': [], 'fever_drop_info_list': [], 'quest_bonus_info_list': [], 'quest_reborn_bonus_info_list': [], 'campaign_extra_reward_info_list': [] }, 'update_data_list': { 'functional_maintenance_list': [] }  }
	}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/quest/set_quest_clear_party", Android_Version + "/quest/set_quest_clear_party"], errorhandler(async (req,res) => {
	// let res.locals.UserSessionRecord = ReadSessionRecord();
	let JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/dungeon_start/start", Android_Version + "/dungeon_start/start"], errorhandler(async (req,res) => {
	const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const DungeonKey = crypto.randomBytes(16).toString("hex");
	const MsgPackData = msgpack.unpack(req.body); const QuestID = MsgPackData['quest_id']; if (typeof QuestID === 'string') { res.end(); return; }
	const PartyNo_List = MsgPackData['party_no_list'];
	if (MsgPackData['repeat_setting'] != null) {
		res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = MsgPackData['repeat_setting'];
	} else if (MsgPackData['repeat_state'] != 1) { res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = {}; }
	const SupportViewerID = MsgPackData['support_viewer_id']; let SupportSessionRecord = {}; let SupportIndexRecord = {};
	let PartyNumberList = []; let PartyListData = []; let DungeonTypeID = 1; if (PartyNo_List.length > 1) { DungeonTypeID = 15; }
	PartyListData = DataManager.PopulateUnitData(PartyNo_List, ViewerID, res.locals.UserIndexRecord);
	let AreaInfo = QuestMap.GetQuestInfo(QuestID, "area_info");
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedTeam'] == 1) { PartyListData[0]['party_unit_list'] = res.locals.UserSessionRecord['DungeonRecord']['FixedTeamData']; }
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedArea'] == 1) { AreaInfo = res.locals.UserSessionRecord['DungeonRecord']['FixedAreaData']; }
	res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'] = QuestID;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] = 0;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'] = Math.floor(Date.now() / 1000);
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyNumber'] = PartyNumberList;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][1] = [];
	if (SupportViewerID != 0) { SupportSessionRecord = ReadSessionRecord(MasterAccountRecord[String(SupportViewerID)]['SessionID']); SupportIndexRecord = ReadIndexRecord(String(SupportViewerID));
								res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'].push({'viewer_id': SupportViewerID, 'get_mana_point': 25, 'is_friend': 1, 'apply_send_status': 0});
								res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = DataManager.PopulateSupportData(SupportSessionRecord, SupportIndexRecord);
							  	PartyListData[0]['support_data'] = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0]; }
	let ReviveLimit = QuestMap.GetQuestInfo(QuestID, "revives"); if (ReviveLimit == undefined) { ReviveLimit = 0; }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
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
		'odds_info': QuestMap.GetQuestInfo(QuestID, "odds_info"),
		'update_data_list': {
			'quest_list': DataManager.GetPlayerQuestData(QuestID, res.locals.UserIndexRecord)
		}
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dungeon_start/start_assign_unit", Android_Version + "/dungeon_start/start_assign_unit"], errorhandler(async (req,res) => {
	const ViewerID = res.locals.UserSessionRecord['ViewerID'];
	const DungeonKey = crypto.randomBytes(16).toString("hex");
	const MsgPackData = msgpack.unpack(req.body); const QuestID = MsgPackData['quest_id']; if (typeof QuestID === 'string') { res.end(); }
	const PartyList = MsgPackData['request_party_setting_list'];
	if (MsgPackData['repeat_setting'] != null) {
		res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = MsgPackData['repeat_setting'];
	} else if (MsgPackData['repeat_state'] != 1) { res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = {}; }
	const SupportViewerID = MsgPackData['support_viewer_id']; let SupportSessionRecord = {}; let SupportIndexRecord = {};
	let PartyListData = []; let DungeonTypeID = 1; if (PartyList.length > 4) { DungeonTypeID = 15; }
	PartyListData = DataManager.PopulateAssignedUnitData(PartyList, ViewerID, res.locals.UserIndexRecord);
	let AreaInfo = QuestMap.GetQuestInfo(QuestID, "area_info");
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedTeam'] == 1) { PartyListData[0]['party_unit_list'] = res.locals.UserSessionRecord['DungeonRecord']['FixedTeamData']; }
	if (res.locals.UserSessionRecord['DungeonRecord']['SetFixedArea'] == 1) { AreaInfo = res.locals.UserSessionRecord['DungeonRecord']['FixedAreaData']; }
	res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'] = QuestID;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = DungeonKey;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] = 0;
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStartedAt'] = Math.floor(Date.now() / 1000);
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartyData'] = PartyListData[0]['party_unit_list'];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonPartySettings'] = PartyListData[1];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][1] = [];
	if (SupportViewerID != 0) { SupportSessionRecord = ReadSessionRecord(MasterAccountRecord[String(SupportViewerID)]['SessionID']); SupportIndexRecord = ReadIndexRecord(String(SupportViewerID));
								res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportPlayer'].push({'viewer_id': SupportViewerID, 'get_mana_point': 25, 'is_friend': 1, 'apply_send_status': 0});
								res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'] = DataManager.PopulateSupportData(SupportSessionRecord, SupportIndexRecord);
							  	PartyListData[0]['support_data'] = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonSupportCharacter'][0]; }
	let ReviveLimit = QuestMap.GetQuestInfo(QuestID, "revives"); if (ReviveLimit == undefined) { ReviveLimit = 0; }
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
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
		'odds_info': QuestMap.GetQuestInfo(QuestID, "odds_info"),
		'update_data_list': {
			'quest_list': DataManager.GetPlayerQuestData(QuestID, res.locals.UserIndexRecord)
		}
	}}
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dungeon_record/record", Android_Version + "/dungeon_record/record"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const DungeonKey = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'];
	let ResultData = DataManager.DungeonRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, DungeonKey);
	JSONDict = ResultData[0];
	res.locals.UserIndexRecord = ResultData[1];
	res.locals.UserSessionRecord = ResultData[2];
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dungeon/get_area_odds", Android_Version + "/dungeon/get_area_odds"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const DungeonKey = MsgPackData['dungeon_key'];
	let QuestID = 0;
	if (DungeonKey == res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey']) { QuestID = res.locals.UserSessionRecord['DungeonRecord']['LastQuestID']; }
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'] += 1;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'odds_info': QuestMap.GetQuestInfo(QuestID, "odds_info")
		}
	}
	JSONDict['data']['odds_info']['area_index'] = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonStep'];
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dungeon/fail", Android_Version + "/dungeon/fail"], errorhandler(async (req,res) => {
	res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'] = 0;
	// request sends dungeon_key
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'result': 1,
		'fail_helper_list': [],
		'fail_helper_detail_list': [],
		'fail_quest_detail': { 'quest_id': res.locals.UserSessionRecord['DungeonRecord']['LastQuestID'], 'wall_id': 0, 'wall_level': 0, 'is_host': 1 },
		'update_data_list': { 'functional_maintenance_list': [] }
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dungeon/retry", Android_Version + "/dungeon/retry"], async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'continue_count': 1
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.post([iOS_Version + "/dungeon_skip/start", Android_Version + "/dungeon_skip/start"], errorhandler(async (req,res) => {
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/dungeon_skip/start_assign_unit", Android_Version + "/dungeon_skip/start_assign_unit"], errorhandler(async (req,res) => {
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/repeat/end", Android_Version + "/repeat/end"], errorhandler(async (req, res) => {
	const DungeonKey = res.locals.UserSessionRecord['DungeonRecord']['LastDungeonKey'];
	res.locals.UserSessionRecord['DungeonRecord']['RepeatSettings'] = {};
	res.locals.UserSessionRecord['DungeonRecord']['RepeatCount'] = 0;
	const ResultData = DataManager.DungeonRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, DungeonKey);
	JSONDict = ResultData[0];
	res.locals.UserIndexRecord = JSONDict[1];
	res.locals.UserSessionRecord = JSONDict[2];
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/wall/get_wall_clear_party", Android_Version + "/wall/get_wall_clear_party"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body); const QuestID = MsgPackData['wall_id'];
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'wall_clear_party_setting_list': [],
		'lost_unit_list': []
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/wall/set_wall_clear_party", Android_Version + "/wall/set_wall_clear_party"], errorhandler(async (req,res) => {
	// const MsgPackData = msgpack.unpack(req.body); # This is the wall id and party data to be set
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/wall_start/start", Android_Version + "/wall_start/start"], errorhandler(async (req,res) => {
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
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'] = {};
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][1] = [];
	if (SupportViewerID != 0) { SupportSessionRecord = ReadSessionRecord(MasterAccountRecord[String(SupportViewerID)]['SessionID']); SupportIndexRecord = ReadIndexRecord(String(SupportViewerID));
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/wall_start/start_assign_unit", Android_Version + "/wall_start/start_assign_unit"], errorhandler(async (req,res) => {
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
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'] = {};
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][0] = [];
	res.locals.UserSessionRecord['Wall']['LastSupportCharacter'][1] = [];
	if (SupportViewerID != 0) { SupportSessionRecord = ReadSessionRecord(MasterAccountRecord[String(SupportViewerID)]['SessionID']); SupportIndexRecord = ReadIndexRecord(String(SupportViewerID));
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
	WriteSessionRecord(res.locals.UserSessionRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/wall_record/record", Android_Version + "/wall_record/record"], errorhandler(async (req,res) => {
	const MsgPackData = msgpack.unpack(req.body);
	const WallID = MsgPackData['wall_id']
	const ResultData = DataManager.WallRecord(res.locals.UserSessionRecord, res.locals.UserIndexRecord, WallID);
	const JSONDict = ResultData[0];
	res.locals.UserIndexRecord = ResultData[1];
	WriteSessionRecord(res.locals.UserSessionRecord);
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/wall/fail", Android_Version + "/wall/fail"], errorhandler(async (req,res) => {
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

Orchis.post([iOS_Version + "/stamp/get_stamp", Android_Version + "/stamp/get_stamp"], errorhandler(async (req, res) => {
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'stamp_list': res.locals.UserSessionRecord['Stickers']
	}}
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/stamp/set_equip_stamp", Android_Version + "/stamp/set_equip_stamp"], errorhandler(async (req, res) => {
	const MsgPackData = msgpack.unpack(req.body); const StampList = MsgPackData['stamp_list']
	res.locals.UserIndexRecord['equip_stamp_list'] = StampList;
	var JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': {
		'equip_stamp_list': StampList
	}}
	WriteIndexRecord(res.locals.UserIndexRecord);
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.post([iOS_Version + "/user/get_n_account_info", Android_Version + "/user/get_n_account_info"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'n_account_info': { 'email': "user@orchis-lite", 'nickname': res.locals.UserIndexRecord['user_data']['name'] } } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));
Orchis.post([iOS_Version + "/user/linked_n_account", Android_Version + "/user/linked_n_account"], errorhandler(async (req, res) => {
	const JSONDict = { 'data_headers': { 'result_code': 1 }, 'data': { 'result_code': 1 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
}));

Orchis.get("/", async (req,res) => {
	res.set('content-type', 'text/html');
	res.end(`
		<html> 
			<title>Orchis-Lite</title>
			<ul style="color: #0feca3; font-size: 30px"; class="NotoSans">
				<li>Tutorial<br />- The initial tutorial is functional, and the in-game tutorials (crafting, team building, etc.) are skipped.</li>
				<li>Summoning<br />- Currently all non-welfare characters are available in the summon pool. Vouchers are not consumed when summoning, and summons otherwise cost 10 wyrmite each.</li>
				<li>Upgrading<br />- It is possible to Unbind/Level up/Create copies of Weapons/Wyrmprints, and to unbind and level up characters/dragons.</li>
				<li>Quests<br />- Everything should work. Some quests have incorrect drops. All quests drop at least 5 wyrmite.</li>
				<li>Mercurial Gauntlet<br />- Works and records properly. It also drops many random items used for upgrading.</li>
				<li>The Halidom/Dragon's Roost<br />- Building and upgrading facilities should work. Giving dragons gifts will not.</li>
				<li>Stories<br />- Unit, Castle, and Quest stories should all function.</li>
				<li>Shop<br />- The shop is viewable and item summons work. Item purchases are not implemented, but trades and wyrmprint purchases are.</li>
				<li>Album<br />- The album is viewable, however medals are not functional.</li>
			</ul>
			<p style="color: #0feca3; font-size: 34px"; class="NotoSans"><strong>A massive thank you to LukeFZ, dreadfullydistinct, and Nano for all of their help! Orchis wouldn't be anywhere near as far along without their insight.</strong></p>
		</html>
	`);
});
Orchis.get("/dragalipatch/config", async (req,res) => {
	res.end(JSON.stringify({
		'mode': 'RAW',
		'cdnUrl': 'localhost:3000',
		'coneshellKey': null,
		'useUnifiedLogin': ServerConf['is_unified_login']
	}));
});
Orchis.get("/assetver", async (req, res) => {
	res.end(JSON.stringify(AssetList));
});

Orchis.post("*", async (req,res) => {
	console.log('POST on URL ' + req.url);
	var JSONDict = { 'data_headers': { 'result_code': 151 }, 'data': { 'result_code': 151 } }
	const Serialized = msgpack.pack(JSONDict); res.set(ResHeaders(Serialized.length)); res.end(Serialized);
});
Orchis.get("*", async (req,res) => {
	console.log('GET on URL ' + req.url);
	res.status(404);
    res.end('<p>But nobody came.</p>');
});

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
function CreateAccountShell() {
	let UserIDRecord = {};
	const ViewerID = 1000;
	const SessionID = "a1000";
	UserIDRecord = { 'ViewerID': ViewerID, 'SessionID': SessionID };
	const UserSessionRecord = DefaultSessionRecord();
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
function DefaultSessionRecord() {
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
		'NormalMission': { 'is_update': 0, 'receivable_reward_count': 0, 'new_complete_mission_id_list': [], 'pickup_mission_count': 0, 'all_mission_count': 222, 'completed_mission_count': 222, 'current_mission_id': 0 },
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
		'ViewerID': 1000,
		'LastLogin': Math.floor(Date.now() / 1000),
		'SaveUpdatedAt': 0,
		'Diamantium': 1200,
		'GiftRecord': {
			'GiftNormalList': [],
			'GiftLimitedList': [],
			'GiftHistory': []
		},
		'SummonRecord': {
			'FreeTenfoldCount': 1,
			'DailyLimitCount': 1,
			'ItemCount': 0,
			'SummonHistory': []
		},
		'LastAssignedDragonID': 39999,
		'FortData': {
			'Smiths': DefaultSmithData,
			'Production': DefaultProductionData,
			'BuildID': 9999,
			'Build': {}
		},
		'EnergyItems': DefaultEnergyItems,
		'DungeonRecord': {},
		'Wall': {},
		'QuestNotice': DefaultMissionNotice,
		'MissionRecord': {},
		'AlbumData': {},
		'WyrmprintSets': TutorialStatic.DefaultWyrmprints,
		'EquipmentSets': TutorialStatic.DefaultEquipments,
		'Epithet': StaticData.DefaultEpithets,
		'SupportCharacter': DefaultSupportCharacter,
		'CrestTrade': [],
		'SetOptions': DefaultOptions,
		'Stickers': StaticData.DefaultStickers,
		'MyPage': {},
		'Analytics': {
			'SummonCount': 0
		},
		'GuildLastCheck': 0
	}
	
	return UserSessionRecord;
}
function SaveUserDB() {
	zlib.gzip(msgpack.pack(MasterAccountRecord), (err, buffer) => {
		fs.writeFile('./Library/database/accountrecord.msg.gz', buffer) });
	zlib.gzip(msgpack.pack(MasterIDRecord), (err, buffer) => {
		fs.writeFile('./Library/database/idrecord.msg.gz', buffer) });
}


module.exports = Orchis;
