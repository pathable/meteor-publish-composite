/* eslint-disable no-console */
import { Meteor } from 'meteor/meteor';

const options =
    (Meteor.settings &&
        Meteor.settings.public &&
        Meteor.settings.public.publishComposite) ||
    {};

let debugLoggingEnabled = options.debug;

function debugLog(source, message) {
    if (!debugLoggingEnabled) { return; }
    let paddedSource = source;
    while (paddedSource.length < 35) { paddedSource += ' '; }
    console.log(`[${paddedSource}] ${message}`);
}

function enableDebugLogging() {
    debugLoggingEnabled = true;
}

export {
    debugLog,
    enableDebugLogging,
};
