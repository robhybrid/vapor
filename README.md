# Vapor 2

## install
    npm i

create a `.env` file and set in it:

    MEDIA_ROOT=/path/to/where_all_your_clips_lives

This should be an absolute path. Supported formats are:
M$V, MOV, WEBM, MP4, GIF, JPG
You can also set this variable at runtime on the command line.

### config options
    {
        countdown: false, // makes numbers play numbers (for new years countdown)
        apiRoot // the location of the API server.
    }

## start
    npm start

## controls
- any of the letter keys, as well as `; "  < > ? ` - plays clips.
- tab - tap to beat for autopilot.
- up/down - change number of layers.
- left/right - cycle keyboards
- option + left/right - cycle blend modes
- +/- - increases / decreases kaleidoscope slices (JPG)  
- ctrl + number (any clips playing will create a virtual patch)
- numbers - will jump to that position in time, on the last played video.
- ctrl + number - saves playing clips to that group, loads that group.
- shift or capslock - sustain

### organizing clips
There are two ways of organizing clips, you can organize them in directories, before you launch the app, and Vapor will traverse the directories in order. 

#### groups
The groups (accessed by CTRL + Number) are a way of defining groups of clips on the fly.
Any clips that you have playing can be saved to one of 10 groups by pressing CTRL + Number.
Pressing CTRL + Shift +  Number will load that group.
Once selected, only these clips will be available, either by keyboard or autopilot. 

CTRL + Delete releases the saved group and restores all your clips. 

CTRL + Number + Delete - Deletes that group.