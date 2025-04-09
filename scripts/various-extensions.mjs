export default class VariousExtensions {
    setup() {

        Hooks.on('createActor', async function (actor, options, userID) {
            if (userID != game.user.id) { return; }

            if (actor.system?.details?.height?.value && parseInt(actor.system.details.height.value)) {
                let h = parseInt(actor.system.details.height.value);
                actor.prototypeToken.setFlag('wall-height', 'tokenHeight', h / 100);
            } else {
                actor.prototypeToken.setFlag('wall-height', 'tokenHeight', 1.8);
            }
        });

        Reflect.defineProperty(WarhammerActor.prototype, 'hasPlayerOwner', {
            get() {
                return game.users.some(u => !u.isGM && u.name != "Stream" && this.testUserPermission(u, "OWNER"));
            }
        });

        window.onunhandledrejection = promiseRejectionEvent => {
            let reason = promiseRejectionEvent.reason;
            let stackTrace = promiseRejectionEvent.promise.__creationPoint;
            if (promiseRejectionEvent.reason.message) {
                reason = promiseRejectionEvent.reason.message;
            }
            if (promiseRejectionEvent.reason.stack) {
                stackTrace = promiseRejectionEvent.reason.stack;
            }
            console.error(reason + ": " + stackTrace);

            let chatOptions = {};
            chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            chatOptions["user"] = game.user.id;

            // Emit the HTML as a chat message
            chatOptions["content"] = `<h2>Unhandled Promise Rejection</h2><p>${reason}</p><p>${stackTrace}</p>`;
            //ChatMessage.create(chatOptions);
        };

        window.oncustomerror = function (customMessage, error) {
            console.error(customMessage + ": " + error);
            let stackTrace = error.stack;
            let message = error.message;

            let chatOptions = {};
            chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            chatOptions["user"] = game.user.id;

            // Emit the HTML as a chat message
            chatOptions["content"] = `<h2>${customMessage}</h2><p>${message}</p><p>${stackTrace}</p>`;
            //ChatMessage.create(chatOptions);
        };

        Hooks.on("error", (location, error, data) => {
            window.oncustomerror(`Error in ${location}`, error);
        });
    }
}