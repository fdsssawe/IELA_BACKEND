class Observer {
    update() {
        throw new Error("Method 'update()' must be implemented.");
    }
}

export default class LogObserver extends Observer {
    update(token) {
        console.log(`Token ${token} has been validated.`);
    }
}