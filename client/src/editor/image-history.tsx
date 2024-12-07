const HISTORY_SIZE = 20;

export class ImageHistory {
    private readonly size: number = HISTORY_SIZE;
    readonly original: ImageData;
    readonly stack: ImageData[] = [];
    currentIndex: number;

    constructor(stack: ImageData[] = []) {
        this.original = stack[0];
        this.stack = stack;
        this.currentIndex = 0;
    }

    push(image: ImageData) {
        this.currentIndex += 1;
        this.stack.splice(this.currentIndex); // delete all elements after index of current image
        this.stack.push(image);

        if(this.stack.length > this.size) {
            this.stack.shift();
        }
    }

    getCurrentImage() {
        return this.stack[this.currentIndex];
    }

    getPreviousImage() {
        if(this.currentIndex <= 0) {
            return this.stack[0];
        }

        return this.stack[this.currentIndex - 1];
    }
}