#!/bin/sh
xcode-select --install

/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew tap homebrew/science
brew install homebrew/science/opencv

brew install pkg-config cairo libpng jpeg giflib imlib2

brew cask install xquartz --force
ln -s /opt/X11/include/X11 /usr/local/include/X11

curl https://www.unix-ag.uni-kl.de/~auerswal/ssocr/ssocr-2.16.3.tar.bz2
bzip2 -dc ssocr-2.16.3.tar.bz2 | tar -xvf -
cd ssocr-2.16.3
sudo make install

brew install node
sudo npm install
node server/install-test.js
