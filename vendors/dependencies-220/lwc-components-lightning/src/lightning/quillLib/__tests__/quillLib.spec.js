import lightningQuill from 'lightning/quillLib';
const { inputRichTextLibrary } = lightningQuill;
jest.mock('../quill.js');
describe('filter formats', () => {
    it('filters invalid formats out', () => {
        const formats = {
            arglbargle: 'cake',
            align: 'center',
        };
        expect(inputRichTextLibrary.filterFormats(formats)).toEqual({
            align: 'center',
        });
    });

    it('converts px values to integers for size', () => {
        const formats = { size: '12px' };
        expect(inputRichTextLibrary.filterFormats(formats)).toEqual({
            size: 12,
        });
    });

    it('filters valid sizes', () => {
        const formats = { size: 19 };
        expect(inputRichTextLibrary.filterFormats(formats)).toEqual({});
    });

    it('filters non-number sizes', () => {
        const formats = { size: 'hello' };
        expect(inputRichTextLibrary.filterFormats(formats)).toEqual({});
    });

    it('does not filter valid sizes', () => {
        inputRichTextLibrary.ALLOWED_SIZES.forEach(size => {
            const formats = { size };
            expect(inputRichTextLibrary.filterFormats(formats)).toEqual({
                size,
            });
        });
    });

    it('filters invalid fonts', () => {
        const formats = { font: 'comic sans' };
        expect(inputRichTextLibrary.filterFormats(formats)).toEqual({});
    });

    it('does not filter valid fonts', () => {
        inputRichTextLibrary.FONT_LIST.map(item => {
            return item.value;
        }).forEach(font => {
            expect(inputRichTextLibrary.filterFormats({ font })).toEqual({
                font,
            });
        });
    });
});

describe('apply formats', () => {
    it('applies a single format', () => {
        const format = jest.fn();
        inputRichTextLibrary.applyFormats({ format }, { align: 'center' });
        expect(format).toBeCalledWith('align', 'center');
    });

    it('applies a bundle of formats', () => {
        const format = jest.fn();

        inputRichTextLibrary.applyFormats(
            { format },
            { font: 'sans-serif', align: 'center' }
        );
        expect(format).toBeCalledWith('font', 'sans-serif');
        expect(format).toBeCalledWith('align', 'center');
    });

    it('transforms sizes to px', () => {
        const format = jest.fn();
        inputRichTextLibrary.applyFormats({ format }, { size: 12 });
        expect(format).toBeCalledWith('size', '12px');
    });

    it('filters invalid formats', () => {
        const format = jest.fn();
        inputRichTextLibrary.applyFormats(
            { format },
            { size: 12, align: 'center', arglbargle: 'banana' }
        );
        expect(format).not.toBeCalledWith('size');
        expect(format).not.toBeCalledWith('arglebargle');
        expect(format).toBeCalledWith('align', 'center');
    });
});
