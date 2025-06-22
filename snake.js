import { getInputDirection } from "./input.js";
export const Snake_speed = 3;
const snakeBody = [{ x: 11, y: 11 }];
let newSegments = 0;

export function update() {
    addSegments();
    let inputDirection = getInputDirection();
    for (let i = snakeBody.length - 2; i >= 0; i--) {
        snakeBody[i + 1] = { ...snakeBody[i] };
    }
    snakeBody[0].x += inputDirection.x;
    snakeBody[0].y += inputDirection.y;
}

export function getSnakeBody() {
    return snakeBody;
}

export function expandSnake(amount) {
    newSegments += amount;
}

export function onSnake(position, { ignoreHead = false } = {}) {
    return snakeBody.some((segment, index) => {
        if (ignoreHead && index === 0) return false;
        return equalPositions(segment, position);
    })
}
export function getSnakeHead() {
    return snakeBody[0];
}

export function snakeIntersection() {
    return onSnake(snakeBody[0], { ignoreHead: true });
}

function equalPositions(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

function addSegments() {
    for (let i = 0; i < newSegments; i++) {
        snakeBody.push({ ...snakeBody[snakeBody.length - 1] });
    }
    newSegments = 0;
}

export function draw(gameBoard) {
    // No longer needed for canvas rendering
}

export function getInterpolatedSnakeBody(alpha) {
    // alpha: 0 = previous, 1 = current
    // Clamp alpha
    alpha = Math.max(0, Math.min(1, alpha));
    return snakeBody.map((seg, i) => {
        const prev = snakeBody[i - 1] || seg;
        return {
            x: prev.x + (seg.x - prev.x) * alpha,
            y: prev.y + (seg.y - prev.y) * alpha
        };
    });
}

