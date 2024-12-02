const HISTORY_SIZE = 5;

export class ImageHistory {
    private readonly size: number = HISTORY_SIZE;
    readonly original: ImageData;
    readonly stack: ImageData[] = [];

    constructor(stack: ImageData[] = []) {
        this.original = stack[0];
        this.stack = stack;
    }

    push(image: ImageData) {
        this.stack.push(image);

        if(this.stack.length > this.size) {
            this.stack.shift();
        }
    }

    getCurrentImage() {
        return this.stack[this.stack.length - 1];
    }

    getPreviousImage() {
        if(this.stack.length == 1) {
            return this.stack[0];
        }

        return this.stack[this.stack.length - 2];
    }
}