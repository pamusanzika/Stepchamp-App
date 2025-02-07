import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";

export default class SampleService {
    private static instance: SampleService;
    private _contractService: ContractService;

    private constructor() {
        this._contractService = ContractService.getInstance();
    }

    public static getInstance(): SampleService {
        if (!SampleService.instance) {
            SampleService.instance = new SampleService();
        }
        return SampleService.instance;
    }

    /**
     * Sample Submit Input To Contrac Request.
     */
    async sampleMessageSubmitToContractMethod(sampleMessage: any) {
        const messageType = "sampleType";
        const messageCommand = "sampleCommand";

        try {
            const sessionId = localStorage.getItem(LocalStorageKeys.sessionId);

            const sampleObj = {
                Service: "Test",
                Action: "Test2",
                type: messageType,
                command: messageCommand,
                Auth: {
                    sessionId: sessionId?.replace(/['"]/g, '')
                },
                data: {
                    sampleProp: sampleMessage
                }
            };
            
            this._contractService.submitInputToContract(sampleObj);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

