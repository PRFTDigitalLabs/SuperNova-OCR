# SuperNova OCR

A method for detecting scores from pre-DMD era pinball machines with [OpenCV](https://github.com/peterbraden/node-opencv) and [SSOCR](https://github.com/dt-tl/SSOCR)

This was written and tested on a MacBook Pro running OSX 10.11.4. Installing the prerequisites (and their prerequisites) may not work as expected in other environments.

## Installation

first, take a look at [install.sh](install.sh) to make sure you understand what it's doing. You may want to comment out some lines if you already have some of the components (e.g. Node.js) installed. After you have reviewed it...

run `sh install.sh` from the root folder to download and install the necessary components. If you have any trouble with them, please contact their maintiners:

* [Homebrew](http://brew.sh/)
* [xquartz](http://www.xquartz.org/)
* [opencv 2.4](https://github.com/Homebrew/homebrew-science/blob/master/opencv.rb)
* [pkg-config](https://www.freedesktop.org/wiki/Software/pkg-config/)
* [cairo](http://cairographics.org/)
* [libpng](http://www.libpng.org/pub/png/libpng.html)
* [jpeg](http://www.ijg.org/)
* [giflib](http://giflib.sourceforge.net/)
* [imlib2](https://sourceforge.net/projects/enlightenment/)
* [SSOCR](https://www.unix-ag.uni-kl.de/~auerswal/ssocr/)
* [Node.js](https://nodejs.org/en/)
* [node-opencv](https://github.com/peterbraden/node-opencv)
