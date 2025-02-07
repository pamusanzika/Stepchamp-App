const nodeIp = process.env.REACT_APP_CONTRACT_NODE_IP;
const nodePort = process.env.REACT_APP_CONTRACT_NODE_PORT;
const HotPocket = (window as any).HotPocket;

export default class ContractService {
  private static instance: ContractService;

  private constructor() {}

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  userKeyPair = null;
  client: any = null;
  isConnectionSucceeded = false;
  server = `wss://${nodeIp}:${nodePort}`;

  isInitCalled = false;

  promiseMap = new Map();

  public async init() {
    if (this.userKeyPair == null) {
      try {
        this.userKeyPair = await HotPocket.generateKeys();
      } catch (error) {
        console.log(error);
      }
    }

    if (this.client == null && this.userKeyPair !== null) {
      this.client = await HotPocket.createClient(
        [this.server],
        this.userKeyPair
      );
    }
    console.log("Initialized");
    if (this.client) {
      // This will get fired if HP server disconnects unexpectedly.
      this.client.on(HotPocket.events.disconnect, () => {
        console.log("Disconnected");
        this.isConnectionSucceeded = false;
        window.location.reload();
      });

      // This will get fired as servers connects/disconnects.
      this.client.on(
        HotPocket.events.connectionChange,
        (server: any, action: any) => {
          console.log(server + " " + action);
        }
      );

      // This will get fired when contract sends outputs.
      this.client.on(HotPocket.events.contractOutput, (r: any) => {
        r.outputs.forEach((o: any) => {
          // const outputLog = o.length <= 10000 ? o : `[Big output (${o.length / 1024} KB)]`;
          // console.log(`Output (ledger:${r.ledgerSeqNo})>> ${outputLog}`);
          const pId = o.promiseId;
          if (o.error) {
            this.promiseMap.get(pId)?.rejecter(o.error);
          } else {
            this.promiseMap.get(pId)?.resolver(o.success);
          }

          this.promiseMap.delete(pId);
        });
      });

      this.client.on(HotPocket.events.healthEvent, (ev: any) => {
        console.log(ev);
      });

      if (!this.isConnectionSucceeded) {
        if (!(await this.client.connect())) {
          console.log("Connection failed.");
          window.location.reload();
          return false;
        }
        console.log("HotPocket Connected.");
        this.isConnectionSucceeded = true;
      }

      this.isInitCalled = true;

      return true;
    } else {
      return false;
    }
  }

  public submitInputToContract(inp: any) {
    let resolver, rejecter;
    const promiseId = this._getUniqueId();
    const inpString = JSON.stringify({ promiseId: promiseId, ...inp });
    this.client.submitContractInput(inpString).then((input: any) => {
      input?.submissionStatus.then((s: any) => {
        console.log("submitContractInput - s :" + JSON.stringify(s));
        if (s.status === "accepted") {
          return s;
        } else if (s.status !== "accepted") {
          console.log(`Ledger_Rejection: ${s.reason}`);
          throw `Ledger_Rejection: ${s.reason}`;
        }
      });
    });

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
      this.promiseMap.set(promiseId, {
        resolver: resolver,
        rejecter: rejecter,
      });
    });
  }

  _getUniqueId() {
    const typedArray = new Uint8Array(10);
    const randomValues = window.crypto.getRandomValues(typedArray);
    return randomValues.join("");
  }

  async submitReadRequest(inp: any) {
    const inpString = JSON.stringify(inp);

    const output = await this.client.submitContractReadRequest(inpString);
    if (output && output.hasOwnProperty("error")) {
      throw output.error;
    } else {
      return output != null ? output.success: null;
    }
  }
}
