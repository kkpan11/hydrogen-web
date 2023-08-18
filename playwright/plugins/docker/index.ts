/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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

import * as os from "os";
import * as childProcess from "child_process";
import * as fse from "fs-extra";

export function dockerRun(args: {
    image: string;
    containerName: string;
    dockerParams?: string[];
    applicationParams?: string[];
}): Promise<string> {
    const userInfo = os.userInfo();
    const params = args.dockerParams ?? [];
    const appParams = args.applicationParams ?? [];

    if (userInfo.uid >= 0) {
        // On *nix we run the docker container as our uid:gid otherwise cleaning it up its media_store can be difficult
        params.push("-u", `${userInfo.uid}:${userInfo.gid}`);
    }

    return new Promise<string>((resolve, reject) => {
        childProcess.execFile('sudo', [
            "docker",
            "run",
            "--name", args.containerName,
            "-d",
            ...params,
            args.image,
            ... appParams
        ], (err, stdout) => {
            if (err) {
                reject(err);
            }
            resolve(stdout.trim());
        });
    });
}

export function dockerExec(args: {
    containerId: string;
    params: string[];
}): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        childProcess.execFile("sudo", [
            "docker",
            "exec", args.containerId,
            ...args.params,
        ], { encoding: 'utf8' }, (err, stdout, stderr) => {
            if (err) {
                console.log(stdout);
                console.log(stderr);
                reject(err);
                return;
            }
            resolve();
        });
    });
}

/**
 * Create a docker network; does not fail if network already exists
 */
export function dockerCreateNetwork(args: {
    networkName: string;
}): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        childProcess.execFile("sudo", [
            "docker",
            "network", 
            "create",
            args.networkName,
            "--subnet", "172.18.0.0/16"
        ], { encoding: 'utf8' }, (err, stdout, stderr) => {
            if(err) {
                if (stderr.includes(`network with name ${args.networkName} already exists`)) {
                    // Don't consider this as error
                    resolve();
                }
                reject(err);
                return;
            }
            resolve();
       }) 
    });
}

export async function dockerLogs(args: {
    containerId: string;
    stdoutFile?: string;
    stderrFile?: string;
}): Promise<void> {
    const stdoutFile = args.stdoutFile ? await fse.open(args.stdoutFile, "w") : "ignore";
    const stderrFile = args.stderrFile ? await fse.open(args.stderrFile, "w") : "ignore";

    await new Promise<void>((resolve) => {
        childProcess.spawn("sudo", [
            "docker",
            "logs",
            args.containerId,
        ], {
            stdio: ["ignore", stdoutFile, stderrFile],
        }).once('close', resolve);
    });

    if (args.stdoutFile) await fse.close(<number>stdoutFile);
    if (args.stderrFile) await fse.close(<number>stderrFile);
}

export function dockerStop(args: {
    containerId: string;
}): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        childProcess.execFile('sudo', [
            "docker",
            "stop",
            args.containerId,
        ], err => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

export function dockerRm(args: {
    containerId: string;
}): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        childProcess.execFile('sudo', [
            "docker",
            "rm",
            args.containerId,
        ], err => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
