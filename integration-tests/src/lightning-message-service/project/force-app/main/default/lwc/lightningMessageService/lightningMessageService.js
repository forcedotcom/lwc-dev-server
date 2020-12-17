import { LightningElement, wire } from 'lwc';
import { MessageContext, publish } from 'lightning/messageService';
import SAMPLEMC from '@salesforce/messageChannel/SampleMessageChannel__c';

export default class LightningMessageService extends LightningElement {
    @wire(MessageContext)
    messageContext;

    handleClick() {
        const message = {
            recordId: '001xx000003NGSFAA4',
            recordData: { accountName: 'Burlington Textiles Corp of America' }
        };
        publish(this.messageContext, SAMPLEMC, message);
    }
}
