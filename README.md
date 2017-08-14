#vapor

##installation:

`npm install`

`bower install`

`brew install ffmpeg`

put clips in client/assets/video

##run

run `nginx` (if configured)

run `grunt serve`

## controls
mash some keys (starting with 'Q').

Videos are loaded on the 30 row grid from 'Q' to '/'.

Option-K shows keyboard layout.

number keys preview banks. (when viewing the keyboard layout.

option-[number] selects bank.

Caps-lock to sustain all videos.

Spacebar to blackout.

Command-Shift-F to enter full screen.

Option-S brings up fade and Video mapping controls.

Option-C brings up clients.

Use Ctrl-H to not play video on current screen, useful speeding up playback when using 2 or more screens.

Option-F for File browser.

Ctrl-S shows screens.

Ctrl-{number} selects or creates screen.

Tapping ~ sets autopilot BPM

Option-~ hide/show BPM

ESC clears BPM

Option-M toggle mute (on by default).

##install nginx

This is optional, but it will greatly improve latency and stability.

`brew tap homebrew/nginx`

`brew install nginx-full --with-mp4 --with-mp4-h264-module --with-gzip-static --with-flv`

- edit `/usr/local/etc/nginx/nginx.conf`

- in nginx.conf change location root to point at clients directory, eg:

        location / {
                root   /Users/robertwilliams/Sites/vapor/client;
                index  index.html index.htm;
                mp4;
                gzip off;
                gzip_static off;
        }

- In `server/api/files.js`, uncomment line 35 `staticServer = 'http://' + ip + ':8080/';`

- `sudo launchctl load -w /Library/LaunchDaemons/org.macports.nginx.plist`

- to stop `nginx -s stop`

### TODOS:

* implement Screes/matrixTransform
* make all sliders work across websockets.
