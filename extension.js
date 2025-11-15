import GLib from 'gi://GLib';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { setLogging, setLogFn, journal } from './utils.js'

let activeWorkspaceChangedId;

const Display = global.get_display();
// const WindowManager = global.get_window_manager();
const WorkspaceManager = global.get_workspace_manager();
const Stage = global.get_stage();

let afterPaintId = null;

export default class maximizeLonleyWindow extends Extension {
    enable() {
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

        activeWorkspaceChangedId = WorkspaceManager.connect('workspace-switched', this.onWorkspaceChanged.bind(this));


        // journalctl -f -o cat SYSLOG_IDENTIFIER=focus-on-hover-by-blueray453
        journal(`Enabled`);
    }

    disable() {
        WorkspaceManager.disconnect(activeWorkspaceChangedId);

        if (afterPaintId !== null) {
            Stage.disconnect(afterPaintId);
            afterPaintId = null;
        }
    }

    onWorkspaceChanged() {
        // Avoid double registration
        if (afterPaintId !== null)
            Stage.disconnect(afterPaintId);

        afterPaintId = Stage.connect('after-paint', () => {
            let [x, y] = global.get_pointer();
            let window = Stage.get_actor_at_pos(0, x, y).get_parent().get_meta_window();

            if (window.get_window_type() === 0) {
                window.activate(global.get_current_time());
                window.raise();
            }
            journal(`after-paint fired`);
            Stage.disconnect(afterPaintId);
        });

        // GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
        //     journal(`Workspace Changed`);
        //     let active_workspace = WorkspaceManager.get_active_workspace();
        //     let wins = active_workspace.list_windows();
        //     let sorted_wins = Display.sort_windows_by_stacking(wins);

        //     journal(`Workspace Changed`);

        //     sorted_wins.forEach(window => {
        //         journal(`Iterating over windows`);
        //         if (window.has_pointer()) {
        //             journal(`Window Has Pointer`);
        //             window.activate(global.get_current_time());
        //             window.raise();
        //             // Main.activateWindow(window);
        //             // let win_workspace = window.get_workspace();
        //             // Here global.get_current_time() instead of 0 will also work
        //             // win_workspace.activate_with_focus(window, 0);
        //             journal(`Window Activated`);
        //         }
        //     });

        //     return GLib.SOURCE_REMOVE; // important to avoid repeated execution
        // });
    }
}
