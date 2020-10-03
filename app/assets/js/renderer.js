const electron = require('electron');
const main = require('./scripts/main.js');
const remote = electron.remote;

(function handleWindowControls() {
    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            init();
        }
    };

    function load() {
        main.start();
    }

    function init() {
        document.getElementById('min-button').addEventListener("click", event => {
            remote.getCurrentWindow().minimize();
        });

        document.getElementById('close-button').addEventListener("click", event => {
            remote.getCurrentWindow().close()
        });

        document.getElementById('max-page-button').addEventListener("click", (event) => {
            remote.getCurrentWindow().maximize();
            document.getElementById('change-button').style.display = "flex";
            document.getElementById('max-page-button').style.display = "none";
        });

        document.getElementById('change-button').addEventListener("click", (event) => {
            remote.getCurrentWindow().setBounds({ width: 850, height: 500 });
            document.getElementById('change-button').style.display = "none";
            document.getElementById('max-page-button').style.display = "flex";
        });

        electron.remote.getCurrentWindow().on('move', function () {
            let win = electron.remote.getCurrentWindow();
            let position = win.getPosition();
            if (position[0] != 0 || position[1] != 0) {
                document.getElementById('change-button').style.display = "none";
                document.getElementById('max-page-button').style.display = "flex";
                win.setBounds({ width: 850, height: 500 });
            }
        });

        window.onload = () => {
            load();
        }
    }
})();