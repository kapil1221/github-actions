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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const blakejs = __importStar(require("blakejs"));
const jsonpath_plus_1 = require("jsonpath-plus");
const TezosLanguageUtil_1 = require("../TezosLanguageUtil");
const TezosMessageUtil_1 = require("../TezosMessageUtil");
const TezosNodeReader_1 = require("../TezosNodeReader");
const TezosNodeWriter_1 = require("../TezosNodeWriter");
const TezosTypes = __importStar(require("../../../types/tezos/TezosChainTypes"));
var Tzip7ReferenceTokenHelper;
(function (Tzip7ReferenceTokenHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, 'head', address);
            if (!!!contract.script) {
                throw new Error(`No code found at ${address}`);
            }
            const k = Buffer.from(blakejs.blake2s(JSON.stringify(contract.script.code), null, 16)).toString('hex');
            if (k !== '0e3e137841a959521324b4ce20ca2df7') {
                throw new Error(`Contract does not match the expected code hash: ${k}, '0e3e137841a959521324b4ce20ca2df7'`);
            }
            return true;
        });
    }
    Tzip7ReferenceTokenHelper.verifyDestination = verifyDestination;
    function verifyScript(script) {
        const k = Buffer.from(blakejs.blake2s(TezosLanguageUtil_1.TezosLanguageUtil.preProcessMichelsonScript(script).join('\n'), null, 16)).toString('hex');
        if (k !== 'b77ada691b1d630622bea243696c84d7') {
            throw new Error(`Contract does not match the expected code hash: ${k}, 'b77ada691b1d630622bea243696c84d7'`);
        }
        return true;
    }
    Tzip7ReferenceTokenHelper.verifyScript = verifyScript;
    function deployContract(server, keystore, fee, administrator, pause = true, supply = 0, gas = 150000, freight = 5000) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = `parameter (or (or (or (pair %transfer (address :from) (pair (address :to) (nat :value))) (pair %approve (address :spender) (nat :value))) (or (pair %getAllowance (pair (address :owner) (address :spender)) (contract nat)) (or (pair %getBalance (address :owner) (contract nat)) (pair %getTotalSupply unit (contract nat))))) (or (or (bool %setPause) (address %setAdministrator)) (or (pair %getAdministrator unit (contract address)) (or (pair %mint (address :to) (nat :value)) (pair %burn (address :from) (nat :value))))));
        storage (pair (big_map %ledger (address :user) (pair (nat :balance) (map :approvals (address :spender) (nat :value)))) (pair (address %admin) (pair (bool %paused) (nat %totalSupply))));
        code { CAST (pair (or (or (or (pair address (pair address nat)) (pair address nat)) (or (pair (pair address address) (contract nat)) (or (pair address (contract nat)) (pair unit (contract nat))))) (or (or bool address) (or (pair unit (contract address)) (or (pair address nat) (pair address nat))))) (pair (big_map address (pair nat (map address nat))) (pair address (pair bool nat)))); DUP; CAR; DIP { CDR }; IF_LEFT { IF_LEFT { IF_LEFT { DIP { DUP; CDR; CDR; CAR; IF { UNIT; PUSH string "TokenOperationsArePaused"; PAIR; FAILWITH } {  } }; DUP; DUP; CDR; CAR; DIP { CAR }; COMPARE; EQ; IF { DROP } { DUP; CAR; SENDER; COMPARE; EQ; IF {  } { DUP; DIP { DUP; DIP { DIP { DUP }; CAR; SENDER; PAIR; DUP; DIP { CDR; DIP { CAR }; GET; IF_NONE { EMPTY_MAP (address) nat } { CDR } }; CAR; GET; IF_NONE { PUSH nat 0 } {  } }; DUP; CAR; DIP { SENDER; DIP { DUP; CDR; CDR; DIP { DIP { DUP }; SWAP }; SWAP; SUB; ISNAT; IF_NONE { DIP { DUP }; SWAP; DIP { DUP }; SWAP; CDR; CDR; PAIR; PUSH string "NotEnoughAllowance"; PAIR; FAILWITH } {  } }; PAIR }; PAIR; DIP { DROP; DROP }; DIP { DUP }; SWAP; DIP { DUP; CAR }; SWAP; DIP { CAR }; GET; IF_NONE { PUSH nat 0; DIP { EMPTY_MAP (address) nat }; PAIR; EMPTY_MAP (address) nat } { DUP; CDR }; DIP { DIP { DUP }; SWAP }; SWAP; CDR; CDR; DUP; INT; EQ; IF { DROP; NONE nat } { SOME }; DIP { DIP { DIP { DUP }; SWAP }; SWAP }; SWAP; CDR; CAR; UPDATE; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; CAR; DIP { SOME }; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CDR; CAR; DIP { CAR }; GET; IF_NONE { DUP; CDR; CDR; INT; EQ; IF { NONE (pair nat (map address nat)) } { DUP; CDR; CDR; DIP { EMPTY_MAP (address) nat }; PAIR; SOME } } { DIP { DUP }; SWAP; CDR; CDR; DIP { DUP; CAR }; ADD; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; SOME }; SWAP; DUP; DIP { CDR; CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; CDR; INT; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CAR; DIP { CAR }; GET; IF_NONE { CDR; CDR; PUSH nat 0; SWAP; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DUP; CAR; DIP { DIP { DUP }; SWAP }; SWAP; CDR; CDR; SWAP; SUB; ISNAT; IF_NONE { CAR; DIP { DUP }; SWAP; CDR; CDR; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; DIP { DUP }; SWAP; DIP { DUP; CAR; INT; EQ; IF { DUP; CDR; SIZE; INT; EQ; IF { DROP; NONE (pair nat (map address nat)) } { SOME } } { SOME }; SWAP; CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; CDR; NEG; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DROP }; NIL operation; PAIR } { SENDER; PAIR; DIP { DUP; CDR; CDR; CAR; IF { UNIT; PUSH string "TokenOperationsArePaused"; PAIR; FAILWITH } {  } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; DUP; DIP { CAR; DIP { CAR }; GET; IF_NONE { EMPTY_MAP (address) nat } { CDR } }; CDR; CAR; GET; IF_NONE { PUSH nat 0 } {  }; DUP; INT; EQ; IF { DROP } { DIP { DUP }; SWAP; CDR; CDR; INT; EQ; IF { DROP } { PUSH string "UnsafeAllowanceChange"; PAIR; FAILWITH } }; DIP { DUP }; SWAP; DIP { DUP; CAR }; SWAP; DIP { CAR }; GET; IF_NONE { PUSH nat 0; DIP { EMPTY_MAP (address) nat }; PAIR; EMPTY_MAP (address) nat } { DUP; CDR }; DIP { DIP { DUP }; SWAP }; SWAP; CDR; CDR; DUP; INT; EQ; IF { DROP; NONE nat } { SOME }; DIP { DIP { DIP { DUP }; SWAP }; SWAP }; SWAP; CDR; CAR; UPDATE; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; CAR; DIP { SOME }; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; NIL operation; PAIR } } { IF_LEFT { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; DUP; CAR; DIP { CDR }; DUP; DIP { CAR; DIP { CAR }; GET; IF_NONE { EMPTY_MAP (address) nat } { CDR } }; CDR; GET; IF_NONE { PUSH nat 0 } {  }; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } { IF_LEFT { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; DUP; CAR; DIP { CDR }; DIP { CAR }; GET; IF_NONE { PUSH nat 0 } { CAR }; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; CDR; CDR; CDR; CDR; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } } } } { IF_LEFT { IF_LEFT { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; NIL operation; PAIR } { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP; CDR }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; NIL operation; PAIR } } { IF_LEFT { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; CDR; CDR; CAR; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } { IF_LEFT { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CAR; DIP { CAR }; GET; IF_NONE { DUP; CDR; INT; EQ; IF { NONE (pair nat (map address nat)) } { DUP; CDR; DIP { EMPTY_MAP (address) nat }; PAIR; SOME } } { DIP { DUP }; SWAP; CDR; DIP { DUP; CAR }; ADD; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; SOME }; SWAP; DUP; DIP { CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; INT; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DROP; NIL operation; PAIR } { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CAR; DIP { CAR }; GET; IF_NONE { CDR; PUSH nat 0; SWAP; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DUP; CAR; DIP { DIP { DUP }; SWAP }; SWAP; CDR; SWAP; SUB; ISNAT; IF_NONE { CAR; DIP { DUP }; SWAP; CDR; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; DIP { DUP }; SWAP; DIP { DUP; CAR; INT; EQ; IF { DUP; CDR; SIZE; INT; EQ; IF { DROP; NONE (pair nat (map address nat)) } { SOME } } { SOME }; SWAP; CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; NEG; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DROP; NIL operation; PAIR } } } } };`;
            const storage = `Pair {} (Pair "${administrator}" (Pair ${pause ? 'True' : 'False'} ${supply}))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractOriginationOperation(server, keystore, 0, undefined, fee, '', freight, gas, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult['operationGroupID']);
        });
    }
    Tzip7ReferenceTokenHelper.deployContract = deployContract;
    function getAccountBalance(server, mapid, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            if (mapResult === undefined) {
                throw new Error(`Map ${mapid} does not contain a record for ${account}`);
            }
            const jsonresult = jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: mapResult });
            return Number(jsonresult[0]);
        });
    }
    Tzip7ReferenceTokenHelper.getAccountBalance = getAccountBalance;
    function getAccountAllowance(server, mapid, account, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(source, 'address'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            if (mapResult === undefined) {
                throw new Error(`Map ${mapid} does not contain a record for ${source}/${account}`);
            }
            let allowances = new Map();
            jsonpath_plus_1.JSONPath({ path: '$.args[1][*].args', json: mapResult }).forEach(v => allowances[v[0]['string']] = Number(v[1]['int']));
            return allowances[account];
        });
    }
    Tzip7ReferenceTokenHelper.getAccountAllowance = getAccountAllowance;
    function getSimpleStorage(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return {
                mapid: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
                supply: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0]),
                administrator: jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].string', json: storageResult })[0],
                paused: (jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t')
            };
        });
    }
    Tzip7ReferenceTokenHelper.getSimpleStorage = getSimpleStorage;
    function getTokenSupply(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0]);
        });
    }
    Tzip7ReferenceTokenHelper.getTokenSupply = getTokenSupply;
    function getAdministrator(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].string', json: storageResult })[0];
        });
    }
    Tzip7ReferenceTokenHelper.getAdministrator = getAdministrator;
    function getPaused(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return (jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t');
        });
    }
    Tzip7ReferenceTokenHelper.getPaused = getPaused;
    function transferBalance(server, keystore, contract, fee, source, destination, amount, gas, freight) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Left (Left (Left (Pair "${source}" (Pair "${destination}" ${amount})))))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    Tzip7ReferenceTokenHelper.transferBalance = transferBalance;
    function approveBalance(server, keystore, contract, fee, destination, amount, gas, freight) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Left (Left (Right (Pair "${destination}" ${amount}))))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    Tzip7ReferenceTokenHelper.approveBalance = approveBalance;
    function activateLedger(server, keystore, contract, fee, gas, freight) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = '(Right (Left (Left False)))';
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    Tzip7ReferenceTokenHelper.activateLedger = activateLedger;
    function deactivateLedger(server, keystore, contract, fee, gas, freight) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = '(Right (Left (Left True)))';
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    Tzip7ReferenceTokenHelper.deactivateLedger = deactivateLedger;
    function setAdministrator(server, keystore, contract, address, fee, gas, freight) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Right (Left (Right "${address}")))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    Tzip7ReferenceTokenHelper.setAdministrator = setAdministrator;
    function mint(server, keystore, contract, fee, destination, amount, gas = 150000, freight = 5000) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Right (Right (Right (Left (Pair "${destination}" ${amount})))))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    Tzip7ReferenceTokenHelper.mint = mint;
    function burn(server, keystore, contract, fee, source, amount, gas, freight) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Right (Right (Right (Right (Pair "${source}" ${amount})))))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    Tzip7ReferenceTokenHelper.burn = burn;
    function clearRPCOperationGroupHash(hash) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
})(Tzip7ReferenceTokenHelper = exports.Tzip7ReferenceTokenHelper || (exports.Tzip7ReferenceTokenHelper = {}));
//# sourceMappingURL=Tzip7ReferenceTokenHelper.js.map