import {
    urlRegexString,
    newLineRegexString,
    emailRegexString,
    createHttpHref,
    createEmailHref,
} from 'lightning/utilsPrivate';

/*
 * Regex was taken from aura lib and refactored
 */
const linkRegex = new RegExp(
    `(${newLineRegexString})|${urlRegexString}|${emailRegexString}`,
    'gi'
);
const emailRegex = new RegExp(emailRegexString, 'gi');
const newLineRegex = new RegExp(newLineRegexString, 'gi');

function getTextPart(text) {
    return {
        isText: true,
        value: text,
    };
}

function getUrlPart(url) {
    return {
        isLink: true,
        value: url,
        href: createHttpHref(url),
    };
}

function getEmailPart(email) {
    return {
        isLink: true,
        value: email,
        href: createEmailHref(email),
    };
}

function getNewlinePart() {
    return {
        isNewline: true,
    };
}

function getLinkPart(link) {
    if (link.match(newLineRegex)) {
        return getNewlinePart();
    } else if (link.match(emailRegex)) {
        return getEmailPart(link);
    }
    return getUrlPart(link);
}

export function parseToFormattedLinkifiedParts(text) {
    const parts = [];
    const re = linkRegex;
    let match;
    while ((match = re.exec(text)) !== null) {
        const indexOfMatch = text.indexOf(match[0]);
        let link = match[0];
        const endsWithQuote = link && link.endsWith('&quot');
        // If we found an email or url match, then create a text part for everything
        // up to the match and then create the part for the email or url
        if (indexOfMatch > 0) {
            parts.push(getTextPart(text.slice(0, text.indexOf(match[0]))));
        }
        if (endsWithQuote) {
            link = link.slice(0, link.lastIndexOf('&quot'));
        }
        parts.push(getLinkPart(link));

        if (endsWithQuote) {
            parts.push(getTextPart('&quot'));
        }
        text = text.substring(re.lastIndex);
        re.lastIndex = 0;
    }
    if (text != null && text !== '') {
        parts.push(getTextPart(text));
    }
    return parts;
}

export function parseToFormattedParts(text) {
    return text.split(newLineRegex).map((part, index) => {
        return index % 2 === 0 ? getTextPart(part) : getNewlinePart();
    });
}
