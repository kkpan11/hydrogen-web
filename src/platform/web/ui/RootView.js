/*
Copyright 2025 New Vector Ltd.
Copyright 2020 Bruno Windels <bruno@windels.cloud>

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import {SessionView} from "./session/SessionView.js";
import {LoginView} from "./login/LoginView";
import {LogoutView} from "./LogoutView.js";
import {ForcedLogoutView} from "./ForcedLogoutView.js";
import {SessionLoadView} from "./login/SessionLoadView.js";
import {SessionPickerView} from "./login/SessionPickerView.js";
import {TemplateView} from "./general/TemplateView";
import {StaticView} from "./general/StaticView.js";

export class RootView extends TemplateView {
    render(t, vm) {
        return t.mapView(vm => vm.activeSection, activeSection => {
            switch (activeSection) {
                case "error":
                    return new StaticView(t => {
                        return t.div({className: "StatusView"}, [
                            t.h1("Something went wrong"),
                            t.p(vm.errorText),
                        ])
                    });
                case "session":
                    return new SessionView(vm.sessionViewModel);
                case "login":
                    return new LoginView(vm.loginViewModel);
                case "logout":
                    return new LogoutView(vm.logoutViewModel);
                case "forced-logout":
                    return new ForcedLogoutView(vm.forcedLogoutViewModel);
                case "picker":
                    return new SessionPickerView(vm.sessionPickerViewModel);
                case "redirecting":
                    return new StaticView(t => t.p("Redirecting..."));
                case "loading":
                    return new SessionLoadView(vm.sessionLoadViewModel);
                default:
                    throw new Error(`Unknown section: ${vm.activeSection}`);
            }
        });
    }
}
