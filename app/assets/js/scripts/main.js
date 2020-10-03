const electron = require('electron');
const rootPath = require('electron-root-path').rootPath;
const remote = electron.remote;
const MaxBlocks = 100, baseGroup = "Общая";
var camera, scene, renderer, publicCategory = [baseGroup];

function $(object) {
    let localElement = null;
    const method = {
        remove: () => { localElement.innerHTML = new String() },
        change: (data) => { localElement.innerHTML = data; },
        add: (data) => { localElement.innerHTML += data; },
        count: () => {
            let element = document.getElementById("countAllNotification");
            let number = JSON.parse(localStorage.getItem("LocalDataStorage") || "[]").length;
            element.innerHTML = `Всего напоминаний: ${number}/${MaxBlocks}`;
        },
        removeLast: (selector) => {
            if (object[0] === "#") {
                let child = localElement.getElementsByClassName(selector[0] === "." ? selector.slice(1) : selector);
                child[child.length].remove();
            } else {
                return new Error("Root element is not ID");
            }
        },
        e: (string = object) => { return string[0] === "#" ? document.getElementById(string.slice(1)) : document.getElementsByClassName(string.slice(1)) }
    }
    if (object) { localElement = method.e(); }
    return method;
}

const onload = () => {
    let arr = JSON.parse(localStorage.getItem("LocalDataStorage")) || [];
    let catg = JSON.parse(localStorage.getItem("category")) || [];
    if (!catg.includes(baseGroup)) { localStorage.setItem("category", JSON.stringify([...catg, baseGroup])) }
    var table = [...arr];
    (() => {
        $("#countAllNotification").change(`Всего напоминаний: ${arr.length}/${MaxBlocks}`);
        let array = localStorage.getItem("category") || "[]";
        if (array != null) {
            JSON.parse(array).forEach(element => {
                $("#nameCategoryDeleteOption").add(`<option value="${element}">${element}</option>`);
                $("#addCategoryOfElem").add(`<option value="${element}">${element}</option>`);
            });
        }

        arr.forEach((elem) => {
            if (elem[4]) {
                if (!publicCategory.includes(elem[4]) && JSON.parse(array).includes(elem[4])) {
                    $("#categoryList").add(`<input type="checkbox" onclick="filter(this,'${elem[4]}')" style="width:min-content;" checked><span>Категория: ${elem[4]}</span><br>`);
                    publicCategory.push(elem[4])
                }
            }
        })
    })()

    let count = table.length;
    for (let i = 0; i < (MaxBlocks - count); i++) {
        table.push([undefined, "Пусто", "Пока нет информации", "1.01.1970"])
    }

    var controls;
    var objects = [], elements = [];
    var targets = { sphere: [] };

    init();

    animate();

    function init() {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.z = 1600;
        scene = new THREE.Scene();
        for (var i = 0; i < table.length; i++) {
            var item = table[i];

            var element = document.createElement('div');
            element.className = 'element';
            element.style.backgroundColor = item[1] != "Пусто" ? `#${(Math.random().toString(16) + '000000').substring(2, 8).toUpperCase()}80` : `#1d455a41`;

            var symbol = document.createElement('div');
            symbol.className = 'symbol';
            symbol.textContent = item[1];
            element.appendChild(symbol);

            var date = document.createElement('div');
            date.className = 'date';
            date.type = 'hidden';
            date.innerHTML = item[3];
            element.appendChild(date);

            var details = document.createElement('div');
            details.className = 'details';
            details.innerHTML = item[2]
            element.appendChild(details);

            var object = new THREE.CSS3DObject(element);
            object.position.x = Math.random() * 4000 - 2000;
            object.position.y = Math.random() * 4000 - 2000;
            object.position.z = Math.random() * 4000 - 2000

            var category = document.createElement('input');
            category.className = 'category';
            category.type = 'hidden';
            category.value = item[4] || "Общая";
            element.appendChild(category);

            var id = document.createElement('input');
            id.className = 'id';
            id.type = 'hidden';
            id.value = item[0];
            element.appendChild(id);

            var position = document.createElement('input');
            position.className = 'position';
            position.type = 'hidden';
            position.value = `0,0,0`;
            element.appendChild(position);

            scene.add(object);
            elements.push(element);
            objects.push(object);
        }

        var vector = new THREE.Vector3();
        for (var i = 0, l = objects.length; i < l; i++) {
            var object = objects[i];
            var phi = Math.acos(-1 + (2 * i) / l);
            var theta = Math.sqrt(l * Math.PI) * phi;
            object = new THREE.Object3D();
            object.position.x = 1000 * Math.cos(theta) * Math.sin(phi);
            object.position.y = 1000 * Math.sin(theta) * Math.sin(phi);
            object.position.z = 1000 * Math.cos(phi);
            elements[i].getElementsByClassName("position")[0].value = (`${object.position.x},${object.position.y},${object.position.z}`)
            vector.copy(object.position).multiplyScalar(2);
            object.lookAt(vector);
            targets.sphere.push(object);
        }

        renderer = new THREE.CSS3DRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = 0;
        document.getElementById('container').appendChild(renderer.domElement);
        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.5;
        controls.addEventListener('change', render);
        transform(targets.sphere, 5000);
        window.addEventListener('resize', onWindowResize, false);
    }

    function transform(targets, duration) {
        TWEEN.removeAll();
        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            var target = targets[i];
            new TWEEN.Tween(object.position)
                .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            new TWEEN.Tween(object.rotation)
                .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }
        new TWEEN.Tween(this).to({}, duration * 2).onUpdate(render).start();
    }
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        controls.update();
    }
    function render() {
        renderer.render(scene, camera);
    }
}

const allListener = () => {
    let clock = new THREE.Clock(), angle = 0, angularSpeed = THREE.Math.degToRad(20), delta = 0, radius = 1600;
    let rotate = starter = null;
    let defaultList = `<option value="default" disabled selected hidden>Выберите категорию</option><option value="${baseGroup}">${baseGroup}</option>`;

    function rotateCamera() {
        rotate = setInterval(() => {
            delta = clock.getDelta();
            camera.position.x = Math.cos(angle) * radius;
            camera.position.z = Math.sin(angle) * radius;
            angle += angularSpeed * delta;
            camera.lookAt(new THREE.Vector3());
        }, 1);
    }

    setTimeout(() => rotateCamera(), 4000);

    document.body.addEventListener("mousemove", () => {
        clearInterval(rotate);
        clearTimeout(starter)
        starter = setTimeout(() => {
            rotateCamera()
        }, 1000)
    });

    $("#container").e().addEventListener("click", (e) => {
        for (let i = 0; i < e.path.length; i++) {
            try {
                if (e.path[i].getAttribute("class") == "element") {
                    $("#infoNotificationName").e().value = e.path[i].getElementsByClassName("symbol")[0].innerText;
                    $("#infoNotificationAllInfo").e().value = e.path[i].getElementsByClassName("details")[0].innerText;
                    $("#infoNotificationDeadLine").e().value = e.path[i].getElementsByClassName("date")[0].innerHTML;
                    let position = e.path[i].getElementsByClassName("position")[0].value.split(",");
                    camera.position.x = position[0];
                    camera.position.y = position[1];
                    camera.position.z = position[2];
                    ThisBlock = e.path[i]
                    return false;
                }
            } catch{ }
        }
    });

    $("#createNewNotificationButton").e().addEventListener("click", (e) => {
        let emptyBlock = $(".element").e();
        if (JSON.parse(localStorage.getItem("LocalDataStorage") || "[]").length < emptyBlock.length) {
            for (let i = 0; i < emptyBlock.length; i++) {
                if (emptyBlock[i].getElementsByClassName("symbol")[0].innerText == "Пусто") {
                    let name = $("#newNotificationName").e();
                    let fullname = $("#newNotificationAllInfo").e();
                    let date = $("#newNotificationDeadLine").e();
                    let category = $("#addCategoryOfElem").e().value === "default" ? $("#newCategory").e().value : $("#addCategoryOfElem").e().value;
                    let storage = JSON.parse(localStorage.getItem("LocalDataStorage")) || [];
                    if (name.value) {
                        let localCount = JSON.parse(localStorage.getItem("LocalDataStorage") || "[]").length
                        localStorage.setItem("LocalDataStorage", JSON.stringify([...storage, [localCount + 1, name.value, fullname.value, date.value, category]]));
                        $("#countAllNotification").change(`Всего напоминаний: ${localCount + 1}/${MaxBlocks}`);
                        emptyBlock[i].getElementsByClassName("symbol")[0].innerText = name.value;
                        emptyBlock[i].getElementsByClassName("details")[0].innerText = fullname.value || name.value;
                        emptyBlock[i].getElementsByClassName("date")[0].innerHTML = date.value;
                        emptyBlock[i].getElementsByClassName("id")[0].value = localCount + 1;
                        emptyBlock[i].getElementsByClassName("category")[0].value = category;
                        emptyBlock[i].style.backgroundColor = `#${(Math.random().toString(16) + '000000').substring(2, 8).toUpperCase()}80`;
                        console.log(publicCategory)
                        if (category && !publicCategory.includes(category) && !category.includes(" ")) {
                            console.log(2, category, !publicCategory.includes(category), !category.includes(" "))
                            let array = JSON.parse(localStorage.getItem("category")) || [];
                            if (category.length > 0 && !array.includes(category)) {
                                console.log(3, category.length > 0, !array.includes(category))
                                localStorage.setItem("category", JSON.stringify([category, ...array]))
                                $("#nameCategoryDeleteOption").add(`<option value="${category}">${category}</option>`);
                                $("#addCategoryOfElem").add(`<option value="${category}">${category}</option>`);
                                $("#categoryList").add(`<input type="checkbox"  checked onclick="filter(this,'${category}')" style="width: min-content;"><span>Категория: ${category}</span><br></div>`);
                                publicCategory.push(category);
                            }
                        }
                    }
                    return 0;
                }
            }
        }
    });

    $("#infoNotificationEdit").e().addEventListener("click", (e) => {
        if (ThisBlock != undefined) {
            let name = $("#infoNotificationName").e().value;
            let fullname = $("#infoNotificationAllInfo").e().value;
            let category = ThisBlock.getElementsByClassName("category")[0].value;
            let storage = JSON.parse(localStorage.getItem("LocalDataStorage")) || [];
            let date = $("#infoNotificationDeadLine").e().value;
            let id = parseInt(ThisBlock.getElementsByClassName("id")[0].value);
            let newStorage = storage.filter((e) => (parseInt(e[0]) != id));
            if (storage.length != newStorage.length) {
                localStorage.setItem("LocalDataStorage", JSON.stringify([...newStorage, [id, name, fullname, date, category]]));
            } else {
                id = storage.length + 1;
                category = baseGroup;
                localStorage.setItem("LocalDataStorage", JSON.stringify([...storage, [id, name, fullname, date, category]]));
                ThisBlock.style.backgroundColor = `#${(Math.random().toString(16) + '000000').substring(2, 8).toUpperCase()}80`;
            }
            ThisBlock.getElementsByClassName("symbol")[0].innerHTML = name;
            ThisBlock.getElementsByClassName("details")[0].innerHTML = fullname;
            ThisBlock.getElementsByClassName("category")[0].value = category;
            ThisBlock.getElementsByClassName("date")[0].innerHTML = date;
            ThisBlock.getElementsByClassName("id")[0].value = id;
            $().count();
        }
    });

    $("#infoNotificationButton").e().addEventListener("click", (e) => {
        if (ThisBlock != undefined) {
            let name = ThisBlock.getElementsByClassName("symbol")[0];
            let fullname = ThisBlock.getElementsByClassName("details")[0]
            let category = ThisBlock.getElementsByClassName("category")[0]
            let storage = JSON.parse(localStorage.getItem("LocalDataStorage")) || [];
            let date = ThisBlock.getElementsByClassName("date")[0];
            let id = ThisBlock.getElementsByClassName("id")[0];
            localStorage.setItem("LocalDataStorage", JSON.stringify(storage.filter((e) => e[1] != name.innerText || e[2] != fullname.innerText)));
            ThisBlock.style.backgroundColor = `#1d455a41`;
            $().count();
            name.innerText = "Пусто";
            fullname.innerText = "Пока нет информации";
            category.value = baseGroup;
            date.innerHTML = "1.01.1970";
            id.value = undefined
        }
    });

    $("#deleteAllData").e().addEventListener("click", (e) => {
        let confirm = $("#deleteAllDataConfirm").e().value;
        if (confirm) {
            let emptyBlock = $(".element").e();
            publicCategory = []
            for (let i = 0; i < emptyBlock.length; i++) {
                if (emptyBlock[i].getElementsByClassName("symbol")[0].innerText != "Пусто") {
                    emptyBlock[i].style.opacity = 1;
                    emptyBlock[i].getElementsByClassName("symbol")[0].innerText = "Пусто";
                    emptyBlock[i].getElementsByClassName("details")[0].innerText = "Пока нет информации";
                    emptyBlock[i].getElementsByClassName("category")[0].value = baseGroup;
                    emptyBlock[i].getElementsByClassName("id")[0].value = undefined;
                    emptyBlock[i].getElementsByClassName("date")[0].innerHTML = "1.01.1970";
                    emptyBlock[i].style.backgroundColor = `#1d455a41`;
                }
            }
            $("#categoryList").change(`<input type="checkbox" onclick="filter(this,'Общая')" style="width: min-content;"><span>Категория: Общая</span><br>`);
            localStorage.setItem("LocalDataStorage", JSON.stringify([]));
            $("#nameCategoryDeleteOption").change(defaultList);
            $("#addCategoryOfElem").change(defaultList + '<option value="create">Создать</option>');
            localStorage.setItem("category", JSON.stringify([baseGroup]));
            $().count();
        }
    });

    $("#nameCategoryDelete").e().addEventListener("click", (e) => {
        let all = []
        let array = JSON.parse(localStorage.getItem("category")) || [];
        let deleteValue = $("#nameCategoryDeleteOption").e().value;
        if (deleteValue && deleteValue !== baseGroup) {
            let newArray = array.filter((e) => e != deleteValue);
            localStorage.setItem("category", JSON.stringify(newArray));
            publicCategory = [];
            $("#categoryList").remove();
            JSON.parse(localStorage.getItem("LocalDataStorage") || "[]").forEach((elem) => {
                if (elem[4]) {
                    if (!all.includes(elem[4]) && newArray.includes(elem[4])) {
                        $("#categoryList").add(`<input type="checkbox" checked onclick="filter(this,'${elem[4]}')" style="width: min-content;"><span>Категория: ${elem[4]}</span><br>`);
                        all.push(elem[4]);
                    }
                }
            })
            if (newArray != null) {
                $("#nameCategoryDeleteOption").remove();
                $("#addCategoryOfElem").remove();
                newArray.forEach(element => {
                    $("#nameCategoryDeleteOption").add(`<option value="${element}">${element}</option>`);
                    $("#addCategoryOfElem").add(`<option value="${element}">${element}</option>`);
                });
                if (!newArray[0]) {
                    $("#nameCategoryDeleteOption").add(defaultList);
                    $("#addCategoryOfElem").add(defaultList);
                }
            }
            $().count();
        }
    });
}

module.exports.start = () => {
    onload();
    allListener();
}