class Control extends Phaser.Scene {
    graphics;
    curve;
    path;

    constructor() {
        super("Control");
    }

    preload() {
        
        
    }

    create() {
        let my = this.my;
        let { width, height } = this.sys.game.canvas;

        this.text = this.add.text(width/2, height/2, 'Use the A and D keys to move left and right\nuse the left mouse button to shoot small missiles\nand use the right mouse button to shoot large ones.\nMissiles go to the mouse position and then lock onto the closest enemy\nClick to start game', { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' });
        this.text.setOrigin(0.5, 0.5);
        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            this.scene.start("MainScene");
        });

    }


    update() {
        let { width, height } = this.sys.game.canvas;
        let my = this.my;
        
    }
}