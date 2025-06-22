import { onSnake, expandSnake } from "./snake.js";
import { randomGridPosition } from "./grid.js";

let food = getRandomFoodPosition();
const EXPANSION_RATE = 1;
let score = 0;

export function update() {
    if (onSnake(food)) {
        expandSnake(EXPANSION_RATE);
        food = getRandomFoodPosition();
        score++;
    }
}

export function draw(gameBoard) {
    // No longer needed for canvas rendering
}

export function getScore() {
    return score;
}

export function resetScore() {
    score = 0;
}

export function getFoodPosition() {
    return food;
}

function getRandomFoodPosition() {
    let newFoodPosition;
    while (newFoodPosition == null || onSnake(newFoodPosition)) {
        newFoodPosition = randomGridPosition();
    }
    return newFoodPosition;
}