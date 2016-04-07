#!/bin/sh
xcode-select --install
wait $!

\curl -L https://get.rvm.io | bash -s stable --rails --autolibs=enabled
wait $1
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)"
wait $1
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" \
  </dev/null
wait $!

echo 😢 😢 😢 This takes FOREVER! 😢 😢 😢

brew cask install xquartz --force
wait $!

sudo ln -s /opt/X11/include/X11 /usr/local/include/X11
wait $!

brew tap homebrew/science
wait $!

brew install homebrew/science/opencv
wait $!

brew install pkg-config cairo libpng jpeg giflib imlib2
wait $!

curl -O https://www.unix-ag.uni-kl.de/~auerswal/ssocr/ssocr-2.16.3.tar.bz2
wait $!
bzip2 -dc ssocr-2.16.3.tar.bz2 | tar -xvf -
wait $!
cd ssocr-2.16.3
sudo make install
wait $!

rm ssocr-2.16.3.tar.bz2
wait $!
rm -rf ssocr-2.16.3
wait$!

brew install node
wait $!
sudo npm update -g
wait $!
npm install -g node-gyp
wait $!
brew reinstall pkg-config
wait $!
sudo npm install
wait $!
node server/install-test.js
