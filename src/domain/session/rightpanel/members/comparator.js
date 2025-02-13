/*
Copyright 2025 New Vector Ltd.
Copyright 2021 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import {PowerLevels} from "../../../../matrix/room/PowerLevels.js";

export function createMemberComparator(powerLevels) {
    const collator = new Intl.Collator();
    const removeCharacter = string => string.charAt(0) === "@"? string.slice(1) : string;

    return function comparator(member, otherMember) {
        const p1 = powerLevels.getUserLevel(member.userId);
        const p2 = powerLevels.getUserLevel(otherMember.userId);
        if (p1 !== p2) { return p2 - p1; }
        const name = removeCharacter(member.name);
        const otherName = removeCharacter(otherMember.name);
        return collator.compare(name, otherName);
    };
}

export function tests() {

    function createComparatorWithPowerLevel(map) {
        let users = {};
        for (const prop in map) {
            Object.assign(users, {[prop]: map[prop]});
        }
        const powerLevelEvent = {
            content: {users, users_default: 0}
        };
        return createMemberComparator(new PowerLevels({powerLevelEvent}));
    }

    return {
        "power_level(member1) > power_level(member2) returns value <= 0": assert => {
            const fn = createComparatorWithPowerLevel({"@alice:hs.tld": 50});
            const member1 = {userId: "@alice:hs.tld", name: "alice"};
            const member2 = {userId: "@bob:hs.tld", name: "bob"};
            assert.strictEqual(fn(member1, member2) <= 0, true);
        },

        "power_level(member1) < power_level(member2) returns value > 0": assert => {
            const fn = createComparatorWithPowerLevel({"@alice:hs.tld": 50});
            const member1 = {userId: "@bob:hs.tld", name: "bob"};
            const member2 = {userId: "@alice:hs.tld", name: "alice"};
            assert.strictEqual(fn(member1, member2) > 0, true);
        },

        "alphabetic compare on name": assert => {
            const fn = createComparatorWithPowerLevel();
            const member1 = {userId: "@bob:hs.tld", name: "bob"};
            const member2 = {userId: "@alice:hs.tld", name: "alice"};
            assert.strictEqual(fn(member1, member2) > 0, true);
            assert.strictEqual(fn(member2, member1) <= 0, true);
        },

        "alphabetic compare with case (alice comes before Bob)": assert => {
            const fn = createComparatorWithPowerLevel();
            const member1 = {userId: "@bob:hs.tld", name: "Bob"};
            const member2 = {userId: "@alice:hs.tld", name: "alice"};
            assert.strictEqual(fn(member1, member2) > 0, true);
            assert.strictEqual(fn(member2, member1) <= 0, true);
        },

        "equal powerlevel and same names returns 0": assert => {
            const fn = createComparatorWithPowerLevel({"@bobby:hs.tld": 50, "@bob:hs.tld": 50});
            const member1 = {userId: "@bob:hs.tld", name: "bob"};
            const member2 = {userId: "@bobby:hs.tld", name: "bob"};
            assert.strictEqual(fn(member1, member2), 0);
            assert.strictEqual(fn(member2, member1), 0);
        },

        "(both_negative_powerlevel) power_level(member1) < power_level(member2) returns value > 0": assert => {
            const fn = createComparatorWithPowerLevel({"@alice:hs.tld": -100, "@bob:hs.tld": -50});
            const member1 = {userId: "@alice:hs.tld", name: "alice"};
            const member2 = {userId: "@bob:hs.tld", name: "bob"};
            assert.strictEqual(fn(member1, member2) > 0, true);
        },

        "(both_negative_powerlevel) power_level(member1) > power_level(member2) returns value <= 0": assert => {
            const fn = createComparatorWithPowerLevel({"@alice:hs.tld": -50, "@bob:hs.tld": -100});
            const member1 = {userId: "@alice:hs.tld", name: "alice"};
            const member2 = {userId: "@bob:hs.tld", name: "bob"};
            assert.strictEqual(fn(member1, member2) <= 0, true);
        },

        "(one_negative_powerlevel) power_level(member1) > power_level(member2) returns value <= 0": assert => {
            const fn = createComparatorWithPowerLevel({"@alice:hs.tld": 50, "@bob:hs.tld": -100});
            const member1 = {userId: "@alice:hs.tld", name: "alice"};
            const member2 = {userId: "@bob:hs.tld", name: "bob"};
            assert.strictEqual(fn(member1, member2) <= 0, true);
        },

        "(one_negative_powerlevel) power_level(member1) < power_level(member2) returns value > 0": assert => {
            const fn = createComparatorWithPowerLevel({"@alice:hs.tld": -100, "@bob:hs.tld": 50});
            const member1 = {userId: "@alice:hs.tld", name: "alice"};
            const member2 = {userId: "@bob:hs.tld", name: "bob"};
            assert.strictEqual(fn(member1, member2) > 0, true);
        },
    };
}
