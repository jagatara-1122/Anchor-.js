var Movement = pc.createScript('movement');

class MovementListener {
    constructor(entityData, event = ()=> ({boolean: false}), vector = new pc.Vec3(0, 0, 0), moveOption = {rigid: false, slip: true, local: false, normalize: false, customVector: false}) {
        this.entity = entityData;
        this.event = event;
        this.backFrame = false;
        this.on = true;
        const {rigid = false, slip = true, local = false, normalize = false, customVector = false} = moveOption;
        this.rigid = rigid;
        this.slip = slip;
        this.local = local;
        this.normalize = normalize;
        this.customVector = customVector;
        this.vector = vector;
        this.vectorRegist = new pc.Vec3(0, 0, 0);
        this._vectorTMP = new pc.Vec3(0, 0, 0);
        this._vectorTMP2 = new pc.Vec3(0, 0, 0);
    }
    go(dt) {
        if(!this.on) {
            this.backFrame = false;
            return false;
        }
        const booleanData = this.event();
        const vectorScale = (this.slip ? dt : 1);
        const vector = this.vectorRegist.copy(this.customVector ? ( booleanData.vector === undefined ? pc.Vec3.ZERO : booleanData.vector) : this.vector);
        if(this.normalize && this.vectorRegist.lengthSq() > 0) vector.normalize();
        vector.mulScalar(vectorScale * (booleanData.speed === undefined ? 1 : booleanData.speed));
        if(booleanData.boolean && (this.slip || !this.backFrame)) {
            if(this.rigid && this.entity.rigidbody) {
                this._vectorTMP.copy(this.entity.getPosition()).add(vector);
                this._vectorTMP2.copy(this.entity.rigidbody.linearVelocity);
                this.entity.rigidbody.teleport(this._vectorTMP);
                this.entity.rigidbody.linearVelocity = this._vectorTMP2;
            }else{
                if(this.local) {
                    this.entity.translateLocal(vector);
                }else{
                    this.entity.translate(vector);
                }
            }
        }
        this.backFrame = booleanData.boolean;
        return booleanData.boolean;
    }
    switch(booleanData = null){
        if(booleanData === null) {
            this.on = !this.on;
        }else{
            this.on = booleanData;
        }
    }
}

// initialize code called once per entity
Movement.prototype.initialize = function() {
    this.movementListener = new Map();
    this.movementListenerB = new Map();
    this.app.movement = this;
};

// update code called every frame
Movement.prototype.update = function(dt) {
    for(const [name, listen] of this.movementListener){
        if(listen.entity && !listen.entity.destroyed) {
            this.movementListenerB.set(name, listen.go(dt));
        }else{
            this.delMovementListener(name);
        }
    }
};

Movement.prototype.MovementListener = MovementListener;

Movement.prototype.addListener = function(name , movementListener = new MovementListener()) {
    this.movementListener.set(name, movementListener);
    this.movementListenerB.set(name, false);
    return true;
}

Movement.prototype.addMovementListener = function(name, entityData = null, event, vector, moveOption) {
    if(entityData === null) return undefined;
    if(this.movementListener.get(name) !== undefined) return false;
    return this.addListener(name, new MovementListener(entityData, event, vector, moveOption));
}
Movement.prototype.delMovementListener = function(name) {
    return {movementListener: this.movementListener.delete(name),
        movementListenerB: this.movementListenerB.delete(name)
    };
}
// uncomment the swap method to enable hot-reloading for this script
// update the method body to copy state from the old instance
// Movement.prototype.swap = function(old) { };

// learn more about scripting here:
// https://developer.playcanvas.com/user-manual/scripting/