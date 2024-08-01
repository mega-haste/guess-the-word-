import "./style.css";
import Data from "./data.json";

enum GameState {
    Setup,
    MidGame,
    Wining,
}

function choose<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

class Game {
    public state: GameState = GameState.Setup;
    public gameElement: HTMLDivElement | undefined;
    public attempts: number = 1;
    public maxAttempts: number = 5;
    public wordTypes: string[];
    public choosenWordType: string | undefined;
    public choosenWord: string | undefined;
    public wordTypeInputsContainer = document.createElement(
        "div"
    ) as HTMLDivElement;
    public gamePannel = document.createElement("div") as HTMLDivElement;
    public winningContainer = document.createElement("div") as HTMLDivElement;
    public attemptElement: HTMLDivElement | undefined;

    public constructor() {
        this.wordTypes = Object.keys(Data);
        document.onkeyup = (ev) => this.Submit(ev);
    }

    public AnchorTo(id: string) {
        this.gameElement = document.getElementById(id) as HTMLDivElement;
    }

    public set AttemptsElement(value: string) {
        this.attemptElement = document.getElementById(value) as HTMLDivElement;
    }

    public Start() {
        this.winningContainer.remove();
        this.gamePannel.remove();
        if (this.state === GameState.Setup) this.ChoosingWordTypePhase();
    }

    public Update() {
        if (this.attemptElement)
            this.attemptElement.innerHTML = `attempts: ${this.attempts}/${this.maxAttempts}`;

        if (this.attempts > this.maxAttempts) {
            this.state = GameState.Setup;
            alert("You lost :(");
        }
        switch (this.state) {
            case GameState.Setup:
                this.Start();
                break;
            case GameState.MidGame:
                this.MidGamePhase();
                break;
            case GameState.Wining:
                this.WiningPhase();
                break;
        }
    }

    public ChoosingWordTypePhase() {
        if (!this.gameElement) return;
        this.wordTypeInputsContainer = document.createElement(
            "div"
        ) as HTMLDivElement;
        for (const wordType of this.wordTypes) {
            const wordTypeInput = document.createElement(
                "input"
            ) as HTMLInputElement;
            wordTypeInput.className = "word-type-input";
            wordTypeInput.type = "button";
            wordTypeInput.value = wordType;
            wordTypeInput.onclick = (ev) => this.OnChoseWordType(ev);

            this.wordTypeInputsContainer.className =
                "word-type-inputs-container";
            this.wordTypeInputsContainer.appendChild(wordTypeInput);
        }
        this.gameElement.appendChild(this.wordTypeInputsContainer);
    }

    public OnChoseWordType(ev: MouseEvent) {
        ev.preventDefault();
        this.choosenWordType = (ev.target as HTMLInputElement).value;
        this.state = GameState.MidGame;
        this.wordTypeInputsContainer.remove();
        this.choosenWord = choose(
            (Data as Record<string, string[]>)[this.choosenWordType as string]
        );
        this.Update();
    }

    public OnInputChange(ev: Event) {
        ev.preventDefault();
        const input = ev.target as HTMLInputElement;
        if (input.value.length >= 1) {
            input.value = input.value[0];
            input.disabled = true;
            input.classList.add("filled-letter");
            if (input.dataset.next) {
                const nextInput = document.getElementById(
                    input.dataset.next
                ) as HTMLInputElement;
                nextInput.focus();
            }
        }
    }

    public OnInputKeyDown(ev: KeyboardEvent) {
        const input = ev.target as HTMLInputElement;
        if (ev.keyCode === 8) {
            if (input.dataset.back) {
                const prevInput = document.getElementById(
                    input.dataset.back
                ) as HTMLInputElement;
                prevInput.classList.remove("filled-letter");
                prevInput.disabled = false;
                prevInput.focus();
            }
        }
    }

    public MidGamePhase() {
        this.gamePannel.remove();
        this.gamePannel = document.createElement("div") as HTMLDivElement;
        this.gamePannel.className = "game-pannel";

        if (!this.choosenWord) return;
        const choosenWordHintLength = Math.round(this.choosenWord.length / 3);

        for (let i = 0; i < choosenWordHintLength; i++) {
            const filledLetter = document.createElement(
                "span"
            ) as HTMLSpanElement;
            filledLetter.classList.add("filled-letter", "game-pannel-object");
            filledLetter.innerText = this.choosenWord[i];
            this.gamePannel.appendChild(filledLetter);
        }

        for (let i = choosenWordHintLength; i < this.choosenWord.length; i++) {
            const inputLetter = document.createElement(
                "input"
            ) as HTMLInputElement;
            const atStart = i === choosenWordHintLength + 1;
            const atEnd = i === this.choosenWord.length - 1;
            console.log(atEnd);

            inputLetter.type = "text";
            inputLetter.classList.add("game-pannel-object");
            inputLetter.id = `input-${i}`;
            inputLetter.oninput = (ev) => this.OnInputChange(ev);
            inputLetter.onkeyup = (ev) => this.OnInputKeyDown(ev);

            if (!atStart) inputLetter.dataset.back = `input-${i - 1}`;
            if (!atEnd) inputLetter.dataset.next = `input-${i + 1}`;
            else inputLetter.dataset.lastInput = "yes";
            this.gamePannel.appendChild(inputLetter);
        }

        this.gameElement?.appendChild(this.gamePannel);
    }

    public WiningPhase() {
        this.gamePannel.remove();
        this.winningContainer?.remove();
        const winnigMessage = document.createElement("h1");
        winnigMessage.innerHTML = `You won!!!<br/>Attempts: ${this.attempts}/${this.maxAttempts}.`;
        this.winningContainer.appendChild(winnigMessage);

        this.gameElement?.appendChild(this.winningContainer);
    }

    public Submit(ev: KeyboardEvent) {
        if (ev.keyCode === 13 && this.state === GameState.MidGame) {
            const lastInput = this.gamePannel.lastChild as HTMLInputElement;
            if (lastInput.disabled) {
                let buffer = "";
                this.gamePannel.childNodes.forEach((el) => {
                    const child = el as HTMLElement;
                    switch (child.tagName.toLowerCase()) {
                        case "span":
                            const span = child as HTMLSpanElement;
                            buffer += span.innerText ? span.innerText : " ";
                            break;
                        case "input":
                            const input = child as HTMLInputElement;
                            buffer += input.value;
                            break;
                    }
                });
                console.log(buffer, this.choosenWord);
                if (buffer.toLowerCase() === this.choosenWord?.toLowerCase()) {
                    this.state = GameState.Wining;
                    this.Update();
                } else {
                    this.attempts++;
                    this.Update();
                }
            }
        }
    }
}

const game = new Game();
game.AttemptsElement = "attempts";
game.AnchorTo("game");
game.Start();
