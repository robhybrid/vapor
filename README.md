# Vapor 2

## install
    npm i

### config options
    {
        countdown: false, // makes numbers play numbers (for new years countdown)
        apiRoot // the location of the API server.
    }
### add clips
This accepts the folling formats (m4v|mov|webm|mp4|gif|jpg|png) 

Either put them all in a directoy named `media` at the root of this folder, or create a `.env` file and in that file add the path to you media folder as:
    
    MEDIA_ROOT=/path/to/my/folder

Vapor will search for any appropirate files anywhere in that directory. 

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