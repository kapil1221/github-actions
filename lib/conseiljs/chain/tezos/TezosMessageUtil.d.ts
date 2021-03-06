/// <reference types="node" />
import { SignedOperationGroup } from '../../types/tezos/TezosChainTypes';
import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
export declare namespace TezosMessageUtils {
    function writeBoolean(value: boolean): string;
    function readBoolean(hex: string): boolean;
    function writeInt(value: number): string;
    function writeSignedInt(value: number): string;
    function readInt(hex: string): number;
    function readSignedInt(hex: string): number;
    function findInt(hex: string, offset: number, signed?: boolean): {
        value: number;
        length: number;
    };
    function writeString(value: string): string;
    function readString(hex: string): string;
    function readAddress(hex: string): string;
    function readAddressWithHint(b: Buffer | Uint8Array, hint: string): string;
    function writeAddress(address: string): string;
    function readBranch(hex: string): string;
    function writeBranch(branch: string): string;
    function readPublicKey(hex: string): string;
    function writePublicKey(publicKey: string): string;
    function readKeyWithHint(b: Buffer | Uint8Array, hint: string): string;
    function writeKeyWithHint(key: string, hint: string): Buffer;
    function readSignatureWithHint(b: Buffer | Uint8Array, hint: string): string;
    function writeSignatureWithHint(sig: string, hint: string): Buffer;
    function readBufferWithHint(b: Buffer | Uint8Array, hint: string): string;
    function writeBufferWithHint(b: string): Buffer;
    function computeOperationHash(signedOpGroup: SignedOperationGroup): string;
    function computeKeyHash(key: Buffer, prefix?: string): string;
    function writePackedData(value: string | number | Buffer, type: string, format?: TezosParameterFormat): string;
    function readPackedData(hex: string, type: string): string | number;
    function encodeBigMapKey(key: Buffer): string;
}
