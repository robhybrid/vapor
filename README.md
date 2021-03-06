# Vapor 2

demo: https://vjapp.io

## install
    npm i

### config options
    {
        countdown: false, // makes numbers play numbers (for new years countdown)
        apiRoot // the location of the API server.
    }
### add clips
This accepts these formats: `(m4v|mov|webm|mp4|gif|jpg|png)`

Either put them all in a directory named `media` at the root of this folder, or create a `.env` file and in that file add the path to you media folder as:
    
    MEDIA_ROOT=/path/to/my/folder

Vapor will search for any appropriate files anywhere in that directory. 

Alternatively, you can assign a S3 bucket, and it will read all the files from the index. All the media files in an S3 bucket must be in a `video` subdirectory.

    S3_WEB_ROOT=https://dk1ug69h7ixee.cloudfront.net/

## start
    npm start

## controls {#controls}
Controls are also listed on the help screen, [src/Help/controls.md](src/Help/controls.md).You can access them, in app, by pressing `option` and then clicking "help".

### organizing clips
Clips can be organized into directories, and those directories are selectable form the option menu.

<!-- #### groups
The groups (accessed by CTRL + Number) are a way of defining groups of clips on the fly.
Any clips that you have playing can be saved to one of 10 groups by pressing CTRL + Number.
Pressing CTRL + Shift +  Number will load that group.
Once selected, only these clips will be available, either by keyboard or autopilot. 

CTRL + Delete releases the saved group and restores all your clips. 

CTRL + Number + Delete - Deletes that group. -->