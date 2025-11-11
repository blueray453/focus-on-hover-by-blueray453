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
        let actor = global.get_stage().get_actor_at_pos(0, x, y);
        let window = actor.get_parent().get_meta_window();

        if (window.get_window_type() === Meta.WindowType.NORMAL) {
            journal(`WinID: ${window.get_id()}`);
            window.activate(0);
        }
    }
}
