/*
Copyright 2020 Bruno Windels <bruno@windels.cloud>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export function hydrogenGithubLink(t) {
    if (DEFINE_VERSION === "develop") {
        return t.a(
            {
                target: "_blank",
                href: `https://github.com/vector-im/hydrogen-web`,
            },
            `Hydrogen develop, ${DEFINE_GLOBAL_HASH}`
        );
    } else if (DEFINE_VERSION && DEFINE_GLOBAL_HASH) {
        return t.a(
            {
                target: "_blank",
                href: `https://github.com/vector-im/hydrogen-web/releases/tag/v${DEFINE_VERSION}`,
            },
            `Hydrogen v${DEFINE_VERSION} (${DEFINE_GLOBAL_HASH}) on Github`
        );
    } else {
        return t.a(
            {
                target: "_blank",
                href: "https://github.com/vector-im/hydrogen-web",
            },
            "Hydrogen on Github"
        );
    }
}
