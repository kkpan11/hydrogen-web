/*
Copyright 2025 New Vector Ltd.
Copyright 2021 The Matrix.org Foundation C.I.C.
Copyright 2020 Bruno Windels <bruno@windels.cloud>

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import {MIN_UNICODE, MAX_UNICODE} from "./common";
import {Store} from "../Store";
import {StateEvent} from "../../types";

function encodeKey(roomId: string, eventType: string, stateKey: string) {
     return `${roomId}|${eventType}|${stateKey}`;
}

export interface RoomStateEntry {
    roomId: string;
    event: StateEvent;
    key: string;
}

export class RoomStateStore {
    private _roomStateStore: Store<RoomStateEntry>;

    constructor(idbStore: Store<RoomStateEntry>) {
        this._roomStateStore = idbStore;
    }

    get(roomId: string, type: string, stateKey: string): Promise<RoomStateEntry | undefined> {
        const key = encodeKey(roomId, type, stateKey);
        return this._roomStateStore.get(key);
    }

    getAllForType(roomId: string, type: string): Promise<RoomStateEntry[]> {
        const range = this._roomStateStore.IDBKeyRange.bound(
            encodeKey(roomId, type, ""),
            encodeKey(roomId, type, MAX_UNICODE),
            false,
            true
        );
        return this._roomStateStore.selectAll(range);
    }

    set(roomId: string, event: StateEvent): void {
        const key = encodeKey(roomId, event.type, event.state_key);
        const entry = {roomId, event, key};
        this._roomStateStore.put(entry);
    }

    removeAllForRoom(roomId: string): void {
        // exclude both keys as they are theoretical min and max,
        // but we should't have a match for just the room id, or room id with max
        const range = this._roomStateStore.IDBKeyRange.bound(roomId, `${roomId}|${MAX_UNICODE}`, true, true);
        this._roomStateStore.delete(range);
    }
}
