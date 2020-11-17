import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export  default class Machine {
    constructor() {
        let main = require('./init.json');
        this.right = main.right
        this.left = main.left
        this.spaceSymbol = main.space
        this.initialState = main.initialState
        this.acceptStates = main.acceptStates
        this.transitions = main.transitions
        this.input = main.initConfig
        this.head = 1
        this.counter = 0
        this.fs = require('fs');
        this.currentState = Object.keys(this.transitions)[0]
        for(let k in this.transitions) {
            if(main.initConfig.search(k) !== -1){
                this.head = main.initConfig.search(k) + 1
                this.input = main.initConfig.replace(k, "")
                this.currentState = k
                break
            }
        }
        this.logs = {}
        this.currentConfig = [this.spaceSymbol, ...this.input.split(""), this.spaceSymbol];

    }

    read(){
        console.log("Configuracion inicial", this.parseConfig())
        while (true) {
            let transition = this.transitions[this.currentState]
                .find(([read]) => read === this.currentConfig[this.head])

            if (transition) {
                let cfHolder = [... this.currentConfig]
                let pastHead = this.head
                let [ , write, direction, successorState] = transition
                this.currentConfig[this.head] = write
                if (direction === this.right) {
                    this.head++
                    if (this.head === this.currentConfig.length - 1) {
                        this.currentConfig = [...this.currentConfig, this.spaceSymbol]
                    }
                } else if (direction === this.left) {
                    this.head--
                    if (this.head === 0) {
                        this.currentConfig = [this.spaceSymbol, ...this.currentConfig]
                        this.head ++
                    }
                }

                this.log(transition,cfHolder, pastHead, successorState)

                this.currentState = successorState
                this.counter++
            } else {
                const jsonString = JSON.stringify(this.logs, null, 2)
                this.fs.writeFile('./output.json', jsonString, err => {
                    if (err) {
                        console.log('Error writing file', err)
                    } else {

                    }
                })
                const accepted = !! this.acceptStates.find(x => x === this.currentState)
                console.log("\n----------------------------------\n")
                console.log(`No hay transicion para el estado ${this.currentState} con valor ${this.currentConfig[this.head]} disponible.`);
                let parsedConfig = this.parseConfig(this.currentConfig, {head: this.head, state: this.currentState})
                if (accepted) {
                    console.log(`${this.currentState} ${parsedConfig} aceptado`)
                } else {
                    console.log(`${this.currentState} ${parsedConfig} rechazado`)
                }

                break;
            }
        }
    }

    log(transition,currentConfig,pastHead, successorState) {

        const ts = this.parseTransition(transition)
        const configParsed = this.parseConfig()
        const pointer = this.parsePointer(ts.length)
        this.logs[this.counter] = {
            successorConfig: this.parseConfig(this.currentConfig, {head: this.head, state: successorState}),
            currentConfig: this.parseConfig(currentConfig, {head: pastHead, state: this.currentState}),
            currentState: this.currentState,
            successorState: successorState,
            readValue: transition[0],
            writeValue: transition[1],
        }
        console.log("    " + pointer)
        console.log("    " + `${ts} \t ${configParsed}`)
    }

    parseTransition(transition) {
        const [read, write, direction, successorState] = transition
        return `Estado actual (${this.currentState} ${read}) → Sucesor (${write} ${direction} ${successorState})`
    }

    parseConfig(cf = this.currentConfig, state = undefined){
        if (state){
            let text = cf.join("")
            let textArr = text.split('');
            textArr.splice(state.head, 0, state.state)
            return textArr.join("")
        }
        return cf.join("")
    }

    parsePointer(transitionFunctionLength){
        return `${Array(transitionFunctionLength).fill(" ")
            .join("")} \t ${Array(this.head)
            .fill(" ")
            .join("")}↓`
    }


}