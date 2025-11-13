import GLib from 'gi://GLib';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { setLogging, setLogFn, journal } from './utils.js'

let activeWorkspaceChangedId;

// const Display = global.get_display();
// const WindowManager = global.get_window_manager();
const WorkspaceManager = global.get_workspace_manager();

export default class maximizeLonleyWindow extends Extension {
    enable() {
        activeWorkspaceChangedId = WorkspaceManager.connect('workspace-switched', this.focusWindowUnderPointer.bind(this));

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
        WorkspaceManager.disconnect(activeWorkspaceChangedId);
    }

    focusWindowUnderPointer() {
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {

            // journal(`object is ${object}`);
            // journal(`p0 is ${p0}`);
            let active_workspace = WorkspaceManager.get_active_workspace();
            // let active_workspace = wm.get_workspace_by_index(p0);
            let wins = active_workspace.list_windows();

            journal(`Workspace Changed`);

            wins.forEach(window => {
                if (window.has_pointer()) {
                    journal(`Window Has Pointer`);
                    window.activate(global.get_current_time());
                    window.raise();
                    // window.raise_and_make_recent_on_workspace(p0);
                    // Main.activateWindow(window);
                    // let win_workspace = window.get_workspace();
                    // Here global.get_current_time() instead of 0 will also work
                    // win_workspace.activate_with_focus(window, 0);
                    journal(`Window Activated`);
                }
            });

            // journal(`Workspace Changed`);
            // let [x, y] = global.get_pointer();
            // journal(`x: ${x}`);
            // journal(`y: ${y}`);
            // let window = global.get_stage().get_actor_at_pos(0, x, y).get_parent().get_meta_window();

            // journal(`window: ${window}`);

            // if (window instanceof Meta.Window && window.get_window_type() === 0) {
            //     // let current_workspace = WorkspaceManager.get_active_workspace();
            //     journal(`WinID: ${window.get_id()}`);
            //     journal(`Win Title: ${window.get_title()}`);


            //     journal(`Window Has Pointer`);
            //     window.activate(global.get_current_time());
            //     // Main.activateWindow(window);
            //     // let win_workspace = window.get_workspace();
            //     // // Here global.get_current_time() instead of 0 will also work
            //     // win_workspace.activate_with_focus(window, 0);
            //     journal(`Window Activated`);

            //     // if (!window.has_focus()){
            //     //     journal(`Window not Focused`);
            //     //     window.activate(0);
            //     // } else {
            //     //     journal(`Window already focused`);
            //     // }
            // }



            return GLib.SOURCE_REMOVE; // important to avoid repeated execution
        });


    }
}
