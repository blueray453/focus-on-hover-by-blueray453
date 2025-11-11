import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { setLogging, setLogFn, journal } from './utils.js'

let activeWorkspaceChangedId;

const WindowManager = global.get_window_manager();
// const WorkspaceManager = global.get_workspace_manager();

export default class maximizeLonleyWindow extends Extension {
    enable() {
        activeWorkspaceChangedId = WindowManager.connect('switch-workspace', this.onWorkspaceChanged.bind(this));

        setLogFn((msg, error = false) => {
            let level;
            if (error) {
                level = GLib.LogLevelFlags.LEVEL_CRITICAL;
            } else {
                level = GLib.LogLevelFlags.LEVEL_MESSAGE;
            }

            GLib.log_structured(
                'focus-on-hover-by-blueray453',
                level,
                {
                    MESSAGE: `${msg}`,
                    SYSLOG_IDENTIFIER: 'focus-on-hover-by-blueray453',
                    CODE_FILE: GLib.filename_from_uri(import.meta.url)[0]
                }
            );
        });


        setLogging(true);

        // journalctl -f -o cat SYSLOG_IDENTIFIER=focus-on-hover-by-blueray453
        journal(`Enabled`);
    }

    disable() {
        WindowManager.disconnect(activeWorkspaceChangedId);
    }

    onWorkspaceChanged() {
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            journal(`Workspace Changed`);
            let [x, y] = global.get_pointer();
            journal(`x: ${x}`);
            journal(`y: ${y}`);
            let window_actor = global.get_stage().get_actor_at_pos(Clutter.PickMode.NONE, x, y).get_parent();

            journal(`window_actor: ${window_actor}`);

            if (!window_actor || !window_actor.meta_window) {
                journal("No window found under pointer");
                return;
            }

            let window = window_actor.get_meta_window();

            if (window instanceof Meta.Window && window.get_window_type() === Meta.WindowType.NORMAL) {
                // let current_workspace = WorkspaceManager.get_active_workspace();
                journal(`WinID: ${window.get_id()}`);
                journal(`Win Title: ${window.get_title()}`);

                if (window.has_pointer()) {
                    journal(`Window Has Pointer`);
                    window.activate(global.get_current_time());
                    Main.activateWindow(window);
                    let win_workspace = window.get_workspace();
                    // Here global.get_current_time() instead of 0 will also work
                    win_workspace.activate_with_focus(window, 0);
                    journal(`Window Activated`);
                }

                // if (!window.has_focus()){
                //     journal(`Window not Focused`);
                //     window.activate(0);
                // } else {
                //     journal(`Window already focused`);
                // }
            }
            return GLib.SOURCE_REMOVE; // important to avoid repeated execution
        });
    }
}
