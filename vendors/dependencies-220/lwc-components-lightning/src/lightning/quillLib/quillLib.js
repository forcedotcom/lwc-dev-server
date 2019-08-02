import Quill from './quill';
import { createComponent } from 'aura'; // eslint-disable-line lwc/no-compat-create
import labelImageSizeExceeded from '@salesforce/label/LightningRichTextEditor.imageSizeExceeded';
import labelImageUploadFailed from '@salesforce/label/LightningRichTextEditor.imageUploadFailed';
import { sanitizeDOM } from 'lightning/configProvider';

const Delta = Quill.Delta;
const ALLOWED_FORMATS_FOR_API = [
    'align',
    'font',
    'size',
    /* the following formats are not enabled for 220,
       leaving them here to simplify enabling them
    'link',
    'indent',
    'list',
    'bold',
    'italic',
    'strike',
    'header',
    'direction',
    'code',
    'code-block',
    'color',
    'script',
    'underline',
    'background',*/
];

const ALLOWED_SIZES = [
    8,
    9,
    10,
    11,
    12,
    14,
    16,
    18,
    20,
    22,
    24,
    26,
    28,
    36,
    48,
    72,
];

const FONT_LIST = [
    {
        label: 'Salesforce Sans',
        value: 'default',
    },
    {
        label: 'Arial',
        class: 'sans-serif',
        value: 'sans-serif',
    },
    {
        label: 'Courier',
        class: 'courier',
        value: 'courier',
    },
    {
        label: 'Verdana',
        class: 'verdana',
        value: 'verdana',
    },
    {
        label: 'Tahoma',
        class: 'tahoma',
        value: 'tahoma',
    },
    {
        label: 'Garamond',
        class: 'garamond',
        value: 'garamond',
    },
    {
        label: 'Times New Roman',
        class: 'serif',
        value: 'serif',
    },
];

const ALLOWED_FONTS = FONT_LIST.map(item => {
    return item.value;
});

const ALLOWED_TAGS = [
    'a',
    'abbr',
    'acronym',
    'address',
    'b',
    'br',
    'big',
    'blockquote',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'del',
    'div',
    'dl',
    'dd',
    'dt',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'ins',
    'kbd',
    'li',
    'ol',
    'p',
    'param',
    'pre',
    'q',
    's',
    'samp',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'tt',
    'u',
    'ul',
    'var',
    'strike',
    'font',
];

const ALLOWED_ATTRS = [
    'accept',
    'action',
    'align',
    'alt',
    'autocomplete',
    'background',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'checked',
    'cite',
    'class',
    'clear',
    'color',
    'cols',
    'colspan',
    'coords',
    'datetime',
    'default',
    'dir',
    'disabled',
    'download',
    'enctype',
    'face',
    'for',
    'headers',
    'height',
    'hidden',
    'high',
    'href',
    'hreflang',
    'id',
    'ismap',
    'label',
    'lang',
    'list',
    'loop',
    'low',
    'max',
    'maxlength',
    'media',
    'method',
    'min',
    'multiple',
    'name',
    'noshade',
    'novalidate',
    'nowrap',
    'open',
    'optimum',
    'pattern',
    'placeholder',
    'poster',
    'preload',
    'pubdate',
    'radiogroup',
    'readonly',
    'rel',
    'required',
    'rev',
    'reversed',
    'rows',
    'rowspan',
    'spellcheck',
    'scope',
    'selected',
    'shape',
    'size',
    'span',
    'srclang',
    'start',
    'src',
    'step',
    'style',
    'summary',
    'tabindex',
    'target',
    'title',
    'type',
    'usemap',
    'valign',
    'value',
    'width',
    'xmlns',
    // for custom blots
    'data-fileid',
];

const IMAGE_MAX_SIZE = 1048576; // Max size of image: 1MB - 1048576 bytes

function _sanitize(val) {
    return sanitizeDOM(val, { ALLOWED_TAGS, ALLOWED_ATTRS });
}

function computeIndentLevel(node) {
    const indentMatch = node.className.match(/ql-indent-([0-9]+)/);
    if (indentMatch) {
        return parseInt(indentMatch[1], 10);
    }

    return 0;
}

/**
 * Turn a list with ql- classes into a nested list.
 * Recursive!
 *
 * @param  {Array} list         an array of list items
 * @param  {Number} indentLevel the current indent level
 * @param  {String} type        ol or ul
 * @return {HTMLElement}        A DOM element
 */
function nestList(list, indentLevel, type) {
    let level;
    let thisNode;
    let lastNode;
    const returnNode = document.createElement(type);
    while (list.length > 0) {
        if (thisNode) {
            lastNode = thisNode;
        }
        thisNode = list[0];
        level = computeIndentLevel(thisNode);

        // should be a sub-list. Recurse!
        if (lastNode && level > indentLevel) {
            lastNode.appendChild(nestList(list, level, type));
        } else if (level < indentLevel) {
            return returnNode;
        } else {
            thisNode.removeAttribute('class');
            returnNode.appendChild(list.shift());
        }
    }
    return returnNode;
}

/**
 * Recursivly flatten a nested list
 * an add quill classes
 *
 * No return, this will TRANSFORM the passed list
 * @param  {HTMLElement} list        This list node
 * @param  {Number} indentLevel The indentation level of the list passed
 */
function unnestList(list, indentLevel) {
    const children = Array.prototype.slice.call(list.childNodes);
    children.forEach(node => {
        if (indentLevel > 0) {
            node.className = 'ql-indent-' + indentLevel;
        }

        Array.prototype.slice.call(node.childNodes).forEach(childNode => {
            const regex = /ol|ul/i;
            if (regex.test(childNode.tagName)) {
                unnestList(childNode, indentLevel + 1);
            }
        });
    });
}

function cleanInput(html) {
    const frag = document.createElement('div');
    // eslint-disable-next-line lwc/no-inner-html
    frag.innerHTML = _sanitize(html);
    const lists = Array.prototype.slice.call(frag.querySelectorAll('ol,ul'));
    if (lists) {
        lists.forEach(list => {
            unnestList(list, 0);
            const flatList = list.querySelectorAll('li');
            if (flatList.length > 0) {
                for (let i = 0; i < flatList.length; i += 1) {
                    list.appendChild(flatList[i]);
                }
            }
        });
    }
    // eslint-disable-next-line lwc/no-inner-html
    return frag.innerHTML;
}

function cleanOutput(html) {
    const frag = document.createElement('div');
    // eslint-disable-next-line lwc/no-inner-html
    frag.innerHTML = html;
    const lists = Array.prototype.slice.call(frag.querySelectorAll('ol,ul'));
    if (lists) {
        lists.forEach(list => {
            const myList = nestList(
                Array.prototype.slice.call(list.querySelectorAll('li')),
                0,
                list.tagName
            );
            list.parentNode.replaceChild(myList, list);
        });
    }
    // eslint-disable-next-line lwc/no-inner-html
    return frag.innerHTML;
}

function insertEmbed(quillInstance, format, value, attributes) {
    const insert = {};
    const attrs = attributes || {};

    // this is important! if the editor
    // is not focused we can't insert.
    quillInstance.focus();
    const range = quillInstance.getSelection();

    // TODO: handle alt tags!
    insert[format] = value;
    const delta = new Delta().retain(range.index).delete(range.length);
    delta.insert(insert, attrs);
    return quillInstance.updateContents(delta);
}

/**
 * 1. Attempt to upload the selected file
 *     a. If the file size exceeds 1MB, the file will not be uploaded
 *     b. If the upload encounters a problem, an error is thrown
 * 2. If the file is uploaded, insert the file/image into the editor
 * @param {Object} quillApi - Quill instance into which the image should be inserted
 * @param {Object} file - The file that needs to be uploaded
 * @param {Object} shareWithEntityId - Entity ID to share the image with
 */
function uploadAndInsertSelectedFile(quillApi, file, shareWithEntityId) {
    if (file.size > this.IMAGE_MAX_SIZE) {
        throw new Error(this.labelImageSizeExceeded);
    } else {
        createComponent(
            'force:fileUpload',
            {
                shareWithEntityId,
                onUpload: serverResponse => {
                    if (serverResponse.successful) {
                        this.insertEmbed(
                            quillApi,
                            'image',
                            serverResponse.response.downloadUrl,
                            { alt: file.name }
                        );
                    } else {
                        throw new Error(
                            this.labelImageUploadFailed +
                                'Response from Server: ' +
                                serverResponse.response
                        );
                    }
                },
            },
            (uploadFileCmp, status) => {
                if (status === 'SUCCESS') {
                    uploadFileCmp.uploadFile(file);
                }
            }
        );
    }
}

function filterFormats(formats) {
    const ret = {};
    const keys = Object.keys(formats);
    keys.forEach(key => {
        let value = formats[key];
        // remove formats not in the white list
        if (ALLOWED_FORMATS_FOR_API.indexOf(key) === -1) {
            return;
        }

        // check font values whitelist
        if (key === 'font' && ALLOWED_FONTS.indexOf(value) === -1) {
            return;
        }

        // cast size to int, check value, cast back to string later when we set it
        if (key === 'size') {
            const size = parseInt(value, 10);
            // fast short circuit non number values;
            if (isNaN(size)) {
                return;
            }
            if (ALLOWED_SIZES.indexOf(size) === -1) {
                return;
            }
            value = size;
        }
        ret[key] = value;
    });
    return ret;
}

function applyFormats(api, formats) {
    const filtered = filterFormats(formats);
    Object.keys(filtered).forEach(key => {
        let value = formats[key];
        if (key === 'size') {
            value = `${value}px`;
        }
        api.format(key, value);
    });
}

const inputRichTextLibrary = {
    Delta,
    filterFormats,
    applyFormats,
    computeIndentLevel,
    nestList,
    unnestList,
    cleanInput,
    cleanOutput,
    insertEmbed,
    uploadAndInsertSelectedFile,
    ALLOWED_SIZES,
    FONT_LIST,
    ALLOWED_ATTRS,
    ALLOWED_TAGS,
    IMAGE_MAX_SIZE,
    labelImageSizeExceeded,
    labelImageUploadFailed,
};

export default { Quill, inputRichTextLibrary };
