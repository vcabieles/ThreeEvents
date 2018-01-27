/** Events that make it easier to manipulate ThreeJS meshes as well as speed up development.
 * @author Victor Cabieles / victorcabieles@gmail.com / github.com/vcabieles
 * V:0.0.3 1/27/2018
 * .attach: options = draggable true by default;
 */

THREE.MeshControls = function (camera, container) {

    if(container === undefined || container.nodeName === undefined){
        throw "THREE.MeshControls Element Parameter Not set"
    }else{
        this.container = container;
        this.camera = camera;
        this.objects = [];
    }

    var _plane = new THREE.Plane(),
        _raycaster = new THREE.Raycaster(),
        _mouse = new THREE.Vector2(),
        _offset = new THREE.Vector3(),
        _intersection = new THREE.Vector3(),
        _direction = new THREE.Vector3();

    var _selected = null, _hovered = null;


    var _this = this,
        flags = {
            btn: {
                isLeftBtn: false,
                isRightBtn: false,
                isMiddleBtn: false
            }
        };

    this._raySet = function () {
        if (_this.camera instanceof THREE.OrthographicCamera) {
            _this._vector.set(_mouse.x, _mouse.y, -1).unproject(_this.camera);
            _direction.set(0, 0, -1).transformDirection(_this.camera.matrixWorld);
            _raycaster.set(_this._vector, _this._direction);

        }
        else {

            var vector = new THREE.Vector3(_mouse.x, _mouse.y, 1);
            vector.unproject(_this.camera);
            _raycaster.set(_this.camera.position, vector.sub(_this.camera.position).normalize());

        }

    };

    function toThreeCords(clientX, clientY){
        var rect = _this.container.getBoundingClientRect();
            _mouse.x = ( ( clientX - rect.left ) / rect.width ) * 2 - 1;
            _mouse.y = -( ( clientY - rect.top ) / rect.height ) * 2 + 1;
    }

    function setMouseBtn(event){
        switch (event.button) {
            case 0: // left
                flags.btn.isLeftBtn = true;
                flags.btn.isRightBtn = false;
                flags.btn.isMiddleBtn = false;
                break;
            case 1: // middle
                flags.btn.isLeftBtn = false;
                flags.btn.isRightBtn = false;
                flags.btn.isMiddleBtn = true;
                break;
            case 2: // right
                flags.btn.isLeftBtn = false;
                flags.btn.isRightBtn = true;
                flags.btn.isMiddleBtn = false;
                break;
        }
    }

    function addListeners(){
        container.addEventListener( 'mousemove', onDocumentMouseMove, false );
        container.addEventListener( 'mousedown', onDocumentMouseDown, false );
        container.addEventListener( 'mouseup', onDocumentMouseCancel, false );
        // container.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
        // container.addEventListener( 'touchmove', onDocumentTouchMove, false );
        // container.addEventListener( 'touchstart', onDocumentTouchStart, false );
        // container.addEventListener( 'touchend', onDocumentTouchEnd, false );
    }

    function removeListeners(){

        container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        container.removeEventListener( 'mousedown', onDocumentMouseDown, false );
        container.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
        // container.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
        // container.removeEventListener( 'touchmove', onDocumentTouchMove, false );
        // container.removeEventListener( 'touchstart', onDocumentTouchStart, false );
        // container.removeEventListener( 'touchend', onDocumentTouchEnd, false );
    }

    function onDocumentMouseMove(event){
        event.preventDefault();
        toThreeCords(event.clientX, event.clientY);

        console.log(_selected);

    }

    function onDocumentMouseDown(event){
        setMouseBtn(event);
        _this._raySet();
        var intersects = _raycaster.intersectObjects(_this.objects, true);

        if(intersects.length > 0){
            _selected = intersects[0].object;
            _this.dispatchEvent( { type: 'click', object: intersects, btn: flags.btn});
        }

    }

    function onDocumentMouseCancel(event){
        event.preventDefault();

        setMouseBtn(event);
        _this._raySet();
        var mouseUpSelected = _raycaster.intersectObjects(_this.objects, true);

        if(mouseUpSelected.length > 0){
            _this.dispatchEvent( { type: 'mouseup', object: mouseUpSelected, btn: flags.btn});
        }

        if(_selected && _selected.dragable === true){
            _this.dispatchEvent( { type: 'dragend', object: _selected});
        }

    }

    // #API
    this.attach = function (object, options){
        if(options === undefined || options.dragable === undefined){
           options = {};
           options.dragable = false;
           object.dragable = false;
        }
        if (object instanceof THREE.Mesh) {
            this.objects.push(object);
        }
        else {
            this.objects.push(object);
            for (var i = 0; i < object.children.length; i++) {
                object.children[i].userDataParent = object;
            }
        }
    };

    this.detach = function (object) {
        var item = _this.objects.indexOf(object);
        this.objects.splice(item, 1);

    };

    this.dispose = function (object){
        _this.detach(object);
    };

    this.disposeAll = function (){
        _this.objects.length = 0;
        removeListeners()
    };

    this.removeListenrs = function(){
        removeListeners()
    };

    addListeners();

};


THREE.MeshControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.MeshControls.prototype.constructor = THREE.MeshControls;