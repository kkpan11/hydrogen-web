/*
Copyright 2025 New Vector Ltd.
Copyright 2020 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import {MIN_UNICODE, MAX_UNICODE} from "./common";
import {Store} from "../Store";

export enum BackupStatus {
    NotBackedUp = 0,
    BackedUp = 1
}

export enum KeySource {
    DeviceMessage = 1,
    Backup,
    Outbound
}

export interface InboundGroupSessionEntry {
    roomId: string;
    senderKey: string;
    sessionId: string;
    session?: string;
    claimedKeys?: { [algorithm : string] : string };
    eventIds?: string[];
    backup: BackupStatus,
    source: KeySource
}

type InboundGroupSessionStorageEntry = InboundGroupSessionEntry & { key: string };


function encodeKey(roomId: string, senderKey: string, sessionId: string): string {
    return `${roomId}|${senderKey}|${sessionId}`;
}

export class InboundGroupSessionStore {
    private _store: Store<InboundGroupSessionStorageEntry>;

    constructor(store: Store<InboundGroupSessionStorageEntry>) {
        this._store = store;
    }

    async has(roomId: string, senderKey: string, sessionId: string): Promise<boolean> {
        const key = encodeKey(roomId, senderKey, sessionId);
        const fetchedKey = await this._store.getKey(key);
        return key === fetchedKey;
    }

    get(roomId: string, senderKey: string, sessionId: string): Promise<InboundGroupSessionEntry | undefined> {
        return this._store.get(encodeKey(roomId, senderKey, sessionId));
    }

    set(session: InboundGroupSessionEntry): void {
        const storageEntry = session as InboundGroupSessionStorageEntry;
        storageEntry.key = encodeKey(session.roomId, session.senderKey, session.sessionId);
        this._store.put(storageEntry);
    }

    removeAllForRoom(roomId: string) {
        const range = this._store.IDBKeyRange.bound(
            encodeKey(roomId, MIN_UNICODE, MIN_UNICODE),
            encodeKey(roomId, MAX_UNICODE, MAX_UNICODE)
        );
        this._store.delete(range);
    }
    countNonBackedUpSessions(): Promise<number> {
        return this._store.index("byBackup").count(this._store.IDBKeyRange.only(BackupStatus.NotBackedUp));
    }

    getFirstNonBackedUpSessions(amount: number): Promise<InboundGroupSessionEntry[]> {
        return this._store.index("byBackup").selectLimit(this._store.IDBKeyRange.only(BackupStatus.NotBackedUp), amount);
    }

    async markAsBackedUp(roomId: string, senderKey: string, sessionId: string): Promise<void> {
        const entry = await this._store.get(encodeKey(roomId, senderKey, sessionId));
        if (entry) {
            entry.backup = BackupStatus.BackedUp;
            this._store.put(entry);
        }
    }

    async markAllAsNotBackedUp(): Promise<number> {
        const backedUpKey = this._store.IDBKeyRange.only(BackupStatus.BackedUp);
        let count = 0;
        await this._store.index("byBackup").iterateValues(backedUpKey, (val: InboundGroupSessionEntry, key: IDBValidKey, cur: IDBCursorWithValue) => {
            val.backup = BackupStatus.NotBackedUp;
            cur.update(val);
            count += 1;
            return false;
        });
        return count;
    }
}
