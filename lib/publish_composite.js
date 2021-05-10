import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';

import Publication from './publication';
import Subscription from './subscription';
import { debugLog, enableDebugLogging } from './logging';

const options =
    (Meteor.settings &&
        Meteor.settings.public &&
        Meteor.settings.public.publishComposite) ||
    {};

let unblockEnabled = options.unblock;

let publish = Meteor.publish;

function publishComposite(name, options, config) {
    return publish(name, function publish(...args) {
        if ((unblockEnabled && (!config || config.unblock !== false))
            || (config && config.unblock)) {
            if (!this.unblock) {
                console.warn('this.unblock is not defined, please check if the Meteor package lamhieu:unblock is added', this);
            } else {
                this.unblock();
            }
        }

        const subscription = new Subscription(this);
        const instanceOptions = prepareOptions.call(this, options, args);
        const publications = [];

        instanceOptions.forEach((opt) => {
            const pub = new Publication(subscription, opt);
            pub.publish();
            publications.push(pub);
        });

        this.onStop(() => {
            publications.forEach(pub => pub.unpublish());
        });

        debugLog('Meteor.publish', `${name}.ready`);
        this.ready();
    });
}

// For backwards compatibility
Meteor.publishComposite = publishComposite;

function prepareOptions(options, args) {
    let preparedOptions = options;

    if (typeof preparedOptions === 'function') {
        preparedOptions = preparedOptions.apply(this, args);
    }

    if (!preparedOptions) {
        return [];
    }

    if (!_.isArray(preparedOptions)) {
        preparedOptions = [preparedOptions];
    }

    return preparedOptions;
}

function setPublishFunction(newPublish) {
    publish = newPublish;
}

export {
    enableDebugLogging,
    publishComposite,
    setPublishFunction,
};
