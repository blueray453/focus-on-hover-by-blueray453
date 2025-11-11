import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { setLogging, setLogFn, journal } from './utils.js'

let activeWorkspaceChangedId;

const WindowManager = global.get_window_manager();

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
        journal(`Workspace Changed`);
        let [x, y] = global.get_pointer();
        journal(`x: ${x}`);
        journal(`y: ${y}`);
        let actor = global.get_stage().get_actor_at_pos(0, x, y).get_parent();

        journal(`actor: ${actor}`);

        if (!actor || !actor.meta_window) {
            journal("No window found under pointer");
            return;
        }

        let window = actor.get_meta_window();

        if (window instanceof Meta.Window && window.get_window_type() === Meta.WindowType.NORMAL) {
            journal(`WinID: ${window.get_id()}`);
            journal(`Win Title: ${window.get_title()}`);
            window.activate(0);
        }
    }
}
