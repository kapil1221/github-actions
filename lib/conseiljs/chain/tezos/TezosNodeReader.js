"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonpath_plus_1 = require("jsonpath-plus");
const TezosErrorTypes_1 = require("../../types/tezos/TezosErrorTypes");
const FetchSelector_1 = __importDefault(require("../../utils/FetchSelector"));
const LoggerSelector_1 = __importDefault(require("../../utils/LoggerSelector"));
const log = LoggerSelector_1.default.getLogger();
const fetch = FetchSelector_1.default.getFetch();
var TezosNodeReader;
(function (TezosNodeReader) {
    function performGetRequest(server, command) {
        const url = `${server}/${command}`;
        return fetch(url, { method: 'get' })
            .then(response => {
            if (!response.ok) {
                log.error(`TezosNodeReader.performGetRequest error: ${response.status} for ${command} on ${server}`);
                throw new TezosErrorTypes_1.TezosRequestError(response.status, response.statusText, url, null);
            }
            return response;
        })
            .then(response => {
            const json = response.json();
            log.debug(`TezosNodeReader.performGetRequest response: ${json} for ${command} on ${server}`);
            return json;
        });
    }
    function getBlock(server, hash = 'head', chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${hash}`).then(json => { return json; });
    }
    TezosNodeReader.getBlock = getBlock;
    function getBlockHead(server) {
        return getBlock(server);
    }
    TezosNodeReader.getBlockHead = getBlockHead;
    function getAccountForBlock(server, blockHash, accountHash, chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${blockHash}/context/contracts/${accountHash}`)
            .then(json => json);
    }
    TezosNodeReader.getAccountForBlock = getAccountForBlock;
    function getCounterForAccount(server, accountHash, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = yield performGetRequest(server, `chains/${chainid}/blocks/head/context/contracts/${accountHash}/counter`)
                .then(r => r.toString());
            return parseInt(counter.toString(), 10);
        });
    }
    TezosNodeReader.getCounterForAccount = getCounterForAccount;
    function getSpendableBalanceForAccount(server, accountHash, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield performGetRequest(server, `chains/${chainid}/blocks/head/context/contracts/${accountHash}`)
                .then(json => json);
            return parseInt(account.balance.toString(), 10);
        });
    }
    TezosNodeReader.getSpendableBalanceForAccount = getSpendableBalanceForAccount;
    function getAccountManagerForBlock(server, block, accountHash, chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${block}/context/contracts/${accountHash}/manager_key`)
            .then(result => (result && result.toString() !== 'null') ? result.toString() : '').catch(err => '');
    }
    TezosNodeReader.getAccountManagerForBlock = getAccountManagerForBlock;
    function isImplicitAndEmpty(server, accountHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield getAccountForBlock(server, 'head', accountHash);
            const isImplicit = accountHash.toLowerCase().startsWith('tz');
            const isEmpty = Number(account.balance) === 0;
            return (isImplicit && isEmpty);
        });
    }
    TezosNodeReader.isImplicitAndEmpty = isImplicitAndEmpty;
    function isManagerKeyRevealedForAccount(server, accountHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const managerKey = yield getAccountManagerForBlock(server, 'head', accountHash);
            return managerKey.length > 0;
        });
    }
    TezosNodeReader.isManagerKeyRevealedForAccount = isManagerKeyRevealedForAccount;
    function getContractStorage(server, accountHash, block = 'head', chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${block}/context/contracts/${accountHash}/storage`);
    }
    TezosNodeReader.getContractStorage = getContractStorage;
    function getValueForBigMapKey(server, index, key, block = 'head', chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${block}/context/big_maps/${index}/${key}`).catch(err => undefined);
    }
    TezosNodeReader.getValueForBigMapKey = getValueForBigMapKey;
    function getMempoolOperation(server, operationGroupId, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const mempoolContent = yield performGetRequest(server, `chains/${chainid}/mempool/pending_operations`).catch(() => undefined);
            const jsonresult = jsonpath_plus_1.JSONPath({ path: `$.applied[?(@.hash=='${operationGroupId}')]`, json: mempoolContent });
            return jsonresult[0];
        });
    }
    TezosNodeReader.getMempoolOperation = getMempoolOperation;
    function estimateBranchTimeout(server, branch, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const refBlock = getBlock(server, branch, chainid);
            const headBlock = getBlock(server, 'head', chainid);
            var result = yield Promise.all([refBlock, headBlock]).then(blocks => Number(blocks[1]['header']['level']) - Number(blocks[0]['header']['level']));
            return 64 - result;
        });
    }
    TezosNodeReader.estimateBranchTimeout = estimateBranchTimeout;
    function getMempoolOperationsForAccount(server, accountHash, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const mempoolContent = yield performGetRequest(server, `chains/${chainid}/mempool/pending_operations`).catch(() => undefined);
            const a = mempoolContent.applied.filter(g => g.contents.some(s => (s.source === accountHash || s.destination === accountHash)));
            const o = a.map(g => { g.contents = g.contents.filter(s => (s.source === accountHash || s.destination === accountHash)); return g; });
            return o;
        });
    }
    TezosNodeReader.getMempoolOperationsForAccount = getMempoolOperationsForAccount;
})(TezosNodeReader = exports.TezosNodeReader || (exports.TezosNodeReader = {}));
//# sourceMappingURL=TezosNodeReader.js.map