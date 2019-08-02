import {
    getCompoundFields,
    isCompoundField,
    getFieldsForLayout,
    getMissingRelationshipFields,
    getReferenceRelationships,
    getUiField,
} from 'lightning/fieldUtils';
import store from './mockdata.json';
import notperson from './notperson.json';
import person from './yesperson.json';

describe('getCompoundFields', () => {
    it('returns a list of component fields for Name', () => {
        const fields = getCompoundFields(
            'Name',
            store.record,
            store.objectInfo
        );
        expect(fields).toEqual(['FirstName', 'LastName', 'Salutation']);
    });

    it('returns a list of component fields for Address', () => {
        const fields = getCompoundFields(
            'Name',
            store.record,
            store.objectInfo
        );
        expect(fields).toEqual(['FirstName', 'LastName', 'Salutation']);
    });
});

describe('isCompoundField', () => {
    it('returns true for a standard name field', () => {
        const isCompound = isCompoundField('Name', store.objectInfo);
        expect(isCompound).toEqual(true);
    });

    it('returns true for a person account name field', () => {
        const isCompound = isCompoundField(
            'Name',
            person.objectInfos.Account,
            true
        );
        expect(isCompound).toEqual(true);
    });

    it('returns false for a business account name field when person account is enabled', () => {
        const isCompound = isCompoundField(
            'Name',
            notperson.objectInfos.Account,
            false
        );
        expect(isCompound).toEqual(false);
    });
});

describe('getUiField', () => {
    it('returns a map of values for compound fields', () => {
        const compoundField = getUiField(
            'Name',
            store.record,
            store.objectInfo
        );
        expect(compoundField.value).toEqual({
            FirstName: 'Jim',
            LastName: 'Steele',
            Salutation: null,
        });
    });
});

describe('getFieldsForLayout', () => {
    it('returns the field list for the Full layout', () => {
        const fields = getFieldsForLayout(
            store.layouts.Lead.Full.View,
            store.objectInfo
        );
        expect(fields).toEqual([
            'OwnerId',
            'Status',
            'Name',
            'Phone',
            'Company',
            'Email',
            'Title',
            'Rating',
            'Address',
            'Website',
            'AnnualRevenue',
            'Description',
        ]);
    });
});

describe('reference utils', () => {
    it('gets the expected reference info', () => {
        const referenceInfo = getUiField(
            'OwnerId',
            store.record,
            store.objectInfo
        );

        expect(referenceInfo).toEqual(
            expect.objectContaining({
                displayValue: 'Test User',
                value: '005R0000000F9tkIAC',
            })
        );
    });
    it('gets the reference relationships from an objectInfo', () => {
        const relationships = getReferenceRelationships(
            ['Name', 'OwnerId', 'CreatedById', 'State'],
            store.objectInfo
        );

        expect(relationships).toEqual({
            OwnerId: {
                name: 'Owner',
                nameFields: ['FirstName', 'LastName', 'Name'],
            },
            CreatedById: {
                name: 'CreatedBy',
                nameFields: ['Name'],
            },
        });
    });
    it('finds the missing relationships in a record', () => {
        const missingRelationships = getMissingRelationshipFields(
            {
                fields: {
                    OwnerId: {},
                    CreatedBy: {},
                    CreatedById: {},
                },
            },
            {
                OwnerId: {
                    name: 'Owner',
                    nameFields: ['FirstName', 'LastName', 'Name'],
                },
                CreatedById: {
                    name: 'CreatedBy',
                    nameFields: ['Name'],
                },
            }
        );

        expect(missingRelationships).toEqual([
            'Owner.FirstName',
            'Owner.LastName',
            'Owner.Name',
        ]);
    });
});
